-- STATIC Network social/backend backbone.
-- Additive migration for the four-phase path:
-- 1) auth/social graph, 2) interactions/notifications,
-- 3) media/provider jobs, 4) live/economy/moderation gates.
--
-- This file is intentionally honest: it creates durable tables and RLS
-- policies, but it does not fake payments, generation, moderation, or live
-- streaming providers.

create extension if not exists pgcrypto;

alter table public.media_assets
  add column if not exists bucket text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  item_type text not null default 'signal',
  title text,
  route text default '/discover',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(owner_id, item_id, item_type)
);

create table if not exists public.signal_reactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  signal_id uuid references public.signals(id) on delete cascade,
  target_id text not null,
  target_type text not null default 'signal',
  reaction_type text not null default 'amplified',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(owner_id, target_id, target_type, reaction_type)
);

alter table public.comments
  add column if not exists target_id text,
  add column if not exists target_type text not null default 'signal',
  add column if not exists local_id text,
  add column if not exists data jsonb not null default '{}'::jsonb;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null,
  title text not null,
  body text,
  route text default '/account',
  read_at timestamptz,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  provider text not null,
  job_type text not null,
  status text not null default 'queued',
  prompt text,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error text,
  cost_cents integer not null default 0,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_processing_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  media_asset_id uuid references public.media_assets(id) on delete cascade,
  job_type text not null default 'thumbnail',
  status text not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  event_id uuid references public.live_events(id) on delete set null,
  entity_id uuid references public.entities(id) on delete set null,
  room_slug text not null unique,
  title text not null,
  status text not null default 'scheduled',
  starts_at timestamptz,
  ended_at timestamptz,
  route text default '/live',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  message text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  item_type text not null default 'marketplace',
  title text,
  status text not null default 'intent_only',
  amount_cents integer,
  currency text default 'usd',
  provider text,
  provider_reference text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_id text not null,
  target_type text not null,
  reason text not null,
  detail text,
  status text not null default 'open',
  route text default '/discover',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid references public.profiles(id) on delete set null,
  report_id uuid references public.moderation_reports(id) on delete set null,
  target_id text not null,
  target_type text not null,
  action text not null,
  note text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists saved_items_owner_id_idx on public.saved_items(owner_id);
create index if not exists saved_items_item_idx on public.saved_items(item_type, item_id);
create index if not exists signal_reactions_signal_id_idx on public.signal_reactions(signal_id);
create index if not exists signal_reactions_target_idx on public.signal_reactions(target_type, target_id);
create index if not exists comments_target_idx on public.comments(target_type, target_id);
create unique index if not exists comments_owner_local_id_idx
  on public.comments(owner_id, local_id)
  where local_id is not null;
create index if not exists notifications_owner_read_idx on public.notifications(owner_id, read_at);
create index if not exists provider_jobs_owner_status_idx on public.provider_jobs(owner_id, status);
create index if not exists media_processing_jobs_owner_status_idx on public.media_processing_jobs(owner_id, status);
create index if not exists live_rooms_status_idx on public.live_rooms(status);
create index if not exists live_room_messages_room_idx on public.live_room_messages(room_id, created_at);
create index if not exists marketplace_orders_owner_status_idx on public.marketplace_orders(owner_id, status);
create index if not exists moderation_reports_target_idx on public.moderation_reports(target_type, target_id);
create index if not exists moderation_reports_status_idx on public.moderation_reports(status);

alter table public.saved_items enable row level security;
alter table public.signal_reactions enable row level security;
alter table public.notifications enable row level security;
alter table public.provider_jobs enable row level security;
alter table public.media_processing_jobs enable row level security;
alter table public.live_rooms enable row level security;
alter table public.live_room_messages enable row level security;
alter table public.marketplace_orders enable row level security;
alter table public.moderation_reports enable row level security;
alter table public.moderation_actions enable row level security;

drop policy if exists "Owners manage saved items" on public.saved_items;
create policy "Owners manage saved items"
on public.saved_items for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage signal reactions" on public.signal_reactions;
create policy "Owners manage signal reactions"
on public.signal_reactions for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Public signal reactions are readable" on public.signal_reactions;
create policy "Public signal reactions are readable"
on public.signal_reactions for select
using (true);

drop policy if exists "Owners read notifications" on public.notifications;
create policy "Owners read notifications"
on public.notifications for select
using (auth.uid() = owner_id);

drop policy if exists "Owners update notifications" on public.notifications;
create policy "Owners update notifications"
on public.notifications for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners create provider jobs" on public.provider_jobs;
create policy "Owners create provider jobs"
on public.provider_jobs for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners read provider jobs" on public.provider_jobs;
create policy "Owners read provider jobs"
on public.provider_jobs for select
using (auth.uid() = owner_id);

drop policy if exists "Owners create media processing jobs" on public.media_processing_jobs;
create policy "Owners create media processing jobs"
on public.media_processing_jobs for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners read media processing jobs" on public.media_processing_jobs;
create policy "Owners read media processing jobs"
on public.media_processing_jobs for select
using (auth.uid() = owner_id);

drop policy if exists "Readable live rooms" on public.live_rooms;
create policy "Readable live rooms"
on public.live_rooms for select
using (status in ('live', 'scheduled') or owner_id is null or auth.uid() = owner_id);

drop policy if exists "Owners manage live rooms" on public.live_rooms;
create policy "Owners manage live rooms"
on public.live_rooms for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Readable live room messages" on public.live_room_messages;
create policy "Readable live room messages"
on public.live_room_messages for select
using (
  exists (
    select 1 from public.live_rooms
    where live_rooms.id = live_room_messages.room_id
    and (live_rooms.status in ('live', 'scheduled') or live_rooms.owner_id = auth.uid())
  )
);

drop policy if exists "Authenticated users create live room messages" on public.live_room_messages;
create policy "Authenticated users create live room messages"
on public.live_room_messages for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage marketplace order intents" on public.marketplace_orders;
create policy "Owners manage marketplace order intents"
on public.marketplace_orders for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Authenticated users create moderation reports" on public.moderation_reports;
create policy "Authenticated users create moderation reports"
on public.moderation_reports for insert
with check (auth.uid() = reporter_id);

drop policy if exists "Reporters read their moderation reports" on public.moderation_reports;
create policy "Reporters read their moderation reports"
on public.moderation_reports for select
using (auth.uid() = reporter_id);

-- Admin/moderator reads and moderation_actions should be wired with service-role
-- functions later. Do not expose service-role keys to the browser.
