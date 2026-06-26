# STATIC Unreal First Cloud Session

Purpose: make the first paid Unreal Engine 5.8 session short, controlled, and useful. Do not rent a cloud workstation until this checklist is ready to execute.

## Budget Rule

- Do not start a paid cloud workstation without a timer.
- Do not leave the machine running while thinking, researching, eating, sleeping, or waiting on downloads.
- First session target: 90 minutes.
- Hard stop target: 2 hours unless the owner explicitly approves more time.
- Goal is a captured proof video and project structure, not a finished game.

## Workstation Target

Minimum acceptable remote machine:

- Windows 11
- NVIDIA RTX GPU
- 32 GB RAM
- 1 TB storage
- fast internet
- persistent disk/storage between sessions

Preferred:

- RTX 4080, RTX 4090, RTX 5080, RTX 5090, RTX A5000, RTX A6000, or RTX 6000 Ada class GPU
- 64 GB RAM
- 2 TB storage

Avoid:

- machines that delete local files after shutdown unless a persistent volume is attached
- hourly machines with no spending cap
- unclear billing
- CPU-only machines
- tiny storage machines

## Before Paying

Have these ready locally:

- Epic Games account login
- Unreal Engine 5.8 install access
- project name: `StaticCity_UE58`
- destination folder: `C:\STATIC\StaticCity_UE58`
- STATIC canon docs copied or accessible
- Mr. Stone GLB test asset, if accepted
- arrival district videos/images
- island, marina, Sky Crown, and STATIC Island Resort Quarter prompts

## First Session Goal

Create the first Unreal project and prove the STATIC world can become a real engine slice.

Do not chase perfection. Build the skeleton:

1. Install/open Epic Games Launcher.
2. Install Unreal Engine 5.8.
3. Create project: `StaticCity_UE58`.
4. Use a Third Person or Open World starter template.
5. Set project location: `C:\STATIC\StaticCity_UE58`.
6. Open the project once and confirm it loads.
7. Enable core plugins.
8. Create the `/Game/STATIC` folder structure.
9. Create the first persistent map.
10. Place blockout zones for the proof loop.
11. Import one test asset if time allows.
12. Capture screenshots/video.
13. Shut down the workstation.

## Required Plugins To Enable

Enable only what is needed for the first slice:

- Enhanced Input
- Control Rig
- Niagara
- Movie Render Queue
- Water
- PCG
- World Partition tools / Open World support
- Mass Entity
- Mass AI
- Mass Crowd, if available
- MetaHuman-related plugins, if available

Do not spend the first session debugging optional experimental plugins unless the project already opens cleanly.

## Folder Structure

Create this inside Unreal Content Browser:

```text
/Game/STATIC
/Game/STATIC/Maps
/Game/STATIC/Characters
/Game/STATIC/Characters/MrStone
/Game/STATIC/Characters/Companions
/Game/STATIC/Vehicles
/Game/STATIC/Vehicles/Land
/Game/STATIC/Vehicles/Marine
/Game/STATIC/Districts
/Game/STATIC/Districts/Arrival
/Game/STATIC/Districts/StaticIslandResort
/Game/STATIC/Districts/Marina
/Game/STATIC/Districts/SkyCrown
/Game/STATIC/Districts/SignalBorough
/Game/STATIC/Districts/SolarCoast
/Game/STATIC/Districts/TunnelRiseSuburbs
/Game/STATIC/Districts/MarketWalk
/Game/STATIC/Districts/RadioRooftop
/Game/STATIC/Districts/StaticIsland
/Game/STATIC/Districts/HiddenWalkingStreet
/Game/STATIC/Landmarks
/Game/STATIC/Landmarks/MountainSign
/Game/STATIC/Interiors
/Game/STATIC/Interiors/Hero
/Game/STATIC/Interiors/Templates
/Game/STATIC/Interiors/Lobbies
/Game/STATIC/Missions
/Game/STATIC/Props
/Game/STATIC/Props/Furniture
/Game/STATIC/Materials
/Game/STATIC/PCG
/Game/STATIC/UI
/Game/STATIC/Audio
/Game/STATIC/Cinematics
```

