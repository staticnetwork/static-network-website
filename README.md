# STATIC Network

The public website now includes the Entity Generator, versioned Entity DNA, secure Netlify provider adapters, provider status diagnostics, and S.A.G.E., a global 3D voice-ready concierge.

Key routes:

- `/entities/generate` - Entity DNA and visual generator
- `/sage` - expanded S.A.G.E. control center
- `/provider-status` - non-billable provider configuration checks

See `PROVIDER_SETUP.md`, `ACTIVATE_PROVIDERS.md`, `ENTITY_VISUAL_PIPELINE.md`, and `SAGE_AI_OS_ROADMAP.md` for activation and production roadmaps.

Public website and early app-shell preview for
[thestaticnetwork.com](https://thestaticnetwork.com).

## Stack

- Vite
- React
- Supabase-ready Auth, Postgres, and Storage adapter
- Dependency-free History API router
- Netlify static hosting

## Local development

Use Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
npm run preview
```

Netlify uses `public/_redirects` to serve client-side routes from `index.html`.

## Current product status

The public routes and app shell are implemented. The Entity-only feed, visual
avatar creator, Channel designer, account screens, discovery filtering,
broadcast deck, Radio player, PLAY generation sequence, Studio control room,
LIVE mode, Channel worlds, and marketplace previews are available.

Without Supabase environment variables, creator data stays in local browser
storage. With Supabase configured, email/password authentication, profile
ownership, local-to-cloud import, and cloud-to-device structured-data sync are
available. Audio/video streaming infrastructure, real generation, payments,
subscriptions, production moderation, recommendations, and marketplace
transactions are intentionally not connected.

## Entity-first local MVP

- Six-step Entity Builder with layered visual avatar controls
- Dedicated visual creator at `/entities/avatar`
- Genesis Entity behavior for the first local Entity
- Automatic Channel creation at `/channels/:entityHandle`
- Channel designer at `/channel/customize`
- Entity profile at `/entities/profile`
- Entity-only posting, poses, reactions, and comments at `/feed`
- Signal publishing into the profile, Channel, `/feed`, and `/signals`
- Video, image, and audio Blob storage in IndexedDB
- Local account profile and profile-image storage
- Simulated `Go Live As Entity` mode
- Local World and Drop builders
- Full Entity operations inside STATIC Studio

Local storage keys:

- `static_entities`
- `static_channels`
- `static_signals`
- `static_worlds`
- `static_drops`
- `static_current_entity`
- `static_live`
- `static_local_account`

Media uses the IndexedDB database `static_network_mvp` and object store
`static_media`. These local records are an MVP boundary, not a replacement for
authenticated cloud media processing, moderation, or backups.

## Supabase-ready account mode

Copy `.env.example` to `.env.local`, add the public Supabase URL and
publishable key, and follow `SUPABASE_SETUP.md`. Never add a service-role key,
secret key, database password, or JWT secret to this frontend.

Routes:

- `/login`
- `/signup`
- `/account`

After login, structured Entity, Channel, Signal, World, and Drop data is pulled
into a non-destructive device cache. The account page can import existing local
Genesis data into the authenticated owner account.

## Hero trailer

The homepage supports muted autoplay trailer files at:

- `/public/media/static-network-trailer.webm`
- `/public/media/static-network-trailer.mp4`

Until an owner-provided trailer is added, the page uses
`/public/media/static-hero-fallback.png`.

See `STATIC_MASTER_CONTEXT.md` for product canon and `src/providers/` for the
future provider-adapter boundary.
