# STATIC Entity Visual Pipeline

## Current production baseline

Phase 1 is implemented: structured Entity DNA, reference-image storage, free local concept renders, secure provider adapters, official image assignment, and profile/Channel/feed/Studio identity propagation.

The Three.js runtime and GLB asset slots are also present. Current 3D figures are procedural development stand-ins, not commissioned final Entity models.

## Roadmap

1. **AI-generated identity:** Generate and curate consistent portraits, full-body frames, banners, post poses, and official references from Entity DNA.
2. **Animated media:** Add approved image-to-video, talking Entity, lip-sync, and animated post providers behind explicit credit confirmation.
3. **Image to 3D:** Evaluate approved services that can convert official Entity references into topology, textures, rigging, and blendshapes.
4. **Web avatar:** Load optimized GLB/glTF assets through `EntityViewport3D`, map animations, attach cosmetics, and provide mobile quality levels.
5. **AAA cinematic pipeline:** Evaluate Unreal Engine, MetaHuman, or an equivalent high-end character pipeline with a trained developer and documented source-control/build process.
6. **Live Entity mode:** Connect facial tracking, voice, recording, and LiveKit/WebRTC broadcasting with moderation and device-performance controls.

## Boundaries

- Unreal/MetaHuman is a future high-end pipeline, not the immediate owner workflow.
- STATIC can create and protect an AI-generated visual identity now.
- GLB/glTF and future Unreal assets should derive from approved official references, never random one-off generations.
- Pixel Streaming may be evaluated later for browser-delivered Unreal sessions.
- No current code claims to install, operate, or automate Unreal without owner and developer setup.

## Asset contract

GLB/glTF files live under `public/assets/entities/<category>/`. Registry paths are defined in `src/lib/entityEngine/entityAssetRegistry.js`. Every cosmetic record should support identity, category, rarity, premium/unlocked state, asset reference, material and color options, body/pose compatibility, attach point, and marketplace readiness. All current items remain unlocked and non-transactional.

