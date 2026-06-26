# Mr. Stone Playable Entity Rig Spec

This folder is reserved for the real Mr. Stone playable Entity rig. The current `/city` route uses a procedural Three.js stand-in only. Do not treat the stand-in as final character art.

## Target Files

- `mr-stone.glb`: optimized web runtime model.
- `mr-stone.source.blend` or equivalent: private source file, not required in public deploy.
- `mr-stone.animations.glb`: optional separate animation library if exported separately.
- `textures/`: optimized texture maps if not embedded in the GLB.

## Character Direction

Mr. Stone should read as the founder/owner of STATIC Tower: luxury, authority, underground broadcast world, not superhero armor and not generic businessman.

Visual target:
- Black luxury streetwear/tailored coat.
- Subtle purple/gold STATIC trim.
- Premium jewelry and watch.
- Optional sunglasses/glasses slot.
- Status pass or VIP credential slot.
- Looks natural inside penthouse, valet, Market Walk, Radio Rooftop, and vehicle scenes.

## Required Rig

- Humanoid skeleton compatible with common web animation retargeting.
- Root bone at world origin.
- Forward direction documented before import.
- Separate named meshes or material slots for jacket, pants, shoes, jewelry, watch, glasses, and status pass.
- Blend shapes are optional for V0, but facial expression hooks should be planned.

## Required Animations

P0:
- idle
- walk
- turn-left / turn-right or turn-in-place
- enter-suv
- exit-suv
- stand-to-sit
- seated-idle
- receive-drink
- hold-drink
- hold-cigar

P1:
- phone-check
- point/direct
- greet/handshake
- elevator-idle
- rooftop-vip-recline
- window-lookout / vibe-mode idle

## Runtime Budget

First web prototype:
- Runtime GLB target: under 15 MB.
- Texture set target: 1K or 2K, compressed later.
- Use LOD where possible.
- Avoid hair/cloth physics until performance budget is understood.

## Replacement Target

This asset replaces:
- `createMrStoneMarker()` in `src/components/world/StaticCityEngineView.jsx`.

The rig must support the current owner storyboard route:
penthouse spawn, elevator walk, valet pickup, SUV enter/exit, Market Walk fit/status beat, Radio Rooftop VIP, and Vibe Mode handoff.
