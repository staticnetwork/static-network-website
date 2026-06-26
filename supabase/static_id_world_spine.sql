-- STATIC ID / World Spine
-- Additive migration for the cross-platform STATIC account, Entity loadouts,
-- companions/bodyguards, vehicles, property/spawn rights, world sessions, and
-- event access. This does not fake gameplay; it creates the ownership spine the
-- web app, future mobile app, and future Unreal/engine client can share.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists static_id text,
  add column if not exists access_tier text not null default 'waitlist',
  add column if not exists beta_status text not null default 'requested',
  add column if not exists preferred_platform text not null default 'web',
  add column if not exists platform_access jsonb not null default '{}'::jsonb,
  add column if not exists account_flags jsonb not null default '{}'::jsonb;

create unique index if not exists profiles_static_id_idx
  on public.profiles(lower(static_id))
  where static_id is not null;

create table if not exists public.platform_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  platform_user_id text,
  platform_handle text,
  device_label text,
  status text not null default 'linked',
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz,
  data jsonb not null default '{}'::jsonb,
  unique(owner_id, platform, platform_user_id)
);

create table if not exists public.entity_loadouts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid not null references public.entities(id) on delete cascade,
  active_outfit_item_id text,
  active_vehicle_id uuid,
  active_property_id uuid,
  active_companion_slots jsonb not null default '[]'::jsonb,
  status_tier text not null default 'starter',
  visibility text not null default 'private',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, entity_id)
);

create table if not exists public.companion_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  companion_key text not null,
  name text not null,
  companion_type text not null default 'guardian',
  scale_class text not null default 'medium',
  role text not null default 'companion',
  behavior_profile text not null default 'visual_follow',
  model_url text,
  thumbnail_url text,
  source text not null default 'static_original',
  license text,
  moderation_status text not null default 'pending',
  performance_budget jsonb not null default '{}'::jsonb,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, companion_key)
);

create table if not exists public.companion_slots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid not null references public.entities(id) on delete cascade,
  companion_id uuid not null references public.companion_assets(id) on delete cascade,
  slot_index int not null default 1,
  slot_type text not null default 'companion',
  follow_mode text not null default 'follow',
  protect_mode text not null default 'cosmetic_only',
  active boolean not null default true,
  district_permissions jsonb not null default '{}'::jsonb,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, entity_id, slot_index)
);

create table if not exists public.vehicle_builds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  vehicle_key text not null,
  name text not null,
  vehicle_class text not null default 'street',
  model_url text,
  thumbnail_url text,
  customization jsonb not null default '{}'::jsonb,
  status text not null default 'preview',
  moderation_status text not null default 'pending',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, vehicle_key)
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  property_key text not null,
  name text not null,
  property_type text not null default 'residence',
  city_tier text,
  spawn_x numeric,
  spawn_y numeric,
  route text default '/city',
  visibility text not null default 'private',
  status text not null default 'preview',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, property_key)
);

create table if not exists public.property_access (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  access_level text not null default 'owner',
  spawn_enabled boolean not null default false,
  granted_by uuid references public.profiles(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(owner_id, entity_id, property_id)
);

create table if not exists public.world_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  active_vehicle_id uuid references public.vehicle_builds(id) on delete set null,
  active_property_id uuid references public.properties(id) on delete set null,
  client_type text not null default 'web',
  scene_id text not null default 'arrival-district',
  route_node_id text,
  session_status text not null default 'preview',
  position jsonb not null default '{}'::jsonb,
  camera_state jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  data jsonb not null default '{}'::jsonb
);

create table if not exists public.event_access (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  event_id text not null,
  event_type text not null default 'venue',
  access_level text not null default 'general',
  status text not null default 'reserved',
  route text default '/live',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, event_id, event_type)
);

create table if not exists public.sports_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  event_key text not null,
  title text not null,
  sport text not null default 'basketball',
  venue_key text not null default 'static-arena',
  route text not null default '/city',
  event_status text not null default 'preview',
  visibility text not null default 'private',
  starts_at timestamptz,
  ends_at timestamptz,
  rights_status text not null default 'static_original',
  moderation_status text not null default 'pending',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, event_key)
);

create table if not exists public.team_rosters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete cascade,
  team_key text not null,
  team_name text not null,
  sport text not null default 'basketball',
  role text not null default 'player',
  jersey_item_id text,
  status text not null default 'preview',
  moderation_status text not null default 'pending',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, team_key, entity_id)
);

