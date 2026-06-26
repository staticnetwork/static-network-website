# STATIC Network Master Context

## June 2026 private-beta rule

STATIC remains private beta until the platform is visually and functionally strong enough for public exploration. With `VITE_STATIC_BETA_MODE=true`, unauthenticated visitors see the premium beta gate and access request flow. Internal routes require local development access or authentication. Owner routes require local development or an authenticated `owner` role.

S.A.G.E. is STATIC's concierge and operating layer. Text guidance can operate internally. ElevenLabs is the only accepted premium speech path; when it is absent S.A.G.E. is muted and labeled text-only. Procedural character art, browser text-to-speech, and unfinished creation tools are not public product features.

The official S.A.G.E. visual and talking state require an owner-approved image, connected ElevenLabs voice, public media storage, and a real talking-avatar result. No layer may report completion before its provider validates and its output can be reviewed.

Current official foundation:

- Visual: owner-approved Google Gemini 3.1 Flash Image candidate 2, stored at `/assets/sage/official-sage-foundation.jpg`.
- Active slots: `officialSageFullBody` and `officialSageIdleStill`.
- Voice: ElevenLabs Lily, labeled `Lily - British Executive Female`.
- Spoken pronunciation: on-screen `S.A.G.E.` is normalized to spoken `Sage`.
- Talking/lip-sync video: not active until a full-body, high-definition,
  watermark-free provider result is returned and approved.
- Rejected test: the June 13, 2026 D-ID Talk proved the storage, voice, and
  provider pipeline, but its 512x512 face crop and trial watermark are not
  acceptable S.A.G.E. output. D-ID must not be used as the production visual
  layer.
- Selected production candidate: HeyGen Cinematic Avatar at 1080p for
  full-body motion, followed by HeyGen Precision Lipsync using the approved
  ElevenLabs audio. Requests must set `enable_watermark: false` and preserve
  the source format where supported.

Provider secrets are server-only Netlify variables. Only public Supabase configuration may use `VITE_`. Paid generation is never automatic and always requires explicit confirmation.

Netlify production deploys cost 15 account credits each. Follow `NETLIFY_CREDIT_POLICY.md`: test locally, use draft deploys where needed, batch changes, and obtain owner approval immediately before any production release.

## Brand

STATIC Network is an AI-native entertainment platform. As of the current
public-site direction, STATIC Network's web product is an AI-native social
network first: humans post AI-made or AI-assisted work, build Signal,
follow creators, and establish reputation before the Unreal/PC/console game
client arrives.

- Primary line: **The Home of AI Entertainment**
- Alternate positioning: **The Synthetic Media Network**
- Tagline: **Watch it. Hear it. Play it. Create it. Own it.**
- Current public web engine: **AI social network for human creators.** Every
  public post must be AI-made or AI-assisted, with clear process/provenance.
- Future game engine: **Entity-first world identity.** Entities, companions,
  properties, vehicles, combat, traversal, NPC civilization, and full city
  life move into the Unreal client when the engine layer is ready.
- Product idea: a creator posts AI work now, builds a portable STATIC profile
  and Signal, then later carries identity, follows, assets, score, and
  access into STATIC City.
- Visual canon: black, deep charcoal, white, silver, icy cyan, electric blue,
  and restrained violet depth.
- Cultural texture: underground broadcast, future pirate radio, transmission
  infrastructure, premium editorial design, and controlled interference.
- Logo status: the approved working STATIC mark is
  `/assets/brand/static-mark-official-working.png`, generated from the
  owner-approved coat-back STATIC mark direction and cleaned into a transparent
  PNG. Supporting source/candidate files live in `/assets/brand/` and
  `/assets/brand-candidates/`. This is the active site mark for the portal and
  public web direction, but it still needs a final vector pass, originality
  review, and legal/trademark clearance before merchandise, app-icon,
  trademark, or large commercial rollout usage.

Avoid generic SaaS gradients, vague automation claims, fake social proof, fake
backend behavior, and visual clutter that harms speed or comprehension.

## Hard Publish Rule

STATIC is not ready for public release until it can be placed beside Instagram,
TikTok, YouTube, and Facebook and credibly say:

1. It looks as polished, intentional, and premium as those products.
2. It performs fast on desktop and mobile without broken layouts, dead routes,
   horizontal overflow, or confusing flows.
3. It is better in at least one clear STATIC-native way: AI-only creation
   culture, Signal reputation, creator provenance, future game portability, or
   cinematic world identity.
4. It does not rely on fake backend behavior, fake users, fake payments, fake
   generation, or fake live systems.