## First Maps

Create:

```text
/Game/STATIC/Maps/M_STATIC_City_Persistent
/Game/STATIC/Maps/M_STATIC_FirstLoop_Blockout
```

`M_STATIC_City_Persistent` is the future world container.

`M_STATIC_FirstLoop_Blockout` is the practical first route:

1. STATIC Island private estate spawn
2. harbor / helipad / guarded causeway exit
3. water or road approach
4. gold STATIC CITY mountain sign view
5. Arrival District
6. Market Walk
7. STATIC Strip / Arena energy
8. Radio Rooftop
9. Vibe Mode road
10. return route

## First Blockout Objects

Use simple shapes. Name them clearly:

```text
BP_Blockout_PrivateStaticIsland
BP_Blockout_StaticIslandResortQuarter
BP_Blockout_StaticMarina
BP_Blockout_ArrivalDistrict
BP_Blockout_MarketWalk
BP_Blockout_RadioRooftop
BP_Blockout_SkyCrownDistrict
BP_Blockout_SignalBorough
BP_Blockout_SolarCoast
BP_Blockout_TunnelRiseSuburbs
BP_Blockout_StaticCityMountainSign
BP_Blockout_VibeModeRoad
BP_Blockout_ReturnRoute
BP_Blockout_TheRedLight
BP_Blockout_HiddenWalkingStreet
BP_Blockout_TemplateApartment
BP_Blockout_TemplateShop
BP_Blockout_TemplateLobby
```

The point is not beauty yet. The point is scale, route logic, and camera geography.

## Story And Interior Rules For Session One

Do not build a campaign in session one. Create only enough mission structure to support later story mode:

- `Missions/M_STATIC_OriginMission_01_Arrival`
- `Missions/M_STATIC_OriginMission_02_FirstRide`
- `Missions/M_STATIC_OriginMission_03_FirstVenue`

Do not attempt full enterable city coverage in session one. Create interior proof categories:

- one hero interior blockout
- one lobby/elevator blockout
- one modular apartment/shop template
- one hidden entrance/back-door transition blockout

If these work, the city can scale without hand-placing furniture in every building.

## First Camera Shots

Capture these before ending the session:

1. Wide shot from STATIC Island toward the city.
2. Marina/water route shot.
3. Gold STATIC CITY mountain sign shot.
4. Arrival District approach shot.
5. Market Walk stop shot.
6. Radio Rooftop destination shot.
7. Vibe Mode road shot.

If there is time, record a 30-60 second editor flythrough.

## First Asset Imports

Only import assets if the project and folders are already stable.

Priority:

1. Mr. Stone test GLB
2. Stone SUV test GLB
3. Arrival District reference image/video
4. STATIC Island reference image
5. STATIC Island Resort Quarter reference image

Do not waste first-session time trying to fix a bad asset. If import fails, log it and move on.

## Do Not Do In Session One

- no multiplayer
- no payments
- no marketplace
- no full MetaHuman conversion rabbit hole
- no final lighting pass
- no advanced vehicle physics
- no ocean simulation perfection
- no massive asset downloads without approval
- no long shader-compilation waiting while the cloud meter runs unattended

## Shutdown Checklist

Before shutting down:

- save all maps
- save all assets
- take screenshots of folder structure
- take screenshots of project settings/plugin list
- export or upload the proof video/screenshots
- confirm persistent storage is enabled
- stop or shut down the cloud workstation
- record actual time used and estimated cost

## Success Criteria

The first cloud session succeeds if it produces:

- a UE5.8 project named `StaticCity_UE58`
- STATIC folder structure
- at least one saved map
- blockout route for the first loop
- proof screenshots or a short editor flythrough
- no runaway billing

Anything beyond that is a bonus.
