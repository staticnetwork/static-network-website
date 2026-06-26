# STATIC Portal Redesign Roadmap

Generated: 2026-06-17

This roadmap is internal direction for turning STATIC from a website shell into a portal into an AI-native entertainment universe. Do not use OASIS or Ready Player One as public branding. The public language should stay original to STATIC.

## Current Decision

The old public beta gate is replaced by the STATIC Portal System for the public-facing first impression. The beta gate remains active, but the visual metaphor changes from "website with access form" to "arrival district with controlled access."

The new visual direction is STATIC as a luxury AI entertainment district: nightlife, flagship venue, city-scale media, fashion, billboards, creators, fans, cars, wet pavement, palm-lined streets, and premium cultural gravity. The experience should feel like the user has arrived outside the first real door into STATIC, not like they are viewing an abstract software splash screen.

The main district image must be visible before login. Access controls should feel like venue entry points layered onto the city, with clickable arrival hotspots such as Request Access, ClubSTATIC, Creator Boulevard, and S.A.G.E. The first impression should excite visitors to enter, not hide the world behind a dead access wall.

Primitive internal tools remain gated. The redesign does not make unfinished tools public.

## Portal System Principles

- STATIC opens like a world, not a website.
- STATIC should feel like a place people gather, not only a hologram interface.
- Typography should feel like premium futuristic venue signage: stylized, uppercase, wide-tracked, and matched to the district's black / chrome / gold / violet palette.
- Public visitors should feel they found the edge of a larger universe.
- S.A.G.E. should feel integrated into the environment, not pasted on top.
- Public copy should be premium and controlled-access, not apologetic setup language.
- No cheap cyberpunk, lime-green takeover, generic SaaS cards, flat social-app framing, or sterile empty sci-fi.
- Motion should feel slow, cinematic, and spatial, with reduced-motion support.

## Zone Evolution Map

### Entities -> Identity Chamber

Future state: a high-end identity lab where creators shape persistent Entities with official image, motion, voice, channel, world, and behavior slots.

Current blocker: manual Avatar Builder and local SVG previews are not public quality.

Next build steps:

- Hide primitive visuals from public flows.
- Make official image slots first-class.
- Add OpenArt/manual asset import workflow.
- Add provider-backed generation only behind explicit cost controls.
- Propagate approved assets to profile, channel, feed, studio, and future live surfaces.

### Studio -> Creation Bay

Future state: a cinematic creation bay for assembling Entities, shows, games, audio, visuals, and worlds.

Current blocker: Studio is an app-shell preview without real production storage, publishing, or generation.

Next build steps:

- Connect Supabase account ownership.
- Connect R2 media storage.
- Separate public previews from real creator controls.
- Build a media queue and status layer before adding paid providers.

### Feed / Signals -> Signal Stream

Future state: a living stream of transmissions from Entities, Channels, Worlds, drops, live events, and playable scenes.

Current blocker: current feed/signals are local/static data and should not be represented as a real public network.

Next build steps:

- Define signal schema.
- Store signals in Supabase.
- Add privacy/visibility states.
- Add moderation before public publishing.

### Channels -> World Channels

Future state: creator-owned world entrances combining profile, media, lore, events, membership, drops, and world portals.

Current blocker: dynamic channel route reads local state and has no real public backend.

Next build steps:

- Move channel records to Supabase.
- Attach official Entity assets.
- Add public-safe channel theme system.
- Add media slots and schedule slots.

### PLAY -> Game / World Portal

Future state: the entrance to AI-generated games and playable worlds.

Current blocker: current PLAY page is concept UI, not actual generation/play infrastructure.

Next build steps:

- Define game/world prompt schema.
- Decide provider/runtime strategy.
- Start with curated playable demos before user generation.
- Store generated worlds in R2/Supabase.

### Live -> Broadcast Arena

Future state: realtime Entity broadcasts, premieres, creator shows, avatar-hosted rooms, and audience interaction.

Current blocker: LiveKit scaffold exists, but no real live room infrastructure is configured.

Next build steps:

- Configure LiveKit or chosen realtime provider.
- Add owner-only live room tests.
- Add clear simulated vs live labels internally.
- Do not expose public "go live" until real streaming works.

### Marketplace -> Asset Exchange

Future state: digital asset exchange for skins, memberships, templates, drops, and creator-owned media assets.

Current blocker: no payment, ownership, transaction, fulfillment, or moderation backend.

Next build steps:

- Keep marketplace as preview only.
- Design asset metadata and rights model.
- Choose payment/subscription provider.
- Add ownership records before transactions.

### S.A.G.E. -> Concierge / Operator Layer

Future state: S.A.G.E. is the integrated guide, command layer, and eventually conversational presence inside STATIC.

Current blocker: S.A.G.E. v1 asset is local/not live; `/sage-lab` action names need fixing; no realtime avatar exists.

Next build steps:

- Keep S.A.G.E. as environmental cue in public portal until final visual is approved.
- Fix `/sage-lab` action mismatch.
- Add approved arrival, idle, summon, collapse, and talking slots.
- Add memory and permissions only after auth and privacy rules exist.
- Evaluate realtime avatar providers before spending more.

## Immediate Public Route Plan

- `/`: STATIC Arrival Portal with controlled beta access.
- `/login`: Operator access console.
- `/signup`: Operator key request console.
- `/contact`: Transmission console.
- `/terms`: Portal-styled preliminary terms.
- `/privacy`: Portal-styled preliminary privacy notice.

## Quality Gates Before Deployment

- Desktop route check for `/`, `/login`, `/signup`, `/contact`, `/terms`, `/privacy`.
- Mobile route check for the same routes.
- Confirm old beta shell appearance is gone.
- Confirm no primitive Avatar Builder, SVG Entity preview, D-ID output, or boxed S.A.G.E. visual leaks publicly.
- Confirm no horizontal overflow.
- Run lint.
- Run production build.
- Owner reviews screenshots/preview before deployment.

## Current Non-Goals

- Do not redesign all internal tools in this pass.
- Do not connect new paid APIs.
- Do not deploy automatically.
- Do not expose backend setup status to public users.
- Do not claim immersive-universe features are complete.
