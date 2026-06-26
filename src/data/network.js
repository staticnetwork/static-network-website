export const platforms = [
  {
    slug: 'signals',
    number: '01',
    name: 'STATIC Signals',
    shortName: 'Signals',
    label: 'Discovery Boulevard',
    headline: 'Catch the signal before it hits the street.',
    description:
      'A living boulevard for music, films, games, characters, broadcasts, creator drops, sports nights, and world events moving through STATIC City.',
    status: 'BOULEVARD LIVE',
    tone: 'cyan',
  },
  {
    slug: 'channels',
    number: '02',
    name: 'STATIC Channels',
    shortName: 'Channels',
    label: 'Creator Venues',
    headline: 'Every creator gets a venue, not just a profile.',
    description:
      'Persistent creator-owned destinations where audiences can watch, listen, play, collect, and follow an evolving world.',
    status: 'VENUES ONLINE',
    tone: 'silver',
  },
  {
    slug: 'radio',
    number: '03',
    name: 'STATIC Radio',
    shortName: 'Radio',
    label: 'Rooftop Frequency',
    headline: 'The city never goes silent.',
    description:
      'Always-on stations for new music, moods, scenes, creator takeovers, after-hours sound, and digital culture.',
    status: 'ON AIR',
    tone: 'blue',
  },
  {
    slug: 'play',
    number: '04',
    name: 'STATIC PLAY',
    shortName: 'Play',
    label: 'Arcade Worlds',
    headline: 'What would you like to play today?',
    description:
      'Describe a game or interactive world, remix a template, shape the rules, and light up a playable idea.',
    status: 'ENGINE STANDBY',
    tone: 'violet',
  },
  {
    slug: 'live',
    number: '05',
    name: 'STATIC LIVE',
    shortName: 'Live',
    label: 'Broadcast Arena',
    headline: 'Go live from inside the venue.',
    description:
      'Creator broadcasts, premieres, watch parties, virtual events, live performances, and audience-controlled moments.',
    status: 'ARENA LIVE',
    tone: 'cyan',
  },
  {
    slug: 'originals',
    number: '06',
    name: 'STATIC Originals',
    shortName: 'Originals',
    label: 'Premiere House',
    headline: 'Stories that refuse to stay in one format.',
    description:
      'AI-native shows, animation, documentaries, characters, music films, and franchises built to expand across the network.',
    status: 'PREMIERES QUEUED',
    tone: 'silver',
  },
  {
    slug: 'marketplace',
    number: '07',
    name: 'STATIC Marketplace',
    shortName: 'Marketplace',
    label: 'Asset Boulevard',
    headline: 'Take a piece of the world with you.',
    description:
      'A city marketplace for assets, skins, music packs, templates, memberships, drops, vehicles, outfits, and creator-powered experiences.',
    status: 'MARKET PREVIEW',
    tone: 'blue',
  },
  {
    slug: 'labs',
    number: '08',
    name: 'STATIC LABS',
    shortName: 'Labs',
    label: 'Future Works',
    headline: 'Future systems beneath the city.',
    description:
      'Experimental tools, workflows, adapters, and future systems for building AI-native entertainment.',
    status: 'RESEARCH ACTIVE',
    tone: 'violet',
  },
]

