# Entity Recording and Live Pipeline

## Delivery sequence

1. Require a facial rig and documented blendshapes on the production GLB.
2. Add consent-based webcam face tracking.
3. Retarget expressions to the Entity rig.
4. Add body and hand tracking only after facial performance is stable.
5. Support local microphone voice input and visible privacy state.
6. Record an avatar video clip with preview, retake, and deletion controls.
7. Export or attach the approved clip to the Entity feed.
8. Add a local live-avatar camera preview.
9. Add WebRTC/LiveKit rooms after token, moderation, and room-permission review.
10. Add moderation, reporting, safety delay, and emergency stop controls.
11. Optimize meshes, textures, animation clips, and streaming payloads.
12. Enforce mobile quality tiers, thermal limits, and graceful fallbacks.

## Technologies to evaluate

- MediaPipe Face Landmarker and blendshape output
- ARKit-compatible blendshape naming
- WebRTC and LiveKit for live rooms
- `MediaRecorder` and WebCodecs where browser support is appropriate
- Server-side transcoding after a storage and retention policy exists

No camera or microphone should activate without a user gesture and visible indicator. No recording should persist without explicit approval.

