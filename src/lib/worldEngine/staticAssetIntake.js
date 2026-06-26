import { staticCharacterAssetRoutingPlan, staticCityMacroDistricts, staticIslandTopology } from './staticCityScalePlan.js'

export const ASSET_INTAKE_STORAGE_KEY = 'static_world_asset_intake'

export const assetTypeOptions = [
  'Character',
  'Companion',
  'Creature',
  'Vehicle',
  'Weapon',
  'Building',
  'Interior',
  'Prop',
  'Wardrobe',
  'Jewelry',
  'Environment',
  'Audio',
  'Animation',
  'VFX',
  'UI / Decal',
]

export const sourceStatusOptions = [
  'Owner-generated',
  'Purchased pack',
  'Free pack',
  'Marketplace candidate',
  'Needs sourcing',
  'Quarantine',
]

export const licenseStatusOptions = [
  'Commercial cleared',
  'Owner-created',
  'Needs review',
  'Prototype only',
  'Restricted',
  'Unknown',
]

export const assetFormatOptions = [
  'GLB',
  'GLTF',
  'FBX',
  'OBJ',
  'Blend',
  'PNG',
  'JPG',
  'WEBM',
  'MP4',
  'WAV',
  'OGG',
  'Unknown',
]

export const rarityOptions = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
  'Mythic',
  'Founder',
]

export const gameplayRoleOptions = [
  'Ambient NPC',
  'Recruitable NPC',
  'Companion candidate',
  'Boss / champion',
  'Vendor',
  'Guard / security',
  'Performer',
  'Vehicle / travel',
  'Player-owned build asset',
  'District landmark',
  'Quest object',
  'Cosmetic / wardrobe',
  'Combat kit',
  'Event prop',
  'World terrain',
]

const fieldRegionOptions = [
  ['fields-desert', 'The Fields / Desert Region', 'Fields', 'Desert Region'],
  ['fields-forest', 'The Fields / Forest Region', 'Fields', 'Forest Region'],
  ['fields-snow', 'The Fields / Snow Region', 'Fields', 'Snow Region'],
]

const hiddenLayerOptions = [
  ['rootside-tunnels', 'Rootside / Underground Tunnels', 'Hidden City', 'Rootside'],
  ['astral-port', 'STATIC Astral Port / Orbit', 'Future Universe', 'Astral Port'],
  ['asset-quarantine', 'Catalog / Quarantine', 'Pipeline', 'Unassigned'],
]

