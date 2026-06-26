# STATIC City Production Asset Manifest

This is the owner-facing source-of-truth checklist for assets needed before STATIC City can move from web prototype toward a real Unreal Engine 5.8 vertical slice.

Status values:

- `prototype-present`: an early test file exists, but it is not final.
- `needed`: no approved production asset exists yet.
- `design-needed`: design direction is needed before sourcing.
- `not-cleared`: license/trademark/commercial usage has not been cleared.

## P0 Foundation

| Asset | Target | Status | License | Blender Use | Unreal Use |
| --- | --- | --- | --- | --- | --- |
| Official STATIC logo system | `/assets/brand/static-official-logo.svg` | design-needed | must be original/owned | Only needed for 3D signs, badges, pendants, decals | Source for UI, app icon, signage, clothing badges, billboards |
| Mr. Stone playable Entity rig | `characters/mr-stone/mr-stone.glb` | prototype-present | owner-generated prototype review required | Inspect scale, materials, textures, topology, file size | Temporary import test; final should become MetaHuman/humanoid rig |
| Black luxury SUV | `vehicles/stone-suv.glb` | needed | not-cleared | Check wheel/door separation and material slots | Vehicle shell, valet animation, route camera anchor |
| STATIC Tower valet chunk | `venues/static-tower-valet.glb` | needed | not-cleared | Check collision surfaces and spawn-marker empties | First exterior/interior bridge |
| Market Walk retail chunk | `venues/market-walk.glb` | needed | not-cleared | Check interactive meshes and room scale | Clothing/jewelry/status mission |

## P1 First World Loop

| Asset | Target | Status | License | Blender Use | Unreal Use |
| --- | --- | --- | --- | --- | --- |
| STATIC Radio rooftop venue | `venues/static-radio-rooftop.glb` | needed | not-cleared | Check crowd lanes, DJ booth, VIP couch, prop separation | Radio rooftop destination and event venue |
| STATIC Arena / basketball venue | `venues/static-arena.glb` | needed | not-cleared | Check court, tunnel, VIP, crowd-wall modules | First sports venue |
| Basketball court kit | `sports/basketball-court-kit.glb` | needed | not-cleared | Check hoop/court/ball collision readiness | Shootaround and sports prototype |
| STATIC Blues route cue | `audio/static-blues-loop.ogg` | needed | rights-safe original required | Not applicable | Vibe Mode audio cue |
| Vibe Mode STATIC Strip chunk | `routes/vibe-strip.glb` | needed | not-cleared | Check camera rail and billboard surface separation | First-person window cruise |
| Gold STATIC CITY mountain sign | `landmarks/static-city-mountain-sign.glb` | needed | not-cleared | Check scale and LOD strategy | Signature skyline landmark |
| Private STATIC Island estate | `venues/private-static-island-estate.glb` | needed | not-cleared | Check island scale, spawn markers, modular sub-pieces | Mr. Stone primary residence canon |
| STATIC Marina district | `venues/static-marina.glb` | needed | not-cleared | Check dock modules and route markers | Marine travel hub |
| Solar Coast district | `venues/static-beach.glb` | needed | not-cleared | Check beach club, car show, boardwalk pieces | Beach/social/marine crossover |
| STATIC Island Resort Quarter | `venues/static-island-resort-quarter.glb` | needed | not-cleared | Check cultural respect, shops, route markers | Island vacation district |
| Summit return route | `routes/summit-return.glb` | needed | not-cleared | Check road scale and camera markers | Mission return route |
| Original STATIC race car | `vehicles/static-race-car.glb` | needed | not-cleared | Check wheels, interior, material slots | Velocity/racing prototype |
| STATIC Velocity garage | `venues/static-velocity-garage.glb` | needed | not-cleared | Check customization station meshes | Vehicle identity loop |
| STATIC Velocity night run route | `routes/night-run.glb` | needed | not-cleared | Check route collision and hazard markers | Red-light challenge route |

## P2 Expansion

| Asset | Target | Status | License | Blender Use | Unreal Use |
| --- | --- | --- | --- | --- | --- |
| Crew HQ / faction base | `venues/crew-hq.glb` | needed | not-cleared | Check banner, command table, vehicle bay modules | Crew formation and faction presence |
| District fortress upgrade kit | `props/district-fortress-kit.glb` | needed | not-cleared | Check modular snapping and collision | Dominion territory upgrades |
| Dominion conflict arena | `venues/dominion-arena.glb` | needed | not-cleared | Check cover/spawn/spectator modules | Opt-in arcade conflict |
| Guardian companion / bodyguard | `companions/guardian-companion.glb` | needed | not-cleared | Check rig-readiness and LOD | Companion follow/protect prototype |
| Companion Hub / Guardian Yard | `venues/companion-hub.glb` | needed | not-cleared | Check preview pads and terminal meshes | Companion selection venue |
| Marine vehicle kit | `vehicles/marine-vehicle-kit.glb` | needed | not-cleared | Check steering/wake/passenger anchors | Speedboat and jet ski prototypes |
| STATIC yacht party venue | `venues/yacht-party.glb` | needed | not-cleared | Check deck/DJ/VIP/camera markers | Floating event venue |
| Sky Crown district chunk | `venues/sky-crown-district.glb` | needed | not-cleared | Check tower kit modularity and LOD | Supertall luxury skyline |
| Signal Borough district chunk | `venues/signal-borough.glb` | needed | not-cleared | Check alley/market/crowd lane modules | Dense urban side |
| Tunnel Rise Suburbs chunk | `venues/tunnel-rise-suburbs.glb` | needed | not-cleared | Check road/home/park modular kits | Euphoric suburbia reveal |
| The Red Light / Hidden Walking Street | `venues/the-red-light-hidden-walk.glb` | needed | age-gated/moderated future content | Check doorway portals, crowd lanes, signage surfaces | Hidden mature-nightlife discovery chain |

## Production Rule

Do not treat any downloaded, AI-generated, or community asset as final until it has:

- clear commercial rights
- no copied real-world brands or protected IP
- stable source files
- Blender inspection or equivalent validation
- Unreal import test
- performance budget
- replacement path documented
