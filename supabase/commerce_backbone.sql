-- STATIC Social commerce backbone.
-- Additive migration for Static Coins, Stripe checkout fulfillment, and
-- server-only wallet updates. Apply after social_backbone.sql.

create extension if not exists pgcrypto;

alter table public.marketplace_orders
  add column if not exists fulfilled_at timestamptz;

create unique index if not exists marketplace_orders_provider_reference_unique_idx
  on public.marketplace_orders(provider_reference);

create table if not exists public.static_coin_wallets (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  lifetime_earned integer not null default 0 check (lifetime_earned >= 0),
  lifetime_spent integer not null default 0 check (lifetime_spent >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.static_coin_ledger (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.marketplace_orders(id) on delete set null,
  delta integer not null check (delta <> 0),
  reason text not null,
  provider text,
  provider_reference text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists static_coin_ledger_provider_reference_reason_idx
  on public.static_coin_ledger(provider, provider_reference, reason)
  where provider_reference is not null;

create index if not exists static_coin_ledger_owner_created_idx
  on public.static_coin_ledger(owner_id, created_at desc);

alter table public.static_coin_wallets enable row level security;
alter table public.static_coin_ledger enable row level security;

drop policy if exists "Owners read static coin wallets" on public.static_coin_wallets;
create policy "Owners read static coin wallets"
on public.static_coin_wallets for select
using (auth.uid() = owner_id);

drop policy if exists "Owners read static coin ledger" on public.static_coin_ledger;
create policy "Owners read static coin ledger"
on public.static_coin_ledger for select
using (auth.uid() = owner_id);

create or replace function public.credit_static_coins(
  p_owner_id uuid,
  p_delta integer,
  p_reason text,
  p_provider text default null,
  p_provider_reference text default null,
  p_order_id uuid default null,
  p_data jsonb default '{}'::jsonb
)
returns public.static_coin_wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_ledger_id uuid;
  wallet_row public.static_coin_wallets;
begin
  if p_owner_id is null then
    raise exception 'owner_id is required';
  end if;

  if p_delta <= 0 then
    raise exception 'credit delta must be positive';
  end if;

  insert into public.static_coin_ledger (
    owner_id,
    order_id,
    delta,
    reason,
    provider,
    provider_reference,
    data
  )
  values (
    p_owner_id,
    p_order_id,
    p_delta,
    p_reason,
    p_provider,
    p_provider_reference,
    coalesce(p_data, '{}'::jsonb)
  )
  on conflict do nothing
  returning id into inserted_ledger_id;

  if inserted_ledger_id is null then
    select * into wallet_row
    from public.static_coin_wallets
    where owner_id = p_owner_id;

    if wallet_row.owner_id is null then
      insert into public.static_coin_wallets (owner_id)
      values (p_owner_id)
      on conflict (owner_id) do nothing;

      select * into wallet_row
      from public.static_coin_wallets
      where owner_id = p_owner_id;
    end if;

    return wallet_row;
  end if;

  insert into public.static_coin_wallets (
    owner_id,
    balance,
    lifetime_earned,
    updated_at
  )
  values (
    p_owner_id,
    p_delta,
    p_delta,
    now()
  )
  on conflict (owner_id) do update
  set
    balance = public.static_coin_wallets.balance + excluded.balance,
    lifetime_earned = public.static_coin_wallets.lifetime_earned + excluded.lifetime_earned,
    updated_at = now()
  returning * into wallet_row;

  update public.marketplace_orders
  set fulfilled_at = coalesce(fulfilled_at, now()),
      updated_at = now()
  where id = p_order_id;

  return wallet_row;
end;
$$;

revoke all on function public.credit_static_coins(uuid, integer, text, text, text, uuid, jsonb) from public;
grant execute on function public.credit_static_coins(uuid, integer, text, text, text, uuid, jsonb) to service_role;