5. The owner has reviewed the exact build intended for release and explicitly
   approved publishing.

Until that bar is met, production deploys are for private/internal review only.

## Signal Rule

Posts are called **posts** in the public product. "Transmission" may be used
as atmospheric brand language, but the core social UI should remain simple:
post, like, comment, share, follow.

Signal is the creator reputation score earned through network actions:

- Publish an AI-made or AI-assisted post: `+100 Signal`
- Gain a unique follower: `+100 Signal`
- Receive or make a comment: `+10 Signal`
- Receive or make a like/reaction: `+10 Signal`
- Share a post: `+20 Signal`

These values are product defaults. In local mode they may be simulated, but the
production version must be server-authoritative with anti-spam, abuse,
botting, duplicate-action, and reversal rules before public launch.

## Google AI / Static+ Launch Rule

Google AI is the first approved intelligence layer for STATIC Social. It may be
used for post assistance, captions, hashtag suggestions, category detection,
AI-made disclosure guidance, creator-account writing, and moderation pre-checks.
It must run through Netlify/server functions only; the Google key must never be
exposed in the browser.

Launch default:

- Free accounts receive `3` AI creation/assist credits per week.
- The first use of those credits is the low-cost AI Post Assistant, but the same
  quota philosophy extends to Studio features as each provider becomes real:
  image generation/editing, music drafts, video drafts, music-video concepts,
  small-game design help, asset/world prompts, and blueprint packaging.
- Static+ target price is `$19.99/month` unless changed by the owner. At that
  price it must feel like a full creator suite, not a small quota bump: image
  generation/editing, video and music-video creation, music/audio tools, asset
  and blueprint generation, profile/channel creative tools, larger uploads,
  expanded weekly credits, priority processing, and game-carryover utilities.
- Creator Pro target price is `$99.99/month` unless changed by the owner. It is
  the high-end builder/operator tier: coding help, app/site/game prototyping,
  advanced automations, API/workflow adapters, team rooms, release operations,
  campaign planning, asset pipelines, provider orchestration, and priority
  access to deeper STATIC Studio and future engine workflows.
- Owner/admin accounts may receive a higher internal allowance for seeding the
  network, but that still belongs server-side.
- Quotas must be server-authoritative through Supabase-backed usage tracking.
- Static Coins and paid tiers are public only after Stripe Checkout, Stripe
  webhooks, `marketplace_orders`, `static_coin_wallets`, and
  `static_coin_ledger` are deployed and verified. Coin packs must be fulfilled
  idempotently so Stripe retries cannot double-credit a wallet.
- No public paid checkout, subscription, Static Coin, Static Credit, or creator
  payout feature should launch until Stripe/payment setup, taxes, refunds,
  terms, age rules, abuse controls, and platform-store rules are reviewed.

Google can support parts of the Studio vision, but not all categories are equal:
image and text assistance are the earliest realistic web features; music/video
generation can become provider-backed once access, cost, rights, storage, and
review controls are ready; full games and Unreal-ready assets remain roadmap
features until dedicated providers and engine workflows are connected.

Create-tab product benchmark: STATIC Studio should promise the same class of
creator capability as top AI creative suites such as Higgsfield, without copying
their brand, UI, or exact product language. The promised surface area should
include:

- image generation and image editing
- video generation, shorts, cinematic shots, camera moves, and ad-style scenes
- audio/music generation, voice, sound design, hooks, station IDs, and radio
  assets
- music videos and lyric/performance video concepts
- AI influencer / virtual creator campaign tools
- marketing/ad creative studio workflows
- canvas-style remixing, storyboarding, templates, and prompt presets
- creator libraries for saved assets, drafts, references, presets, and brand
  kits
- asset, world, character, prop, vehicle, interior, venue, and blueprint
  packaging for future STATIC City use

STATIC's differentiator is that those creations feed a social profile, Signal
score, Static Store, Static+ subscription tier, Static Coins, and eventual game
carryover instead of living as isolated generation files.

The first public AI feature is the **AI Post Assistant**: improve a draft
caption, suggest tags, categorize the post, and confirm whether the post is
clear enough to qualify as AI-made or AI-assisted.

## Eight Systems

1. STATIC Signals: AI-made and AI-assisted mixed-media discovery feed.
2. STATIC Channels: creator-owned profiles, worlds, and destinations.
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

## STATIC Radio Direction

STATIC Radio must be built on creator-owned, STATIC-owned, AI-generated with
valid commercial rights, or separately licensed audio. Spotify is not the
backbone for public 24/7 stations; it can only be considered later as an
optional personal account/taste/metadata integration if its terms allow the
specific use case.

