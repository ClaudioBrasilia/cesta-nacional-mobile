create table if not exists public.premium_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_id text not null check (char_length(entitlement_id) between 1 and 80),
  product_id text not null check (char_length(product_id) between 1 and 160),
  store text not null check (store in ('apple', 'google', 'web')),
  transaction_id text not null check (char_length(transaction_id) between 1 and 240),
  status text not null default 'active' check (status in ('active', 'refunded', 'expired', 'revoked')),
  purchased_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store, transaction_id)
);

alter table public.premium_entitlements enable row level security;

-- O aplicativo pode consultar apenas os próprios direitos. O servidor que valida
-- recibos deve usar uma chave protegida para inserir ou atualizar os registros.
drop policy if exists "Users can read their own premium entitlements" on public.premium_entitlements;
create policy "Users can read their own premium entitlements"
  on public.premium_entitlements for select
  to authenticated
  using (auth.uid() = user_id);

create index if not exists premium_entitlements_user_status_idx
  on public.premium_entitlements(user_id, entitlement_id, status);

create index if not exists premium_entitlements_expiration_idx
  on public.premium_entitlements(expires_at)
  where expires_at is not null;
