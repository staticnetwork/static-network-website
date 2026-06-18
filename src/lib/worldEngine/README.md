# World Engine Boundary

This folder is the bridge between the current STATIC public website and the future real-time Arrival District engine.

Use `districtManifest.js` for shared world facts:

- venue IDs
- route targets
- 2D spawn coordinates
- camera intents
- travel lines
- future systems

Use `engineBridge.js` for runtime integration:

- `createWorldEngineSnapshot(activeVenueId)` returns the public scene state a future engine can read.
- `mountWorldEnginePreview()` is intentionally a no-op until a real engine is selected.

Keep backend, AI generation, payments, multiplayer, NPC memory, and uploads out of this folder until the real systems exist.