Radio V1 architecture:

1. Tracks enter STATIC through upload, STATIC Originals, approved AI generation,
   or future licensed catalog deals.
2. Every creator-uploaded or AI-generated track needs a rights declaration
   before public station use.
3. Station programming is stored as a queue/schedule, not faked by the UI.
4. Public anonymous listening telemetry should use a rate-limited Edge Function.
   Direct browser inserts are reserved for signed-in owner/listener actions.
5. Provider jobs for music generation are queued as backend work and must remain
   pending until a server-side adapter, cost approval, and rights policy exist.

Current radio SQL path:

- `supabase/network_spine.sql` creates the early station-save table.
- `supabase/radio_backbone.sql` expands Radio into tracks, rights declarations,
  station schedules, and signed-in tune/play events.
- `scripts/apply-supabase-sql.mjs` applies migrations through Supabase's
  project database query endpoint with a personal access token.

## Audience

- Creators want to build durable worlds, own audience relationships, release
  across formats, and monetize without losing identity.
- Fans want to discover early, participate, play, collect, support, and belong.
- Studios want flexible infrastructure for collaborative world-building.
- Entities are the center of the social layer: persistent characters,
  performers, founders, hosts, artists, gamers, guides, influencers, and
  digital identities that move across multiple formats and experiences.

## Entity-First Flow

This is the future Unreal/game-client direction, not the current public web
front door. The public web front door is human AI creators posting work.

1. A user creates an Entity backstage or inside the future client.
2. STATIC creates the Entity's Channel.
3. The Entity becomes the public-facing game/world identity.
4. The Entity publishes Signals and media when the engine layer is ready.
5. Signals appear on both the Channel and discovery feed.
6. The Entity can enter simulated live mode, build Worlds, and create Drops.
7. Future authenticated services preserve ownership and cloud media.

The first locally created Entity receives founder framing:

- Rank #001
- Genesis Entity
- Origin Signal
- Signal: 1T

The score communicates network-origin status, not organic followers.

## Product Boundaries

The current website is a private-beta experience and internal app shell. It
must not pretend that unactivated providers or backend systems exist.

Internal local features:

- Entity Builder, visual tools, and Entity Profile behind beta/dev access
- automatic Entity Channel creation
- Channel theme, profile image, and banner customization
- Entity-only Signal feed, poses, reactions, and comments
- local Entity Signals and media metadata
- media Blob persistence in IndexedDB
- simulated Entity live status
- local World and Drop builders
- owner-only S.A.G.E. identity and talking-avatar labs

Cloud-ready account features:

- `/login`, `/signup`, and `/account`
- Supabase Auth session and profile context when public environment variables exist
- Postgres schema with Row Level Security policies
- Storage ownership policies for avatars, banners, media, and thumbnails
- local-to-cloud Entity network import
- cloud-to-device structured-data cache after authenticated login
- local creator mode when Supabase is not configured

Not connected until owner activation:

- production provider credentials
- production Supabase project credentials
- full cloud-first editing and realtime collaboration
- IndexedDB Blob transfer to cloud storage during legacy import
- payments, subscriptions, or marketplace transactions
- public multi-user publishing or real creator analytics
- realtime talking-avatar infrastructure
- recommendations, search indexing, moderation, or admin tooling

All future integrations must be server-side where secrets are involved and must
include authorization, consent, safety, cost, rate-limit, and data-retention
decisions before launch.

## STATIC Social AI Agent Cohort

STATIC Social can use a backend AI creator cohort to make the early network
feel alive, but it must never fake human users or pretend local preview content
is production activity.

Approved direction:

- Launch with clearly labeled preview creators/posts in the frontend when the
  backend cohort is not active.
- Build the real cohort as server-side scheduled agents, not browser scripts.
- Each agent needs a profile, voice/taste/cadence, allowed topics, content
  limits, cooldowns, and a stop switch.
- Agent posts, likes, comments, follows, and shares must be written through
  backend actions with audit logs and moderation status.
- Human posts can receive agent interaction only after safety, spam, and abuse
  rules exist. The UI should disclose AI-assisted network behavior where needed.
- Agents should help seed culture, welcome creators, start challenges, and
  surface good AI work. They must not impersonate real people, inflate paid
  metrics, or create fake financial/social proof.

Future backend tables should include `ai_agents`, `agent_runs`,
`agent_actions`, moderation review state, rate limits, and provider output
metadata. See `supabase/social_agents_draft.sql`. Do not apply that draft to
production until owner approval and a moderation policy exist.

