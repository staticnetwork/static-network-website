# STATIC City GLB Sourcing Guide

This folder is for commercial-safe 3D assets only. Do not use ripped game assets, celebrity likenesses, luxury car logos, copyrighted brand marks, or unlicensed marketplace files.

## Immediate Targets

1. `/assets/brand/static-official-logo.svg`
2. `characters/mr-stone/mr-stone.glb`
3. `vehicles/stone-suv.glb`
4. `vehicles/static-race-car.glb`
5. `routes/night-run.glb`
6. `venues/static-velocity-garage.glb`
7. `venues/crew-hq.glb`
8. `props/district-fortress-kit.glb`
9. `companions/guardian-companion.glb`
10. `venues/companion-hub.glb`
11. `venues/static-arena.glb`
12. `sports/basketball-court-kit.glb`
13. `props/sports-fan-crowd-kit.glb`
14. `sports/vip-watch-party-kit.glb`
15. `landmarks/static-city-mountain-sign.glb`
16. `venues/private-static-island-estate.glb`
17. `venues/static-marina.glb`
18. `venues/static-beach.glb`
19. `venues/static-island-resort-quarter.glb`
20. `vehicles/marine-vehicle-kit.glb`
21. `venues/yacht-party.glb`
22. `venues/sky-crown-district.glb`
23. `venues/signal-borough.glb`
24. `venues/tunnel-rise-suburbs.glb`
25. `venues/the-red-light-hidden-walk.glb`

The owner-only city engine will automatically attempt to load those files. If a file is missing or invalid, the procedural fallback stays active.

The hidden walking street has its own prompt at `venues/HIDDEN_WALKING_STREET_PROMPT.md`.

The production asset manifest lives at `ASSET_MANIFEST.md`. Blender intake rules live at `BLENDER_PREP_GUIDE.md`.

## Unreal Engine 5.8 Direction

STATIC City should now treat Unreal Engine 5.8 as the high-fidelity game-client target. The website remains the public/social/account/preview layer. Assets sourced here should therefore support two paths:

- A lightweight GLB preview that can load in the browser owner build.
- A higher-quality source asset that can graduate into Unreal Engine 5.8 or be rebuilt there without losing the same canon.

Do not over-optimize official assets only for this web prototype if it damages the long-term Unreal quality bar. For early tests, web-safe placeholders are fine. For production, prefer source files with clean materials, separated meshes, animation/rig potential, collision planning, and enough fidelity to survive in a UE5.8 vertical slice.

## Recommended Path

### P0: Mr. Stone

Best first route:

- Generate a stylized original humanoid character.
- Export as GLB if available.
- If the generator does not provide a clean rig, use Mixamo/Blender later for animation retargeting.
- Keep the first web GLB under 15 MB.

Prompt:

```text
Create an original premium founder character named Mr. Stone for a futuristic entertainment city called STATIC Network. Full-body adult male, powerful but elegant, cinematic luxury streetwear, black tailored long coat or glossy black jacket, champagne-gold trim, subtle violet neon accents, dark luxury pants, designer-style boots with no real brand logos, jewelry chain, watch, glasses, VIP status pass, confident owner energy, nightclub/casino/tower-owner presence, high-end underground broadcast world, not a superhero, not a celebrity likeness, not GTA, not Marvel, not Fortnite. Neutral A-pose or T-pose, clean topology, rig-ready humanoid, expressive hands, full body visible, game-ready style, black/violet/gold color palette.
```

Negative prompt:

```text
No real brands, no celebrity likeness, no copyrighted logos, no weapons, no armor overload, no extra limbs, no deformed hands, no blurry face, no game rip style, no text baked onto clothing except STATIC-owned symbols if custom supplied later.
```

### P0: Stone SUV

Best first route:

- Source or generate an original black luxury SUV without real logos.
- Export as GLB.
- Keep separate wheels/doors/windows if possible.
- Keep the first web GLB under 12 MB.

Prompt:

```text
Create an original black luxury SUV for a futuristic entertainment city called STATIC Network. Sleek premium SUV, glossy black paint, champagne-gold trim, subtle violet underglow, cinematic valet arrival energy, high-end casino/hotel owner vehicle, no real-world brand logo, no license plate brand, clean game-ready model, separated wheels, visible cabin, dashboard screen, side windows, rear passenger door detail, suitable for web GLB export, elegant and powerful, not militarized, not a copied real car.
```

Negative prompt:

```text
No Bentley logo, no Rolls-Royce logo, no Cadillac logo, no Lamborghini logo, no real brand grille, no police/military styling, no weapon attachments, no damaged vehicle, no text except STATIC-owned marks if custom supplied later.
```

## Placement

After export, place files exactly here:

```text
public/assets/world/city/characters/mr-stone/mr-stone.glb
public/assets/world/city/vehicles/stone-suv.glb
```

Then reload:

```text
http://127.0.0.1:4175/city?owner-preview=1
```

## STATIC VELOCITY Prompts

Vehicle and racing prompts live here:

```text
public/assets/world/city/vehicles/VELOCITY_PROMPTS.md
public/assets/world/city/routes/VELOCITY_PROMPTS.md
```

Faction and territory-mode prompts live here:

```text
public/assets/world/city/venues/DOMINION_PROMPTS.md
public/assets/world/city/props/DOMINION_PROMPTS.md
```

Companion and guardian prompts live here:

```text
public/assets/world/city/companions/COMPANION_PROMPTS.md
```

Sports and arena prompts live here:

```text
public/assets/world/city/sports/SPORTS_PROMPTS.md
```

Full-scale landmark, resort, borough, suburb, and marine prompts live here:

```text
public/assets/world/city/landmarks/FULL_SCALE_LANDMARK_PROMPTS.md
public/assets/world/city/marine/MARINE_DISTRICT_PROMPTS.md
```

## Prototype vs Production Assets

Use free/community assets only for internal testing when the license is clear and compatible with prototype work. For official STATIC production assets, prefer original owner-directed generations or commissioned models so the final city has a unique signature.

Evaluate every 3D provider with the same checklist:

- GLB export quality.
- Rigging and animation readiness.
- Texture fidelity under dark neon lighting.
- File size and mobile performance.
- Commercial/license terms.
- Cost per usable final asset, not cost per attempt.
- How well the tool follows STATIC-specific art direction.

## Acceptance Checklist

- File opens in a GLB viewer.
- File is commercial-safe or clearly licensed for STATIC use.
- File has no third-party marks.
- File size is mobile-web reasonable.
- Mr. Stone is full body, not a bust.
- SUV is not a real branded vehicle copy.
- Materials look good under dark/neon lighting.
- Asset can be replaced later without changing route logic.
