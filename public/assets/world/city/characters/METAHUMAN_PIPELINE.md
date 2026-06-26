# STATIC MetaHuman Pipeline

Target engine: Unreal Engine 5.8.

MetaHuman should be the default production path for STATIC human and near-human characters:

- Mr. Stone
- S.A.G.E.-style guides
- DJs, hosts, guards, valets, fans, creators, celebrities, athletes, NPC pedestrians
- humanoid companions where the design is close enough to a human body

## Why This Matters

The 5.8 MetaHuman toolchain can turn custom human-shaped source meshes into animation-ready MetaHumans. That means STATIC can art-direct characters in Blender, ZBrush, or image-to-3D tools, then use MetaHuman tooling to reach a higher-quality rig/animation baseline faster than hand-building every human from scratch.

This does not replace art direction. It replaces a chunk of painful character-production plumbing.

## Working Pipeline

1. Design the character concept.
2. Sculpt or generate a human/humanoid source mesh.
3. Clean the silhouette and proportions.
4. Bring the mesh into Unreal Engine 5.8 MetaHuman tooling.
5. Convert to MetaHuman-compatible topology/rig.
6. Add wardrobe, hair, materials, accessories, animation set, and performance LODs.
7. Connect the character to STATIC ID, Entity profile, inventory/loadout, permissions, and moderation state.

## Still Required

- Wardrobe system.
- Hair and grooming choices.
- Jewelry/accessory slots.
- Locomotion and interaction animation sets.
- Facial performance capture rules.
- NPC behavior trees or Mass/crowd logic.
- Network replication strategy.
- Mobile/web preview LODs.
- Moderation and likeness/legal review.

## Not Covered By MetaHuman

- Cars and vehicles.
- Buildings and venues.
- Props and marketplace items.
- Dragons, golems, robots, unusual monsters, and non-humanoid companions.
- Physics-heavy gameplay systems.

Those need separate GLB/Unreal asset, rigging, animation, and optimization paths.

## Rule

Use MetaHuman-first for humans. Use original asset pipelines for everything else.
