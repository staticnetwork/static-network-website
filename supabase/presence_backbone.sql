-- STATIC Social presence backbone.
-- Additive migration for online status, route presence, and active account UI.
-- This is not a chat bot worker or fake streaming system; it stores real
-- signed-in user heartbeat state that the app can read and refresh.

create extension if not exists pgcrypto;

create table if not exists public.profile_presence (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text,
  username text,
  avatar_url text,
  route text not null default '/feed',
  status text not null default 'online',
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '90 seconds',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists profile_presence_status_idx
  on public.profile_presence(status, expires_at desc);

create index if not exists profile_presence_route_idx
  on public.profile_presence(route, expires_at desc);

alter table public.profile_presence enable row level security;

drop policy if exists "Active profile presence is readable" on public.profile_presence;
create policy "Active profile presence is readable"
on public.profile_presence for select
using (expires_at > now());

drop policy if exists "Owners manage profile presence" on public.profile_presence;
create policy "Owners manage profile presence"
on public.profile_presence for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);
