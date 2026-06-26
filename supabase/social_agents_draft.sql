-- STATIC Social AI Agent Cohort Draft
-- This is a planning migration only. Do not apply to production until the
-- owner approves the agent policy, moderation rules, rate limits, and UI
-- disclosure language.

create table if not exists public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  display_name text not null,
  archetype text not null,
  persona jsonb not null default '{}'::jsonb,
  allowed_actions text[] not null default array['post', 'comment', 'like', 'share'],
  max_actions_per_day integer not null default 12,
  max_human_replies_per_day integer not null default 5,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.ai_agents(id) on delete cascade,
  run_type text not null,
  status text not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_actions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.ai_agents(id) on delete cascade,
  run_id uuid references public.agent_runs(id) on delete set null,
  action_type text not null,
  target_table text,
  target_id uuid,
  status text not null default 'pending_moderation',
  generated_text text,
  prompt_metadata jsonb not null default '{}'::jsonb,
  moderation_metadata jsonb not null default '{}'::jsonb,
  approved_by uuid,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ai_agents enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_actions enable row level security;

-- Public users should not write agent state directly. Read policies and
-- owner/admin policies must be added only after the production auth roles are
-- finalized.
