create extension if not exists pgcrypto;

create table if not exists public.online_leagues (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  name text not null check (char_length(name) between 3 and 40),
  owner_id uuid not null references auth.users(id) on delete cascade,
  max_teams integer not null default 8 check (max_teams between 2 and 8),
  current_round integer not null default 1 check (current_round between 1 and 14),
  status text not null default 'open' check (status in ('open', 'active', 'finished')),
  created_at timestamptz not null default now()
);

create table if not exists public.online_league_members (
  league_id uuid not null references public.online_leagues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  club_name text not null check (char_length(club_name) between 3 and 32),
  team_power integer not null default 70 check (team_power between 55 and 95),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  points_for integer not null default 0 check (points_for >= 0),
  points_against integer not null default 0 check (points_against >= 0),
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

create table if not exists public.online_round_submissions (
  league_id uuid not null references public.online_leagues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  round integer not null check (round between 1 and 14),
  strategy text not null check (strategy in ('control', 'three', 'defense')),
  starter_ids jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null default now(),
  primary key (league_id, user_id, round)
);

alter table public.online_leagues enable row level security;
alter table public.online_league_members enable row level security;
alter table public.online_round_submissions enable row level security;

create or replace function public.is_online_league_member(target_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.online_league_members
    where league_id = target_league_id and user_id = auth.uid()
  );
$$;

revoke all on function public.is_online_league_member(uuid) from public;
grant execute on function public.is_online_league_member(uuid) to authenticated;

drop policy if exists "Members can read online leagues" on public.online_leagues;
create policy "Members can read online leagues" on public.online_leagues for select to authenticated
  using (status = 'open' or owner_id = auth.uid() or public.is_online_league_member(id));

drop policy if exists "Users can create online leagues" on public.online_leagues;
create policy "Users can create online leagues" on public.online_leagues for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "Owners can update online leagues" on public.online_leagues;
create policy "Owners can update online leagues" on public.online_leagues for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "Members can read standings" on public.online_league_members;
create policy "Members can read standings" on public.online_league_members for select to authenticated
  using (public.is_online_league_member(league_id));

drop policy if exists "Users can join online leagues" on public.online_league_members;
create policy "Users can join online leagues" on public.online_league_members for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.online_leagues l where l.id = league_id and l.status = 'open'));

drop policy if exists "Users can update their online club" on public.online_league_members;
create policy "Users can update their online club" on public.online_league_members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Members can read submissions" on public.online_round_submissions;
create policy "Members can read submissions" on public.online_round_submissions for select to authenticated
  using (public.is_online_league_member(league_id));

drop policy if exists "Users can submit their round" on public.online_round_submissions;
create policy "Users can submit their round" on public.online_round_submissions for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.online_league_members m where m.league_id = league_id and m.user_id = auth.uid()));

drop policy if exists "Users can update their round" on public.online_round_submissions;
create policy "Users can update their round" on public.online_round_submissions for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists online_league_members_league_idx on public.online_league_members(league_id);
create index if not exists online_round_submissions_league_round_idx on public.online_round_submissions(league_id, round);

