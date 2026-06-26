# Blender Prep Guide For STATIC City

This MacBook can help with light Blender/GLB preparation, but it is not the main Unreal production machine.

## What This Mac Can Do

- Open small GLB/glTF test assets.
- Check scale, orientation, transforms, and origin points.
- Inspect material slots and missing textures.
- Rename objects and organize mesh hierarchy.
- Remove obvious junk geometry.
- Export lightweight GLB previews.
- Take quick screenshots for review.

## What This Mac Should Not Be Used For

- Heavy sculpting.
- Massive city scenes.
- Unreal Engine 5.8 production.
- MetaHuman conversion.
- Nanite-heavy workflows.
- High-resolution cinematic rendering.
- Thousands of NPCs/crowds.
- Large texture-bake sessions.

## Install Guidance

If the newest Blender installer refuses this macOS version, install the newest Blender release that still supports this machine. Do not upgrade the operating system blindly just to force one tool if the Mac is already struggling with current Unreal requirements.

## GLB Intake Checklist

For every incoming `.glb`:

1. Open it in Blender or a GLB viewer.
2. Confirm it loads without missing textures.
3. Confirm the asset is full-body or full-scene, not a cropped preview.
4. Apply scale/rotation only if needed.
5. Check the object hierarchy.
6. Check whether important pieces are separated: wheels, doors, signs, props, clothing, jewelry, portals, collision surfaces.
7. Check file size.
8. Check material count.
9. Check whether it has bones/animation.
10. Export a clean preview copy only if the original is preserved.

## File Naming

Use lowercase, hyphenated, descriptive names:

```text
mr-stone.glb
stone-suv.glb
static-radio-rooftop.glb
the-red-light-hidden-walk.glb
```

Do not overwrite source files from Meshy, Blender, Fab, or any provider until an archived original exists.

## Web Preview Budgets

The owner web prototype should stay light:

- Characters: ideally under 15 MB.
- Companions: ideally under 10 MB.
- Vehicles: ideally under 12 MB.
- Large venues: use placeholder chunks or compressed web LODs, not production city meshes.

The Unreal version can use higher-quality source assets later.

## When To Stop And Wait For The Unreal Machine

Stop on this Mac if:

- Blender crashes repeatedly.
- The asset is over 50 MB and slow to orbit.
- Texture previews freeze.
- You need MetaHuman, PCG, Mass Crowd, World Partition, Nanite, Lumen, or UE5.8 import testing.

This machine is for preparation. The RTX/Windows or cloud workstation is for the real engine build.
