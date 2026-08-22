import { supabase } from "@/lib/supabase";

export type OnlineLeague = {
  id: string;
  code: string;
  name: string;
  owner_id: string;
  max_teams: number;
  current_round: number;
  status: "open" | "active" | "finished";
  created_at: string;
  round_deadline: string;
};

export type OnlineMatch = {
  id: string;
  league_id: string;
  round: number;
  home_user_id: string;
  away_user_id: string;
  home_score: number;
  away_score: number;
  home_strategy: string;
  away_strategy: string;
  played_at: string;
};

export type OnlineNotification = {
  id: string;
  league_id: string;
  user_id: string;
  title: string;
  body: string;
  kind: string;
  read_at: string | null;
  created_at: string;
};

export type OnlineLeagueMember = {
  league_id: string;
  user_id: string;
  club_name: string;
  team_power: number;
  wins: number;
  losses: number;
  points_for: number;
  points_against: number;
  joined_at: string;
};

export type OnlineRoundSubmission = {
  league_id: string;
  user_id: string;
  round: number;
  strategy: "control" | "three" | "defense";
  starter_ids: string[];
  submitted_at: string;
};

export type OnlineLeagueSummary = {
  league: OnlineLeague;
  membership: OnlineLeagueMember;
};

function makeLeagueCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
}

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user)
    throw new Error("Entre com sua conta para acessar a liga online.");
  return data.user.id;
}

export async function createOnlineLeague(
  name: string,
  clubName: string,
  teamPower: number,
): Promise<OnlineLeagueSummary> {
  const userId = await requireUserId();
  const { data: league, error: leagueError } = await supabase
    .from("online_leagues")
    .insert({ code: makeLeagueCode(), name: name.trim(), owner_id: userId })
    .select("*")
    .single();
  if (leagueError || !league)
    throw new Error(leagueError?.message ?? "Não foi possível criar a liga.");

  const { data: membership, error: memberError } = await supabase
    .from("online_league_members")
    .insert({
      league_id: league.id,
      user_id: userId,
      club_name: clubName.trim(),
      team_power: teamPower,
    })
    .select("*")
    .single();
  if (memberError || !membership)
    throw new Error(
      memberError?.message ??
        "Liga criada, mas não foi possível registrar seu clube.",
    );
  return { league, membership };
}

export async function joinOnlineLeague(
  code: string,
  clubName: string,
  teamPower: number,
): Promise<OnlineLeagueSummary> {
  const userId = await requireUserId();
  const { data: league, error: leagueError } = await supabase
    .from("online_leagues")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single();
  if (leagueError || !league)
    throw new Error("Código de liga não encontrado ou indisponível.");
  const { data: membership, error: memberError } = await supabase
    .from("online_league_members")
    .insert({
      league_id: league.id,
      user_id: userId,
      club_name: clubName.trim(),
      team_power: teamPower,
    })
    .select("*")
    .single();
  if (memberError || !membership)
    throw new Error(
      memberError?.code === "23505"
        ? "Você já está nesta liga."
        : (memberError?.message ?? "Não foi possível entrar na liga."),
    );
  return { league, membership };
}

export async function listOnlineLeagues(): Promise<OnlineLeagueSummary[]> {
  const userId = await requireUserId();
  const { data: memberships, error: memberError } = await supabase
    .from("online_league_members")
    .select("*")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });
  if (memberError) throw new Error(memberError.message);
  if (!memberships?.length) return [];
  const ids = memberships.map((membership) => membership.league_id);
  const { data: leagues, error: leagueError } = await supabase
    .from("online_leagues")
    .select("*")
    .in("id", ids);
  if (leagueError) throw new Error(leagueError.message);
  return (leagues ?? []).flatMap((league) => {
    const membership = memberships.find((item) => item.league_id === league.id);
    return membership ? [{ league, membership }] : [];
  });
}

export async function getOnlineLeagueDashboard(leagueId: string) {
  await requireUserId();
  const [
    { data: league, error: leagueError },
    { data: members, error: memberError },
    { data: submissions, error: submissionError },
    { data: matches, error: matchError },
    { data: notifications, error: notificationError },
  ] = await Promise.all([
    supabase.from("online_leagues").select("*").eq("id", leagueId).single(),
    supabase
      .from("online_league_members")
      .select("*")
      .eq("league_id", leagueId)
      .order("wins", { ascending: false })
      .order("points_for", { ascending: false }),
    supabase
      .from("online_round_submissions")
      .select("*")
      .eq("league_id", leagueId),
    supabase
      .from("online_matches")
      .select("*")
      .eq("league_id", leagueId)
      .order("round", { ascending: false })
      .order("played_at", { ascending: false }),
    supabase
      .from("online_notifications")
      .select("*")
      .eq("league_id", leagueId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  if (leagueError || !league)
    throw new Error(leagueError?.message ?? "Liga não encontrada.");
  if (memberError) throw new Error(memberError.message);
  if (submissionError) throw new Error(submissionError.message);
  if (matchError) throw new Error(matchError.message);
  if (notificationError) throw new Error(notificationError.message);
  return {
    league: league as OnlineLeague,
    members: (members ?? []) as OnlineLeagueMember[],
    submissions: (submissions ?? []) as OnlineRoundSubmission[],
    matches: (matches ?? []) as OnlineMatch[],
    notifications: (notifications ?? []) as OnlineNotification[],
  };
}

export async function submitOnlineRound(
  leagueId: string,
  round: number,
  strategy: OnlineRoundSubmission["strategy"],
  starterIds: string[],
) {
  const userId = await requireUserId();
  const { error } = await supabase.from("online_round_submissions").upsert(
    {
      league_id: leagueId,
      user_id: userId,
      round,
      strategy,
      starter_ids: starterIds,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "league_id,user_id,round" },
  );
  if (error) throw new Error(error.message);
}

export async function resolveOnlineRound(leagueId: string, round: number) {
  await requireUserId();
  const { data, error } = await supabase.rpc("resolve_online_round_v2", {
    target_league_id: leagueId,
    target_round: round,
  });
  if (error) throw new Error(error.message);
  return data as {
    status: "waiting" | "resolved";
    submitted?: number;
    total?: number;
    resolved?: number;
    next_round?: number;
    matches?: number;
    deadline?: string;
  };
}
