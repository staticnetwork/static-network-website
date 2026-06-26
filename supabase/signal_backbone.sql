-- STATIC Social Signal ledger.
-- Additive migration: turns local preview rewards into durable cloud events.
-- This does not mint paid currency, process payments, or expose service keys.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists signal_score bigint not null default 0,
  add column if not exists signal_updated_at timestamptz;

create table if not exists public.signal_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null default 'activity',
  points integer not null check (points <> 0),
  reason text not null,
  target_id text,
  target_type text,
  route text default '/feed',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists signal_events_owner_created_idx
  on public.signal_events(owner_id, created_at desc);

create index if not exists signal_events_target_idx
  on public.signal_events(target_type, target_id);

alter table public.signal_events enable row level security;

drop policy if exists "Owners read signal events" on public.signal_events;
create policy "Owners read signal events"
on public.signal_events for select
using (auth.uid() = owner_id);

drop policy if exists "Owners create signal events" on public.signal_events;
create policy "Owners create signal events"
on public.signal_events for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners create notifications" on public.notifications;
create policy "Owners create notifications"
on public.notifications for insert
with check (auth.uid() = owner_id);

create or replace function public.add_signal_points(
  p_owner_id uuid,
  p_points integer,
  p_reason text,
  p_event_type text default 'activity',
  p_target_id text default null,
  p_target_type text default null,
  p_route text default '/feed',
  p_data jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_score bigint;
begin
  if auth.uid() is null or auth.uid() <> p_owner_id then
    raise exception 'Not allowed to update this Signal ledger.';
  end if;

  if p_points = 0 then
    raise exception 'Signal point event must be non-zero.';
  end if;

  insert into public.signal_events (
    owner_id,
    event_type,
    points,
    reason,
    target_id,
    target_type,
    route,
    data
  ) values (
    p_owner_id,
    coalesce(nullif(p_event_type, ''), 'activity'),
    p_points,
    coalesce(nullif(p_reason, ''), 'Signal activity'),
    nullif(p_target_id, ''),
    nullif(p_target_type, ''),
    coalesce(nullif(p_route, ''), '/feed'),
    coalesce(p_data, '{}'::jsonb)
  );

  update public.profiles
  set
    signal_score = greatest(0, signal_score + p_points),
    signal_updated_at = now(),
    updated_at = now()
  where id = p_owner_id
  returning signal_score into next_score;

  return coalesce(next_score, 0);
end;
$$;

grant execute on function public.add_signal_points(uuid, integer, text, text, text, text, text, jsonb) to authenticated;
