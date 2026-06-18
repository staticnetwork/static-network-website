# STATIC World Engine Readiness

This build prepares the public website to become a real-time district later. It does not ship a fake 3D world, fake NPC system, fake multiplayer, fake payments, or fake AI generation.

## What is ready now

- Arrival District is the public landing world.
- Venue definitions are centralized in `src/lib/worldEngine/districtManifest.js`.
- Each venue has an ID, route, engine zone, spawn coordinate, camera intent, travel line, and future system tags.
- The Arrival District exposes `data-engine-scene`, `data-engine-mode`, `data-engine-mount`, `data-engine-venue`, `data-engine-zone`, and `data-engine-camera` hooks.
- Cinematic travel mode is isolated so a future engine camera path can replace it without changing route behavior.
- S.A.G.E. remains click-triggered, which keeps browser audio rules and provider-credit usage honest.
- `/demo` no longer exposes a public demo room; old `/demo` visits fall back to the Arrival District.

## Recommended next engine workload

1. Choose the browser engine:
   - Start with React Three Fiber if we want the fastest path inside the current React app.
   - Consider Babylon.js if browser tooling and scene editor flow matter more.
   - Avoid Unity/Unreal WebGL until the product needs heavy game-runtime features.

2. Build the engine shell:
   - Mount into `#static-world-engine-mount`.
   - Read `createWorldEngineSnapshot()` from `src/lib/worldEngine/engineBridge.js`.
   - Render a lightweight district scene with venue portals before adding avatars.

3. Add controlled movement:
   - Start with click-to-travel camera paths.
   - Then add a controllable Entity/avatar.
   - Keep keyboard/touch accessibility and reduced-motion fallbacks.

4. Add presence carefully:
   - Local NPC shells first.
   - Scripted S.A.G.E. guide second.
   - Real multiplayer only after auth, profiles, safety, moderation, and storage are reliable.

5. Add production systems only when ready:
   - Spatial audio, creator uploads, generated music/video, live rooms, payments, and marketplace transactions require real providers, cost controls, rights checks, and moderation.

## Do not fake

- No fake multiplayer.
- No fake user-controlled avatars.
- No fake AI generation.
- No fake streaming/radio rights.
- No fake marketplace transactions.
- No fake wallet or payment state.
- No fake NPC memory.

## Public positioning

The public site can say STATIC is preparing to become a controllable entertainment district. It should not claim the real-time engine layer is live until it actually is.
