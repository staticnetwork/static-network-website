-- STATIC World Asset Intake Spine
-- Additive draft migration for owner-reviewed world asset intake.
--
-- This does not activate a public marketplace, payments, asset ownership,
-- Unreal imports, NPC intelligence, or creator uploads. It only creates the
-- reviewable backend shape for moving the local `/asset-intake` console into
-- authenticated cloud state later.
--
-- Apply after:
-- 1. supabase/schema.sql
-- 2. supabase/static_id_world_spine.sql
-- 3. supabase/world_engine_story_spine.sql

create extension if not exists pgcrypto;

create table if not exists public.world_asset_intake_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  intake_key text not null,
  name text not null,
  slug text not null,
  source_name text,
  source_url text,
  source_status text not null default 'Needs sourcing',
  license_status text not null default 'Unknown',
  asset_type text not null default 'Character',
  asset_format text not null default 'GLB',
  target_home_id text not null default 'asset-quarantine',
  target_home_label text not null default 'Catalog / Quarantine',
  world_layer text not null default 'Pipeline',
  biome text,
  rarity text not null default 'Common',
  gameplay_role text not null default 'Ambient NPC',
  faction text,
  creator_space text,
  scale_class text not null default 'Human scale',
  npc_ecosystem boolean not null default false,
  owner_approved_placement boolean not null default false,
  ready_for_blender boolean not null default false,
  ready_for_unreal boolean not null default false,
  readiness_score int not null default 0 check (readiness_score >= 0 and readiness_score <= 100),
  intake_status text not null default 'Quarantine',
  unreal_target_path text,
  web_prototype_path text,
  import_notes text,
  lore_notes text,
  moderation_notes text,
  file_notes text,
  visibility text not null default 'owner_internal',
  moderation_status text not null default 'internal_review',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, intake_key)
);

create table if not exists public.world_asset_intake_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  intake_id uuid not null references public.world_asset_intake_records(id) on delete cascade,
  file_role text not null default 'source',
  file_name text not null,
  storage_bucket text,
  storage_path text,
  public_url text,
  mime_type text,
  file_size_bytes bigint,
  checksum text,
  scan_status text not null default 'not_scanned',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.world_asset_placement_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  intake_id uuid not null references public.world_asset_intake_records(id) on delete cascade,
  review_status text not null default 'pending',
  placement_decision text not null default 'quarantine',
  reviewer_note text,
  target_home_id text,
  target_home_label text,
  gameplay_role text,
  rarity text,
  faction text,
  npc_ecosystem boolean,
  reviewed_at timestamptz,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.world_asset_import_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  intake_id uuid not null references public.world_asset_intake_records(id) on delete cascade,
  job_type text not null default 'unreal_import_plan',
  job_status text not null default 'planned',
  target_engine text not null default 'unreal-5.8',
  source_file_id uuid references public.world_asset_intake_files(id) on delete set null,
  output_path text,
  error_message text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists world_asset_intake_owner_idx
  on public.world_asset_intake_records(owner_id, updated_at desc);

create index if not exists world_asset_intake_status_idx
  on public.world_asset_intake_records(intake_status, license_status, source_status);

create index if not exists world_asset_intake_home_idx
  on public.world_asset_intake_records(target_home_id, asset_type, rarity);

create index if not exists world_asset_intake_ecosystem_idx
  on public.world_asset_intake_records(target_home_id, npc_ecosystem)
  where npc_ecosystem = true;

create index if not exists world_asset_intake_files_owner_idx
  on public.world_asset_intake_files(owner_id, intake_id);

create index if not exists world_asset_placement_reviews_owner_idx
  on public.world_asset_placement_reviews(owner_id, intake_id, review_status);

create index if not exists world_asset_import_jobs_owner_idx
  on public.world_asset_import_jobs(owner_id, intake_id, job_status);

alter table public.world_asset_intake_records enable row level security;
alter table public.world_asset_intake_files enable row level security;
alter table public.world_asset_placement_reviews enable row level security;
alter table public.world_asset_import_jobs enable row level security;

drop policy if exists "Owners manage world asset intake" on public.world_asset_intake_records;
create policy "Owners manage world asset intake"
on public.world_asset_intake_records for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage world asset intake files" on public.world_asset_intake_files;
create policy "Owners manage world asset intake files"
on public.world_asset_intake_files for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage world asset placement reviews" on public.world_asset_placement_reviews;
create policy "Owners manage world asset placement reviews"
on public.world_asset_placement_reviews for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage world asset import jobs" on public.world_asset_import_jobs;
create policy "Owners manage world asset import jobs"
on public.world_asset_import_jobs for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- Future server-side TODO:
-- - mirror approved intake records into world_asset_registry only after license,
--   moderation, placement, and import status are approved
-- - validate uploaded file MIME, size, virus scan, thumbnail generation, and
--   commercial-rights metadata before any public visibility
-- - never allow client-only writes to ownership, commerce, rare companion, or
--   Unreal import-complete state
