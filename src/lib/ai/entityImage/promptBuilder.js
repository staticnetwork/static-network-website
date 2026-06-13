export function buildEntityImagePrompt(dna, outputType = 'portrait') {
  const list = (items, formatter) => items?.length ? items.map(formatter).join('; ') : 'none'
  return [
    `Create a premium ${outputType} image of ${dna.identity.name || 'a new STATIC Entity'}.`,
    `Identity: ${dna.identity.role}; ${dna.identity.ageRange}; ${dna.identity.presentation}; ${dna.identity.heritage}.`,
    `Appearance: ${dna.appearance.build}; ${dna.appearance.skinTone}; ${dna.appearance.face}; ${dna.appearance.hair}; ${dna.appearance.eyes}; ${dna.appearance.distinguishingFeatures}.`,
    `Wardrobe: ${dna.wardrobe.direction}; ${dna.wardrobe.primaryLook}; palette ${dna.wardrobe.colors.join(', ')}; materials ${dna.wardrobe.materials.join(', ')}.`,
    `Tattoos: ${list(dna.tattoos, (item) => `${item.design} at ${item.placement}, ${item.visibility}`)}.`,
    `Jewelry: ${list(dna.jewelry, (item) => `${item.design}, ${item.material}`)}.`,
    `Props: ${list(dna.props, (item) => `${item.design}. Treat weapons only as non-operational cinematic visual props, never in use or aimed`)}.`,
    `World: ${dna.world.environment}; ${dna.world.lighting}; ${dna.world.era}.`,
    `Visual direction: ${dna.generation.style}. STATIC Network black, white, charcoal and icy signal light. Premium entertainment key art, coherent anatomy, consistent identity.`,
    `Avoid: ${dna.generation.negativePrompt}.`,
  ].join('\n')
}

