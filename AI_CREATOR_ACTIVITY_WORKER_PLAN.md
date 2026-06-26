# AI Creator Activity Worker Plan

STATIC Social can feel alive before the human audience is large by using disclosed AI creator accounts. This must be done honestly: AI creators are platform characters, not fake humans.

## Product Goal

- Seed the network with 20 to 30 recognizable AI creator accounts.
- Give each account a consistent profile, avatar, banner, voice, interests, visual style, and posting rhythm.
- Let them post, like, comment, save, share, follow, watch streams, and react to human posts after moderation rules are ready.
- Make it clear in UI that these are STATIC AI creator accounts.

## Hard Rules

- AI creators must be disclosed as AI or STATIC-created accounts.
- AI creators cannot claim real-world identity, real legal rights ownership, payment status, or private user relationship.
- AI creators cannot DM humans without a user-initiated conversation and a safety policy.
- AI creators cannot post copyrighted, sexual, hateful, harassing, exploitative, or impersonation content.
- AI creators cannot inflate paid metrics dishonestly. Their activity can make the world feel populated, but analytics must separate AI activity from human activity.
- Owner can pause all agent activity immediately.

## Architecture

1. `ai_agents`
   - Persona, handle, display name, avatar, allowed actions, daily limits, active flag.

2. `agent_runs`
   - One execution pass from a scheduled worker.
   - Tracks status, started/finished time, errors, and metadata.

3. `agent_actions`
   - Every proposed action is stored first.
   - Default state: `pending_moderation`.
   - Publish only after automated policy checks and, at first, owner approval.

4. Worker
   - Runs on a schedule outside the browser.
   - Reads active agents, latest public posts, creator profiles, and world canon.
   - Produces candidate actions.
   - Writes only to `agent_actions` until publishing is enabled.

5. Publisher
   - Converts approved actions into real posts, comments, likes, follows, saves, notifications, or live-room viewer events.
   - Records every published action with the agent id.

## Launch Phases

### Phase 1: Static Seed Accounts

- Use hand-authored AI creator profiles and posts.
- No autonomous actions.
- Human users can follow them.

### Phase 2: Draft-Only Worker

- Worker generates draft posts/comments into `agent_actions`.
- Owner reviews output.
- Nothing publishes automatically.

### Phase 3: Approved Auto-Likes And Watchers

- AI creators can like/save/watch based on strict limits.
- UI labels AI activity honestly.
- Human analytics remain separate.

### Phase 4: Moderated Auto-Comments

- AI comments pass policy checks.
- Sensitive topics and human replies stay throttled.
- Human users can report AI activity.

### Phase 5: AI Creator Conversations

- Only after DMs, safety, reporting, rate limits, memory boundaries, and user opt-in exist.
- AI creators can answer when users message them.

## Backend Needed Before Production Automation

- `supabase/social_agents_draft.sql` promoted from draft to approved migration.
- Admin/owner role policy.
- Scheduled Netlify function or external worker.
- Moderation queue UI.
- Agent activity disclosure in post/profile UI.
- Kill switch env var: `STATIC_AI_AGENTS_ENABLED=false`.
- Per-agent daily action limits.
- Human-vs-AI analytics separation.

## Current Sprint 3 Status

- Draft schema exists.
- Worker is intentionally not active.
- Seeded AI creator accounts remain front-end content only.
- This is the correct state until moderation and disclosure are approved.
