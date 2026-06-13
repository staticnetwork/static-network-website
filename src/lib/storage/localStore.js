import { normalizeAvatarConfig } from '../avatarConfig'
import { migrateEntityData } from '../entityEngine/entityMigrations'

const KEYS = {
  entities: 'static_entities',
  channels: 'static_channels',
  signals: 'static_signals',
  worlds: 'static_worlds',
  drops: 'static_drops',
  currentEntity: 'static_current_entity',
  live: 'static_live',
  account: 'static_local_account',
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

export function normalizeEntity(entity) {
  if (!entity) return null
  return migrateEntityData({
    ...entity,
    companyBrand: entity.companyBrand || entity.company || '',
    titlePosition: entity.titlePosition || entity.title || '',
    fanbaseName: entity.fanbaseName || entity.fanbase || '',
    links: entity.links || [],
    avatarConfig: normalizeAvatarConfig(entity.avatarConfig, entity),
    profileImageRef: entity.profileImageRef || '',
    channelBannerRef: entity.channelBannerRef || '',
    channelTheme: {
      style: 'Broadcast',
      accentColor: '#78e8ff',
      layoutStyle: 'Media Grid',
      featuredModule: 'Signals',
      bannerHeadline: entity.channelTagline || 'A new world is transmitting.',
      ...(entity.channelTheme || {}),
    },
  })
}

export function getEntities() {
  return read(KEYS.entities).map(normalizeEntity)
}

export function getCurrentEntity() {
  const currentId = window.localStorage.getItem(KEYS.currentEntity)
  const entities = getEntities()
  return entities.find((entity) => entity.id === currentId) || entities.at(-1) || null
}

export function setCurrentEntity(entityId) {
  window.localStorage.setItem(KEYS.currentEntity, entityId)
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { key: KEYS.currentEntity } }))
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
  const entity = normalizeEntity({
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
    updatedAt: new Date().toISOString(),
  })

  write(KEYS.entities, [...entities, entity])
  setCurrentEntity(entity.id)
  createChannelForEntity(entity)
  return entity
}

export function saveEntity(entity) {
  const normalized = normalizeEntity({ ...entity, updatedAt: new Date().toISOString() })
  const entities = getEntities()
  const next = entities.some((item) => item.id === normalized.id)
    ? entities.map((item) => (item.id === normalized.id ? normalized : item))
    : [...entities, normalized]
  write(KEYS.entities, next)
  return normalized
}

export function getChannels() {
  return read(KEYS.channels).map((channel) => ({
    ...channel,
    displayName: channel.displayName || channel.name || '',
    profileImageRef: channel.profileImageRef || '',
    bannerRef: channel.bannerRef || '',
    theme: {
      style: 'Broadcast',
      accentColor: '#78e8ff',
      layoutStyle: 'Media Grid',
      featuredModule: 'Signals',
      bannerHeadline: channel.tagline || 'A new world is transmitting.',
      ...(channel.theme || {}),
    },
    modules: channel.modules || ['Feed', 'Videos', 'Live', 'Music', 'Worlds', 'Drops', 'About'],
  }))
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
    displayName: entity.channelName || entity.name,
    tagline: entity.channelTagline || 'A new world is transmitting.',
    company: entity.companyBrand || entity.company || '',
    profileImageRef: entity.profileImageRef || '',
    bannerRef: entity.channelBannerRef || '',
    theme: entity.channelTheme,
    modules: ['Feed', 'Videos', 'Live', 'Music', 'Worlds', 'Drops', 'About'],
    featuredSignalId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  write(KEYS.channels, [...channels, channel])
  return channel
}

export function saveChannel(channel) {
  const channels = getChannels()
  const nextChannel = { ...channel, updatedAt: new Date().toISOString() }
  const next = channels.some((item) => item.id === channel.id)
    ? channels.map((item) => (item.id === channel.id ? nextChannel : item))
    : [...channels, nextChannel]
  write(KEYS.channels, next)
  return nextChannel
}

