export const staticCityScalePlan = {
  name: 'STATIC City Full-Scale World',
  engineTarget: 'Unreal Engine 5.8',
  scaleIntent: 'GTA-scale entertainment city plus STATIC Island, resort coast, tunnel-rise suburbs, beach/marina districts, mountain districts, and playable venue districts.',
  coreCorrection: 'The browser owner map is a control-room prototype. The Unreal build should become the real world.',
  cityBlend: 'Hillside scale, supertall skyline ambition, Riviera-level luxury, strip spectacle, high-density borough energy, beach/marina glamour, island vacation culture, and original STATIC broadcast mythology.',
}

export const staticCityMacroDistricts = [
  {
    id: 'arrival-district',
    name: 'Arrival District',
    biome: 'city-core',
    role: 'Public-facing first impression, central plaza, billboards, creator traffic, tour start, and request-access gravity.',
    references: ['Times Square density', 'Vegas spectacle', 'STATIC hero image canon'],
  },
  {
    id: 'static-strip',
    name: 'STATIC Strip',
    biome: 'nightlife',
    role: 'Club STATIC, VIP tables, hotels, casinos, restaurants, creator appearances, sports watch parties, and luxury cruising.',
    references: ['Vegas Strip', 'Miami nightlife', 'premium black-glass STATIC architecture'],
  },
  {
    id: 'signal-borough',
    name: 'Signal Borough',
    biome: 'dense-urban',
    role: 'High-density towers, alleyways, billboards, creator chaos, NPC risk pockets, nightlife spillover, street vendors, and high-alert city simulation.',
    references: ['dense borough energy', 'Times Square velocity', 'urban alley risk loops'],
  },
  {
    id: 'arena-district',
    name: 'Arena District',
    biome: 'sports',
    role: 'STATIC Arena, basketball-first gameplay, fan plaza, creator leagues, merch drops, pregame/postgame Signals, and crowd heat.',
    references: ['arena plaza', 'sports city blocks', 'red-carpet event routing'],
  },
  {
    id: 'radio-rooftop-district',
    name: 'Radio Rooftop District',
    biome: 'music',
    role: 'STATIC Radio building, rooftop lounges, DJ floors, live sessions, artist drops, and Vibe Mode route starts.',
    references: ['rooftop radio', 'Miami terrace', 'broadcast tower'],
  },
  {
    id: 'market-walk-district',
    name: 'Market Walk District',
    biome: 'retail',
    role: 'Luxury mall, fashion houses, jewelry stores, vehicle accessories, avatar wardrobe, creator drops, and status upgrades.',
    references: ['luxury retail', 'Riviera-level boutiques', 'futuristic mall concourse'],
  },
  {
    id: 'play-district',
    name: 'PLAY District',
    biome: 'game-portals',
    role: 'Playable world gates, esports lounges, arcade arenas, VR zones, generated worlds, and creator game portals.',
    references: ['theme park portals', 'arcade city', 'future sports/gaming campus'],
  },
  {
    id: 'studio-district',
    name: 'Studio District',
    biome: 'creator-production',
    role: 'Studios, soundstages, creator offices, editing floors, animation capture rooms, and live production hubs.',
    references: ['Hollywood studio lots', 'AI production campus', 'creator towers'],
  },
  {
    id: 'beach-district',
    name: 'Solar Coast',
    biome: 'coast',
    role: 'Beach clubs, car shows, mansions, high-rises, boardwalks, waterfront clubs, jet ski races, beach parties, marina routes, and sports/music crossover events.',
    references: ['Miami Beach', 'Santa Monica energy', 'luxury neon coastline'],
  },
  {
    id: 'marina-district',
    name: 'STATIC Marina',
    biome: 'marine',
    role: 'Yachts, speedboats, boat races, yacht parties, water taxis, island approach, and high-status docks.',
    references: ['Monaco harbor', 'Miami marina', 'private island ferry lanes'],
  },
  {
    id: 'tunnel-rise-suburbs',
    name: 'Tunnel Rise Suburbs',
    biome: 'residential',
    role: 'A long dark freeway tunnel opens into euphoric mountain suburbia: perfect neighborhoods climbing both sides of the freeway, parks, gyms, schools, starter homes, family/friend plazas, and modern Sims-style everyday life.',
    references: ['mountain suburbia', 'perfect neighborhood fantasy', 'freeway-tunnel reveal'],
  },
  {
    id: 'sky-crown-district',
    name: 'Sky Crown District',
    biome: 'supertall-luxury',
    role: 'Ultra-tall towers, sky bridges, rooftop pools, luxury hotels, creator headquarters, finance/status towers, observation decks, and future-facing skyline spectacle.',
    references: ['supertall skyline ambition', 'futuristic towers', 'luxury sky architecture'],
  },
  {
    id: 'crown-ridge',
    name: 'Crown Ridge',
    biome: 'luxury-hillside',
    role: 'Mansions, casinos, castles, galleries, hill roads, premium restaurants, and elite property progression.',
    references: ['Riviera-level luxury', 'hillside estates', 'private clubs'],
  },
  {
    id: 'static-tower-summit',
    name: 'STATIC Tower Summit',
    biome: 'landmark',
    role: 'City command landmark, theme park crown, largest concert venue, red carpet, observation deck, and public symbol of power.',
    references: ['mountain summit', 'future tower', 'celebrity event crown'],
  },
  {
    id: 'static-island',
    name: 'STATIC Island District',
    biome: 'owner-estate',
    role: 'Mr. Stone private estate plus resort/vacation side and rare-character ecosystem: yacht arrivals, STATIC luau events, electric flower accessories, light-reactive dancewear, beach markets, firelight stages, ocean sports, private harbor, helipad, yacht dock, guardian perimeter, island spawn, rare character hunts, and legendary inner-compound threats.',
    references: ['private island estate', 'superyacht harbor', 'island resort culture', 'fortified luxury fantasy', 'character rarity gradient'],
  },
]

