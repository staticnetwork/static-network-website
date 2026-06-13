export const platforms = [
  {
    slug: 'signals',
    number: '01',
    name: 'STATIC Signals',
    shortName: 'Signals',
    label: 'Discovery Feed',
    headline: 'Catch the signal before it becomes the culture.',
    description:
      'A living discovery feed for music, films, games, characters, broadcasts, creator drops, and strange new worlds.',
    status: 'FEED ACTIVE',
    tone: 'green',
  },
  {
    slug: 'channels',
    number: '02',
    name: 'STATIC Channels',
    shortName: 'Channels',
    label: 'Creator-Owned Worlds',
    headline: 'Every creator deserves a world, not just a profile.',
    description:
      'Persistent creator-owned destinations where audiences can watch, listen, play, collect, and follow an evolving universe.',
    status: 'WORLDS ONLINE',
    tone: 'lime',
  },
  {
    slug: 'radio',
    number: '03',
    name: 'STATIC Radio',
    shortName: 'Radio',
    label: 'Always Broadcasting',
    headline: 'The network never goes silent.',
    description:
      'Always-on stations for new music, moods, scenes, creator takeovers, experimental sound, and digital culture.',
    status: 'ON AIR',
    tone: 'acid',
  },
  {
    slug: 'play',
    number: '04',
    name: 'STATIC PLAY',
    shortName: 'Play',
    label: 'Playable Imagination',
    headline: 'What would you like to play today?',
    description:
      'Describe a game or interactive world, remix a template, shape the rules, and share a playable idea.',
    status: 'ENGINE STANDBY',
    tone: 'green',
  },
  {
    slug: 'live',
    number: '05',
    name: 'STATIC LIVE',
    shortName: 'Live',
    label: 'Broadcast Together',
    headline: 'Go live from inside the world.',
    description:
      'Creator broadcasts, premieres, watch parties, virtual events, live performances, and audience-controlled moments.',
    status: 'SIGNAL LIVE',
    tone: 'warning',
  },
  {
    slug: 'originals',
    number: '06',
    name: 'STATIC Originals',
    shortName: 'Originals',
    label: 'New-Format Stories',
    headline: 'Stories that refuse to stay in one format.',
    description:
      'AI-native shows, animation, documentaries, characters, music films, and franchises built to expand across the network.',
    status: 'PREMIERES QUEUED',
    tone: 'lime',
  },
  {
    slug: 'marketplace',
    number: '07',
    name: 'STATIC Marketplace',
    shortName: 'Marketplace',
    label: 'Own The Culture',
    headline: 'Take a piece of the world with you.',
    description:
      'A future marketplace for assets, skins, music packs, templates, memberships, drops, and creator-powered experiences.',
    status: 'MARKET PREVIEW',
    tone: 'acid',
  },
  {
    slug: 'labs',
    number: '08',
    name: 'STATIC LABS',
    shortName: 'Labs',
    label: 'Build What Comes Next',
    headline: 'The experimental layer of the network.',
    description:
      'Prototype tools, workflows, adapters, and future APIs for building AI-native entertainment systems.',
    status: 'RESEARCH ACTIVE',
    tone: 'green',
  },
]

export const routeMeta = {
  '/': {
    title: 'STATIC Network | The Home of AI Entertainment',
    description:
      'Watch it. Hear it. Play it. Create it. Own it. Enter the AI-native entertainment network.',
  },
  '/signals': {
    title: 'STATIC Signals | Discover What Breaks Next',
    description: 'The living discovery feed for the next wave of AI-native entertainment.',
  },
  '/channels': {
    title: 'STATIC Channels | Creator-Owned Worlds',
    description: 'Explore creator-owned entertainment worlds across the STATIC Network.',
  },
  '/radio': {
    title: 'STATIC Radio | Always Broadcasting',
    description: 'Preview 24/7 stations for new music, moods, scenes, and digital culture.',
  },
  '/play': {
    title: 'STATIC PLAY | Playable Imagination',
    description: 'Describe, remix, share, and play AI-generated games and interactive worlds.',
  },
  '/live': {
    title: 'STATIC LIVE | Broadcast Together',
    description: 'Enter live premieres, creator broadcasts, events, performances, and watch parties.',
  },
  '/originals': {
    title: 'STATIC Originals | Stories Without Limits',
    description: 'Discover shows, films, animation, documentaries, and expanding digital franchises.',
  },
  '/marketplace': {
    title: 'STATIC Marketplace | Own The Culture',
    description: 'Preview creator drops, assets, templates, skins, memberships, and digital experiences.',
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
    title: 'Entities | STATIC Network',
    description: 'Meet persistent characters, virtual performers, and living digital identities.',
  },
  '/studio': {
    title: 'STATIC Studio | Create Across Every Format',
    description: 'Preview the command center for building music, video, worlds, games, and releases.',
  },
  '/static-plus': {
    title: 'STATIC+ | Go Deeper Into The Network',
    description: 'Preview enhanced fan access, exclusives, drops, and network-wide benefits.',
  },
  '/creator-pro': {
    title: 'Creator Pro | Build The World',
    description: 'Preview advanced tools and publishing systems for serious STATIC creators.',
  },
  '/discover': {
    title: 'Discover | STATIC Network',
    description: 'Explore trending signals, live broadcasts, worlds, games, music, and originals.',
  },
  '/waitlist': {
    title: 'Join The Signal | STATIC Network',
    description: 'Request early access to STATIC Network for creators, fans, studios, and partners.',
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
  { name: 'STATIC ONE', genre: 'FUTURE / ALT / UNKNOWN', listeners: '12.4K', signal: '98.7', color: 'green' },
  { name: 'NIGHT//DRIVE', genre: 'SYNTH / SPEED / NEON', listeners: '8.1K', signal: '103.3', color: 'lime' },
  { name: 'NO SLEEP', genre: 'R&B / AFTERHOURS', listeners: '6.7K', signal: '88.9', color: 'acid' },
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
      ['Discover', '/discover'],
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
    label: 'Community',
    links: [
      ['Creators', '/creators'],
      ['Studios', '/studios'],
      ['Entities', '/entities'],
    ],
  },
  {
    label: 'Build',
    links: [
      ['STATIC Studio', '/studio'],
      ['STATIC+', '/static-plus'],
      ['Creator Pro', '/creator-pro'],
    ],
  },
]
