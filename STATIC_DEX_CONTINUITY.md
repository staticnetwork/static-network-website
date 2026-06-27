# STATIC / Dex Continuity Checkpoint

Updated: 2026-06-27
Workspace: `/Users/macbook/Documents/Codex/2026-06-12/hey-sage`
Branch: `static-social-preview-20260626`

This file exists so STATIC does not depend on chat memory alone. If the Codex
context window compacts, or if the owner opens a new chat, this is the short
version of what Dex must remember before touching the project.

## Working Relationship

- The owner calls the assistant **Dex**.
- Dex is acting as the product/design/engineering right hand for STATIC.
- The job is not just to follow tickets; the job is to protect the vision,
  make senior calls, and always recommend the next move toward the highest
  version of STATIC.
- Do not publish, deploy, or launch publicly without explicit owner approval.
- Do not treat unfinished features as real. If a backend/API/payment/live tool
  is not wired and verified, label it honestly or keep it out of the public
  surface.

## Current Strategic Direction

STATIC has split into two connected tracks:

1. **STATIC Social** launches first as an AI-native social network.
   - Humans post AI-made or AI-assisted work.
   - Profiles, posts, follows, comments, saves, Signal score, badges, radio,
     TV, creator discovery, and Studio previews are the public web focus.
   - The site should feel as polished as Instagram, TikTok, Facebook, and
     YouTube, while being clearly STATIC: black glass, metallic gold, cinematic
     city depth, creator status, and future-world identity.

2. **STATIC City / STATIC Game** is the Unreal-powered future.
   - The world vision includes STATIC City, regions, fields, land ownership,
     companions, NPC civilizations, districts, vehicles, races, combat modes,
     creator venues, Static Island, Static Radio, Static TV, and portable
     Signal/profile identity.
   - Unreal Engine work is blocked by current hardware. The owner plans to get
     a stronger Windows/NVIDIA machine or equivalent workstation before the
     real engine slice.

## Current Visual North Star

The approved social direction is the black-glass / metallic-gold north star:

- Feed mockup:
  `/Users/macbook/.codex/generated_images/019ebd70-957d-74c2-9d8f-38efce0577bf/ig_0a889742b6975eb0016a3ea955a2608197b13f2f38d12691af.png`
- Profile mockup:
  `/Users/macbook/.codex/generated_images/019ebd70-957d-74c2-9d8f-38efce0577bf/ig_0a889742b6975eb0016a3ea751886081979de9ab831e64677d.png`

Before returning major visual work, Dex should compare the rendered page
against these north-star images by actually looking, not only by reading CSS.

## Active Site State

The current local app is running around `http://127.0.0.1:4189/feed`.

Recent work moved the app toward STATIC Social:

- Portal gate leads into Social.
- Top-left brand should read STATIC Social on social routes.
- Static logo is the approved mark from `/assets/brand/static-mark-official-working.png`.
- Bottom mobile nav is moving toward a five-item app feel: Feed, Search, Post,
  Messages, Profile.
- Profile page was rebuilt closer to a Facebook-banner plus Instagram-grid
  pattern and the owner liked that direction.
- Mr. Stone profile exists as the official founder account target.
- Dex profile/account exists as an internal/brand personality target.
- Feed has seeded AI creator content and should expand through character
  profiles/posts instead of brochure sections.
- Static Radio and Static TV are becoming separate media surfaces that can
  eventually stand alone as apps.
- Static Studio/Create should feel like a premium creator suite ad/surface,
  not developer operations copy.

## Important Product Rules

- Posts are called **posts**. "Transmission" can be atmospheric, but not core UI.
- Signal is reputation. Current intended score thresholds:
  - 0 to 9,999: 1 bar
  - 100,000: 2 bars
  - 1,000,000: 3 bars
  - 1,000,000,000: 4 bars
  - 1,000,000,000,000: 5 bars
- Signal actions:
  - Post: +100
  - Follower: +100
  - Like: +10
  - Comment: +10
  - Share: +20
- Mr. Stone should have official founder status and visible 1M / 1B / 1T
  milestone badges, with the 1T identity treated as mythical/top-tier.
- Public users can browse without account, but posting, following, sharing,
  saving, messaging, live, and owner/admin stats require login.
- Profile pages need posts, tagged posts, followers/following, badges, banner,
  profile image, and a polished grid.
- Tagged tab should only show exact posts where the profile is tagged.
- Owner analytics/performance snapshots should only show to the profile owner,
  not the public.
- Media posts should support images, video, and audio. Music/audio should feed
  STATIC Radio; shows/music videos should feed STATIC TV.
- Posts should support up to 10 images/videos per post before public launch.

## Backend / Infrastructure Direction

Configured or partially configured services have included Supabase, Stripe,
Stream/streaming experiments, Google AI, ElevenLabs, Cloudflare R2, Netlify,
GitHub, and local provider scaffolds. Secrets live in `.env.local` and must
not be exposed.

Launch-critical backend surfaces:

- Supabase auth, profiles, follows, posts, comments, likes, saves, notifications,
  messages, Signal ledger, badges, media metadata, passkeys/invite codes, and
  owner/admin role.
- Storage for images/video/audio with validation and public/private rules.
- Google AI or gateway-backed AI post assistant, with server-side quota.
- Stripe for Static+ / Creator Pro / Static Coins only after real webhook and
  wallet ledger verification.
- Live/streaming provider for real Go Live before calling it functional.
- Moderation/reporting/admin review before public scale.

## Known Current Concerns From Owner Review

- Do not publish yet just because context is low.
- Desktop feed still has too much empty rail space in some states.
- Mobile must feel premium, not reduced or cheap.
- Mobile needs a visible post composer and Go Live action in the right place.
- Site background should be black/dark with a faint stationary city image, not
  blue/grey panels or amateur purple haze.
- The portal gate sound was considered bad and should be replaced/removed.
- Startup ambient static/city sound can be removed from Social for now and
  saved for the game.
- Some older platform pages still have mobile cropping/horizontal overflow:
  Channels, Studios, Static+, Static Play, Labs, Contact.
- Contact appears twice near the bottom in at least one flow.
- Heroes on mobile start too low with too much blank space.
- Radio widget had overlap/station directory glitches and needs a professional
  Spotify/Apple Music-style cleanup with the rooftop hero as background.
- Feed should not show duplicate radio posts/widgets on mobile.
- Suggested creator follow/login buttons need premium styling and centered text.
- Profile images, names, handles, and comment identities must route to profiles.
- Create/Studio page needs the Static Labs visual and premium ad language.
- Messages should feel simple and premium, closer to IG/FB with video-call
  affordance, not beta/developer controls.
- Badges and profile image frames need premium spacing and real-feeling effects.

## Immediate Next Moves

1. Save this checkpoint and commit/push the branch before any risky work.
2. Continue the social polish sprint toward the north-star feed/profile:
   black glass, metallic gold, less grey, less clutter, better mobile.
3. Fix public launch blockers: broken routes, overflow, login gating,
   duplicated widgets, creator routing, profile tabs, media player issues.
4. Wire or verify Supabase-backed account/profile/post flows before public use.
5. Add final production-readiness checklist and only then consider Netlify
   deployment with owner approval.

## Recovery Instruction For A New Chat

If a new Codex chat starts:

1. Read `STATIC_DEX_CONTINUITY.md`.
2. Read `STATIC_MASTER_CONTEXT.md`.
3. Run `git status --short`.
4. Do not publish automatically.
5. Ask whether the owner wants to continue polish, checkpoint/push, or deploy
   preview.

