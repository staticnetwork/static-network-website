export const staticCityOriginPlan = {
  id: 'static-origin-settlements',
  name: 'STATIC ORIGIN SETTLEMENTS',
  principle: 'Every unusual species, companion, creature, guardian, faction, and asset family should feel like it came from somewhere inside the world.',
  pitch: 'The Fields and hidden city layers can contain origin settlements: autonomous villages, camps, enclaves, temples, labs, burrows, sky docks, island colonies, desert caravans, forest clans, snow citadels, creature nests, and machine yards that introduce new asset families into STATIC.',
  publicPositioning: 'Future lore, faction, companion, and asset-origin system. Do not present real-world ethnic groups, colonial conquest, forced assimilation, coercive reproduction, or dehumanizing race language as gameplay.',
}

export const staticOriginSettlementTypes = [
  {
    id: 'desert-caravan',
    name: 'Desert Caravan Enclave',
    region: 'Desert Fields',
    loop: 'Players discover a moving settlement that sells festival tech, survival builds, mutant vehicles, guardian mounts, and dust-route intel.',
  },
  {
    id: 'forest-clan',
    name: 'Forest Clan Settlement',
    region: 'Forest Fields',
    loop: 'Players meet a hidden community with treehouse builds, stealth paths, creature companions, herbal crafting, scouting contracts, and treaty routes.',
  },
  {
    id: 'snow-citadel',
    name: 'Snow Citadel',
    region: 'Snow Fields',
    loop: 'Players reach a mountain fortress with cold-weather armor, heavy guardians, survival trials, air routes, and high-altitude faction politics.',
  },
  {
    id: 'machine-yard',
    name: 'Machine Yard',
    region: 'Rootside / Industrial Edge',
    loop: 'Players unlock robots, drones, armored service units, repair crews, tunnel tech, and mechanical companions.',
  },
  {
    id: 'mythic-nest',
    name: 'Mythic Nest',
    region: 'Hidden Fields / Island Perimeter',
    loop: 'Players earn access to dragons, golems, oversized guardians, elemental creatures, and rare prestige companion lineages.',
  },
]

export const staticOriginInteractionModes = [
  {
    id: 'diplomacy',
    name: 'Diplomacy',
    rules: [
      'Treaties, gifts, quests, reputation, rescue missions, trade, and protection contracts unlock trust.',
      'Joining a player community must be framed as alliance, migration, hiring, citizenship, or invitation, not forced assimilation.',
    ],
  },
  {
    id: 'trade',
    name: 'Trade',
    rules: [
      'Settlements introduce region-specific assets, blueprints, companions, vehicles, food, decor, materials, and clothing into the wider market.',
      'Rare assets require provenance, moderation, inventory state, and entitlement checks.',
    ],
  },
  {
    id: 'conflict',
    name: 'Opt-In Conflict',
    rules: [
      'Conflict with settlements only happens inside clearly marked fictional game modes, quest instances, or contested windows.',
      'Protected settlements, public social hubs, and story-critical communities cannot be randomly griefed.',
      'No real-world colonial language in public marketing.',
    ],
  },
  {
    id: 'lineage',
    name: 'Lineage / Fusion',
    rules: [
      'Creature, pet, mount, and non-human companion systems can combine traits through breeding-inspired fantasy, fusion, incubation, crafting, or lab creation.',
      'Humanlike Entities use consent-based legacy, ancestry, design inheritance, avatar sculpting, or family-role systems instead of breeding language.',
      'New lineage outputs need moderation, rarity balancing, trait caps, and ownership clarity.',
    ],
  },
]

export const staticRegionClaimPressure = [
  {
    id: 'forest-warrior-guardians',
    name: 'Forest Warrior Guardians',
    region: 'Forest Fields',
    loop: 'Humanoid walking warrior animals, creature clans, and forest guardians protect high-value forest parcels before a player can build a fortress there.',
    claimPaths: [
      'Combat-clear hostile patrols inside opt-in PvE claim events.',
      'Negotiate treaties with guardian clans through reputation and quests.',
      'Accept surrender outcomes where defeated units become allies, guards, settlers, or settlement citizens through consent-based story rules.',
    ],
  },
  {
    id: 'snow-infected-pressure',
    name: 'Snow Infected Pressure',
    region: 'Snow Fields',
    loop: 'Winter mountain parcels can be overrun by zombie/infected hordes, icebound ruins, and survival-wave events. If the player builds before clearing pressure, attacks continue.',
    claimPaths: [
      'Clear waves of fictional undead/infected NPCs in non-gory survival modes.',
      'Secure heat generators, walls, watchtowers, and rescue routes before permanent building is safe.',
      'Turn cleared ruins into snow fortresses, mountain towns, research bases, or faction citadels.',
    ],
  },
  {
    id: 'desert-pressure-tbd',
    name: 'Desert Pressure TBD',
    region: 'Desert Fields',
    loop: 'The desert needs its own land-claim pressure identity. Candidates: dust raiders, machine scavengers, sand megafauna, rogue convoys, mirage cults, or weather-based territory trials.',
    claimPaths: [
      'Keep desert threat design open until the visual asset direction is stronger.',
      'Whatever wins must support racing, convoys, El Mirage festival culture, outlaw builds, and desert fortress ownership.',
    ],
  },
]

