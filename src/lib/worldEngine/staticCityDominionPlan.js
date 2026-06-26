export const staticCityDominionPlan = {
  id: 'static-dominion',
  name: 'STATIC DOMINION',
  principle: 'Faction conflict is an opt-in arcade/sci-fi game layer inside STATIC City, not the default social experience.',
  pitch: 'Crews can form alliances, contest fictional districts, upgrade territory into prestige fortresses, run survival-wave events, and earn non-cash Signal Credit reputation.',
  publicPositioning: 'Future crew/faction gameplay. Do not claim live combat, real territory control, real-value rewards, or multiplayer warfare until the engine, backend, moderation, and legal review exist.',
}

export const staticDominionModes = [
  {
    id: 'crew-formation',
    name: 'Crew Formation',
    status: 'design',
    loop: 'Entities form crews with roles, identity, crew home base, vehicle fleet, style, events, and reputation.',
    rules: [
      'Crew names, symbols, banners, and user uploads require moderation.',
      'No real-world gang branding, hate symbols, extremist marks, or copied IP.',
      'Crew benefits start as cosmetic/status, not monetary value.',
    ],
  },
  {
    id: 'district-control',
    name: 'District Control',
    status: 'design',
    loop: 'Crews opt into timed district-control windows. Victory earns prestige, cosmetics, temporary visual control, and non-cash Signal Credit reputation.',
    rules: [
      'No real-world territory language in public marketing.',
      'Control state is time-limited and resettable.',
      'No pay-to-win upgrades.',
      'Anti-cheat/server validation required before real player-versus-player launch.',
    ],
  },
  {
    id: 'fortress-upgrade',
    name: 'Fortress Upgrade',
    status: 'design',
    loop: 'Crews invest non-cash resources into visual defenses: walls, gates, shields, turrets, watch decks, command rooms, and event stages.',
    rules: [
      'Defense upgrades are fictional and arcade-readable.',
      'Signal Credits remain non-cash and non-transferable until legal review says otherwise.',
      'Fortresses must preserve access rules, moderation, and performance limits.',
    ],
  },
  {
    id: 'treaty-bloc',
    name: 'Treaty Bloc',
    status: 'design',
    loop: 'Five or more allied areas can form a treaty bloc, unlock larger shared walls, shared turrets, shared events, and city-scale visual identity.',
    rules: [
      'Treaties should be reversible and season-based.',
      'Treaty maps must avoid harassment, griefing, and lockout spirals.',
      'Large alliances need balancing so new crews can still play.',
    ],
  },
  {
    id: 'survival-waves',
    name: 'Survival Waves',
    status: 'design',
    loop: 'Crews defend a fictional district against waves of increasingly difficult NPC attackers, with first-person or third-person camera options.',
    rules: [
      'NPC enemies should be fictional/scifi and non-gory.',
      'No real-world tactical instruction.',
      'Rewards are cosmetic/status until economy and legal review are complete.',
    ],
  },
  {
    id: 'arcade-loadouts',
    name: 'Arcade Loadouts',
    status: 'design',
    loop: 'Players equip stylized fictional gear: practical-looking items, sci-fi tools, cartoonish energy weapons, armored cars, fantasy tanks, drones, shields, and area-control devices.',
    rules: [
      'Use fictional weapon design and arcade mechanics.',
      'Avoid real-world weapon assembly, procurement, or tactical guidance.',
      'Balance for fun, spectacle, and creator events, not realism.',
    ],
  },
]

export const staticDominionAssetNeeds = [
  {
    id: 'crew-hq',
    name: 'Crew HQ / Faction Base',
    targetPath: '/assets/world/city/venues/crew-hq.glb',
    replaces: 'No crew base scene yet',
  },
  {
    id: 'district-fortress',
    name: 'District Fortress Kit',
    targetPath: '/assets/world/city/props/district-fortress-kit.glb',
    replaces: 'No walls, gates, shields, turrets, or command-room kit yet',
  },
  {
    id: 'dominion-arena',
    name: 'Dominion Conflict Arena',
    targetPath: '/assets/world/city/venues/dominion-arena.glb',
    replaces: 'No instanced faction conflict arena yet',
  },
  {
    id: 'survival-zone',
    name: 'Survival Wave Zone',
    targetPath: '/assets/world/city/venues/survival-zone.glb',
    replaces: 'No wave-defense event zone yet',
  },
  {
    id: 'arcade-loadout-kit',
    name: 'Arcade Loadout Kit',
    targetPath: '/assets/world/city/props/arcade-loadout-kit.glb',
    replaces: 'No fictional gear/loadout props yet',
  },
]