export const routeMeta = {
  '/': {
    title: 'STATIC Network | Official Home',
    description:
      'The official home for everything STATIC: STATIC Social, the coming creation engines, and the future STATIC City game client.',
  },
  '/home': {
    title: 'STATIC Network | Public Network Preview',
    description:
      'Explore the STATIC Network public site, creator systems, preview interfaces, and path from Arrival District into STATIC City.',
  },
  '/signals': {
    title: 'STATIC Signals | Discovery Boulevard',
    description: 'The living discovery boulevard for the next wave of AI-native entertainment.',
  },
  '/my-signal': {
    title: 'My Signal | STATIC Network',
    description: 'Your followed STATIC creators, Channels, AI posts, and future city updates in one personal pulse.',
  },
  '/feed': {
    title: 'STATIC Social | STATIC Network',
    description: 'Enter STATIC Social, the live AI-native social layer for AI-made and AI-assisted posts, media, channels, and Signal.',
  },
  '/profile': {
    title: 'Profile | STATIC Network',
    description: 'Build and polish your STATIC profile, Signal score, creator identity, posts, and public presence.',
  },
  '/search': {
    title: 'Search | STATIC Network',
    description: 'Search STATIC posts, creators, channels, media, assets, and AI-assisted work.',
  },
  '/friends': {
    title: 'Following | STATIC Network',
    description: 'Follow STATIC creators, Channels, posts, music, assets, drops, and AI-assisted work.',
  },
  '/messages': {
    title: 'Messages | STATIC Network',
    description: 'Private STATIC messages and creator conversations. Full messaging backend coming soon.',
  },
  '/notifications': {
    title: 'Notifications | STATIC Network',
    description: 'Track follows, likes, comments, shares, mentions, drops, and Signal updates on STATIC.',
  },
  '/channels': {
    title: 'STATIC Channels | Creator Venues',
    description: 'Explore creator-owned entertainment venues across the STATIC network and future city layer.',
  },
  '/radio': {
    title: 'STATIC Radio | Rooftop Frequency',
    description: 'Tune into 24/7 city stations for new music, moods, scenes, and digital culture.',
  },
  '/play': {
    title: 'STATIC PLAY | Playable Imagination',
    description: 'Describe, remix, share, and play AI-generated games and interactive worlds.',
  },
  '/live': {
    title: 'STATIC LIVE | Broadcast Arena',
    description: 'Enter live premieres, creator broadcasts, events, performances, and watch parties across the network.',
  },
  '/originals': {
    title: 'STATIC Originals | Stories Without Limits',
    description: 'Discover shows, films, animation, documentaries, and expanding digital franchises.',
  },
  '/marketplace': {
    title: 'STATIC Marketplace | Asset Boulevard',
    description: 'Explore creator drops, assets, templates, skins, memberships, and digital experiences.',
  },
  '/labs': {
    title: 'STATIC LABS | Build What Comes Next',
    description: 'Explore experimental tools and future systems for AI-native entertainment.',
  },
  '/creators': {
    title: 'Creators | STATIC Network',
    description: 'Discover the artists, builders, storytellers, and world-makers transmitting on STATIC.',
  },
  '/studios': {
    title: 'Studios | STATIC Network',
    description: 'Explore independent studios building the next generation of entertainment worlds.',
  },
  '/entities': {
    title: 'Entities | Create The Public Identity',
    description: 'Create digital performers, hosts, artists, gamers, founders, influencers, and characters that live across STATIC.',
  },
  '/entities/create': {
    title: 'Create An Entity | STATIC Network',
    description: 'Build a public-facing digital Entity and automatically launch its STATIC Channel.',
  },
  '/entities/generate': {
    title: 'Entity Generator | STATIC Network',
    description: 'Create consistent Entity visuals from structured identity DNA and approved AI image providers.',
  },
  '/sage': {
    title: 'S.A.G.E. | STATIC Network',
    description: 'Meet the provider-aware concierge and operating layer inside STATIC Network.',
  },
  '/sage-identity': {
    title: 'S.A.G.E. Identity | STATIC Network',
    description: 'Owner workspace for generating and approving official S.A.G.E. visual assets.',
  },
  '/sage-lab': {
    title: 'S.A.G.E. Lab | STATIC Network',
    description: 'Owner lab for real ElevenLabs voice and synchronized talking-avatar tests.',
  },
  '/city': {
    title: 'STATIC City Owner Build | STATIC Network',
    description: 'Owner-only STATIC City vertical slice for the future game-world layer.',
  },
  '/provider-status': {
    title: 'Provider Status | STATIC Network',
    description: 'Review secure server-side provider configuration without exposing credentials.',
  },
  '/entities/profile': {
    title: 'Your Entity | STATIC Network',
    description: 'View and operate your STATIC Entity profile, Signals, Worlds, Drops, and Channel.',
  },
  '/entities/avatar': {
    title: 'Visual Entity Creator | STATIC Network',
    description: 'Design a reusable STATIC Entity avatar for profiles, Signals, Channels, and live broadcasts.',
  },
  '/channel/customize': {
    title: 'Customize Channel | STATIC Network',
    description: 'Control the banner, identity, theme, layout, and public story of a STATIC Channel.',
  },
  '/login': {
    title: 'Login | STATIC Network',
    description: 'Sign in to the STATIC Network and keep your profile, Signal, saved work, and future game identity connected.',
  },
  '/signup': {
    title: 'Create Account | STATIC Network',
    description: 'Create a STATIC account for AI work, Channels, media, Signal, and future game portability.',
  },
  '/account': {
    title: 'Account | STATIC Network',
    description: 'Manage your STATIC account, profile, access settings, Signal, and future identity path.',
  },
  '/channel': {
    title: 'Entity Channel | STATIC Network',
    description: 'Enter the entertainment world behind a STATIC Entity.',
  },
  '/studio': {
    title: 'STATIC Studio | Create Across Every Format',
    description: 'Preview the coming STATIC creation suite for images, music, videos, music videos, small games, assets, blueprints, and worlds.',
  },
  '/static-plus': {
    title: 'STATIC+ | Go Deeper Into The Network',
    description: 'Request enhanced fan access, exclusives, drops, and network-wide benefits.',
  },
  '/creator-pro': {
    title: 'Creator Pro | Build The World',
    description: 'Request advanced tools and publishing access for serious STATIC creators.',
  },
  '/discover': {
    title: 'Discover | STATIC Arrival District',
    description: 'Explore trending signals, live broadcasts, venues, games, music, and originals.',
  },
  '/waitlist': {
    title: 'Request City Access | STATIC Network',
    description: 'Request early access to STATIC Network and the controlled STATIC City rollout for creators, fans, studios, and partners.',
  },
  '/contact': {
    title: 'Contact | STATIC Network',
    description: 'Contact the STATIC Network team for creators, studios, press, partnerships, and access.',
  },
  '/terms': {
    title: 'Terms | STATIC Network',
    description: 'Review the preliminary public website terms for STATIC Network.',
  },
  '/privacy': {
    title: 'Privacy | STATIC Network',
    description: 'Review the preliminary public website privacy notice for STATIC Network.',
  },
}