export function getChannelForEntity(entityId) {
  return getChannels().find((channel) => channel.entityId === entityId) || null
}

export function getSignals() {
  return read(KEYS.signals)
    .map((signal) => ({
      ...signal,
      reactions: { amplified: false, remixed: false, saved: false, ...(signal.reactions || {}) },
      comments: signal.comments || [],
      avatarPose: signal.avatarPose || 'Idle',
      text: signal.text || signal.caption || '',
      postType: signal.postType || signal.type || 'Text',
      mediaRefs: signal.mediaRefs || (signal.mediaId ? [signal.mediaId] : []),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getEntitySignals(entityId) {
  return getSignals().filter((signal) => signal.entityId === entityId)
}

export function saveSignal(input) {
  const signal = {
    id: makeId('signal'),
    createdAt: new Date().toISOString(),
    visibility: 'Public',
    avatarPose: 'Idle',
    reactions: { amplified: false, remixed: false, saved: false },
    comments: [],
    ...input,
  }
  write(KEYS.signals, [signal, ...getSignals()])
  return signal
}

export function updateSignal(signalId, updates) {
  const signals = getSignals()
  const next = signals.map((signal) => signal.id === signalId ? { ...signal, ...updates, updatedAt: new Date().toISOString() } : signal)
  write(KEYS.signals, next)
  return next.find((signal) => signal.id === signalId)
}

export function addSignalComment(signalId, comment) {
  const signal = getSignals().find((item) => item.id === signalId)
  if (!signal) return null
  return updateSignal(signalId, {
    comments: [...signal.comments, { id: makeId('comment'), createdAt: new Date().toISOString(), ...comment }],
  })
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
  const next = saveEntity({ ...entity, live })
  write(KEYS.live, live ? { entityId: entity.id, startedAt: new Date().toISOString() } : null)
  return next
}

export function getLocalAccount() {
  return read(KEYS.account, null)
}

export function saveLocalAccount(profile) {
  return write(KEYS.account, profile)
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

export async function saveMedia(file, metadata = {}) {
  const id = makeId('media')
  const record = {
    id,
    blob: file,
    type: metadata.type || file.type.split('/')[0] || 'file',
    fileName: file.name,
    fileType: file.type,
    mimeType: file.type,
    ownerEntityId: metadata.ownerEntityId || '',
    channelId: metadata.channelId || '',
    thumbnailRef: metadata.thumbnailRef || '',
    savedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
  const db = await openMediaDatabase()
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE, 'readwrite')
    transaction.objectStore(MEDIA_STORE).put(record)
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
  })
  db.close()
  return record
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

export function getLocalMigrationBundle() {
  return {
    entities: getEntities(),
    channels: getChannels(),
    signals: getSignals(),
    worlds: getWorlds(),
    drops: getDrops(),
  }
}

export function mergeCloudNetworkBundle(bundle) {
  const merge = (current, incoming, identity = (item) => item.localId || item.cloudId || item.id) => {
    const next = [...current]
    incoming.forEach((item) => {
      const key = identity(item)
      const index = next.findIndex((existing) => identity(existing) === key)
      if (index >= 0) next[index] = { ...next[index], ...item }
      else next.push(item)
    })
    return next
  }

  if (bundle.entities?.length) {
    write(KEYS.entities, merge(getEntities(), bundle.entities.map(normalizeEntity)))
  }
  if (bundle.channels?.length) {
    write(KEYS.channels, merge(getChannels(), bundle.channels))
  }
  if (bundle.signals?.length) {
    write(KEYS.signals, merge(getSignals(), bundle.signals))
  }
  if (bundle.worlds?.length) {
    write(KEYS.worlds, merge(read(KEYS.worlds), bundle.worlds))
  }
  if (bundle.drops?.length) {
    write(KEYS.drops, merge(read(KEYS.drops), bundle.drops))
  }

  if (!getCurrentEntity() && bundle.entities?.[0]) setCurrentEntity(bundle.entities[0].id)
  return getLocalMigrationBundle()
}

export { KEYS as STATIC_STORAGE_KEYS }
