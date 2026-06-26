# STATIC City Data Exports

These JSON files are generated from `src/lib/worldEngine/*` and are meant for future tooling:

- Unreal Engine 5.8 import/data-table prep.
- MCP context when Codex connects to Unreal.
- Supabase seed/migration planning.
- Internal production review.
- Asset-intake option syncing for future Blender/Unreal import tooling.

Regenerate with:

```text
node scripts/export-world-engine-data.mjs
```

Do not edit generated JSON by hand. Update the source modules, then export again.

`asset-intake-options.json` contains the owner-console option catalog only. Real
asset records are exported from `/asset-intake` and should be reviewed before
being stored under `public/assets/world/intake/manifests/`.
