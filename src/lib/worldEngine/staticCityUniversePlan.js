export const staticUniversePlan = {
  id: 'static-universe',
  name: 'STATIC UNIVERSE',
  principle: 'Space is the late-game ceiling breaker, not the first product. STATIC City must be strong before the universe opens.',
  pitch: 'Players who complete the final Earth-side mission can reach the orbital layer, board a ship, visit the STATIC space station, meet off-world origin settlements, and eventually unlock planet-scale creation.',
  publicPositioning: 'Future prestige expansion. Do not claim space travel, planet ownership, solar-system conquest, alien NPCs, or generated planets are live until the engine, backend, moderation, and economy are ready.',
}

export const staticUniverseProgression = [
  {
    id: 'city-mastery',
    name: 'City Mastery',
    loop: 'The player proves they understand STATIC City: Entity, property, vehicle, Radio, Market Walk, PLAY, creator systems, social presence, and at least one major faction or business path.',
  },
  {
    id: 'spaceport-access',
    name: 'STATIC Astral Port',
    loop: 'A late-game spaceport unlocks after major missions, reputation, or founder-event access. The player can board cinematic shuttles, rockets, orbital elevators, or luxury starships.',
  },
  {
    id: 'orbital-station',
    name: 'STATIC Orbital Station',
    loop: 'The station becomes the final Earth-side mission hub: astronaut training, zero-gravity lounge, off-world marketplace, ship hangars, alien diplomacy, orbital concerts, and universe unlock ceremony.',
  },
  {
    id: 'alien-origin-settlement',
    name: 'Off-World Origin Settlements',
    loop: 'Fictional extraterrestrial species, machine civilizations, crystal ecologies, orbital clans, and guardian lineages introduce alien companions, structures, ship parts, materials, and story paths.',
  },
  {
    id: 'planet-generator',
    name: 'Planet Genesis Console',
    loop: 'The prompt station asks: "Design your planet." Land-scale creation expands into planet-scale biomes, cities, oceans, defenses, settlements, resources, and creator-built civilizations.',
  },
  {
    id: 'solar-dominion',
    name: 'Solar Dominion',
    loop: 'Players protect their planet, form alliances, trade resources, host visitors, launch missions, and opt into planet-vs-planet conflict windows for prestige and non-cash Signal Credit reputation.',
  },
]

export const staticUniverseRules = [
  'Do not use NASA logos, patches, uniforms, mission names, spacecraft, or government marks unless properly licensed. Space assets must be commercial-safe, generic, original, or rebranded as STATIC Astral Command.',
  'Alien species and off-world settlements must be fictional, respectful, and not coded as real-world ethnic, religious, tribal, or national groups.',
  'Planet ownership must be server-authoritative, instanced, streamed, and moderated. It should not imply real-world land, legal ownership, or cash-value property.',
  'Planet conflict must be opt-in, time-windowed, rule-bound, and protected from harassment, griefing, and pay-to-win loops.',
  'The first implementation should be cinematic travel and station UI. Real spaceship flight, generated planets, orbital multiplayer, and solar conquest come much later.',
]

export const staticUniverseAssetNeeds = [
  {
    id: 'static-astral-port',
    name: 'STATIC Astral Port / Spaceport',
    targetPath: '/assets/world/universe/venues/static-astral-port.glb',
    replaces: 'No spaceport scene yet',
  },
  {
    id: 'orbital-station',
    name: 'STATIC Orbital Station',
    targetPath: '/assets/world/universe/venues/static-orbital-station.glb',
    replaces: 'No orbital station scene yet',
  },
  {
    id: 'starship-hangar',
    name: 'Starship Hangar And Launch Bay',
    targetPath: '/assets/world/universe/venues/starship-hangar.glb',
    replaces: 'No ship hangar or launch bay yet',
  },
  {
    id: 'astral-suit-pack',
    name: 'STATIC Astral Suit Pack',
    targetPath: '/assets/world/universe/wardrobe/static-astral-suits.glb',
    replaces: 'No original astronaut/explorer suit set yet',
  },
  {
    id: 'alien-settlement-kit',
    name: 'Off-World Settlement Kit',
    targetPath: '/assets/world/universe/settlements/off-world-settlement-kit.glb',
    replaces: 'No alien origin settlement kit yet',
  },
  {
    id: 'planet-genesis-console',
    name: 'Planet Genesis Console',
    targetPath: '/assets/world/universe/props/planet-genesis-console.glb',
    replaces: 'No planet prompt station yet',
  },
]
