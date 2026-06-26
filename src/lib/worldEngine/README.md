# World Engine Boundary

This folder is the bridge between the current STATIC public website and the future real-time Arrival District engine.

Use `districtManifest.js` for shared world facts:

- venue IDs
- route targets
- 2D spawn coordinates
- camera intents
- travel lines
- future systems

Use `staticCityWorld.js` for the owner-only game-world vertical slice:

- city tiers
- route nodes
- mission loop
- scene modes
- system stack
- backend contracts

Use `engineBridge.js` for runtime integration:

- `createWorldEngineSnapshot(activeVenueId)` returns the public scene state a future engine can read.
- `mountWorldEnginePreview()` is intentionally a no-op until a real engine is selected.

Keep backend, AI generation, payments, multiplayer, NPC memory, and uploads out of this folder until the real systems exist.

Use `staticCityAssetPipeline.js` to track the real asset replacement queue:

- playable Mr. Stone rig
- black luxury SUV model
- STATIC Tower valet scene chunk
- Market Walk retail scene chunk
- STATIC Arena and basketball court chunks
- STATIC Radio rooftop scene chunk
- rights-safe STATIC Blues audio cue
- STATIC Velocity race car, garage, and night-run route chunks
- STATIC Companion guardian/bodyguard and Companion Hub chunks

Use `scripts/export-world-engine-data.mjs` to generate JSON handoff files for future Unreal/MCP import:

- `public/assets/world/city/data/asset-pipeline.json`
- `public/assets/world/city/data/city-world.json`
- `public/assets/world/city/data/district-scale.json`
- `public/assets/world/city/data/story-missions.json`
- `public/assets/world/city/data/unreal-handoff.json`

Use `supabase/world_engine_story_spine.sql` as the additive backend draft for world assets, story missions, mission progress, building interiors, interior instances, and future age-gated hidden venues. Do not apply it to production without owner approval.

Use `staticCityModelAssets.js` for live model replacement slots:

- `mr-stone.glb` at `/assets/world/city/characters/mr-stone/mr-stone.glb`
- `stone-suv.glb` at `/assets/world/city/vehicles/stone-suv.glb`

`StaticCityEngineView.jsx` probes these slots in the browser. If a valid GLB is present, it loads and normalizes the model into the current owner route. If the file is missing or invalid, the procedural proxy stays active without breaking the preview.

The first production spec for the actual Mr. Stone rig lives at `public/assets/world/city/characters/mr-stone/README.md`.

The `/city` route is owner-only/internal. It is where STATIC can become a game-like city layer without exposing rough prototypes to the public site.

The `/asset-intake` route is owner-only/internal. It is the local world-bible console for incoming assets and packs: source, license state, type, rarity, district/region/island-ring placement, faction, gameplay role, Blender notes, Unreal target path, and NPC ecosystem potential. `/world-bible` points to the same console.

Asset intake records are saved in localStorage under `static_world_asset_intake`. They are planning records only. They do not create marketplace listings, cloud inventory, ownership, payment state, or Unreal imports. The next backend version needs owner-authenticated Supabase tables plus server-authoritative license/moderation/import status before any public claims.

`src/components/world/StaticCityEngineView.jsx` is the current owner-only Three.js mount. It renders the first WebGL version of the Mr. Stone mission route: nodes, route line, avatar proxy, SUV shell, crowd particles, beat-driven camera modes, and a penthouse-to-elevator interior blockout. It is not multiplayer, not a final avatar rig, and not public.

`staticCityVisualTargets` and `staticCityDistrictBillboards` define the visual north star for `/city`: Arrival District-level density, image-driven venue signage, neon/premium street lighting, and cinematic world composition. Use these references to keep engine work pointed toward the generated hero/video world instead of drifting into generic wireframe maps.

`staticCitySceneModes` is the handoff layer between mission beats and future scene streaming. The first active mode is `penthouse`, which constrains movement to Mr. Stone's top-floor room/hallway and drives third-person follow-camera behavior.

`staticCityOpeningSequence`, `staticCityValetSequence`, `staticCityDriveSequence`, `staticCityMarketSequence`, `staticCityRadioSequence`, and `staticCityVibeSequence` are the current authored V0.1 owner storyboard rails. They are not the final first-time user path. They should eventually be replaced by animation clips, pathfinding, door interactions, and scene streaming, but for now they prove the opening loop: wake, status wall, hallway, elevator call, elevator open, valet arrival, SUV approach, door open, radio boot, drive-route handoff, chase-camera descent, billboard sweep, Market Walk arrival, fit upgrade, jewelry lock, status confirmation, Radio arrival, rooftop reveal, VIP escort, drink/cigar props, VIP couch, Vibe Mode strip cruise, window-down first-person camera, STATIC Blues radio HUD placeholder, tower return, valet tip, and route-complete cue.

`staticCityVelocityPlan.js` defines the racing/car-culture expansion. It treats racing as an in-world experience: red-light challenges, fictional hazard races, car shows promoted through Signals, controlled takeover zones, deep garage customization, and non-cash Signal Credit reputation loops. Keep it owner/internal until real physics, safety, moderation, backend validation, and legal review exist.

`staticCityDominionPlan.js` defines the crew/faction expansion. It treats conflict as opt-in arcade gameplay: crews, seasonal district control, fortress upgrades, treaty blocs, fictional loadouts, and survival waves. Keep it fictional, non-gory, moderated, and non-cash until the engine, backend validation, anti-cheat, safety, and legal review exist.

`staticCityCompanionPlan.js` defines the companion/guardian expansion. It treats companions as identity, utility, protection, and spectacle: cute sidekicks, robotic guards, dragons, golems, guardian bodyguards, and squad slots. Keep companion protection visual/internal until persistence, moderation, performance budgets, mode rules, and backend validation exist.

`staticCityOriginPlan.js` defines origin settlements for The Fields and hidden city layers. It gives unusual species, robots, guardians, mounts, settlement citizens, and asset families a believable source through fictional villages, camps, machine yards, nests, caravans, forest clans, snow citadels, tunnel communities, and island colonies. Keep the language fictional, respectful, and non-colonial.

`staticCityUniversePlan.js` defines the late-game ceiling breaker: STATIC Astral Port, STATIC Orbital Station, off-world origin settlements, Planet Genesis Console, custom planets, alliances, trade, planet defense, and opt-in solar-system conflict. Keep this as future prestige expansion after STATIC City and The Fields are strong.

`staticCitySportsPlan.js` defines the sports expansion. It treats basketball as the first sports proof because the Arrival District canon already shows arena/fan energy. Keep it as venue gravity, VIP watch parties, creator teams, and owner-only state until physics, rigging, multiplayer, anti-cheat, moderation, and replay/reporting are ready.

The browser build is the social/access/preview layer, not the final ceiling. STATIC City now targets Unreal Engine 5.8 as the high-fidelity game client path. The UE5.8 client should connect to the same accounts, Entities, inventory, properties, Signals, Radio, events, vehicles, companions, sports, and creator systems instead of becoming a separate product.
