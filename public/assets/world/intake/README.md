# STATIC World Asset Intake

This folder is the pre-canon staging area for STATIC City assets. It is for owner planning, licensing review, Blender cleanup notes, Unreal import notes, and MCP handoff manifests.

It is not a public marketplace, ownership ledger, creator upload system, payment system, or Unreal source-control replacement.

## Folders

- `quarantine/` - raw candidate notes and unapproved asset references. Nothing here is canon.
- `manifests/` - exported JSON from `/asset-intake` after owner review.
- `approved/` - reviewed local staging notes for assets that are cleared enough to prepare for Blender or Unreal planning.

## Naming

Use lowercase asset slugs:

```text
asset-slug/
asset-slug/preview.png
asset-slug/source.glb
asset-slug/README.md
```

If the source has multiple variants, keep them grouped under the same asset slug and list every variant in that asset README.

## Required Review

Every asset must have:

- Name and source.
- Asset type and format.
- License state.
- World placement: district, region, island ring, hidden layer, or quarantine.
- Gameplay role.
- Import notes for scale, rigging, collision, materials, LOD, and animation.
- Moderation notes for weapons, adult spaces, combat, public/private use, or IP risk.
- Owner-approved placement before it leaves quarantine.

Do not place API keys, private receipts, private marketplace account data, or unreleased third-party license files in this public assets tree.
