# STATIC World Engine Readiness

This build prepares the public website to become a real-time district later. The public site should sell the Arrival District, tour, and request-access flow. Any world prototype or engine experiment is owner-only/internal until it is good enough to show.

## What is ready now

- Arrival District is the public landing world.
- Arrival District videos remain public and should not be hidden behind a hard gate.
- Public CTA surface is intentionally simple: Take The Tour and Request Access.
- Deeper prototypes and engine systems are not public. They should stay owner-only/internal until approved for beta users.
- Venue definitions are centralized in `src/lib/worldEngine/districtManifest.js`.
- Each venue has an ID, route, engine zone, spawn coordinate, camera intent, travel line, and future system tags.
- The Arrival District exposes `data-engine-scene`, `data-engine-mode`, `data-engine-mount`, `data-engine-venue`, `data-engine-zone`, and `data-engine-camera` hooks.
- `src/components/world/StaticWorldEngine.jsx` provides an owner-gated engine experiment with keyboard movement, mobile controls, clickable venue towers, venue selection, and existing route/travel handoff. It is not public and is not the final street-level city traversal experience.
- `/city` provides the owner-only game-first vertical slice: controllable Entity marker, the Mr. Stone owner storyboard route, city tiers, minimap/HUD, property/vehicle/market/radio/social/event/inventory shells, asset pipeline, and backend contract panels.
- `/city` now mounts a real Three.js engine scene for the owner build: WebGL city floor, mission route line, clickable route nodes, Mr. Stone marker, luxury SUV shell, crowd particles, and camera modes driven by the active mission beat.
- `/city` now uses the generated Arrival District and venue images as explicit visual targets and in-world billboard surfaces, so the hidden engine work aims at the same cinematic density as the hero images and arrival videos instead of a plain technical map.
- `/city` now has a first third-person controller foundation: scene-aware movement bounds, facing direction, walking/idle state, an avatar proxy with simple limb animation, and a penthouse-to-elevator interior blockout for the opening mission.
- `/city` now includes the first authored opening loop: a timed owner-only sequence that moves Mr. Stone from penthouse wake/status wall to hallway/elevator, opens the elevator, then transitions to the valet beat.
- `/city` now includes a second authored valet pickup sequence: elevator-to-valet arrival, SUV approach, door-open state, STATIC Radio boot glow, and drive-route handoff.
- `/city` now includes a third authored drive-to-Market-Walk slice: SUV chase-camera travel, road-light pulses, billboard sweep, player-in-vehicle state, Market Walk approach, and retail arrival cue.
- `/city` now includes a fourth authored Market Walk slice: SUV curb stop, exit vehicle, boutique entry, fit upgrade, jewelry lock, status confirmation, and handoff toward Radio arrival.
- `/city` now includes a fifth authored Radio Rooftop slice: Radio curb arrival, security clear, rooftop elevator, rooftop reveal, VIP escort, drink/cigar props, VIP couch, and Vibe Mode handoff.
- `/city` now includes a sixth authored Vibe Mode / Tower Return slice: SUV re-entry, window-down first-person strip cruise, STATIC Blues radio HUD placeholder, billboard canyon, camera pullout, summit road return, tower valet return, valet tip, and route-complete cue.
- The current owner storyboard route is an optional prototype path, not the final first-time user path: Mr. Stone wakes up in the top-floor STATIC Tower penthouse, takes the elevator to valet, enters a black luxury SUV, stops at Market Walk for clothes and jewelry, visits STATIC Radio Rooftop VIP, triggers Vibe Mode on the strip while STATIC Blues plays, then returns to STATIC Tower and tips valet.
- `src/lib/worldEngine/staticCityAssetPipeline.js` defines the real asset replacement queue for Mr. Stone, the SUV, STATIC Tower valet, Market Walk, Radio Rooftop, and the rights-safe STATIC Blues audio cue.
- `public/assets/world/city/characters/mr-stone/README.md` now defines the first production spec for the actual Mr. Stone playable Entity rig.
- A planned district property layer is defined for residences, penthouses, creator businesses, mansions, castles, landmark spawn venues, and prestige properties.
- A vertical mountain-city plan is defined: darker street pulse at the base, circular strip/entry ring around the mountain, brighter premium layers upward, Crown Ridge luxury, and STATIC Tower at the summit.
- STATIC VELOCITY is now part of the owner city design canon: vehicle culture lives inside the city with garage customization, red-light challenges, car shows promoted through Signals, closed fictional takeover zones, and non-cash reputation rewards before any real-value wagering.
- STATIC DOMINION is now part of the owner city design canon: opt-in crew/faction gameplay with seasonal district control, fortress upgrades, treaty blocs, arcade loadouts, and survival-wave events. It must stay fictional, moderated, non-gory, and non-cash until the engine, backend validation, safety, and legal review exist.
- STATIC COMPANIONS is now part of the owner city design canon: cute companions, robotic bodyguards, mythic guardians, dragons, golems, companion squads, stance/loadout slots, and opt-in protection behavior. It must stay cosmetic/internal until persistence, moderation, performance budgets, and mode-specific safety rules exist.
- STATIC SPORTS is now part of the owner city design canon: basketball first, arena nights, fan heat, VIP watch parties, creator teams, and later playable 1v1/3v3/5v5 after physics, animation, netcode, moderation, and anti-cheat exist.
- STATIC prompt-native venues are now part of the city design canon: users should create music, art, games, fashion, companions, and Radio programming by walking into the right venue, using an in-world prompt station, and triggering honest backend job flows.
- The Red Light / Hidden Walking Street is now part of the owner city design canon: a secret mature-nightlife discovery chain where players park, enter The Red Light bar, pass through the back, and reveal a dense neon walking-street corridor inside Signal Borough. This is age-gated/moderated future content, not a public explicit route.
- Story mode target is a GTA-style cinematic open-world campaign with better controls, more realistic graphics, and stronger creator/social systems. It should begin as origin missions that prove arrival, Entity creation, first fit, first ride, first venue, first prompt station, first property, and later hidden discoveries before expanding into full authored chapters.
- Enterable buildings need a tiered interior strategy: hero interiors are authored, repeatable interiors are modular/templated, towers use lobby/elevator/instanced-floor logic, background massing remains facade-only, and seasonal event interiors stream in when needed.
- Cinematic travel mode is isolated so a future engine camera path can replace it without changing route behavior.
- S.A.G.E. remains click-triggered, which keeps browser audio rules and provider-credit usage honest.
- `/demo` no longer exposes a public demo room; old `/demo` visits fall back to the Arrival District.
- Unreal Engine 5.8 is the high-fidelity game-client target. The website is the public/social/account/preview layer and the source-of-truth product spine, not the final ceiling for traversal or graphics.
- MetaHuman should become the default production path for human and near-human characters: Mr. Stone, S.A.G.E.-style guides, valets, guards, DJs, fans, athletes, creators, and NPC pedestrians.
- Steam Deck / SteamOS should be tracked as a handheld PC distribution target once the UE5.8 slice exists. SteamVR / future Valve VR hardware should be tracked as an immersive later lane, not the first build target.
- The long-term city canon has expanded from compact mountain district to full-scale district world: Arrival District, STATIC Strip, Signal Borough, Arena District, Radio Rooftop District, Market Walk, PLAY District, Studio District, Solar Coast, STATIC Marina, Tunnel Rise Suburbs, Sky Crown District, Crown Ridge, STATIC Tower Summit, and STATIC Island District.
- Mr. Stone’s primary residence is now the private estate inside STATIC Island District. STATIC Tower remains the public power landmark, concert/event crown, theme-park summit, and command-suite destination.
- The gold mountain STATIC CITY sign should become a signature landmark: massive gold letters held by two colossal winged guardian statues, visible from city, beach, marina, and island approach routes.
- STATIC Social seeded comments are treated as internal product-feedback prompts when useful. They are fictional launch-world comments, not real user research, but the strongest ideas should be harvested into canon and later validated with actual users.

