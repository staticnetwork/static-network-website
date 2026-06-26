# Netlify Credit Policy

Effective June 13, 2026.

STATIC Network is on Netlify's Free credit-based plan:

- 300 credits per monthly usage period.
- 15 credits per successful production deploy.
- Current usage period: June 12 through July 12, 2026.
- Ten successful production deploys used approximately 150 credits.

## Release Rules

1. Do not production-deploy after individual fixes, provider keys, copy changes, or experiments.
2. Validate locally with lint, production build, functions, and browser QA.
3. Use draft deploys for remote review when local testing is insufficient.
4. Batch provider activation, owner feedback, and polish into one deliberate production release.
5. Obtain explicit owner approval immediately before each production deploy.
6. State the 15-credit production cost and estimated remaining balance before deployment.
7. Keep Netlify auto-recharge disabled unless the owner explicitly authorizes it.
8. Do not upgrade the Netlify plan solely to support development iteration.

## Next Planned Production Release

The next release should batch:

- Google AI image provider;
- official S.A.G.E. visual candidate and approval workflow;
- Cloudflare R2 storage;
- D-ID talking-avatar provider;
- final S.A.G.E. lab verification.

GitHub publishing and local testing do not consume Netlify production-deploy credits.
