const KEYS = {
  entities: 'static_entities',
  channels: 'static_channels',
  signals: 'static_signals',
  worlds: 'static_worlds',
  drops: 'static_drops',
  currentEntity: 'static_current_entity',
  live: 'static_live',
}

const MEDIA_DB = 'static_network_mvp'
const MEDIA_STORE = 'static_media'
const UPDATE_EVENT = 'static:network-updated'

function read(key, fallback = []) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { key } }))
  } catch {
    // Local browser storage can be unavailable in restricted browsing modes.
  }
  return value
}

function makeId(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function normalizeHandle(value) {
  const clean = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[^a-z0-9._-]+/g, '')
    .slice(0, 32)
  return clean || `entity-${Date.now().toString().slice(-6)}`
}

export function getEntities() {
  return read(KEYS.entities)
}

export function getCurrentEntity() {
  const currentId = window.localStorage.getItem(KEYS.currentEntity)
  const entities = getEntities()
  return entities.find((entity) => entity.id === currentId) || entities.at(-1) || null
}

export function getEntityByHandle(handle) {
  const normalized = normalizeHandle(handle)
  return getEntities().find((entity) => normalizeHandle(entity.handle) === normalized) || null
}

export function getGenesisEntity() {
  return getEntities().find((entity) => entity.rank === '#001') || null
}

export function createEntity(input) {
  const entities = getEntities()
  const isGenesis = entities.length === 0
  const handle = normalizeHandle(input.handle || input.name)
  const entity = {
    ...input,
    id: makeId('entity'),
    handle: `@${handle}`,
    rank: isGenesis ? '#001' : `#${String(entities.length + 1).padStart(3, '0')}`,
    status: isGenesis ? 'Genesis Entity' : 'Entity Online',
    badge: isGenesis ? 'Origin Signal' : 'Local Transmission',
    signalScore: isGenesis ? '1T' : 'LOCAL',
    isGenesis,
    live: false,
    createdAt: new Date().toISOString(),
  }

  write(KEYS.entities, [...entities, entity])
  window.localStorage.setItem(KEYS.currentEntity, entity.id)
  createChannelForEntity(entity)
  return entity
}

export function saveEntity(entity) {
  const entities = getEntities()
  const next = entities.some((item) => item.id === entity.id)
    ? entities.map((item) => (item.id === entity.id ? entity : item))
    : [...entities, entity]
  write(KEYS.entities, next)
  return entity
}

export function getChannels() {
  return read(KEYS.channels)
}

export function createChannelForEntity(entity) {
  const channels = getChannels()
  const existing = channels.find((channel) => channel.entityId === entity.id)
  if (existing) return existing

  const channel = {
    id: makeId('channel'),
    entityId: entity.id,
    handle: entity.handle,
    name: entity.channelName || entity.name,
    tagline: entity.channelTagline || 'A new world is transmitting.',
    company: entity.company || '',
    createdAt: new Date().toISOString(),
  }
  write(KEYS.channels, [...channels, channel])
  return channel
}

export function getChannelForEntity(entityId) {
  return getChannels().find((channel) => channel.entityId === entityId) || null
}

export function getSignals() {
  return read(KEYS.signals).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getEntitySignals(entityId) {
  return getSignals().filter((signal) => signal.entityId === entityId)
}

export function saveSignal(input) {
  const signal = {
    id: makeId('signal'),
    createdAt: new Date().toISOString(),
    visibility: 'Public',
    ...input,
  }
  write(KEYS.signals, [signal, ...read(KEYS.signals)])
  return signal
}

export function getWorlds(entityId) {
  return read(KEYS.worlds).filter((world) => !entityId || world.entityId === entityId)
}

export function saveWorld(input) {
  const world = { id: makeId('world'), createdAt: new Date().toISOString(), ...input }
  write(KEYS.worlds, [world, ...read(KEYS.worlds)])
  return world
}

export function getDrops(entityId) {
  return read(KEYS.drops).filter((drop) => !entityId || drop.entityId === entityId)
}

export function saveDrop(input) {
  const drop = { id: makeId('drop'), createdAt: new Date().toISOString(), ...input }
  write(KEYS.drops, [drop, ...read(KEYS.drops)])
  return drop
}

export function setEntityLive(entity, live) {
  const next = { ...entity, live }
  saveEntity(next)
  write(KEYS.live, live ? { entityId: entity.id, startedAt: new Date().toISOString() } : null)
  return next
}

export function subscribeToNetworkUpdates(callback) {
  window.addEventListener(UPDATE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(UPDATE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

function openMediaDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const request = window.indexedDB.open(MEDIA_DB, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(MEDIA_STORE)) db.createObjectStore(MEDIA_STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveMedia(file) {
  const id = makeId('media')
  const db = await openMediaDatabase()
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE, 'readwrite')
    transaction.objectStore(MEDIA_STORE).put({
      id,
      blob: file,
      fileName: file.name,
      fileType: file.type,
      savedAt: new Date().toISOString(),
    })
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
  })
  db.close()
  return { id, fileName: file.name, fileType: file.type }
}

export async function getMedia(id) {
  if (!id) return null
  try {
    const db = await openMediaDatabase()
    const record = await new Promise((resolve, reject) => {
      const request = db.transaction(MEDIA_STORE, 'readonly').objectStore(MEDIA_STORE).get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
    db.close()
    return record
  } catch {
    return null
  }
}

// TODO: Migrate local records and IndexedDB blobs to authenticated cloud
// persistence with ownership rules, moderation, signed media URLs, and backups.
export { KEYS as STATIC_STORAGE_KEYS }