## Seeded Creator Comment Feedback To Carry Forward

- Signal Boulevard should eventually connect the live social feed to in-world billboards, so creator posts can appear as city-scale media.
- Creator Row needs a live premiere calendar, creator-specific entrances, and venue screens that make every creator feel like a full Channel.
- STATIC Radio should test listener voting, rooftop booth live rooms, and waveform UI that reacts to uploaded creator tracks.
- STATIC PLAY needs prompt kiosks with visible crowd response, destination-style portals, and live reaction meters before any real generated-game backend is claimed.
- Market Walk should make asset packs, saved folders, storefront drops, and profile/store/game portability obvious before purchase.
- Wondercore should follow the rule that nothing looks normal from the outside: buildings should advertise the impossible world inside, not generic facades.
- Sky Crown should use Signal-gated elevator access, status lines, and architecture that visibly communicates prestige.
- Arena nights should support fan badges, fan-wall posts, halftime creativity, and event heat that rewards crowd participation.
- Boardwalk routes should hide factions, portals, companion danger reactions, and vacation-to-underworld transitions.
- Velocity should include map heat, risk/reward, streetlight shutdown moments, camera-operator spectacle, and closed fictional takeover zones.
- Solar Coast should support night jet-ski races, beach-club events, car shows near the sand, and high-status coastal nightlife.
- STATIC Marina should support dockside drops, yacht arrivals, profile/status upgrades, and quiet luxury moments.
- STATIC Island should keep the beach welcoming while the inland compound grows more mythical, rare, and dangerous; island flowers and resort looks should become wearable assets.
- Rise should make the tunnel arrival, waterfall sign, and "A better life awaits" mood feel like a real crossing into safety and status.
- Rootside should lean into NPC memory, upstairs-window story triggers, reputation pressure, and beauty hidden inside rougher streets.
- The Fields map should become a public atlas teaser, but public copy must avoid overclaiming real land ownership, conquest, or persistent systems until the game backend exists.

