-- STATIC Social meta-level infrastructure.
-- Apply after social_backbone.sql, social_launch_hardening.sql,
-- presence_backbone.sql, radio_backbone.sql, and commerce_backbone.sql.
--
-- This migration creates the durable contracts for recommendation ranking,
-- media processing, creator analytics, trust/safety, push/native readiness,
-- payouts, and operations telemetry.

create extension if not exists pgcrypto;

create table if not exists public.content_impressions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  target_id text not null,
  target_type text not null default 'signal',
  creator_id uuid references public.profiles(id) on delete set null,
  session_id text,
  event_type text not null default 'impression',
  dwell_seconds integer not null default 0,
  route text default '/feed',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_affinity (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  score numeric not null default 0,
  last_event text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_id, creator_id)
);

create table if not exists public.interest_affinity (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  interest_key text not null,
  interest_type text not null default 'tag',
  score numeric not null default 0,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_id, interest_key, interest_type)
);

create table if not exists public.creator_analytics_daily (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  metric_date date not null default current_date,
  views integer not null default 0,
  impressions integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  saves integer not null default 0,
  follows integer not null default 0,
  radio_plays integer not null default 0,
  retention_seconds integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (creator_id, metric_date)
);

create table if not exists public.media_derivatives (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid references public.media_assets(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade,
  derivative_type text not null,
  status text not null default 'queued',
  storage_path text,
  public_url text,
  width integer,
  height integer,
  duration_seconds numeric,
  bitrate integer,
  mime_type text,
  error text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  query text not null,
  filter text,
  result_count integer not null default 0,
  clicked_target_id text,
  clicked_target_type text,
  route text default '/search',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.trending_terms (
  term text primary key,
  term_type text not null default 'tag',
  score numeric not null default 0,
  window_starts_at timestamptz not null default now(),
  window_ends_at timestamptz not null default now() + interval '1 hour',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  platform text not null default 'web',
  p256dh text,
  auth_secret text,
  device_label text,
  enabled boolean not null default true,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, endpoint)
);

create table if not exists public.moderation_appeals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  report_id uuid references public.moderation_reports(id) on delete set null,
  target_id text not null,
  target_type text not null,
  reason text not null,
  status text not null default 'open',
  reviewer_id uuid references public.profiles(id) on delete set null,
  resolution text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.copyright_takedowns (
  id uuid primary key default gen_random_uuid(),
  claimant_email text not null,
  claimant_name text,
  target_id text not null,
  target_type text not null,
  route text,
  work_description text not null,
  evidence_url text,
  status text not null default 'open',
  reviewer_id uuid references public.profiles(id) on delete set null,
  resolution text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_payout_accounts (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  provider text not null default 'stripe',
  provider_account_id text,
  status text not null default 'pending',
  country text,
  currency text default 'usd',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_payouts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  status text not null default 'pending',
  provider text not null default 'stripe',
  provider_reference text,
  reason text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  severity text not null default 'info',
  source text not null,
  event_name text not null,
  message text,
  route text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists content_impressions_target_idx on public.content_impressions(target_type, target_id, created_at desc);
create index if not exists content_impressions_owner_idx on public.content_impressions(owner_id, created_at desc);
create index if not exists creator_affinity_owner_score_idx on public.creator_affinity(owner_id, score desc);
create index if not exists interest_affinity_owner_score_idx on public.interest_affinity(owner_id, interest_type, score desc);
create index if not exists creator_analytics_creator_date_idx on public.creator_analytics_daily(creator_id, metric_date desc);
create index if not exists media_derivatives_asset_idx on public.media_derivatives(media_asset_id, derivative_type);
create index if not exists media_derivatives_status_idx on public.media_derivatives(status, created_at);
create index if not exists search_events_query_idx on public.search_events(query, created_at desc);
create index if not exists push_subscriptions_owner_idx on public.push_subscriptions(owner_id, enabled);
create index if not exists moderation_appeals_status_idx on public.moderation_appeals(status, created_at);
create index if not exists copyright_takedowns_status_idx on public.copyright_takedowns(status, created_at);
create index if not exists creator_payouts_owner_status_idx on public.creator_payouts(owner_id, status);
create index if not exists ops_events_source_created_idx on public.ops_events(source, created_at desc);
create index if not exists ops_events_severity_created_idx on public.ops_events(severity, created_at desc);

alter table public.content_impressions enable row level security;
alter table public.creator_affinity enable row level security;
alter table public.interest_affinity enable row level security;
alter table public.creator_analytics_daily enable row level security;
alter table public.media_derivatives enable row level security;
alter table public.search_events enable row level security;
alter table public.trending_terms enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.moderation_appeals enable row level security;
alter table public.copyright_takedowns enable row level security;
alter table public.creator_payout_accounts enable row level security;
alter table public.creator_payouts enable row level security;
alter table public.ops_events enable row level security;

drop policy if exists "Authenticated users create content impressions" on public.content_impressions;
create policy "Authenticated users create content impressions"
on public.content_impressions for insert
with check (auth.uid() = owner_id or owner_id is null);

drop policy if exists "Owners read their content impressions" on public.content_impressions;
create policy "Owners read their content impressions"
on public.content_impressions for select
using (auth.uid() = owner_id);

drop policy if exists "Owners manage creator affinity" on public.creator_affinity;
create policy "Owners manage creator affinity"
on public.creator_affinity for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners manage interest affinity" on public.interest_affinity;
create policy "Owners manage interest affinity"
on public.interest_affinity for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Creator analytics are readable" on public.creator_analytics_daily;
create policy "Creator analytics are readable"
on public.creator_analytics_daily for select
using (true);

drop policy if exists "Owners read media derivatives" on public.media_derivatives;
create policy "Owners read media derivatives"
on public.media_derivatives for select
using (auth.uid() = owner_id or public_url is not null);

drop policy if exists "Owners create media derivatives" on public.media_derivatives;
create policy "Owners create media derivatives"
on public.media_derivatives for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners update media derivatives" on public.media_derivatives;
create policy "Owners update media derivatives"
on public.media_derivatives for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners create search events" on public.search_events;
create policy "Owners create search events"
on public.search_events for insert
with check (auth.uid() = owner_id or owner_id is null);

drop policy if exists "Trending terms are public" on public.trending_terms;
create policy "Trending terms are public"
on public.trending_terms for select
using (true);

drop policy if exists "Owners manage push subscriptions" on public.push_subscriptions;
create policy "Owners manage push subscriptions"
on public.push_subscriptions for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners create moderation appeals" on public.moderation_appeals;
create policy "Owners create moderation appeals"
on public.moderation_appeals for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners read moderation appeals" on public.moderation_appeals;
create policy "Owners read moderation appeals"
on public.moderation_appeals for select
using (auth.uid() = owner_id);

drop policy if exists "Authenticated users create copyright takedowns" on public.copyright_takedowns;
create policy "Authenticated users create copyright takedowns"
on public.copyright_takedowns for insert
with check (true);

drop policy if exists "Owners read payout accounts" on public.creator_payout_accounts;
create policy "Owners read payout accounts"
on public.creator_payout_accounts for select
using (auth.uid() = owner_id);

drop policy if exists "Owners read payouts" on public.creator_payouts;
create policy "Owners read payouts"
on public.creator_payouts for select
using (auth.uid() = owner_id);

drop policy if exists "Owners read ops events" on public.ops_events;
create policy "Owners read ops events"
on public.ops_events for select
using (auth.uid() = owner_id);