export const staticCitySignatureLandmarks = [
  ['STATIC CITY sign', 'A massive gold mountain sign held by two 100-foot winged guardian statues, visible from the strip, marina, beaches, and island approach.'],
  ['Mr. Stone Private Island', 'The true owner residence: peak compound, estate, harbor, helipad, yacht dock, underground garage, command rooms, moat, fortress wall, gun towers, patrol ecosystem, and mythic perimeter guardians.'],
  ['STATIC Tower', 'No longer the main home; it becomes the public power symbol, event crown, city command suite, concert venue, and theme-park summit.'],
  ['STATIC Arena', 'Basketball-first arena district with fan plaza, watch parties, creator teams, and future playable sports.'],
  ['Club STATIC', 'Nightlife destination on the strip with VIP tables, performances, afterparties, and social status routing.'],
  ['STATIC Marina', 'Yachts, speedboats, jet skis, water taxis, island access, and marine racing routes.'],
  ['Solar Coast', 'Beach clubs, car shows, mansions, high-rises, boardwalk social loops, jet ski starts, parties, creator shoots, and sports/music crossover events.'],
  ['STATIC Island Resort Quarter', 'The island vacation side: yacht parties, STATIC luaus, electric flowers, firelight stages, ocean sports, creator shops, and warm resort energy.'],
  ['Sky Crown District', 'Supertall original towers, sky bridges, rooftop pools, observation decks, and future-facing city prestige.'],
  ['Tunnel Rise Suburbs', 'A dark tunnel reveal into perfect mountain suburbia, with homes climbing both sides of the freeway and a safer everyday-life loop.'],
]

