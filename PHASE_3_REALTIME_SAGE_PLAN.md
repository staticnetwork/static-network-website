# Phase 3 Realtime S.A.G.E. Plan

Pricing and product facts were checked against official provider pages on June
13-14, 2026. Recheck them before purchasing.

## Current Decision

Use separate systems for separate jobs:

1. **HeyGen native Photo Avatar video generation** for approved pre-rendered
   speaking clips. The request combines an approved avatar, approved
   ElevenLabs audio, a motion prompt, and high expressiveness in one job.
2. **Tavus CVI or another tested realtime provider** for future live browser
   conversation. This remains a separate evaluation because a rendered MP4 is
   not an interactive avatar.

The accepted S.A.G.E. v1 clip is 11.9564 seconds, cost $0.55, and is stored in
Cloudflare R2 for zero-cost repeat playback.

## Retired Experiment

The $7 HeyGen Cinematic Avatar render produced standalone full-body motion, but
Precision Lipsync rejected it because the silent motion footage contained no
detected speaker. That combination is retired for talking-Entity generation.
It must not be presented as the default production path.

D-ID was also rejected on June 13, 2026 because its trial produced a 512x512
face crop with a watermark.

## V1 Production Path

1. Approve an Entity identity image.
2. Create or reuse its HeyGen photo-avatar ID.
3. Approve the script and voice master.
4. Display a cost estimate.
5. Require explicit paid confirmation.
6. Submit one native Photo Avatar video job.
7. Poll the same job without creating duplicates.
8. Review the result before publishing.
9. Copy the approved MP4 to owner-controlled R2 storage.

For the local S.A.G.E. workflow, run
`npm run generate-sage-heygen -- --confirm-paid` only after explicit approval.

## Realtime Boundary

Realtime S.A.G.E. requires more than HeyGen video generation:

- WebRTC session creation and teardown
- streaming speech and interruption handling
- latency and concurrency controls
- microphone consent and text fallback
- per-session cost limits
- moderation and action confirmation
- mobile bandwidth, heat, and interruption testing

The browser should receive only a bounded conversation URL or session token.
Provider credentials stay in server-side functions.

## 3D Boundary

Talking video is not a 3D asset. A later 3D route requires a production mesh,
topology, PBR materials, hair and wardrobe systems, facial blendshapes,
visemes, a body rig, animation sets, LODs, compressed textures, and a
mobile-tested WebGL or WebGPU runtime.

The approved 2D identity remains the visual source of truth.

## Cost Rules

- Pre-rendered approved clips replay for no provider charge.
- Every new voice or avatar render may consume provider credits.
- No client-side code receives provider secrets.
- No paid job is submitted without explicit confirmation.
- Failed jobs and provider pricing are reported honestly.
- Auto reload remains off unless the owner changes that policy.

## Official Sources

- https://elevenlabs.io/pricing
- https://www.tavus.io/pricing
- https://docs.tavus.io/sections/conversational-video-interface/conversation
- https://developers.heygen.com/docs/pricing
- https://developers.heygen.com/photo-avatar
- https://developers.heygen.com/reference/create-video
- https://developers.cloudflare.com/r2/pricing/