export const staticOriginBossSystem = {
  id: 'origin-boss-system',
  name: 'Origin Bosses',
  principle: 'Every major origin civilization, settlement chain, or high-value land zone can have one oversized boss encounter that resolves the claim arc.',
  loop: 'Players push through scouts, soldiers, hazards, and territory pressure. Defeating or resolving the boss encounter triggers surrender, treaty, recruitment, asset unlocks, and a rare boss-companion lineage.',
  rules: [
    'Bosses can be scaled dramatically, such as 180-220% of normal units, so they read instantly as the leader or apex threat.',
    'Boss victories should unlock companion variants, settlement allies, banners, cosmetics, blueprints, and reputation, not unchecked public-space power.',
    'Boss companions need district size limits, cooldowns, performance budgets, and opt-in mode restrictions.',
    'Recruiting a boss should be framed as treaty, respect, oath, contract, redemption, conversion, or captured-then-released story logic, not slavery or farming.',
    'Multiple variations can unlock through region, difficulty, faction, weather, lineage/fusion, cosmetic skin, and companion stance.',
  ],
}

export const staticLivingNpcEcosystemPlan = {
  id: 'living-npc-ecosystems',
  name: 'Living NPC Ecosystem Layer',
  premise: 'NPCs should not exist as frozen props. Character packs should become seeded life systems with needs, alliances, jobs, territories, rituals, conflicts, relationships, memory, and slow evolution.',
  seedRules: [
    'Every imported character pack must be assigned to a home region, district, faction, settlement, island ring, or event ecosystem.',
    'When 10-20 compatible characters exist in one area, the system can propose an autonomous settlement, pact, guild, crew, clan, village, court, gang, lab, cult, order, colony, caravan, or faction.',
    'Settlements should start small: patrol routes, homes, jobs, shared resources, leaders, rivals, routines, and a reason to exist.',
    'NPCs can form pacts, trade routes, romances, rivalries, apprenticeships, wars, festivals, migrations, religious-style belief systems only if fictional/original, and political blocs under moderation rules.',
    'Players discover living systems through observation, Signals, rumors, quests, conflict events, diplomacy, commerce, rescue, hiring, and companion recruitment.',
  ],
  aiDirection: [
    'Long-term NPC AI should combine authored guardrails, simulation state, memory, scheduling, relationship graphs, and optional model-driven dialogue.',
    'NPCs can talk like characters, but important actions must be server-validated state changes, not freeform hallucinated promises.',
    'Civilizations evolve slowly through resources, territory, leadership, player pressure, treaties, war windows, disasters, births/lineage for non-human companion systems, migrations, and events.',
    'AI dialogue should know the NPC role, region, faction, relationship to player, current settlement state, safety limits, and what systems are actually live.',
  ],
  missingSystems: [
    'Region/faction assignment tool for every asset pack.',
    'NPC memory and relationship graph.',
    'Settlement simulation tick: resources, morale, danger, growth, patrols, jobs, and conflicts.',
    'Quest/event generator tied to real state.',
    'Dialogue provider with strict lore, moderation, and cost controls.',
    'Server authority so NPC actions, land claims, recruitment, and conflicts cannot be faked client-side.',
  ],
}

export const staticOriginAssetRules = [
  'Every imported or generated character/species asset should get an origin region, settlement type, rarity class, compatible animation set, scale class, and gameplay lane.',
  'Asset packs should be sorted by source: city NPCs, companions, guardians, settlement citizens, faction units, mounts, creatures, robots, vendors, performers, and event crowds.',
  'Do not use real-world ethnicity, religion, tribe, nationality, or culture as a costume pack. STATIC can be inspired by broad environmental fantasy, but must stay original and respectful.',
  'Origin settlements can expand asset variety without making STATIC feel random: the world explains why dragons, robots, fantasy creatures, bodyguards, street racers, cyberpunks, ranchers, and island performers all belong.',
  'Region claim pressure should make land feel earned: forest parcels may have guardian clans, snow parcels may have infected survival pressure, and desert parcels need their own hazard identity before fortress building opens.',
  'Surrender/recruitment outcomes must be quest/state outcomes, not farming or coercion. Recruited units become allies, guards, citizens, workers, or story followers through clear rules and moderation.',
  'Major origin settlements can have one oversized boss or champion. Defeating or resolving that boss encounter can trigger settlement surrender, treaty, recruitment, and rare boss-companion variants.',
]
