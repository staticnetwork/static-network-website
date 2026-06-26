-- STATIC World Engine / Story Spine
-- Additive draft migration for Unreal-ready world data, story missions,
-- interior tiers, asset registry, and hidden mature-nightlife access gates.
--
-- This file does not activate gameplay, commerce, adult content, multiplayer,
-- NPC intelligence, or provider generation. It only creates reviewable backend
-- state shapes for the web app and future Unreal client.
--
-- Apply after:
-- 1. supabase/schema.sql
-- 2. supabase/static_id_world_spine.sql

create extension if not exists pgcrypto;

create table if not exists public.world_asset_registry (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  asset_key text not null,
  name text not null,
  asset_type text not null default 'world',
  priority text not null default 'P2',
  target_path text not null,
  source_status text not null default 'not-sourced',
  license_status text not null default 'not-cleared',
  source_url text,
  source_provider text,
  file_size_bytes bigint,
  blender_notes text,
  unreal_notes text,
  moderation_status text not null default 'internal',
  visibility text not null default 'internal',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(asset_key)
);

create table if not exists public.static_city_districts (
  id uuid primary key default gen_random_uuid(),
  district_key text not null unique,
  name text not null,
  biome text,
  role text,
  visibility text not null default 'internal',
  engine_target text not null default 'unreal-5.8',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.world_route_nodes (
  id uuid primary key default gen_random_uuid(),
  node_key text not null unique,
  label text not null,
  node_type text not null default 'venue',
  district_key text,
  tier text,
  status text not null default 'planned',
  position jsonb not null default '{}'::jsonb,
  objective text,
  backend_contract text,
  visibility text not null default 'internal',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_missions (
  id uuid primary key default gen_random_uuid(),
  mission_key text not null unique,
  title text not null,
  chapter text not null default 'origin',
  mission_type text not null default 'story',
  status text not null default 'planned',
  visibility text not null default 'internal',
  cinematic_intent text,
  unlock_rules jsonb not null default '{}'::jsonb,
  reward_intent jsonb not null default '{}'::jsonb,
  district_dependencies jsonb not null default '[]'::jsonb,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mission_progress (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  mission_id uuid not null references public.story_missions(id) on delete cascade,
  status text not null default 'not_started',
  active_beat_key text,
  completed_beats jsonb not null default '[]'::jsonb,
  reward_state jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb,
  unique(owner_id, entity_id, mission_id)
);

create table if not exists public.building_interiors (
  id uuid primary key default gen_random_uuid(),
  interior_key text not null unique,
  building_key text,
  name text not null,
  district_key text,
  interior_tier text not null default 'template',
  access_type text not null default 'private',
  streaming_target text,
  moderation_status text not null default 'internal',
  visibility text not null default 'internal',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interior_instances (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  interior_id uuid not null references public.building_interiors(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  instance_key text not null,
  furniture_template text,
  spawn_markers jsonb not null default '[]'::jsonb,
  access_rules jsonb not null default '{}'::jsonb,
  reset_rules jsonb not null default '{}'::jsonb,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, instance_key)
);

create table if not exists public.age_gates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  gate_key text not null,
  consent_version text not null default 'v1',
  status text not null default 'not_granted',
  region text,
  legal_flags jsonb not null default '{}'::jsonb,
  audit_log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, gate_key, consent_version)
);

create index if not exists world_asset_registry_type_idx on public.world_asset_registry(asset_type, priority);
create index if not exists world_asset_registry_visibility_idx on public.world_asset_registry(visibility, moderation_status);
create index if not exists static_city_districts_visibility_idx on public.static_city_districts(visibility);
create index if not exists world_route_nodes_visibility_idx on public.world_route_nodes(visibility, status);
create index if not exists story_missions_chapter_idx on public.story_missions(chapter, status);
create index if not exists mission_progress_owner_idx on public.mission_progress(owner_id, status);
create index if not exists building_interiors_tier_idx on public.building_interiors(interior_tier, visibility);
create index if not exists interior_instances_owner_idx on public.interior_instances(owner_id, interior_id);
create index if not exists age_gates_owner_idx on public.age_gates(owner_id, gate_key, status);

alter table public.world_asset_registry enable row level security;
alter table public.static_city_districts enable row level security;
alter table public.world_route_nodes enable row level security;
alter table public.story_missions enable row level security;
alter table public.mission_progress enable row level security;
alter table public.building_interiors enable row level security;
alter table public.interior_instances enable row level security;
alter table public.age_gates enable row level security;

drop policy if exists "Readable approved world assets" on public.world_asset_registry;
create policy "Readable approved world assets"
on public.world_asset_registry for select
using (visibility = 'public' and moderation_status = 'approved' or auth.uid() = owner_id);

drop policy if exists "Owners manage world assets" on public.world_asset_registry;
create policy "Owners manage world assets"
on public.world_asset_registry for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Readable public static districts" on public.static_city_districts;
create policy "Readable public static districts"
on public.static_city_districts for select
using (visibility in ('public', 'public_preview'));

drop policy if exists "Readable public route nodes" on public.world_route_nodes;
create policy "Readable public route nodes"
on public.world_route_nodes for select
using (visibility in ('public', 'public_preview'));

drop policy if exists "Readable public story missions" on public.story_missions;
create policy "Readable public story missions"
on public.story_missions for select
using (visibility in ('public', 'public_preview'));

drop policy if exists "Owners manage mission progress" on public.mission_progress;
create policy "Owners manage mission progress"
on public.mission_progress for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Readable public building interiors" on public.building_interiors;
create policy "Readable public building interiors"
on public.building_interiors for select
using (visibility in ('public', 'public_preview') and moderation_status = 'approved');

drop policy if exists "Owners manage interior instances" on public.interior_instances;
create policy "Owners manage interior instances"
on public.interior_instances for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage age gates" on public.age_gates;
create policy "Owners manage age gates"
on public.age_gates for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);
