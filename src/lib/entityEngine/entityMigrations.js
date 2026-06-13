import { defaultEntityDNA, ENTITY_DNA_VERSION } from './entityDefaults'

function mergeDNA(current = {}) {
  return {
    ...defaultEntityDNA,
    ...current,
    version: ENTITY_DNA_VERSION,
    identity: { ...defaultEntityDNA.identity, ...(current.identity || {}) },
    appearance: { ...defaultEntityDNA.appearance, ...(current.appearance || {}) },
    wardrobe: { ...defaultEntityDNA.wardrobe, ...(current.wardrobe || {}) },
    voice: { ...defaultEntityDNA.voice, ...(current.voice || {}) },
    world: { ...defaultEntityDNA.world, ...(current.world || {}) },
    generation: { ...defaultEntityDNA.generation, ...(current.generation || {}) },
    tattoos: Array.isArray(current.tattoos) ? current.tattoos : [],
    jewelry: Array.isArray(current.jewelry) ? current.jewelry : [],
    props: Array.isArray(current.props) ? current.props : [],
  }
}

export function migrateEntityData(entity) {
  if (!entity) return entity
  const entityDNA = mergeDNA(entity.entityDNA)
  entityDNA.identity = {
    ...entityDNA.identity,
    name: entityDNA.identity.name || entity.name || '',
    handle: entityDNA.identity.handle || String(entity.handle || '').replace(/^@/, ''),
    role: entityDNA.identity.role || entity.role || '',
  }
  return {
    ...entity,
    entityDNA,
    dnaVersion: ENTITY_DNA_VERSION,
    officialImages: entity.officialImages || entityDNA.generation.officialImages || [],
  }
}

export function normalizeEntityDNA(value) {
  return mergeDNA(value)
}

