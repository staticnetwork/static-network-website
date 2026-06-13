-- STATIC Network initial cloud schema.
-- Review in a new Supabase project before running. This file does not drop data.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  avatar_url text,
  account_type text not null default 'Entity Operator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  handle text not null,
  role text,
  genre text,
  company_brand text,
  title_position text,
  bio text,
  channel_name text,
  channel_tagline text,
  avatar_config jsonb not null default '{}'::jsonb,
  profile_image_url text,
  signal_score text,
  rank text,
  status text,
  badge text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, handle)
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null unique references public.entities(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  handle text not null,
  display_name text not null,
  tagline text,
  banner_url text,
  profile_image_url text,
  theme jsonb not null default '{}'::jsonb,
  featured_signal_id uuid,
  layout_style text default 'Media Grid',
  modules jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'Text',
  title text,
  text text,
  caption text,
  media_urls jsonb not null default '[]'::jsonb,
  avatar_pose text default 'Idle',
  visibility text not null default 'Public' check (visibility in ('Public', 'Private Beta', 'Draft')),
  stats jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.channels
  drop constraint if exists channels_featured_signal_id_fkey;
alter table public.channels
  add constraint channels_featured_signal_id_fkey
  foreign key (featured_signal_id) references public.signals(id) on delete set null;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete cascade,
  type text,
  file_name text,
  mime_type text,
  storage_path text not null,
  public_url text,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.worlds (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  setting text,
  mood text,
  visual_style text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.drops (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text,
  description text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'username', ''),
    coalesce(new.raw_user_meta_data ->> 'account_type', 'Entity Operator')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.entities enable row level security;
alter table public.channels enable row level security;
alter table public.signals enable row level security;
alter table public.media_assets enable row level security;
alter table public.worlds enable row level security;
alter table public.drops enable row level security;
alter table public.comments enable row level security;

create policy "Public profiles are readable" on public.profiles for select using (true);
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Entities are publicly readable" on public.entities for select using (true);
create policy "Owners manage entities" on public.entities for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Channels are publicly readable" on public.channels for select using (true);
create policy "Owners manage channels" on public.channels for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Public signals are readable" on public.signals for select using (visibility = 'Public' or auth.uid() = owner_id);
create policy "Owners manage signals" on public.signals for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Public media metadata is readable" on public.media_assets for select using (true);
create policy "Owners manage media metadata" on public.media_assets for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Worlds are publicly readable" on public.worlds for select using (true);
create policy "Owners manage worlds" on public.worlds for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Drops are publicly readable" on public.drops for select using (true);
create policy "Owners manage drops" on public.drops for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Comments are publicly readable" on public.comments for select using (true);
create policy "Owners manage comments" on public.comments for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Create these four public buckets manually in Storage before applying policies:
-- avatars, banners, media, thumbnails.
-- Files must use the path convention: <auth.uid()>/<entity-id>/<file-name>

create policy "Public STATIC media is readable"
on storage.objects for select
using (bucket_id in ('avatars', 'banners', 'media', 'thumbnails'));

create policy "Users upload owned STATIC media"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('avatars', 'banners', 'media', 'thumbnails')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users update owned STATIC media"
on storage.objects for update to authenticated
using ((storage.foldername(name))[1] = auth.uid()::text)
with check ((storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete owned STATIC media"
on storage.objects for delete to authenticated
using ((storage.foldername(name))[1] = auth.uid()::text);

create index if not exists entities_owner_id_idx on public.entities(owner_id);
create index if not exists entities_handle_idx on public.entities(handle);
create index if not exists signals_created_at_idx on public.signals(created_at desc);
create index if not exists signals_entity_id_idx on public.signals(entity_id);
create index if not exists comments_signal_id_idx on public.comments(signal_id);
