# STATIC Entity Animation Pipeline

## What V1 Can Support

The accepted S.A.G.E. workflow is a viable first animation product for STATIC
Entities:

1. The creator selects an approved Entity image.
2. STATIC creates or reuses that Entity's provider avatar ID.
3. The creator supplies text or approved audio.
4. Voice generation produces an audio master when requested.
5. The server submits the avatar ID, audio URL, motion direction, framing, and
   expressiveness to HeyGen.
6. The finished MP4 is reviewed, stored in R2, and reused without another
   generation charge.

This is appropriate for introductions, announcements, short character posts,
host segments, lore drops, and other presenter-style clips. It is not a fake
realtime feature: each new clip is a paid asynchronous render.

## Product Guardrails

- Provider credentials remain server-side.
- Every paid render requires a clear estimate and explicit user confirmation.
- Creators receive quotas, wallet limits, job history, cancellation states, and
  honest provider errors.
- Finished media is copied to STATIC-controlled storage before provider URLs
  expire.
- Generation, voice, music, likeness, and upload rights require moderation and
  consent controls before public launch.
- `cover` is the default framing for new 16:9 clips to prevent letterbox bands;
  creators may intentionally choose `contain`.

## What Requires A Larger V2 System

Natural walking through a scene, turning, pointing at exact interface elements,
object interaction, camera blocking, and repeatable choreography require more
than the v1 talking-avatar endpoint. Likely options are body reenactment,
character-video generation plus compositing, or a rigged 3D Entity system.

Realtime conversation is a separate class of product again. It needs streaming
speech, interruption handling, WebRTC, session limits, latency management,
moderation, and a realtime avatar or 3D renderer.

The practical rollout is:

- V1: paid pre-rendered talking clips.
- V2: richer queued action and scene clips.
- V3: realtime interactive Entities where cost and quality justify it.