## Storage And Ownership

Local mode preserves:

- `static_entities`
- `static_channels`
- `static_signals`
- `static_creator_profile`
- `static_worlds`
- `static_drops`
- `static_current_entity`
- `static_live`
- `static_local_account`
- IndexedDB `static_network_mvp/static_media`

Cloud mode is enabled only by public `VITE_SUPABASE_URL` plus
`VITE_SUPABASE_PUBLISHABLE_KEY` or legacy `VITE_SUPABASE_ANON_KEY`. Private
admin credentials never belong in the browser.

Owner-only world asset intake records live in browser `localStorage` under
`static_world_asset_intake` until exported from `/asset-intake`. Reviewed
manifests may be staged in `public/assets/world/intake/manifests/` and validated
with `npm run assets:intake:validate -- <manifest>`. The draft Supabase schema
for future server-authoritative asset intake is
`supabase/world_asset_intake_spine.sql`; it must not be applied until owner
access, storage, licensing, moderation, and Unreal import responsibilities are
ready.

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
- Core S.A.G.E. and Entity transformation may not use "preview" as a substitute for a working provider output.
- Public visitors must never see procedural S.A.G.E., browser voice, or low-quality internal builders.

## Arrival District / World Engine Direction

The public homepage is now the STATIC Arrival District, not a traditional
homepage or investor demo. The district should feel like a cinematic
entertainment city visitors can enter, tour, and later control through a real
world engine layer.

Current public build:

- uses a cinematic Arrival District video mode
- uses the generated Arrival District image as the core public landing world
- keeps the Arrival District and cinematic videos public for hype and
  conversion, not hidden behind a hard beta wall
- uses a soft beta gate: public visitors see the district and public tour, but
  deeper prototypes, creator tools, property systems, avatar creation, live
  rooms, and engine layers are not exposed publicly
- exposes venue hotspots for Signals, Live, PLAY, Studio, Channels, Radio,
  Marketplace, and S.A.G.E.
- keeps the current Three.js world prototype owner-only/internal unless
  `VITE_STATIC_OWNER_TOOLS=true` is explicitly enabled
- includes a planned property layer contract for residences, penthouses,
  creator businesses, mansions, castles, landmark spawn venues, and prestige
  properties
- includes a planned vertical mountain-city hierarchy: Street Pulse at the
  darker entry base, Base Loop around the mountain, Neon Rise in the middle,
  Crown Ridge near the luxury upper city, and STATIC Tower Summit at the
  top
- uses cinematic travel as a web-native placeholder for future camera paths
- keeps S.A.G.E. click-triggered for browser audio and provider-credit honesty
- removes the public `/demo` room; old `/demo` visits fall back to the Arrival
  District
- now opens through a portal-first reveal: visitors see the STATIC mark as the
  entry object, choose `Enter STATIC`, then reach the public reveal, trailer
  stage, request-access flow, and Arrival District

Engine readiness:

- shared venue/world facts live in `src/lib/worldEngine/districtManifest.js`
- the future runtime bridge lives in `src/lib/worldEngine/engineBridge.js`
- the first owner-only world prototype shell lives in
  `src/components/world/StaticWorldEngine.jsx`
- the Arrival District DOM exposes engine-friendly scene, mount, venue, zone,
  spawn, and camera metadata
- `/asset-intake` and `/world-bible` are owner-only local world-bible consoles
  for incoming assets: source, license status, type, rarity, region/district/
  island-ring placement, faction, gameplay role, Blender notes, Unreal target
  path, and NPC ecosystem potential
- asset intake records are local planning records in `static_world_asset_intake`
  only; they do not create marketplace listings, cloud inventory, ownership,
  payments, or Unreal imports
- `WORLD_ENGINE_READINESS.md` documents the next workload
- `STATIC_VISUAL_ASSET_SHOTLIST.md` documents the next public hero images,
  animated loops, route visuals, and Unreal-prep reference targets

Do not claim the real-time engine layer, NPCs, multiplayer, user-controlled
avatars, spatial audio, marketplace transactions, or provider generation are
live until those systems are actually implemented.

Next product direction:

- entity concerts and creator venue appearances should become live events
  users move toward inside the district
- event gravity should connect venue crowds, Signals aftershock clips, Radio
  simulcasts, limited drops, skins, access passes, and future moderation
- creator/business/property ownership should become a major retention loop:
  users should eventually spawn from homes, penthouses, mansions, castles,
  businesses, or landmark venues they legitimately own or control
