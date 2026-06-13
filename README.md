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
marketplace drawers, and profile views run entirely in the browser using local
mock programming.

The waitlist demonstration stores recent submissions in browser `localStorage`.
It does not transmit them to an external service. Audio streaming, real
generation, payments, subscriptions, accounts, uploads, publishing,
recommendations, and marketplace transactions are intentionally not connected.

See `STATIC_MASTER_CONTEXT.md` for product canon and `src/providers/` for the
future provider-adapter boundary.