export const assetHomeOptions = [
  ...staticCityMacroDistricts.map((district) => [
    district.id,
    district.name,
    'STATIC City',
    district.biome,
  ]),
  ...fieldRegionOptions,
  ...staticIslandTopology.rings.map(([ring]) => [
    `static-island-${ring.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    `STATIC Island / ${ring}`,
    'STATIC Island',
    ring,
  ]),
  ...hiddenLayerOptions,
].map(([id, label, worldLayer, biome]) => ({ id, label, worldLayer, biome }))

export const assetIntakeStarter = {
  name: '',
  sourceName: '',
  sourceUrl: '',
  assetType: 'Character',
  sourceStatus: 'Needs sourcing',
  licenseStatus: 'Unknown',
  assetFormat: 'GLB',
  targetHomeId: 'asset-quarantine',
  rarity: 'Common',
  gameplayRole: 'Ambient NPC',
  faction: '',
  creatorSpace: '',
  importNotes: '',
  loreNotes: '',
  moderationNotes: '',
  fileNotes: '',
  scaleClass: 'Human scale',
  npcEcosystem: false,
  ownerApprovedPlacement: false,
  readyForBlender: false,
  readyForUnreal: false,
}

export function getAssetHome(homeId) {
  return assetHomeOptions.find((item) => item.id === homeId) || assetHomeOptions.at(-1)
}

function slugify(value) {
  return String(value || 'untitled-asset')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'untitled-asset'
}

function pathSegment(value) {
  return slugify(value)
    .split('-')
    .map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : '')
    .join('')
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `asset-${crypto.randomUUID()}`
  return `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readinessScore(record) {
  const checks = [
    Boolean(record.name.trim()),
    record.targetHomeId !== 'asset-quarantine',
    ['Commercial cleared', 'Owner-created'].includes(record.licenseStatus),
    !['Needs sourcing', 'Quarantine'].includes(record.sourceStatus),
    Boolean(record.gameplayRole),
    Boolean(record.loreNotes.trim() || record.importNotes.trim()),
    record.ownerApprovedPlacement,
    record.readyForBlender,
    record.readyForUnreal,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function statusFor(record, score) {
  if (record.targetHomeId === 'asset-quarantine') return 'Quarantine'
  if (!['Commercial cleared', 'Owner-created'].includes(record.licenseStatus)) return 'License review'
  if (!record.ownerApprovedPlacement) return 'Placement review'
  if (record.readyForUnreal && score >= 78) return 'Unreal-ready candidate'
  if (record.readyForBlender || score >= 56) return 'Blender review'
  return 'Canon candidate'
}

export function normalizeAssetIntake(input = {}) {
  const home = getAssetHome(input.targetHomeId || assetIntakeStarter.targetHomeId)
  const createdAt = input.createdAt || new Date().toISOString()
  const base = {
    ...assetIntakeStarter,
    ...input,
    id: input.id || makeId(),
    name: String(input.name || '').trim(),
    sourceName: String(input.sourceName || '').trim(),
    sourceUrl: String(input.sourceUrl || '').trim(),
    faction: String(input.faction || '').trim(),
    creatorSpace: String(input.creatorSpace || '').trim(),
    importNotes: String(input.importNotes || '').trim(),
    loreNotes: String(input.loreNotes || '').trim(),
    moderationNotes: String(input.moderationNotes || '').trim(),
    fileNotes: String(input.fileNotes || '').trim(),
    targetHomeId: home.id,
    targetHomeLabel: home.label,
    worldLayer: home.worldLayer,
    biome: home.biome,
    createdAt,
    updatedAt: new Date().toISOString(),
  }
  const slug = slugify(base.name)
  const unrealType = pathSegment(base.assetType || 'Asset')
  const unrealHome = pathSegment(home.worldLayer || home.label)
  const unrealDistrict = pathSegment(home.label)
  const score = readinessScore(base)
  const record = {
    ...base,
    slug,
    readinessScore: score,
    status: statusFor(base, score),
    unrealTargetPath: `/Game/STATIC/${unrealHome}/${unrealDistrict}/${unrealType}/${slug}`,
    webPrototypePath: `/public/assets/world/intake/${slug}`,
  }
  return record
}

export function getAssetIntakeRecords() {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ASSET_INTAKE_STORAGE_KEY) || '[]')
    return Array.isArray(parsed)
      ? parsed.map(normalizeAssetIntake).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      : []
  } catch {
    return []
  }
}

export function saveAssetIntakeRecord(input) {
  const records = getAssetIntakeRecords()
  const nextRecord = normalizeAssetIntake(input)
  const next = records.some((record) => record.id === nextRecord.id)
    ? records.map((record) => (record.id === nextRecord.id ? nextRecord : record))
    : [nextRecord, ...records]

  // TODO(asset-intake): replace localStorage with Supabase owner tables once
  // world asset ownership, moderation, licensing, and Unreal import status are
  // server-authoritative.
  window.localStorage.setItem(ASSET_INTAKE_STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('static:asset-intake-updated', { detail: { id: nextRecord.id } }))
  return nextRecord
}

export function deleteAssetIntakeRecord(recordId) {
  const next = getAssetIntakeRecords().filter((record) => record.id !== recordId)
  window.localStorage.setItem(ASSET_INTAKE_STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('static:asset-intake-updated', { detail: { id: recordId, deleted: true } }))
  return next
}

export function makeAssetIntakeExport(records) {
  const normalized = records.map(normalizeAssetIntake)
  return {
    generatedAt: new Date().toISOString(),
    status: 'owner-local-intake-only',
    warning: 'This is planning data, not a public marketplace, backend inventory, or Unreal import.',
    placementRule: staticCharacterAssetRoutingPlan.rules,
    islandRule: staticIslandTopology.rules,
    records: normalized,
  }
}

export function summarizeAssetIntake(records) {
  const list = records.map(normalizeAssetIntake)
  const byHome = list.reduce((acc, record) => {
    acc[record.targetHomeLabel] = (acc[record.targetHomeLabel] || 0) + 1
    return acc
  }, {})
  const ecosystemSeeds = Object.entries(byHome)
    .filter(([, count]) => count >= 10)
    .map(([home, count]) => ({ home, count }))

  return {
    total: list.length,
    quarantine: list.filter((record) => record.status === 'Quarantine').length,
    licenseReview: list.filter((record) => record.status === 'License review').length,
    unrealReady: list.filter((record) => record.status === 'Unreal-ready candidate').length,
    ownerApproved: list.filter((record) => record.ownerApprovedPlacement).length,
    ecosystemSeeds,
  }
}