create or replace function public.resolve_online_round(target_league_id uuid, target_round integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_league public.online_leagues%rowtype;
  submitted integer;
  total_members integer;
  average_score numeric;
  member_record record;
  computed_score integer;
  resolved_count integer := 0;
begin
  select * into target_league from public.online_leagues where id = target_league_id;
  if target_league.id is null then raise exception 'Liga não encontrada'; end if;
  if target_league.owner_id <> auth.uid() then raise exception 'Somente o criador pode processar a rodada'; end if;
  if target_league.current_round <> target_round then raise exception 'Rodada inválida ou já processada'; end if;

  select count(*) into total_members from public.online_league_members where league_id = target_league_id;
  select count(*) into submitted from public.online_round_submissions where league_id = target_league_id and round = target_round;
  if submitted < total_members then
    return jsonb_build_object('status', 'waiting', 'submitted', submitted, 'total', total_members);
  end if;

  select avg(m.team_power + case s.strategy when 'three' then 2 when 'defense' then 1 else 0 end + (abs(hashtext(m.user_id::text || target_round::text)) % 5))
    into average_score
    from public.online_league_members m join public.online_round_submissions s on s.league_id = m.league_id and s.user_id = m.user_id and s.round = target_round
    where m.league_id = target_league_id;

  for member_record in
    select m.*, s.strategy from public.online_league_members m join public.online_round_submissions s on s.league_id = m.league_id and s.user_id = m.user_id and s.round = target_round where m.league_id = target_league_id
  loop
    computed_score := member_record.team_power + case member_record.strategy when 'three' then 2 when 'defense' then 1 else 0 end + (abs(hashtext(member_record.user_id::text || target_round::text)) % 5);
    update public.online_league_members
      set wins = wins + case when computed_score >= average_score then 1 else 0 end,
          losses = losses + case when computed_score < average_score then 1 else 0 end,
          points_for = points_for + computed_score + 70,
          points_against = points_against + round(average_score)::integer + 70
      where league_id = target_league_id and user_id = member_record.user_id;
    resolved_count := resolved_count + 1;
  end loop;

  update public.online_leagues set current_round = least(current_round + 1, 14), status = 'active' where id = target_league_id;
  return jsonb_build_object('status', 'resolved', 'resolved', resolved_count, 'next_round', least(target_league.current_round + 1, 14));
end;
$$;

revoke all on function public.resolve_online_round(uuid, integer) from public;
grant execute on function public.resolve_online_round(uuid, integer) to authenticated;

-- Expansão da liga: confrontos individuais, prazo e histórico.
alter table public.online_leagues add column if not exists round_deadline timestamptz not null default (now() + interval '3 days');

create table if not exists public.online_matches (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.online_leagues(id) on delete cascade,
  round integer not null check (round between 1 and 14),
  home_user_id uuid not null references auth.users(id) on delete cascade,
  away_user_id uuid not null references auth.users(id) on delete cascade,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  home_strategy text not null,
  away_strategy text not null,
  played_at timestamptz not null default now(),
  unique (league_id, round, home_user_id, away_user_id)
);

create table if not exists public.online_notifications (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.online_leagues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null default 'league',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.online_matches enable row level security;
alter table public.online_notifications enable row level security;

drop policy if exists "Members can read matches" on public.online_matches;
create policy "Members can read matches" on public.online_matches for select to authenticated
  using (public.is_online_league_member(league_id));

drop policy if exists "Users cannot write matches" on public.online_matches;
create policy "Users cannot write matches" on public.online_matches for insert to authenticated
  with check (false);

drop policy if exists "Users can read their notifications" on public.online_notifications;
create policy "Users can read their notifications" on public.online_notifications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can update their notifications" on public.online_notifications;
create policy "Users can update their notifications" on public.online_notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists online_matches_league_round_idx on public.online_matches(league_id, round);
create index if not exists online_notifications_user_created_idx on public.online_notifications(user_id, created_at desc);

create or replace function public.resolve_online_round_v2(target_league_id uuid, target_round integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_league public.online_leagues%rowtype;
  submitted integer;
  total_members integer;
  pair record;
  home_score integer;
  away_score integer;
  matches_created integer := 0;
  deadline timestamptz := now() + interval '3 days';
begin
  select * into target_league from public.online_leagues where id = target_league_id;
  if target_league.id is null then raise exception 'Liga não encontrada'; end if;
  if target_league.owner_id <> auth.uid() then raise exception 'Somente o criador pode processar a rodada'; end if;
  if target_league.current_round <> target_round then raise exception 'Rodada inválida ou já processada'; end if;

  select count(*) into total_members from public.online_league_members where league_id = target_league_id;
  select count(*) into submitted from public.online_round_submissions where league_id = target_league_id and round = target_round;
  if submitted < total_members and now() < target_league.round_deadline then
    return jsonb_build_object('status', 'waiting', 'submitted', submitted, 'total', total_members, 'deadline', target_league.round_deadline);
  end if;

  for pair in
    with ranked as (
      select m.user_id, m.team_power, s.strategy,
        row_number() over (order by m.user_id) as rn
      from public.online_league_members m
      join public.online_round_submissions s on s.league_id = m.league_id and s.user_id = m.user_id and s.round = target_round
      where m.league_id = target_league_id
    )
    select home.user_id as home_user_id, away.user_id as away_user_id,
      home.team_power as home_power, away.team_power as away_power,
      home.strategy as home_strategy, away.strategy as away_strategy
    from ranked home join ranked away on away.rn = home.rn + 1
    where mod(home.rn, 2) = 1
  loop
    home_score := pair.home_power + case pair.home_strategy when 'three' then 3 when 'defense' then 1 else 2 end + (abs(hashtext(pair.home_user_id::text || target_round::text)) % 8) + 72;
    away_score := pair.away_power + case pair.away_strategy when 'three' then 3 when 'defense' then 1 else 2 end + (abs(hashtext(pair.away_user_id::text || target_round::text)) % 8) + 70;
    if home_score = away_score then away_score := away_score - 1; end if;

    insert into public.online_matches(league_id, round, home_user_id, away_user_id, home_score, away_score, home_strategy, away_strategy)
      values (target_league_id, target_round, pair.home_user_id, pair.away_user_id, home_score, away_score, pair.home_strategy, pair.away_strategy)
      on conflict (league_id, round, home_user_id, away_user_id) do nothing;

    update public.online_league_members set
      wins = wins + case when home_score > away_score then 1 else 0 end,
      losses = losses + case when home_score < away_score then 1 else 0 end,
      points_for = points_for + home_score, points_against = points_against + away_score
      where league_id = target_league_id and user_id = pair.home_user_id;
    update public.online_league_members set
      wins = wins + case when away_score > home_score then 1 else 0 end,
      losses = losses + case when away_score < home_score then 1 else 0 end,
      points_for = points_for + away_score, points_against = points_against + home_score
      where league_id = target_league_id and user_id = pair.away_user_id;

    insert into public.online_notifications(league_id, user_id, title, body, kind)
      values
        (target_league_id, pair.home_user_id, 'Rodada processada', 'Seu confronto terminou ' || home_score || ' x ' || away_score || '.', 'match'),
        (target_league_id, pair.away_user_id, 'Rodada processada', 'Seu confronto terminou ' || away_score || ' x ' || home_score || '.', 'match');
    matches_created := matches_created + 1;
  end loop;

  deadline := now() + interval '3 days';
  update public.online_leagues set current_round = least(current_round + 1, 14), status = 'active', round_deadline = deadline where id = target_league_id;
  return jsonb_build_object('status', 'resolved', 'matches', matches_created, 'next_round', least(target_league.current_round + 1, 14), 'deadline', deadline);
end;
$$;

revoke all on function public.resolve_online_round_v2(uuid, integer) from public;
grant execute on function public.resolve_online_round_v2(uuid, integer) to authenticated;
