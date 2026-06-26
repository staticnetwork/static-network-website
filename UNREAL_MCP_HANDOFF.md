# STATIC Unreal MCP Handoff

This file is for the future session where Codex/Dex is connected directly to an Unreal Engine 5.8 project through MCP.

## Goal

Create `StaticCity_UE58`: the first real STATIC City engine slice with district blockouts, asset folders, story mission spine, interior tiers, and import targets aligned with the current website/world canon.

## What Must Exist Before MCP Work Starts

- Windows/RTX laptop or cloud workstation.
- Unreal Engine 5.8 or the newest available 5.x build that supports the required plugins.
- Epic Games Launcher signed in.
- Project folder created or ready: `C:\STATIC\StaticCity_UE58`.
- This repo available locally or copied as reference.
- `STATIC_CITY_BIBLE.md`
- `WORLD_ENGINE_READINESS.md`
- `UNREAL_FIRST_CLOUD_SESSION.md`
- `public/assets/world/city/ASSET_MANIFEST.md`
- `public/assets/world/city/BLENDER_PREP_GUIDE.md`
- `public/assets/world/city/data/*.json`
- `supabase/world_engine_story_spine.sql`

## MCP Safety Rules

- Do not publish, package, or upload builds without owner approval.
- Do not buy assets, subscribe, or spend cloud time without explicit approval.
- Do not import ripped game assets, real brand logos, celebrity likenesses, or unclear-license models.
- Do not claim multiplayer, commerce, AI generation, or real NPC intelligence is live until backend systems exist.
- Save often and capture screenshots/video before ending cloud sessions.

## First MCP Tasks

1. Inspect project settings and enabled plugins.
2. Create `/Game/STATIC` folder structure from `UNREAL_FIRST_CLOUD_SESSION.md`.
3. Create persistent map and first-loop blockout map.
4. Create mission folders for origin story spine.
5. Create interior folders for hero, template, lobby/elevator, and event interiors.
6. Create data assets or tables for districts, route nodes, asset manifest, and first mission beats.
7. Add blockout geometry for STATIC Island, Arrival District, Market Walk, Radio Rooftop, Signal Borough, The Red Light, and Hidden Walking Street.
8. Add first route markers: spawn, valet, SUV, Market Walk, Radio, Vibe Mode, return.
9. Import one test GLB only after project structure is stable.
10. Capture a short flythrough proof.

## World-Building Priorities

1. Scale and route geography.
2. Entity/player spawn.
3. Road/walk/elevator/marine transitions.
4. Hero interiors.
5. Interior template system.
6. Mission-state spine.
7. NPC crowd placement.
8. Asset import.
9. Lighting mood.
10. Performance.

## Story Mode Direction

Story mode is a GTA-style cinematic open-world campaign target with better controls, more realistic graphics, and stronger creator/social systems. The first Unreal slice should not attempt the full campaign; it should create the mission architecture and prove the first playable chapters.

Story starts as origin missions:

- Arrival and city orientation.
- Entity creation/claim.
- First fit at Market Walk.
- First ride and Radio.
- First venue.
- First prompt station.
- First property/spawn preview.
- First hidden discovery only after age-gating and moderation exist.

Later chapters should support:

- Mr. Stone founder campaign.
- Rising Entity campaign.
- Crew/faction arcs.
- Racing and takeover arcs.
- Sports/arena arcs.
- Creator/studio arcs.
- Island and yacht arcs.
- Hidden-nightlife arcs.
- City mystery arcs.

Every mission should unlock or stress-test a real system: traversal, vehicle handling, interiors, NPC presence, companions, inventory, Signals, Radio, properties, events, or creator tools.

## Enterable Building Direction

Use tiers:

- Hero interiors: hand-authored.
- Template interiors: modular kits.
- Lobby/elevator interiors: instanced floors.
- Facade-only buildings: skyline and background.
- Event interiors: streamed seasonal spaces.

The goal is to make the city feel enterable without manually furnishing every building.