export const signals = [
  { type: 'MUSIC FILM', title: 'Neon After Midnight', creator: 'VANTA', metric: '42.8K', code: 'SIG-8841', className: 'visual--portal' },
  { type: 'PLAYABLE WORLD', title: 'Chrome District', creator: 'KIRA//OS', metric: '19.2K', code: 'SIG-2280', className: 'visual--grid' },
  { type: 'ORIGINAL SERIES', title: 'Memory Palace', creator: 'Northstar Studio', metric: '71.4K', code: 'SIG-1029', className: 'visual--face' },
  { type: 'LIVE NOW', title: 'Frequency Zero', creator: 'STATIC Radio', metric: '8.6K', code: 'LIVE-009', className: 'visual--wave' },
  { type: 'ENTITY DROP', title: 'Meet I/O', creator: 'Parallel Dept.', metric: '31.7K', code: 'ENT-4100', className: 'visual--orb' },
  { type: 'GAME PROTOTYPE', title: 'Run The Redline', creator: 'Apex Ghost', metric: '12.1K', code: 'PLY-6120', className: 'visual--speed' },
]

export const directoryData = {
  creators: [
    { name: 'KIRA//OS', role: 'WORLD BUILDER', stat: '148K SIGNALS', specialty: 'Games + synthetic cinema', className: 'avatar--kira' },
    { name: 'VANTA', role: 'DIGITAL ARTIST', stat: '92K SIGNALS', specialty: 'Music films + live performance', className: 'avatar--vanta' },
    { name: 'APEX GHOST', role: 'GAME DESIGNER', stat: '68K SIGNALS', specialty: 'Arcade worlds + speed culture', className: 'avatar--apex' },
    { name: 'MARA XI', role: 'STORY ARCHITECT', stat: '53K SIGNALS', specialty: 'Characters + serialized fiction', className: 'avatar--mara' },
    { name: 'NO SIGNAL', role: 'PRODUCER', stat: '41K SIGNALS', specialty: 'Experimental audio + radio', className: 'avatar--signal' },
    { name: 'JUNO VALE', role: 'VIRTUAL DIRECTOR', stat: '37K SIGNALS', specialty: 'Animation + documentary', className: 'avatar--juno' },
  ],
  studios: [
    { name: 'NORTHSTAR', role: 'STORY STUDIO', stat: '12 WORLDS', specialty: 'Original series + interactive fiction', className: 'avatar--north' },
    { name: 'PARALLEL DEPT.', role: 'ENTITY LAB', stat: '31 ENTITIES', specialty: 'Characters + virtual performers', className: 'avatar--parallel' },
    { name: 'NIGHT SHIFT', role: 'MUSIC STUDIO', stat: '84 RELEASES', specialty: 'Albums + visual worlds', className: 'avatar--night' },
    { name: 'REDLINE UNIT', role: 'GAME STUDIO', stat: '8 PLAYABLES', specialty: 'Racing + combat systems', className: 'avatar--redline' },
    { name: 'FRAME//ZERO', role: 'FILM COLLECTIVE', stat: '19 ORIGINALS', specialty: 'Short films + animation', className: 'avatar--frame' },
    { name: 'COMMON SIGNAL', role: 'LIVE NETWORK', stat: '24 EVENTS', specialty: 'Broadcasts + digital venues', className: 'avatar--common' },
  ],
  entities: [
    { name: 'I/O', role: 'DIGITAL ENTITY', stat: 'VERSION 3.2', specialty: 'Performer + world guide', className: 'avatar--io' },
    { name: 'SAINT ZERO', role: 'STORY ENTITY', stat: '4 WORLDS', specialty: 'Antihero + playable identity', className: 'avatar--zero' },
    { name: 'MOTHER STATIC', role: 'BROADCAST ENTITY', stat: 'ALWAYS LIVE', specialty: 'Station host + network oracle', className: 'avatar--mother' },
    { name: 'KID CHROME', role: 'GAME ENTITY', stat: 'LEVEL 88', specialty: 'Racer + digital collectible', className: 'avatar--chrome' },
    { name: 'THE WITNESS', role: 'CINEMA ENTITY', stat: '6 EPISODES', specialty: 'Narrator + mystery engine', className: 'avatar--witness' },
    { name: 'ECHO/9', role: 'MUSIC ENTITY', stat: '27 TRACKS', specialty: 'Vocalist + remix system', className: 'avatar--echo' },
  ],
}

