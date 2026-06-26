export const staticCityCompanionPlan = {
  id: 'static-companions',
  name: 'STATIC COMPANIONS',
  principle: 'Companions are identity, utility, protection, and spectacle inside the city, not just decorative pets.',
  pitch: 'Every Entity can eventually choose a companion layer: cute sidekick, floating bot, robotic bodyguard, mythic guardian, dragon, golem, or crew-linked protector that follows them through STATIC City.',
  publicPositioning: 'Future companion and guardian identity system. Do not claim live protection, combat behavior, multiplayer defense, or paid companion advantages until backend, engine, moderation, and safety rules exist.',
}

export const staticCompanionModes = [
  {
    id: 'cosmetic-companion',
    name: 'Cosmetic Companion',
    status: 'design',
    loop: 'Players pick a small companion that follows them, reacts to venues, appears in posts, and becomes part of their social identity.',
    rules: [
      'First version is visual-only and owner/internal.',
      'Companions must be original or clearly licensed for STATIC use.',
      'Small companions should be performance-safe for mobile web.',
    ],
  },
  {
    id: 'guardian-bodyguard',
    name: 'Guardian Bodyguard',
    status: 'design',
    loop: 'Players can assign one or two larger guardians/bodyguards that follow in city spaces and activate only inside opt-in danger, race, arena, or crew modes.',
    rules: [
      'Protection is fictional gameplay behavior, not real safety language.',
      'Auto-protect behavior requires server validation, abuse controls, and mode-specific rules.',
      'No pay-to-win combat advantage in public modes.',
    ],
  },
  {
    id: 'mythic-companion',
    name: 'Mythic Companion',
    status: 'design',
    loop: 'Dragons, golems, giant robots, and oversized guardians become prestige companions with district restrictions, cinematic spawn moments, and event entrances.',
    rules: [
      'Large companions require district permissions and strict performance budgets.',
      'Mythic companions should not block other players, grief public spaces, or break venue composition.',
      'Use scale variants and LODs before public release.',
    ],
  },
  {
    id: 'companion-loadout',
    name: 'Companion Loadout',
    status: 'design',
    loop: 'Companions can eventually have skins, aura, stance, follow distance, idle animation, greeting animation, and mode-specific utility slots.',
    rules: [
      'Utility slots must be cosmetic or mode-limited until balance exists.',
      'All companion cosmetics need inventory and entitlement checks.',
      'User-generated companion skins require moderation.',
    ],
  },
  {
    id: 'companion-squad',
    name: 'Companion Squad',
    status: 'design',
    loop: 'High-status users, crews, and event hosts can display a limited companion squad in approved spaces, such as tower lobbies, VIP areas, and faction bases.',
    rules: [
      'Squads are capped by venue and device performance.',
      'Crew guards require crew permissions and moderation.',
      'Public spaces must keep visibility, access, and camera readability intact.',
    ],
  },
  {
    id: 'companion-lineage',
    name: 'Companion Lineage / Fusion',
    status: 'design',
    loop: 'Creature, pet, mount, robot, mythic, and guardian companions can eventually inherit traits through fusion, incubation, crafting, lab creation, or fantasy lineage systems.',
    rules: [
      'Use lineage/fusion language for creatures and companions, not coercive breeding language for humanlike Entities.',
      'Humanlike character inheritance belongs to consent-based legacy, ancestry, family-role, or avatar-design systems.',
      'Lineage outputs need trait caps, rarity balancing, moderation, ownership records, and no pay-to-win combat advantage.',
      'Origin settlements should explain where rare companion families come from before they enter the wider marketplace.',
    ],
  },
]

export const staticCompanionEvolutionArc = {
  id: 'five-phase-companion-evolution',
  name: 'Five-Phase Companion Evolution',
  principle: 'Every companion should have long-term growth, even if it starts cute, robotic, mythic, tiny, massive, common, rare, or boss-level.',
  phases: [
    ['Phase 1', 'Bonded Form', 'The companion is claimed, bonded, named, and equipped with its first stance, idle, follow distance, and basic cosmetic identity.'],
    ['Phase 2', 'Awakened Form', 'New animation set, stronger aura, voice/reaction layer, venue reactions, social poses, and early utility inside approved modes.'],
    ['Phase 3', 'Battle / Utility Form', 'Mode-limited guardian behavior, traversal help, scout function, delivery assist, mount prep, or land-defense role depending on companion type.'],
    ['Phase 4', 'Prestige Form', 'Rare visual evolution, larger scale or alternate silhouette, advanced skin slots, special entrance animation, and district-specific status effects.'],
    ['Phase 5', 'Ascended Form', 'Signature final evolution with cinematic summon, unique aura, top-tier cosmetic identity, boss/guardian/mount variant, and high-status story recognition.'],
  ],
  rules: [
    'A companion can start at a higher perceived rarity, but it still has five phases to unlock.',
    'Boss companions can enter at Phase 3 or Phase 4 visually, but Phase 5 remains earned through story, bonding, reputation, or major achievements.',
    'Evolution unlocks must be balanced through time, quests, Signal Credits, achievements, settlement reputation, lineage/fusion, or event participation.',
    'Higher phases do not automatically mean public-space combat dominance. Power stays cosmetic, social, traversal, utility, or opt-in-mode limited until full balance exists.',
    'Each phase should support visible collection: form, aura, scale, stance, skin, entrance, sound cue, title, and profile badge.',
  ],
}

export const staticCompanionAssetNeeds = [
  {
    id: 'guardian-companion',
    name: 'Guardian Companion / Bodyguard',
    targetPath: '/assets/world/city/companions/guardian-companion.glb',
    replaces: 'No guardian companion asset yet',
  },
  {
    id: 'cute-companion',
    name: 'Small Cute Companion',
    targetPath: '/assets/world/city/companions/cute-companion.glb',
    replaces: 'No small companion asset yet',
  },
  {
    id: 'dragon-companion',
    name: 'Mythic Dragon Companion',
    targetPath: '/assets/world/city/companions/dragon-companion.glb',
    replaces: 'No mythic flying companion asset yet',
  },
  {
    id: 'robot-bodyguard',
    name: 'Robot Bodyguard Companion',
    targetPath: '/assets/world/city/companions/robot-bodyguard.glb',
    replaces: 'No robotic bodyguard asset yet',
  },
  {
    id: 'companion-hub',
    name: 'Companion Hub / Guardian Yard',
    targetPath: '/assets/world/city/venues/companion-hub.glb',
    replaces: 'No companion selection venue yet',
  },
]
