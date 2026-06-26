-- STATIC Social launch hardening.
-- Adds durable profile fields and real direct-message tables for launch.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists banner_url text,
  add column if not exists bio text,
  add column if not exists website_url text;

create table if not exists public.direct_threads (
  id uuid primary key default gen_random_uuid(),
  participant_key text not null unique,
  participant_one uuid not null references public.profiles(id) on delete cascade,
  participant_two uuid not null references public.profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  last_message text,
  last_message_at timestamptz,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint direct_threads_distinct_participants check (participant_one <> participant_two)
);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.direct_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) <= 2000),
  media_url text,
  media_type text,
  read_at timestamptz,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists direct_threads_participant_one_idx on public.direct_threads(participant_one, updated_at desc);
create index if not exists direct_threads_participant_two_idx on public.direct_threads(participant_two, updated_at desc);
create index if not exists direct_messages_thread_created_idx on public.direct_messages(thread_id, created_at desc);

alter table public.direct_threads enable row level security;
alter table public.direct_messages enable row level security;

drop policy if exists "Participants read direct threads" on public.direct_threads;
create policy "Participants read direct threads"
on public.direct_threads for select
using (auth.uid() = participant_one or auth.uid() = participant_two);

drop policy if exists "Participants create direct threads" on public.direct_threads;
create policy "Participants create direct threads"
on public.direct_threads for insert
with check (
  auth.uid() = created_by
  and (auth.uid() = participant_one or auth.uid() = participant_two)
);

drop policy if exists "Participants update direct threads" on public.direct_threads;
create policy "Participants update direct threads"
on public.direct_threads for update
using (auth.uid() = participant_one or auth.uid() = participant_two)
with check (auth.uid() = participant_one or auth.uid() = participant_two);

drop policy if exists "Participants read direct messages" on public.direct_messages;
create policy "Participants read direct messages"
on public.direct_messages for select
using (
  exists (
    select 1 from public.direct_threads
    where direct_threads.id = direct_messages.thread_id
    and (direct_threads.participant_one = auth.uid() or direct_threads.participant_two = auth.uid())
  )
);

drop policy if exists "Participants create direct messages" on public.direct_messages;
create policy "Participants create direct messages"
on public.direct_messages for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.direct_threads
    where direct_threads.id = direct_messages.thread_id
    and (direct_threads.participant_one = auth.uid() or direct_threads.participant_two = auth.uid())
  )
);

drop policy if exists "Recipients mark direct messages read" on public.direct_messages;
create policy "Recipients mark direct messages read"
on public.direct_messages for update
using (
  exists (
    select 1 from public.direct_threads
    where direct_threads.id = direct_messages.thread_id
    and (direct_threads.participant_one = auth.uid() or direct_threads.participant_two = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.direct_threads
    where direct_threads.id = direct_messages.thread_id
    and (direct_threads.participant_one = auth.uid() or direct_threads.participant_two = auth.uid())
  )
);