## Recommended next engine workload

1. Lock the Unreal Engine 5.8 vertical slice:
   - Treat UE5.8 as the real city client target for the first serious playable build.
   - Keep the current direct Three.js shell only as the owner-facing web preview and product-control layer.
   - Do not chase GTA/OASIS-level visuals inside the browser. Use the browser to define accounts, routes, venues, Signals, inventory, event state, and public access.
   - Build the Unreal slice around the expanded canon: STATIC Island District, Arrival District, STATIC Tower command suite, valet, SUV, Market Walk, STATIC Arena, Club STATIC, Radio Rooftop, Vibe Mode, Sky Crown District, Tunnel Rise Suburbs, Signal Borough, Solar Coast, marina/beach routes, companions, and Signals.

2. Upgrade the engine shell:
   - Replace the full-screen V0.1 overlay with a persistent engine mount when performance and scene loading are ready.
   - Read `createWorldEngineSnapshot()` from `src/lib/worldEngine/engineBridge.js`.
   - Keep venue portals driven by the district manifest instead of hard-coded scene facts.

3. Add controlled movement:
   - Do not call the current prototype final walk mode.
   - Replace the placeholder Entity marker with an account-owned Entity/avatar.
   - Add street-level traversal camera paths, venue approach shots, and cinematic walking/driving routes through the city.
   - Keep keyboard/touch accessibility and reduced-motion fallbacks.

4. Add presence carefully:
   - Local NPC shells first.
   - Scripted S.A.G.E. guide second.
   - Real multiplayer only after auth, profiles, safety, moderation, and storage are reliable.

5. Add companions carefully:
   - Prototype companion/bodyguard models internally with clear licenses and optimized GLB sizes.
   - Start with visual follow behavior, idle loops, stance, and venue entrance moments.
   - Add protect/assist behavior only inside opt-in arcade modes after backend validation, safety rules, and anti-abuse systems exist.

6. Add live venue gravity:
   - Entity concerts and appearances should become events users move toward.
   - Crowd heat, limited drops, Signals aftershock clips, Radio simulcasts, and venue access all need real state, rights, and moderation.

7. Add sports carefully:
   - Basketball is the first sports target because the Arrival District image already implies arena nights and fan heat.
   - Start with arena exterior/interior, VIP watch parties, spectator mode, and non-cash reputation intent.
   - Add shootaround/1v1 only after avatar rig, ball physics, camera, input, and animation are solid.
   - Add 3v3/5v5, creator teams, leagues, and events only after multiplayer validation, anti-cheat, moderation, and replay/reporting exist.

8. Add property and business ownership:
   - Residences, penthouses, creator businesses, mansions, castles, and landmark venues need real account ownership, entitlement checks, moderation, pricing, inventory limits, and transfer rules.
   - Spawn points should be property-aware only after identity, profiles, and persistence are reliable.

9. Expand into a true city map:
   - Use UE5.8 World Partition/streaming and PCG to scale beyond one district without creating an empty map.
   - Use interior tiers instead of hand-building every unit: hero interiors, modular templates, lobby/elevator interiors, facade-only background buildings, and event-streamed interiors.
   - Keep the mountain hierarchy, but expand outward into city core, strip, suburbs, beach, marina, and private island.
   - The bottom should feel louder, darker, cheaper, and more accessible. The climb should make houses, streets, cars, lighting, architecture, and venue prestige visibly improve.
   - Build roads, walk paths, vehicle paths, marine paths, camera paths, and spawn logic around landmarks instead of random menus.
   - Every district must have a job: social, sports, music, shopping, creator production, property, racing, marine, live events, or PLAY portals.
   - Hidden districts should exist for discovery, not menu clutter. The Red Light / Hidden Walking Street should be found through city traversal, rumors, Signals clues, NPC hints, and back-door venue transitions.

10. Build genuine create-a-player / Entity mode:
   - Start with identity sculpting, body/face controls, wardrobe, voice identity, status items, and rig-ready animation choices.
   - Then connect spawn point, property access, inventory, privacy, moderation, social graph, and cloud persistence.
   - The 3D world should not pretend users have real playable Entities until this system is saved and account-bound.

11. Build the MetaHuman human pipeline:
   - Use MetaHuman-first for human/humanoid characters.
   - Keep source sculpts and concepts clean enough to convert, animate, and optimize inside Unreal Engine 5.8.
   - Use separate pipelines for dragons, robots, vehicles, venues, props, and non-humanoid creatures.

