export const avatarCategories = {
  base: {
    bodyType: ['Slim', 'Athletic', 'Heavy', 'Tall', 'Compact'],
    presentation: ['Male', 'Female', 'Nonbinary', 'Robot', 'Creature', 'Unknown'],
    material: ['Umber', 'Sienna', 'Bronze', 'Sand', 'Porcelain', 'Metallic', 'Chrome', 'Shadow', 'Hologram', 'Alien', 'Synthetic'],
    height: ['Compact', 'Standard', 'Tall'],
  },
  face: {
    faceShape: ['Angular', 'Oval', 'Square', 'Heart', 'Synthetic'],
    eyes: ['Focused', 'Soft', 'Electric', 'Visor', 'Void'],
    eyebrows: ['Straight', 'Arched', 'Bold', 'None'],
    nose: ['Defined', 'Soft', 'Sharp', 'Synthetic'],
    mouth: ['Neutral', 'Smile', 'Smirk', 'Serious'],
    facialHair: ['None', 'Shadow', 'Goatee', 'Beard'],
    marks: ['None', 'Scar', 'Signal Mark', 'Chrome Line'],
    expression: ['Calm', 'Confident', 'Mysterious', 'Intense'],
  },
  hair: {
    hairStyle: ['Fade', 'Waves', 'Braids', 'Locs', 'Long', 'Slick Back', 'Mohawk', 'Bald', 'Synthetic Crown'],
    hairLength: ['Short', 'Medium', 'Long'],
  },
  outfit: {
    outfit: ['Streetwear', 'Luxury Suit', 'Futuristic Armor', 'Tactical', 'Rockstar', 'Western', 'Royal', 'Athletic', 'Formal', 'Sci-Fi Coat', 'Creator Hoodie', 'CEO Look'],
  },
  shoes: {
    shoes: ['Sneakers', 'Boots', 'Luxury Shoes', 'Futuristic Boots', 'Combat Boots', 'Dress Shoes'],
  },
  accessories: {
    accessory: ['None', 'Jewelry', 'Chain', 'Watch', 'Glasses', 'Mask', 'Hat', 'Headphones', 'Tech Visor', 'Wings', 'Instrument', 'Prop Microphone', 'Briefcase', 'Creator Camera'],
  },
  effects: {
    effect: ['Signal Ring', 'Static Particles', 'Hologram Flicker', 'Smoke / Fog', 'Spotlight', 'Broadcast Glitch', 'Cosmic Particles', 'None'],
  },
  pose: {
    pose: ['Idle', 'Wave', 'Arms Crossed', 'CEO', 'Performance', 'Pointing', 'Holding Mic', 'Holding Phone', 'Live Host', 'Victory'],
  },
  background: {
    background: ['Studio', 'City', 'Luxury Office', 'Digital Realm', 'Stage', 'Broadcast Room', 'Space', 'Street', 'Arena', 'Custom Gradient'],
  },
  card: {
    cardStyle: ['Profile Portrait', 'Full Body', 'Live Host Frame', 'Album Cover', 'Channel Banner'],
  },
}

export const defaultAvatarConfig = {
  bodyType: 'Athletic',
  presentation: 'Unknown',
  material: 'Shadow',
  height: 'Standard',
  faceShape: 'Angular',
  eyes: 'Electric',
  eyebrows: 'Straight',
  nose: 'Defined',
  mouth: 'Neutral',
  facialHair: 'None',
  marks: 'Signal Mark',
  expression: 'Confident',
  hairStyle: 'Fade',
  hairLength: 'Short',
  hairColor: '#111827',
  facialHairColor: '#171717',
  outfit: 'CEO Look',
  outfitColor: '#111827',
  accentColor: '#78e8ff',
  shoes: 'Luxury Shoes',
  accessory: 'Tech Visor',
  effect: 'Signal Ring',
  glowColor: '#78e8ff',
  pose: 'CEO',
  background: 'Digital Realm',
  backgroundColor: '#0b1020',
  cardStyle: 'Profile Portrait',
}

export function normalizeAvatarConfig(config = {}, entity = {}) {
  return {
    ...defaultAvatarConfig,
    presentation: entity.presentation || defaultAvatarConfig.presentation,
    outfit: entity.wardrobe === 'Luxury' ? 'Luxury Suit' : entity.wardrobe || defaultAvatarConfig.outfit,
    accessory: entity.accessories === 'Tech Gear' ? 'Tech Visor' : entity.accessories || defaultAvatarConfig.accessory,
    ...config,
  }
}

export function avatarPoseClass(pose = 'Idle') {
  return String(pose).toLowerCase().replace(/[^a-z0-9]+/g, '-')
}
