# S.A.G.E. Arrival Experience

## Product Behavior

S.A.G.E. is the first-run concierge for both the public website and the app shell.

- `/` is the permanent S.A.G.E. landing environment and opens every time a visitor enters or returns to the root route.
- Internal routes do not interrupt visitors with the landing environment. The corner signal can summon S.A.G.E. over any internal route.
- S.A.G.E. materializes on the STATIC platform and offers a tour, direct assistance, authentication, or entry into the network.
- Dismissing the arrival collapses her presence toward the persistent corner signal.
- Selecting the corner signal summons the full-screen arrival again.
- The fallback is the owner-approved full-body foundation image. It must never be represented as final motion footage.

## Approved Media States

The identity registry provides separate approval slots:

1. `officialSageArrivalVideo`: 10-15 second welcome and movement performance.
2. `officialSageIdleLoopVideo`: short seamless pacing or attentive idle loop.
3. `officialSageCollapseVideo`: optional transition into the corner signal.
4. `officialSageSummonVideo`: optional transition out of the signal.
5. `officialSageTalkingVideo`: general approved speaking clip.
6. `officialSageTourVideo`: legacy tour-intro fallback.

Until these assets are approved, CSS handles materialization, subtle pacing, collapse, and summon choreography around the approved still.

## V1 Approved Arrival

- Provider route: HeyGen native Photo Avatar video generation with approved audio supplied at creation time.
- Approved output: `sage/sage-heygen-arrival-final.mp4` in owner-controlled Cloudflare R2.
- Duration: 11.9564 seconds.
- Generation charge: $0.55.
- Repeat playback charge: $0.
- The source export includes thin white top and bottom bands. The landing frame removes them with a clipped 3.5% overscan, so no paid regeneration is required.
- The arrival autoplays muted because browsers block unsolicited audio. Selecting the sound control restarts the approved performance with sound, then collapses S.A.G.E. into the persistent corner signal when it ends.

## Cost Boundary

The launch sequence must use pre-rendered, reusable media stored in owner-controlled R2 storage. Page views and repeat summons must not create new HeyGen, Runway, D-ID, or ElevenLabs jobs.

- Provider generation happens only in an owner-only workflow with explicit credit approval.
- A finished clip is reviewed, approved to a named identity slot, and replayed from storage.
- Live ElevenLabs responses remain opt-in because each new spoken response may consume provider credits.
- No avatar-provider or voice-provider key belongs in browser code.
- The retired $7 Cinematic Avatar plus Precision Lipsync path must not be used for talking-Entity generation. Precision Lipsync rejected the silent cinematic output because it could not detect a speaker.

## Browser Audio

Browsers may block unprompted audio. Arrival video starts muted and exposes an `Enable Sound` control. The visual entrance must remain complete and understandable without sound.

## Production Motion Direction

The final performance should preserve the full body and platform:

- Platform powers on before S.A.G.E. resolves.
- She steps forward naturally and presents with restrained stage movement.
- Delivery should feel like a concise product keynote, not an idle chatbot.
- On “I’ll be in the corner if you need me,” the rendered performance ends with her pointing toward the lower-right signal. The site then performs the precise jump-and-compress transition into the persistent bubble.
- The frame must leave enough negative space for responsive copy.
- Output must be HD, watermark-free, and approved by the owner before public use.
