export const staticCityVelocityPlan = {
  id: 'static-velocity',
  name: 'STATIC VELOCITY',
  principle: 'Vehicle culture is part of city life, not a separate racing menu.',
  pitch: 'Need for Speed-level visual street energy, Midnight Club-level customization ambition, GTA-style get-in/get-out freedom, and STATIC social/event gravity.',
  publicPositioning: 'Coming vehicle culture, garage identity, night runs, car shows, and venue-linked racing. Do not claim real racing, wagering, or multiplayer until those systems exist.',
}

export const staticVelocityModes = [
  {
    id: 'red-light-challenge',
    name: 'Red-Light Challenge',
    status: 'design',
    loop: 'While cruising the city, a real player or NPC pulls up at a light. The player can initiate a challenge, accept terms, then launch into an instanced race route before returning to the city.',
    rules: [
      'First version uses NPC challengers only.',
      'Real player challenges require auth, presence, safety, matchmaking, and abuse controls.',
      'Signal Credits must be non-cash, non-transferable, cosmetic/reputation points until legal review clears anything with value.',
    ],
  },
  {
    id: 'king-run-hazard-race',
    name: 'King Run Hazard Race',
    status: 'design',
    loop: 'A cinematic high-risk route inspired by giant obstacle spectacle: collapsing signage, huge moving route hazards, crowd roar, and impossible city set pieces.',
    rules: [
      'Use original STATIC hazards, not copied film/game IP.',
      'Route hazards are authored and instanced first.',
      'Leaderboard and rewards come only after anti-cheat and backend validation exist.',
    ],
  },
  {
    id: 'car-show-feed-event',
    name: 'Car Show Feed Event',
    status: 'design',
    loop: 'Players host a car show, promote it on Signals, and Entities drive over to a lot/plaza with stage performance, judging, social clips, and drops.',
    rules: [
      'First version is owner-authored event shell.',
      'Creator-hosted events require moderation, capacity limits, scheduling, and report tooling.',
      'Vehicles include exotics, lifted trucks, slabs, lowriders, bikes, motorcycles, and original STATIC customs.',
    ],
  },
  {
    id: 'takeover-zone',
    name: 'Takeover Zone',
    status: 'design',
    loop: 'Limited-time underground zone opens in a controlled district. Drivers perform donuts, camera-passenger shots, burnout choreography, and crowd-reactive clips.',
    rules: [
      'This is a fictional closed in-world event, not encouragement of real illegal street takeovers.',
      'No real-world instructions for dangerous driving.',
      'Needs content moderation, replay capture rules, and safety framing before public release.',
    ],
  },
  {
    id: 'garage-customization',
    name: 'Garage Customization',
    status: 'design',
    loop: 'Players customize vehicles with paint, candy finish, wraps, rims, tint, underglow, interior, audio, suspension, body kits, plates, and status accessories.',
    rules: [
      'No real-world brand marks unless licensed.',
      'All custom parts need entitlement, inventory, and moderation checks.',
      'Physics-affecting upgrades require balance and server validation later.',
    ],
  },
]

export const staticVelocityAssetNeeds = [
  {
    id: 'velocity-garage',
    name: 'STATIC Velocity Garage',
    targetPath: '/assets/world/city/venues/static-velocity-garage.glb',
    replaces: 'No garage scene yet',
  },
  {
    id: 'night-run-route',
    name: 'Night Run Route Chunk',
    targetPath: '/assets/world/city/routes/night-run.glb',
    replaces: 'No red-light challenge route yet',
  },
  {
    id: 'car-show-plaza',
    name: 'Car Show Plaza',
    targetPath: '/assets/world/city/venues/car-show-plaza.glb',
    replaces: 'No car show/social event venue yet',
  },
  {
    id: 'takeover-zone',
    name: 'Takeover Zone Lot',
    targetPath: '/assets/world/city/venues/takeover-zone.glb',
    replaces: 'No takeover performance lot yet',
  },
  {
    id: 'starter-race-car',
    name: 'Original STATIC Race Car',
    targetPath: '/assets/world/city/vehicles/static-race-car.glb',
    replaces: 'No challenge opponent car yet',
  },
]
