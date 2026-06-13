export const ENTITY_DNA_VERSION = 2

export const defaultEntityDNA = {
  version: ENTITY_DNA_VERSION,
  identity: {
    name: '',
    handle: '',
    role: 'Digital Entertainer',
    ageRange: '30s',
    presentation: 'Cinematic',
    heritage: '',
  },
  appearance: {
    build: 'Athletic',
    skinTone: 'Deep bronze',
    face: 'Defined, charismatic, camera-ready',
    hair: 'Close-cut black',
    eyes: 'Dark brown',
    distinguishingFeatures: '',
  },
  wardrobe: {
    direction: 'Future executive',
    primaryLook: 'Tailored black suit',
    colors: ['black', 'charcoal', 'signal cyan'],
    materials: ['wool', 'silk', 'brushed metal'],
  },
  tattoos: [],
  jewelry: [],
  props: [],
  voice: {
    energy: 'Confident British-American future broadcaster',
    cadence: 'Measured',
    providerVoiceId: '',
  },
  world: {
    environment: 'Underground broadcast command center',
    lighting: 'Cinematic edge light',
    era: 'Near future',
  },
  generation: {
    style: 'Photoreal cinematic',
    aspectRatio: '4:5',
    negativePrompt: 'low detail, duplicate limbs, malformed hands, text, watermark, logo',
    referenceMediaIds: [],
    officialImages: [],
    defaultImageId: '',
  },
}

export const mrStonePreset = {
  name: 'Mr Stone',
  handle: 'mrstone',
  role: 'CEO / Founder',
  genre: 'Business',
  company: 'Above All AI',
  title: 'CEO',
  channelName: 'Mr Stone / Above All AI',
  channelTagline: 'Building the future above all.',
  personality: 'Visionary',
  publicTone: 'Motivational',
  bio: 'Founder and CEO of Above All AI. Building the future of AI entertainment, media, and synthetic culture.',
  entityDNA: {
    ...defaultEntityDNA,
    identity: {
      ...defaultEntityDNA.identity,
      name: 'Mr Stone',
      handle: 'mrstone',
      role: 'Founder and future-culture executive',
      ageRange: 'Late 30s to early 40s',
      presentation: 'Masculine',
      heritage: 'Black American',
    },
    appearance: {
      build: 'Tall, powerful, tailored',
      skinTone: 'Deep warm brown',
      face: 'Strong jaw, calm authority, premium editorial realism',
      hair: 'Close-cut black hair with immaculate line',
      eyes: 'Dark brown, focused',
      distinguishingFeatures: 'Quiet confidence, executive presence',
    },
    wardrobe: {
      direction: 'Luxury future executive',
      primaryLook: 'Perfectly tailored black double-breasted suit over a black silk shirt',
      colors: ['obsidian black', 'gunmetal', 'icy cyan'],
      materials: ['silk', 'fine wool', 'brushed platinum'],
    },
    tattoos: [
      { id: 'stone-tattoo-1', placement: 'Right hand', design: 'Minimal geometric origin mark', visibility: 'subtle' },
    ],
    jewelry: [
      { id: 'stone-jewelry-1', type: 'Watch', design: 'Architectural platinum watch', material: 'platinum' },
      { id: 'stone-jewelry-2', type: 'Ring', design: 'Heavy black signet ring', material: 'onyx' },
    ],
    props: [
      { id: 'stone-prop-1', type: 'Visual prop', design: 'Gold 1911 display piece, safely holstered or presented as a non-operational luxury film prop', safety: 'visual-prop-only' },
    ],
    voice: {
      energy: 'Deep, poised, commanding founder transmission',
      cadence: 'Slow and deliberate',
      providerVoiceId: '',
    },
    world: {
      environment: 'Above All Tower executive broadcast chamber overlooking a future city',
      lighting: 'Cold white key light with restrained icy-cyan rim',
      era: 'Near-future luxury',
    },
    generation: {
      ...defaultEntityDNA.generation,
      style: 'Ultra-photoreal luxury editorial cinema',
    },
  },
}

export const cosmeticCatalog = [
  { id: 'tailored-origin', category: 'wardrobe', name: 'Origin Suit', rarity: 'Genesis', unlock: 'Founder preset', price: null },
  { id: 'signal-chain', category: 'jewelry', name: 'Signal Chain', rarity: 'Rare', unlock: 'Future marketplace', price: null },
  { id: 'broadcast-visor', category: 'accessory', name: 'Broadcast Visor', rarity: 'Experimental', unlock: 'LABS', price: null },
]