- STATIC City is the authored core; The Fields are the persistent player-built
  macro-world around it where land can scale from starter plots to festival
  cities, ranches, faction territory, private estates, and eventually
  Yellowstone-scale ownership through streamed world cells
- macro-map geography: STATIC City is a water-surrounded island core connected
  by bridge/causeway/tunnel only to three mainland mega-regions: Desert,
  Forest, and Snow; the right/eastern map side is water with one large STATIC
  Island, accessible only by sea or air
- next public-site redesign should use intentional premium motion design:
  licensed/generated cinematic overlays, billboard loops, HUD/transmission
  graphics, particles, map pulses, light sweeps, and environmental loops, while
  respecting performance, mobile, reduced-motion, and commercial-use rights
- the canonical land hook is: "Buy your land. Build your world. Welcome to
  STATIC."
- El Mirage is the working-name desert festival destination in The Fields:
  a year-round rave/music-festival culture hub where players create festival
  assets and bring them back to their owned land
- Signal Credits should rate-limit generation, asset placement, upgrades, and
  powerful defenses before any real-money or creator-payout economy launches
- underground tunnel infrastructure is canon: service tunnels, old transit
  arteries, maintenance corridors, freight routes, venue backdoors, Rootside
  shortcuts, and hidden entrances connect different points of STATIC City
- Gophurs are the working-name underground courier/fixer faction: stylized
  cyberpunk tunnel runners who retrieve items, deliver assets, scout routes,
  move messages, and help risk-averse or busy players avoid surface conflict
  for a Signal Credit price
- origin settlements are canon for The Fields and hidden city layers: fictional
  villages, camps, enclaves, labs, machine yards, creature nests, caravans,
  forest clans, snow citadels, tunnel communities, and island colonies explain
  where unusual species, companions, robots, guardians, mounts, vendors, and
  asset families come from
- every new character, creature, guard, vendor, or companion asset pack must be
  assigned to a home region, district, faction, settlement, or island ring
  before entering the world; if placement is unclear, keep it in
  catalog/quarantine status and ask the owner where it belongs
- once roughly 10-20 compatible NPC assets exist in a region or settlement
  family, they can begin forming autonomous crews, villages, courts, gangs,
  clans, labs, cults, machine societies, or factions with routines, alliances,
  rivalries, leaders, resource needs, romance, migrations, festivals, trade,
  wars, and territory goals
- origin-settlement interactions should use diplomacy, trade, quests,
  reputation, treaties, hiring, migration, and opt-in conflict windows; avoid
  real-world ethnic/tribal/colonial framing or forced-assimilation language
- STATIC Island is the highest-density character discovery zone: resort shore
  access stays social and welcoming, rarity escalates inward through wild
  belts, elite patrols, fortress walls, moat/inner grounds, and peak-compound
  mythology, and the founder estate itself remains protected from griefing,
  seizure, and exploit paths
- companion lineage/fusion is canon for creatures, pets, mounts, robots,
  mythic companions, and guardians; humanlike Entities use consent-based
  legacy, ancestry, family roles, avatar sculpting, or design inheritance
  instead of breeding language
- every companion can have a five-phase evolution arc: Bonded, Awakened,
  Battle/Utility, Prestige, and Ascended; boss companions may start visually
  advanced but still need earned Phase 5 progression
- STATIC Universe is canon as the late-game ceiling breaker after STATIC City
  and The Fields: STATIC Astral Port, STATIC Orbital Station, off-world origin
  settlements, planet-genesis prompts, custom planets, alliances, trade,
  planet defense, and opt-in solar-system conflict
- the universe unlock beat is: "Prepare for takeoff. STATIC Universe unlocked."
- do not use NASA/government space branding unless licensed; space assets must
  be commercial-safe, generic, original, or rebranded as STATIC Astral Command
- do not claim real space flight, generated planets, planet ownership, alien
  NPCs, or solar conquest are live; first universe implementation should be
  cinematic launch, orbital-station scenes, and planet-design concepts
- platform strategy: the website is the public command center and access layer,
  mobile is the social/creator companion, PC/Steam is the primary high-fidelity
  Unreal client, console follows after the PC loop proves itself, Steam Deck is
  a handheld PC target, and SteamVR/VR/haptics/treadmills are later immersion
  layers
- true street-level walk mode should feel like moving through the cinematic
  city videos, not like the current technical prototype
- the next major technical pass should begin a genuine create-a-player /
  Entity mode with face/body controls, wardrobe, rigging, spawn ownership,
  inventory, cloud persistence, and moderation
- after create-a-player exists, replace the placeholder Entity marker with an
  account-owned avatar path and prepare NPC dialogue shells without faking
  intelligence