export const radioStations = [
  { name: 'STATIC ONE', genre: 'FUTURE / ALT / UNKNOWN', listeners: '12.4K', signal: '98.7', color: 'cyan' },
  { name: 'NIGHT//DRIVE', genre: 'SYNTH / SPEED / NEON', listeners: '8.1K', signal: '103.3', color: 'blue' },
  { name: 'NO SLEEP', genre: 'R&B / AFTERHOURS', listeners: '6.7K', signal: '88.9', color: 'violet' },
  { name: 'GHOST FM', genre: 'AMBIENT / LIMINAL', listeners: '4.9K', signal: '000.0', color: 'ghost' },
]

export const marketplaceItems = [
  { name: 'Chrome District World Kit', creator: 'KIRA//OS', type: 'WORLD TEMPLATE', price: '$28', edition: 'OPEN', className: 'market--chrome' },
  { name: 'Entity Voice Pack 01', creator: 'Parallel Dept.', type: 'AUDIO ASSET', price: '$14', edition: '250 LEFT', className: 'market--voice' },
  { name: 'Redline Vehicle Skins', creator: 'Apex Ghost', type: 'GAME ASSET', price: '$9', edition: 'DROP 01', className: 'market--redline' },
  { name: 'Memory Palace Pass', creator: 'Northstar', type: 'MEMBERSHIP', price: '$22', edition: 'SEASON 1', className: 'market--memory' },
  { name: 'Signal Type System', creator: 'STATIC LABS', type: 'CREATOR TOOL', price: 'FREE', edition: 'BETA', className: 'market--type' },
  { name: 'Night Shift Stems', creator: 'VANTA', type: 'REMIX PACK', price: '$18', edition: '500 LEFT', className: 'market--stems' },
]

export const originalSeries = [
  { title: 'MEMORY PALACE', format: 'SERIES / 8 EPISODES', logline: 'A woman discovers every forgotten memory still exists somewhere.', className: 'original--memory' },
  { title: 'GHOST FREQUENCY', format: 'DOCUMENTARY / LIVE', logline: 'Pirate broadcasters map the invisible culture of a city after midnight.', className: 'original--ghost' },
  { title: 'THE LAST AVATAR', format: 'ANIMATED WORLD', logline: 'The final digital citizen searches for the people who logged off.', className: 'original--avatar' },
  { title: 'REDLINE', format: 'PLAYABLE SERIES', logline: 'Every race rewrites the next episode.', className: 'original--redline' },
]

export const navGroups = [
  {
    label: 'Network',
    links: [
      ['Official Home', '/'],
      ['Discover', '/discover'],
      ['My Signal', '/my-signal'],
      ['Feed', '/feed'],
      ['Signals', '/signals'],
      ['Channels', '/channels'],
      ['Radio', '/radio'],
      ['STATIC PLAY', '/play'],
      ['STATIC LIVE', '/live'],
      ['Originals', '/originals'],
      ['Marketplace', '/marketplace'],
      ['LABS', '/labs'],
    ],
  },
  {
    label: 'Creator Network',
    links: [
      ['Creators', '/creators'],
      ['Studios', '/studios'],
      ['STATIC Studio', '/studio'],
      ['Creator Pro', '/creator-pro'],
      ['STATIC+', '/static-plus'],
      ['Contact', '/contact'],
    ],
  },
  {
    label: 'Build',
    links: [
      ['Provider Status', '/provider-status'],
      ['STATIC PLAY', '/play'],
      ['Marketplace', '/marketplace'],
      ['LABS', '/labs'],
    ],
  },
]
