# STATIC Network

Public website and early app-shell preview for
[thestaticnetwork.com](https://thestaticnetwork.com).

## Stack

- Vite
- React
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

The public routes and rich interactive demonstrations are implemented. The
network feed, discovery filtering, broadcast deck, Radio player, PLAY
generation sequence, Studio creation modes, LIVE reminders, channel worlds,
marketplace drawers, and Entity product loop run entirely in the browser.

The waitlist demonstration stores recent submissions in browser `localStorage`.
It does not transmit them to an external service. Audio streaming, real
generation, payments, subscriptions, accounts, public multi-user publishing,
recommendations, and marketplace transactions are intentionally not connected.

## Entity-first local MVP

- Six-step Entity Builder at `/entities/create`
- Genesis Entity behavior for the first local Entity
- Automatic Channel creation at `/channels/:entityHandle`
- Entity profile at `/entities/profile`
- Signal publishing into the profile, Channel, and `/signals`
- Video, image, and audio Blob storage in IndexedDB
- Simulated `Go Live As Entity` mode
- Local World and Drop builders
- Entity operations inside STATIC Studio

Local storage keys:

- `static_entities`
- `static_channels`
- `static_signals`
- `static_worlds`
- `static_drops`
- `static_current_entity`
- `static_live`

Media uses the IndexedDB database `static_network_mvp` and object store
`static_media`. These local records are an MVP boundary, not a replacement for
authenticated cloud ownership, moderation, media processing, or backups.

## Hero trailer

The homepage supports muted autoplay trailer files at:

- `/public/media/static-network-trailer.webm`
- `/public/media/static-network-trailer.mp4`

Until an owner-provided trailer is added, the page uses
`/public/media/static-hero-fallback.png`.

See `STATIC_MASTER_CONTEXT.md` for product canon and `src/providers/` for the
future provider-adapter boundary.
