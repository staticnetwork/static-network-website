-- STATIC Network cloud spine.
-- Additive migration for account-owned projects, inventory, follows,
-- reminders, marketplace intent, live events, and radio station saves.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  local_id text,
  type text not null default 'studio',
  title text not null default 'Untitled Project',
  prompt text,
  style text,
  output_type text,
  status text,
  route text default '/studio',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_actions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  saved boolean not null default false,
  requested boolean not null default false,
  followed boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, item_id)
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  item_type text not null default 'marketplace',
  title text,
  route text default '/marketplace',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(owner_id, item_id)
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  target_id text not null,
  target_type text not null default 'venue',
  title text,
  route text default '/discover',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(owner_id, target_id, target_type)
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  kind text not null default 'programming',
  title text,
  detail text,
  route text default '/discover',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(owner_id, item_id)
);

create table if not exists public.live_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  title text not null,
  creator text,
  format text,
  starts_at timestamptz,
  live boolean not null default false,
  route text default '/live',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, entity_id)
);

create table if not exists public.radio_stations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  station_id text not null,
  name text not null,
  genre text,
  frequency text,
  route text default '/radio',
  saved boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, station_id)
);

create unique index if not exists projects_owner_local_id_idx
  on public.projects(owner_id, local_id)
  where local_id is not null;

create index if not exists projects_owner_id_idx on public.projects(owner_id);
create index if not exists projects_entity_id_idx on public.projects(entity_id);
create index if not exists marketplace_actions_owner_id_idx on public.marketplace_actions(owner_id);
create index if not exists inventory_owner_id_idx on public.inventory(owner_id);
create index if not exists follows_owner_id_idx on public.follows(owner_id);
create index if not exists reminders_owner_id_idx on public.reminders(owner_id);
create index if not exists live_events_owner_id_idx on public.live_events(owner_id);
create index if not exists live_events_live_idx on public.live_events(live);
create index if not exists radio_stations_owner_id_idx on public.radio_stations(owner_id);

alter table public.projects enable row level security;
alter table public.marketplace_actions enable row level security;
alter table public.inventory enable row level security;
alter table public.follows enable row level security;
alter table public.reminders enable row level security;
alter table public.live_events enable row level security;
alter table public.radio_stations enable row level security;

drop policy if exists "Owners manage projects" on public.projects;
create policy "Owners manage projects"
on public.projects for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage marketplace actions" on public.marketplace_actions;
create policy "Owners manage marketplace actions"
on public.marketplace_actions for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage inventory" on public.inventory;
create policy "Owners manage inventory"
on public.inventory for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage follows" on public.follows;
create policy "Owners manage follows"
on public.follows for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage reminders" on public.reminders;
create policy "Owners manage reminders"
on public.reminders for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Readable live events" on public.live_events;
create policy "Readable live events"
on public.live_events for select
using (live = true or owner_id is null or auth.uid() = owner_id);

drop policy if exists "Owners manage live events" on public.live_events;
create policy "Owners manage live events"
on public.live_events for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Readable radio stations" on public.radio_stations;
create policy "Readable radio stations"
on public.radio_stations for select
using (owner_id is null or auth.uid() = owner_id);

drop policy if exists "Owners manage radio stations" on public.radio_stations;
create policy "Owners manage radio stations"
on public.radio_stations for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);
