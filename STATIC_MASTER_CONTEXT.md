# STATIC Network Master Context

## Brand

STATIC Network is an AI-native entertainment platform.

- Primary line: **The Home of AI Entertainment**
- Alternate positioning: **The Synthetic Media Network**
- Tagline: **Watch it. Hear it. Play it. Create it. Own it.**
- Product engine: **Entity-first social entertainment.** Humans build backstage.
  Entities are public-facing.
- Product idea: a user creates an Entity, the Entity receives a Channel, and
  that identity can publish Signals and expand across music, video, games,
  live experiences, Originals, Worlds, Drops, and creator tools.
- Visual canon: black, deep charcoal, white, silver, icy cyan, electric blue,
  and restrained violet depth.
- Cultural texture: underground broadcast, future pirate radio, transmission
  infrastructure, premium editorial design, and controlled interference.

Avoid generic SaaS gradients, vague automation claims, fake social proof, fake
backend behavior, and visual clutter that harms speed or comprehension.

## Eight Systems

1. STATIC Signals: Entity-led mixed-media discovery feed.
2. STATIC Channels: creator-owned worlds and destinations.
3. STATIC Radio: always-on stations and creator broadcasts.
4. STATIC PLAY: prompted, remixable games and interactive worlds.
5. STATIC LIVE: premieres, performances, events, and watch parties.
6. STATIC Originals: shows, films, animation, documentaries, and franchises.
7. STATIC Marketplace: future assets, drops, skins, templates, and memberships.
8. STATIC LABS: creator tools, provider adapters, and future API systems.

Canonical network copy:

> Eight interconnected systems. One place to discover, build, play, broadcast,
> and own what comes next.

STATIC PLAY line:

> What would you like to play today?

## Audience

- Creators want to build durable worlds, own audience relationships, release
  across formats, and monetize without losing identity.
- Fans want to discover early, participate, play, collect, support, and belong.
- Studios want flexible infrastructure for collaborative world-building.
- Entities are the center of the social layer: persistent characters,
  performers, founders, hosts, artists, gamers, guides, influencers, and
  digital identities that move across multiple formats and experiences.

## Entity-First Flow

1. A user creates an Entity backstage.
2. STATIC creates the Entity's Channel.
3. The Entity becomes the public-facing identity.
4. The Entity publishes Signals and media.
5. Signals appear on both the Channel and discovery feed.
6. The Entity can enter simulated live mode, build Worlds, and create Drops.
7. Future authenticated services preserve ownership and cloud media.

The first locally created Entity receives founder framing:

- Rank #001
- Genesis Entity
- Origin Signal
- Signal Score: 1T

The score communicates network-origin status, not organic followers.

## Product Boundaries

The current website is a public experience and app-shell preview. It must not
pretend that backend systems exist.

Local MVP features:

- Entity Builder, layered visual Avatar Creator, and Entity Profile
- automatic Entity Channel creation
- Channel theme, profile image, and banner customization
- Entity-only Signal feed, poses, reactions, and comments
- local Entity Signals and media metadata
- media Blob persistence in IndexedDB
- simulated Entity live status
- local World and Drop builders
- homepage network boot/trailer fallback and Studio operator controls

Cloud-ready account features:

- `/login`, `/signup`, and `/account`
- Supabase Auth session and profile context when public environment variables exist
- Postgres schema with Row Level Security policies
- Storage ownership policies for avatars, banners, media, and thumbnails
- local-to-cloud Entity network import
- cloud-to-device structured-data cache after authenticated login
- local creator mode when Supabase is not configured

Not connected yet:

- generation providers
- production Supabase project credentials
- full cloud-first editing and realtime collaboration
- IndexedDB Blob transfer to cloud storage during legacy import
- payments, subscriptions, or marketplace transactions
- public multi-user publishing or real creator analytics
- live audio/video infrastructure
- recommendations, search indexing, moderation, or admin tooling

All future integrations must be server-side where secrets are involved and must
include authorization, consent, safety, cost, rate-limit, and data-retention
decisions before launch.

## Storage And Ownership

Local mode preserves:

- `static_entities`
- `static_channels`
- `static_signals`
- `static_worlds`
- `static_drops`
- `static_current_entity`
- `static_live`
- `static_local_account`
- IndexedDB `static_network_mvp/static_media`

Cloud mode is enabled only by public `VITE_SUPABASE_URL` plus
`VITE_SUPABASE_PUBLISHABLE_KEY` or legacy `VITE_SUPABASE_ANON_KEY`. Private
admin credentials never belong in the browser.

## Experience Principles

- Fast and legible on mobile first.
- Strong typography and clear navigation.
- The homepage should feel like a live network dashboard, not a pitch deck.
- Local mock programming should make the public experience feel active without
  pretending that real users, payments, streams, or provider outputs exist.
- Motion should communicate signal and system state, not distract.
- Respect `prefers-reduced-motion`.
- Every public route receives a unique title and description.
- Interactive previews must identify themselves as previews.
- Calls to action should lead to a real route or an interactive local demo.
