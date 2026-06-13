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

The public routes and interface previews are implemented. Forms acknowledge
interactions locally but do not transmit or store data. Audio, game generation,
payments, subscriptions, accounts, uploads, publishing, search,
recommendations, and marketplace transactions are intentionally not connected.

See `STATIC_MASTER_CONTEXT.md` for product canon and `src/providers/` for the
future provider-adapter boundary.
