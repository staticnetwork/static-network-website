# STATIC Social Launch Readiness

This is the current no-fluff checklist before public launch.

## Green Locally

- `vite build` passes.
- `eslint .` passes through the bundled Node/npm runtime.
- Supabase public URL/key are configured.
- Google AI key is configured for the AI Post Assistant.
- LiveKit and Cloudflare R2 keys are present locally.
- Feed posting now accepts image, video, audio, and music files, including common Suno-style exports such as `.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`, and `.flac`.
- The media composer shows whether the cloud upload/storage backend is ready before the user posts media.
- Signal Live has a real token boundary: preview mode is public, but issuing a LiveKit room token requires a logged-in Supabase session.
- `supabase/signal_backbone.sql` and `supabase/presence_backbone.sql` have been applied successfully.
- `supabase/social_backbone.sql`, `supabase/commerce_backbone.sql`, and `supabase/storage_buckets.sql` have been applied successfully to hosted Supabase.
- Hosted storage buckets now exist for avatars, banners, thumbnails, and media/music uploads.
- `netlify/functions/test-media-storage.js` validates hosted Supabase media buckets without exposing the service-role key.
- Hosted Supabase media bucket validation passes for `avatars`, `banners`, `media`, and `thumbnails`.
- `supabase/social_launch_hardening.sql` has been applied successfully for durable profile banners/bios/websites and real direct-message tables.
- Feed posting now publishes locally first, then attaches cloud media after upload. This keeps posts feeling instant even for larger audio/music files.
- Messages now have a real logged-in cloud path: profile search, direct threads, direct messages, and thread reads.
- Signal Live now opens real browser camera/mic preview after user action, requests a protected LiveKit room token for logged-in users, and stops device tracks when the room closes.
- Stripe Checkout functions exist server-side.
- `netlify/functions/test-stripe.js` reports Stripe readiness without exposing secrets.
- Stripe, Stripe price IDs, webhook secret, and Supabase service-role environment variable names are present locally.
- Static Coin wallet and ledger migration exists at `supabase/commerce_backbone.sql`.
- Stripe webhook fulfillment is idempotent through `credit_static_coins`.
- Signal strength bars are locked to the public progression rule: 1 bar for any Signal, 2 bars at 100K, 3 bars at 1M, 4 bars at 1B, and 5 bars at 1T.
- Seeded AI creator posts and comment threads now act as launch-world storytelling, not placeholder filler. The best comment feedback has been harvested into `WORLD_ENGINE_READINESS.md`.
- `AI_CREATOR_ACTIVITY_WORKER_PLAN.md` documents AI creator account automation as draft-only, disclosed, and not active until moderation/safety controls exist.

## Still Blocking Public Launch

- Apply any still-needed world/static-id migrations only if those routes are exposed publicly before the Unreal/game layer is ready.
- Confirm Stripe and `SUPABASE_SERVICE_ROLE_KEY` are configured in Netlify server-only environment variables, not just local `.env.local`.
- Verify a test Stripe checkout records `marketplace_orders`.
- Verify a test Static Coin purchase credits `static_coin_wallets` exactly once.
- Verify the account wallet panel can read the logged-in user's balance.
- Verify media uploads from a logged-in user for avatar, banner, image post, video post, and music/audio post in a Netlify deploy preview.
- Install `livekit-client` in the real development/deploy environment to publish camera/mic tracks to remote viewers. This Codex runtime currently has Node but no npm/pnpm/yarn binary, so local package installation could not be completed here.
- Verify real direct-message send/search between two Supabase accounts in a deploy preview.
- Verify Netlify functions in a deploy preview before production.
- Finish product/legal review for payments, refunds, taxes, age rules, moderation, abuse, and app-store implications.
- Rotate any access token that was pasted into chat or shown on-screen before public launch.

## Current Provider Check

Launch-critical pass:

- Supabase
- Google AI
- LiveKit
- Cloudflare R2
- Stripe local environment presence check

Roadmap provider gaps:

- OpenAI is not configured.
- Runway is not configured.
- ElevenLabs is configured, with the Entity voice ID still optional/missing.

## Next Operator Steps

1. Create Stripe products/prices for Static+, Creator Pro, and coin packs.
2. Add Stripe and service-role secrets to Netlify server-only environment variables.
3. Deploy to a Netlify preview, test account signup/login, AI Assist, media upload, checkout, webhook, and wallet balance.
4. Only publish production after the product can be reviewed next to Instagram/TikTok/YouTube/Facebook without feeling unfinished.