create table if not exists public.arena_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  sports_event_id uuid references public.sports_events(id) on delete cascade,
  session_key text not null,
  mode text not null default 'watch_party',
  venue_key text not null default 'static-arena',
  session_status text not null default 'preview',
  participant_limit int,
  scoreboard jsonb not null default '{}'::jsonb,
  validation_state text not null default 'not_validated',
  replay_url text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, session_key)
);

create index if not exists platform_links_owner_id_idx on public.platform_links(owner_id);
create index if not exists entity_loadouts_owner_id_idx on public.entity_loadouts(owner_id);
create index if not exists companion_assets_owner_id_idx on public.companion_assets(owner_id);
create index if not exists companion_slots_owner_entity_idx on public.companion_slots(owner_id, entity_id);
create index if not exists vehicle_builds_owner_id_idx on public.vehicle_builds(owner_id);
create index if not exists properties_owner_id_idx on public.properties(owner_id);
create index if not exists property_access_owner_entity_idx on public.property_access(owner_id, entity_id);
create index if not exists world_sessions_owner_id_idx on public.world_sessions(owner_id);
create index if not exists world_sessions_status_idx on public.world_sessions(session_status);
create index if not exists event_access_owner_id_idx on public.event_access(owner_id);
create index if not exists sports_events_owner_id_idx on public.sports_events(owner_id);
create index if not exists sports_events_venue_status_idx on public.sports_events(venue_key, event_status);
create index if not exists team_rosters_owner_id_idx on public.team_rosters(owner_id);
create index if not exists arena_sessions_owner_id_idx on public.arena_sessions(owner_id);
create index if not exists arena_sessions_event_idx on public.arena_sessions(sports_event_id);

alter table public.platform_links enable row level security;
alter table public.entity_loadouts enable row level security;
alter table public.companion_assets enable row level security;
alter table public.companion_slots enable row level security;
alter table public.vehicle_builds enable row level security;
alter table public.properties enable row level security;
alter table public.property_access enable row level security;
alter table public.world_sessions enable row level security;
alter table public.event_access enable row level security;
alter table public.sports_events enable row level security;
alter table public.team_rosters enable row level security;
alter table public.arena_sessions enable row level security;

drop policy if exists "Owners manage platform links" on public.platform_links;
create policy "Owners manage platform links"
on public.platform_links for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage entity loadouts" on public.entity_loadouts;
create policy "Owners manage entity loadouts"
on public.entity_loadouts for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Readable companion catalog" on public.companion_assets;
create policy "Readable companion catalog"
on public.companion_assets for select
using (owner_id is null or auth.uid() = owner_id or moderation_status = 'approved');

drop policy if exists "Owners manage companions" on public.companion_assets;
create policy "Owners manage companions"
on public.companion_assets for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage companion slots" on public.companion_slots;
create policy "Owners manage companion slots"
on public.companion_slots for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage vehicle builds" on public.vehicle_builds;
create policy "Owners manage vehicle builds"
on public.vehicle_builds for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Readable public properties" on public.properties;
create policy "Readable public properties"
on public.properties for select
using (visibility = 'public' or owner_id is null or auth.uid() = owner_id);

drop policy if exists "Owners manage properties" on public.properties;
create policy "Owners manage properties"
on public.properties for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage property access" on public.property_access;
create policy "Owners manage property access"
on public.property_access for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage world sessions" on public.world_sessions;
create policy "Owners manage world sessions"
on public.world_sessions for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage event access" on public.event_access;
create policy "Owners manage event access"
on public.event_access for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Readable public sports events" on public.sports_events;
create policy "Readable public sports events"
on public.sports_events for select
using (visibility = 'public' or owner_id is null or auth.uid() = owner_id);

drop policy if exists "Owners manage sports events" on public.sports_events;
create policy "Owners manage sports events"
on public.sports_events for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage team rosters" on public.team_rosters;
create policy "Owners manage team rosters"
on public.team_rosters for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Readable public arena sessions" on public.arena_sessions;
create policy "Readable public arena sessions"
on public.arena_sessions for select
using (session_status = 'public_preview' or owner_id is null or auth.uid() = owner_id);

drop policy if exists "Owners manage arena sessions" on public.arena_sessions;
create policy "Owners manage arena sessions"
on public.arena_sessions for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);