export const staticIslandTopology = {
  id: 'static-island-topology',
  name: 'STATIC Island Protected Rarity Gradient',
  premise: 'STATIC Island looks welcoming at the beach and resort edge, but grows more rare, dangerous, and mythic as players move inward toward Mr. Stone’s peak compound.',
  rings: [
    ['Resort Shore', 'Normal island life: yacht arrivals, parties, beach markets, performances, ocean sports, tourists, creators, and low-risk social encounters.'],
    ['Character Wild Belt', 'The largest variety of recruitable characters and companion candidates on the map. Common and uncommon characters roam here with social, quest, or light challenge loops.'],
    ['Frontline Perimeter', 'Battle-ready patrol routes, elite guards, rare character encounters, spotlight towers, scanning gates, and harder approach paths.'],
    ['Fortress Wall', 'Alcatraz-level wall language with searchlights, towers, cinematic defense systems, and strict access rules. This is spectacle and opt-in gameplay, not a grief zone.'],
    ['Moat And Inner Grounds', 'A dramatic moat with sea-monster lore and high-rarity guardian encounters. Unauthorized access becomes a hard-mode story or event instance.'],
    ['Peak Compound', 'Mr. Stone’s massive castle/compound at the highest point. The legendary golden dragon sleeps here and represents one of the highest-status companion myths in STATIC.'],
  ],
  rules: [
    'Rarity increases from resort edge to inner compound.',
    'Recruitment comes from quests, challenge completion, surrender, treaty, respect, or story conversion, not random exploitation.',
    'The founder residence stays protected. Players may attempt high-risk character hunts through designed modes, but cannot grief or seize Mr. Stone’s core estate.',
    'Beach/resort users should still feel safe unless they opt into deeper island encounters.',
  ],
}

export const staticCharacterAssetRoutingPlan = {
  id: 'character-asset-routing',
  name: 'Character Pack Placement Rules',
  premise: 'Every new character or creature asset pack should be assigned to a region, district, faction, settlement, or island ring before it enters the world.',
  examples: [
    ['Knights, citadel guards, frost warriors', 'Snow Fields, mountain citadels, Crown Ridge castles, or winter boss arcs.'],
    ['Beach performers, island guardians, ocean creatures', 'STATIC Island Resort Shore, marina routes, ocean events, or moat guardian lore.'],
    ['Street racers, mechanics, takeover crews', 'Velocity District, Rootsides, Signal Borough, or desert convoy routes.'],
    ['Cyberpunk couriers, scavengers, tunnel dwellers', 'Rootside, underground tunnel networks, Gophur routes, machine yards.'],
    ['Fantasy creatures, walking warrior animals, forest clans', 'Forest Fields, creature sanctuaries, hidden settlements, land-claim pressure zones.'],
  ],
  rules: [
    'Ask the owner where a new asset pack belongs before canonizing it.',
    'If no answer is available, place assets in quarantine/catalog status until a region, faction, or settlement role is chosen.',
    'When a region reaches roughly 10-20 compatible characters, it can begin forming an autonomous NPC settlement or civilization candidate.',
  ],
}

export const staticCityMarinePlan = [
  ['Speedboat races', 'Instanced marine racing routes with wakes, checkpoints, non-cash reputation, replay clips, and safety boundaries.'],
  ['Jet ski races', 'Shorter beach/marina routes that give players quick action without leaving the social city loop.'],
  ['Yacht parties', 'Floating venues for creators, Radio events, celebrity Entity appearances, private drops, and high-status memberships.'],
  ['Water taxis', 'Fast travel that still feels like world traversal: marina, beach, island estate, strip docks, and event piers.'],
  ['Island perimeter', 'Visual guardian system around Mr. Stone estate; spectacle first, gameplay only after validated safety/mode rules.'],
]

export const staticCityScaleRules = [
  'Do not build one endless empty map. Build dense districts connected by authored roads, rail, water, air, and cinematic travel.',
  'Use PCG for bulk city structure, suburbs, roads, signage, foliage, props, and crowd placement; hand-author hero venues and signature routes.',
  'Use World Partition/streaming logic so huge scale does not become a performance disaster.',
  'Every district needs a purpose: social, sports, music, shopping, property, racing, marine, creator production, live events, or gameplay portals.',
  'The website can preview the map and sell the dream. UE5.8 must carry traversal, crowds, vehicles, water, MetaHumans, and playable scale.',
]
