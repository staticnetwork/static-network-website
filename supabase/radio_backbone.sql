-- STATIC Radio backbone.
-- Additive migration for creator-owned/licensed audio, rights declarations,
-- station scheduling, and signed-in tune/play telemetry.
--
-- This does not wire Spotify, Suno, ElevenLabs Music, payments, or streaming.
-- Provider calls should enter through provider_jobs and server-side workers.

create extension if not exists pgcrypto;

alter table public.radio_stations
  add column if not exists station_slug text,
  add column if not exists description text,
  add column if not exists host_entity_id uuid references public.entities(id) on delete set null,
  add column if not exists status text not null default 'preview',
  add column if not exists visibility text not null default 'public',
  add column if not exists current_track_id uuid,
  add column if not exists schedule_strategy text not null default 'curated_rotation',
  add column if not exists starts_at timestamptz,
  add column if not exists ended_at timestamptz;

create table if not exists public.radio_tracks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  provider_job_id uuid,
  title text not null,
  artist text,
  source_type text not null default 'creator_upload',
  audio_url text,
  duration_seconds integer,
  bpm integer,
  mood text,
  genres jsonb not null default '[]'::jsonb,
  rights_status text not null default 'pending',
  visibility text not null default 'private',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_type in ('creator_upload', 'static_original', 'ai_generated', 'licensed_catalog', 'placeholder')),
  check (rights_status in ('pending', 'approved', 'rejected', 'needs_review')),
  check (visibility in ('public', 'private', 'unlisted', 'blocked'))
);

create table if not exists public.radio_rights_declarations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid not null references public.radio_tracks(id) on delete cascade,
  owns_master boolean not null default false,
  owns_publishing boolean not null default false,
  contains_third_party_samples boolean not null default false,
  commercial_use_confirmed boolean not null default false,
  ai_generated boolean not null default false,
  provider text,
  license_url text,
  declaration text,
  status text not null default 'pending_review',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, track_id),
  check (status in ('pending_review', 'approved', 'rejected', 'needs_info'))
);

create table if not exists public.radio_station_tracks (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.radio_stations(id) on delete cascade,
  track_id uuid references public.radio_tracks(id) on delete set null,
  position integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  segment_type text not null default 'track',
  weight numeric not null default 1,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (segment_type in ('track', 'host_break', 'ad_marker', 'station_id', 'live_takeover', 'placeholder'))
);

create table if not exists public.radio_play_events (
  id uuid primary key default gen_random_uuid(),
  station_id uuid references public.radio_stations(id) on delete set null,
  track_id uuid references public.radio_tracks(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  session_id text,
  event_type text not null default 'play',
  seconds_listened integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (event_type in ('tune', 'play', 'pause', 'skip', 'complete', 'save'))
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'radio_stations_current_track_id_fkey'
  ) then
    alter table public.radio_stations
      add constraint radio_stations_current_track_id_fkey
      foreign key (current_track_id) references public.radio_tracks(id) on delete set null;
  end if;
end $$;

create index if not exists radio_stations_status_idx on public.radio_stations(status, visibility);
create index if not exists radio_stations_slug_idx on public.radio_stations(station_slug);
create index if not exists radio_tracks_owner_id_idx on public.radio_tracks(owner_id);
create index if not exists radio_tracks_visibility_idx on public.radio_tracks(visibility, rights_status);
create index if not exists radio_tracks_media_asset_idx on public.radio_tracks(media_asset_id);
create index if not exists radio_rights_track_idx on public.radio_rights_declarations(track_id);
create index if not exists radio_station_tracks_station_idx on public.radio_station_tracks(station_id, position);
create index if not exists radio_station_tracks_track_idx on public.radio_station_tracks(track_id);
create index if not exists radio_play_events_station_idx on public.radio_play_events(station_id, created_at desc);
create index if not exists radio_play_events_owner_idx on public.radio_play_events(owner_id, created_at desc);

alter table public.radio_tracks enable row level security;
alter table public.radio_rights_declarations enable row level security;
alter table public.radio_station_tracks enable row level security;
alter table public.radio_play_events enable row level security;

drop policy if exists "Readable public radio tracks" on public.radio_tracks;
create policy "Readable public radio tracks"
on public.radio_tracks for select
using (visibility = 'public' and rights_status = 'approved' or auth.uid() = owner_id);

drop policy if exists "Owners manage radio tracks" on public.radio_tracks;
create policy "Owners manage radio tracks"
on public.radio_tracks for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage radio rights" on public.radio_rights_declarations;
create policy "Owners manage radio rights"
on public.radio_rights_declarations for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Readable public station schedules" on public.radio_station_tracks;
create policy "Readable public station schedules"
on public.radio_station_tracks for select
using (
  exists (
    select 1 from public.radio_stations
    where radio_stations.id = radio_station_tracks.station_id
    and (
      radio_stations.visibility = 'public'
      or radio_stations.owner_id is null
      or radio_stations.owner_id = auth.uid()
    )
  )
);

drop policy if exists "Owners manage station schedules" on public.radio_station_tracks;
create policy "Owners manage station schedules"
on public.radio_station_tracks for all
using (
  exists (
    select 1 from public.radio_stations
    where radio_stations.id = radio_station_tracks.station_id
    and radio_stations.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.radio_stations
    where radio_stations.id = radio_station_tracks.station_id
    and radio_stations.owner_id = auth.uid()
  )
);

drop policy if exists "Signed in listeners create radio play events" on public.radio_play_events;
create policy "Signed in listeners create radio play events"
on public.radio_play_events for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners read own radio play events" on public.radio_play_events;
create policy "Owners read own radio play events"
on public.radio_play_events for select
using (auth.uid() = owner_id);

-- TODO: Public anonymous listening telemetry should go through a rate-limited
-- Edge Function, not direct anon inserts, before production launch.