12. Track Steam / VR hardware expansion:
   - Aim first for PC storefront distribution and controller support after the vertical slice is real.
   - Treat Steam Deck / SteamOS as a strong performance/control benchmark for a handheld version.
   - Treat SteamVR and future VR hardware as a premium mode after locomotion, comfort, safety, avatar scale, and multiplayer presence are mature.

13. Add production systems only when ready:
   - Spatial audio, creator uploads, generated music/video, live rooms, payments, and marketplace transactions require real providers, cost controls, rights checks, and moderation.

14. Build prompt-native venue stations:
   - Music Studio computer: prompts songs, stems, demos, drops, and station programming through a queued provider adapter.
   - Art Gallery station: prompts, curates, purchases, and exhibits generated or owned visual art.
   - PLAY Board: prompts game/world concepts and later launches generated playable prototypes.
   - Fashion Atelier: prompts clothing, jewelry, skins, accessories, and creator drops.
   - Entity Lab: prompts companions, NPC shells, alternate Entity versions, and guide concepts.
   - Radio Booth: prompts show formats, intros, drops, event segments, and station moods.
   - Every station must show cost, queue state, rights/provenance, moderation status, and ownership before claiming anything is generated or owned.

15. Build the story campaign after the systems can carry it:
   - Use origin missions as the first playable proof, then grow into Mr. Stone founder chapters, rising Entity chapters, crew/faction arcs, racing arcs, sports arcs, creator/studio arcs, island arcs, hidden-nightlife arcs, and city-mystery arcs.
   - Do not write or build a giant campaign before movement, vehicles, interiors, NPCs, saves, route logic, streaming, and camera systems are reliable.
   - Every story mission should unlock, teach, or stress-test a real system.

## Cost-conscious Unreal runway

The current MacBook cannot run the current Epic Games Launcher because it is capped below macOS 13. Do not treat that as a product blocker. Treat it as a spending guardrail.

Use this MacBook for all work that does not require Unreal Engine runtime:

- public website and owner-only web prototype
- city bible, district canon, mission scripts, route maps, and world rules
- asset prompts, licensing notes, source tracking, and GLB intake
- Supabase/backend contracts, waitlist/account flow, Signals data shape, inventory schema, and marketplace rules
- pitch/investor proof materials and controlled previews

Only rent cloud/remote Unreal time when a specific short task list is ready. A paid Unreal session should begin with exact targets, such as:

- create `StaticCity_UE58`
- enable required plugins
- create `/Game/STATIC` folder structure
- block out STATIC Island District, Arrival District, STATIC Island Resort Quarter, Marina, and one travel route
- import one Mr. Stone test asset, one SUV, and one district kit
- capture a 30-60 second proof video

The first paid-session packet lives in `UNREAL_FIRST_CLOUD_SESSION.md`.

Do not buy a Windows RTX laptop or desktop until the first paid Unreal session proves the pipeline is worth owning. If hardware is later justified, prioritize a Windows RTX machine with 32GB+ RAM, 1TB+ SSD, and a strong NVIDIA RTX GPU. Cloud workstations are a bridge, not a lifestyle subscription.

## Cross-platform direction

The web build is the right first battlefield because it owns the public site, Signals, waitlist, creator pages, access flow, and instant sharing. The long-term world should not be trapped as a website. STATIC should treat the browser build as the account/social/preview layer, then graduate the city into an Unreal Engine 5.8 client for traversal, animation, vehicles, NPCs, venue interiors, multiplayer rooms, and high-fidelity rendering.

The future engine client should connect to the same accounts, Entities, inventory, properties, Signals, Radio, events, companions, vehicles, and creator systems. That keeps the social network and the game world from splitting into two separate products.

## Do not fake

- No fake multiplayer.
- No fake account-owned avatars.
- No fake create-a-player mode.
- No fake entity concerts or live rooms.
- No fake property purchases, deeds, businesses, spawn rights, or ownership perks.
- No fake racing multiplayer, real-value betting, vehicle ownership, or leaderboard rewards.
- No fake crew wars, territory control, fortress ownership, survival rewards, real-value combat prizes, or functional multiplayer conflict.
- No fake companion protection, bodyguard AI, paid combat advantage, or public guardian behavior.
- No fake AI generation.
- No fake streaming/radio rights.
- No fake marketplace transactions.
- No fake wallet or payment state.
- No fake NPC memory.

## Public positioning

The public site can say STATIC is preparing to become a controllable entertainment city. It should not expose or market the owner-only prototype, and it should not claim true street-level walking, persistent multiplayer, real NPCs, live concerts, property ownership, or full avatar ownership until those systems are actually implemented.
