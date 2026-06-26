import { normalizeHandle } from './staticStore'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const STORAGE_KEY = 'static_launch_systems_v1'
const SESSION_KEY = 'static_launch_session_id_v1'
const remoteQueue = []
let remoteFlushTimer = null

const eventWeights = {
  impression: 1,
  dwell: 3,
  like: 8,
  saved: 12,
  save: 12,
  comment: 14,
  share: 18,
  follow: 20,
  report: -35,
}

function nowIso() {
  return new Date().toISOString()
}

function routePath() {
  if (typeof window === 'undefined') return ''
  return `${window.location.pathname || '/'}${window.location.hash || ''}`.slice(0, 160)
}

function canStore() {
  return typeof window !== 'undefined' && window.localStorage
}

function sessionId() {
  if (!canStore()) return ''
  try {
    const current = window.localStorage.getItem(SESSION_KEY)
    if (current) return current
    const next = `static-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem(SESSION_KEY, next)
    return next
  } catch {
    return ''
  }
}

function readState() {
  if (!canStore()) return seedState()
  try {
    return { ...seedState(), ...JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') }
  } catch {
    return seedState()
  }
}

function writeState(next) {
  if (!canStore()) return next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Private browsing/storage pressure should never break the public feed.
  }
  return next
}

function seedState() {
  return {
    posts: {},
    creators: {},
    tags: {},
    mediaTypes: {},
    searches: {},
    ops: [],
    updatedAt: '',
  }
}

function signalId(signal = {}) {
  return signal.cloudId || signal.id || signal.title || `signal-${Date.now()}`
}

function creatorKey(signal = {}) {
  return normalizeHandle(signal.entityHandle || signal.creatorHandle || signal.handle || signal.entityName || signal.creator || 'static')
}

function postType(signal = {}) {
  return String(signal.postType || signal.type || 'post').toLowerCase()
}

function tagTokens(signal = {}) {
  const raw = [signal.tags, signal.text, signal.caption, signal.title].filter(Boolean).join(' ')
  const matches = raw.match(/#[a-zA-Z0-9._-]+/g) || []
  return [...new Set(matches.map((tag) => tag.toLowerCase()))].slice(0, 12)
}

async function authorizationHeaders() {
  if (!isSupabaseConfigured || !supabase) return {}
  try {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

function queueRemoteLaunchEvent(table, payload = {}) {
  if (typeof window === 'undefined' || !isSupabaseConfigured) return
  remoteQueue.push({
    table,
    route: routePath(),
    ...payload,
  })
  while (remoteQueue.length > 80) remoteQueue.shift()
  window.clearTimeout(remoteFlushTimer)
  remoteFlushTimer = window.setTimeout(() => {
    flushRemoteLaunchEvents().catch(() => {})
  }, 1600)
}

export async function flushRemoteLaunchEvents() {
  if (typeof window === 'undefined' || !remoteQueue.length) return { ok: true, stored: 0 }
  const events = remoteQueue.splice(0, 40)
  try {
    const headers = await authorizationHeaders()
    const response = await fetch('/.netlify/functions/record-launch-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ events }),
      keepalive: events.length <= 12,
    })
    if (!response.ok) throw new Error('Launch event flush failed.')
    return response.json().catch(() => ({ ok: true, stored: events.length }))
  } catch (error) {
    remoteQueue.unshift(...events.slice(-40))
    throw error
  }
}

function flushRemoteLaunchEventsOnExit() {
  if (typeof window === 'undefined' || !remoteQueue.length) return
  const events = remoteQueue.splice(0, 12)
  const body = JSON.stringify({ events })
  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon('/.netlify/functions/record-launch-event', new Blob([body], { type: 'application/json' }))
    if (sent) return
  }
  fetch('/.netlify/functions/record-launch-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}

function bump(bucket = {}, key, amount = 1) {
  if (!key) return bucket
  return {
    ...bucket,
    [key]: {
      score: Number(bucket[key]?.score || 0) + amount,
      count: Number(bucket[key]?.count || 0) + 1,
      updatedAt: nowIso(),
    },
  }
}

function baseSignalStats(signal = {}) {
  const reactions = signal.reactions || {}
  return {
    likes: Number(signal.previewReactionCount || 0) + Object.values(reactions).filter(Boolean).length,
    comments: Number(signal.previewCommentCount || signal.comments?.length || 0),
    shares: Number(signal.previewShareCount || 0),
    saves: reactions.saved ? 1 : 0,
    views: Number(signal.previewViewCount || signal.stats?.views || 0) || 0,
  }
}

export function recordFeedImpression(signal = {}) {
  return recordFeedEngagement(signal, 'impression')
}

export function recordFeedEngagement(signal = {}, eventType = 'impression', detail = {}) {
  const state = readState()
  const id = signalId(signal)
  const weight = Number(eventWeights[eventType] ?? 1)
  const creator = creatorKey(signal)
  const type = postType(signal)
  const tags = tagTokens(signal)
  const currentPost = state.posts[id] || {}
  const nextPost = {
    ...currentPost,
    id,
    title: signal.title || currentPost.title || '',
    creator,
    postType: type,
    impressions: Number(currentPost.impressions || 0) + (eventType === 'impression' ? 1 : 0),
    dwellSeconds: Number(currentPost.dwellSeconds || 0) + Number(detail.seconds || 0),
    engagementScore: Number(currentPost.engagementScore || 0) + weight,
    lastEvent: eventType,
    lastSeenAt: nowIso(),
  }

  const nextState = {
    ...state,
    posts: { ...state.posts, [id]: nextPost },
    creators: bump(state.creators, creator, weight),
    mediaTypes: bump(state.mediaTypes, type, Math.max(1, weight / 2)),
    tags: tags.reduce((acc, tag) => bump(acc, tag, weight), state.tags || {}),
    updatedAt: nowIso(),
  }

  queueRemoteLaunchEvent('content_impressions', {
    targetId: id,
    targetType: 'signal',
    sessionId: sessionId(),
    eventType,
    dwellSeconds: Number(detail.seconds || 0),
    data: {
      title: signal.title || '',
      creator,
      postType: type,
      tags,
      localId: signal.id || '',
      cloudId: signal.cloudId || '',
      scoreWeight: weight,
      ...detail,
    },
  })

  return writeState(nextState)
}

function recencyScore(signal = {}) {
  const created = new Date(signal.createdAt || 0).getTime()
  if (!created) return 0
  const ageHours = Math.max(1, (Date.now() - created) / 36e5)
  return Math.max(0, 30 - Math.log2(ageHours) * 5)
}

export function forYouScore(signal = {}) {
  const state = readState()
  const id = signalId(signal)
  const creator = creatorKey(signal)
  const type = postType(signal)
  const tags = tagTokens(signal)
  const stats = baseSignalStats(signal)
  const postState = state.posts[id] || {}
  const creatorAffinity = Number(state.creators?.[creator]?.score || 0)
  const typeAffinity = Number(state.mediaTypes?.[type]?.score || 0)
  const tagAffinity = tags.reduce((sum, tag) => sum + Number(state.tags?.[tag]?.score || 0), 0)
  const socialProof = stats.likes * 2 + stats.comments * 3 + stats.shares * 4 + stats.saves * 5 + Math.min(stats.views, 200) * 0.04
  const localProof = Number(postState.engagementScore || 0) + Number(postState.dwellSeconds || 0) * 0.2
  const founderBoost = normalizeHandle(signal.entityHandle) === 'mrstone' || signal.creatorId === 'official-mr-stone' ? 10 : 0
  return recencyScore(signal) + socialProof + localProof + founderBoost + creatorAffinity * 0.08 + typeAffinity * 0.05 + tagAffinity * 0.06
}

export function rankForYouSignals(signals = []) {
  return [...signals].sort((a, b) => {
    const scoreDelta = forYouScore(b) - forYouScore(a)
    if (scoreDelta) return scoreDelta
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })
}

export function getForYouReason(signal = {}) {
  const state = readState()
  const creator = creatorKey(signal)
  const tags = tagTokens(signal)
  const type = postType(signal)
  const topTag = tags.find((tag) => Number(state.tags?.[tag]?.score || 0) > 0)
  if (Number(state.creators?.[creator]?.score || 0) > 15) return `Because you engage with @${creator}`
  if (topTag) return `Trending for ${topTag}`
  if (Number(state.mediaTypes?.[type]?.score || 0) > 10) return `More ${type.replace('-', ' ')} posts`
  if (signal.previewShareCount || signal.previewReactionCount) return 'Rising across STATIC'
  return 'For You'
}

export function recordSearchQuery(query = '', detail = {}) {
  const clean = String(query || '').trim().toLowerCase().slice(0, 80)
  if (!clean) return readState()
  const state = readState()
  queueRemoteLaunchEvent('search_events', {
    query: clean,
    filter: detail.filter || '',
    resultCount: Number(detail.resultCount || 0),
    clickedTargetId: detail.clickedTargetId || '',
    clickedTargetType: detail.clickedTargetType || '',
    data: detail.data || {},
  })
  return writeState({
    ...state,
    searches: bump(state.searches || {}, clean, 2),
    updatedAt: nowIso(),
  })
}

export function getTrendingTokens(signals = [], limit = 12) {
  const state = readState()
  const counts = new Map()
  signals.forEach((signal) => tagTokens(signal).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)))
  Object.entries(state.tags || {}).forEach(([tag, row]) => counts.set(tag, (counts.get(tag) || 0) + Number(row.score || 0)))
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag)
}

export function getCreatorAnalytics(creator = {}, signals = []) {
  const state = readState()
  const handle = normalizeHandle(creator.handle || creator.username || creator.displayName)
  const creatorSignals = signals.filter((signal) => normalizeHandle(signal.entityHandle || signal.creatorHandle || signal.entityName) === handle || signal.creatorId === creator.id)
  const totals = creatorSignals.reduce((acc, signal) => {
    const id = signalId(signal)
    const stats = baseSignalStats(signal)
    const local = state.posts[id] || {}
    acc.views += stats.views + Number(local.impressions || 0)
    acc.likes += stats.likes
    acc.comments += stats.comments
    acc.shares += stats.shares
    acc.saves += stats.saves
    acc.dwellSeconds += Number(local.dwellSeconds || 0)
    acc.radioPlays += Number(signal.radioPlayCount || signal.stats?.radioPlays || 0)
    return acc
  }, { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, dwellSeconds: 0, radioPlays: 0 })

  const engagement = totals.likes + totals.comments + totals.shares + totals.saves
  const retention = totals.views ? Math.min(98, Math.round((totals.dwellSeconds / Math.max(1, totals.views * 12)) * 100)) : creatorSignals.length ? 41 : 0
  const topPost = [...creatorSignals].sort((a, b) => forYouScore(b) - forYouScore(a))[0]
  return {
    posts: creatorSignals.length,
    views: totals.views,
    engagement,
    comments: totals.comments,
    shares: totals.shares,
    saves: totals.saves,
    radioPlays: totals.radioPlays,
    retention,
    topPostTitle: topPost?.title || topPost?.text || 'No posts yet',
  }
}

export function getMediaProcessingSummary(signals = []) {
  return signals.reduce((acc, signal) => {
    const status = signal.cloudUploadStatus || (signal.mediaUrls?.length ? 'uploaded' : signal.mediaRefs?.length || signal.mediaId ? 'local' : 'none')
    if (status === 'uploaded') acc.uploaded += 1
    else if (status === 'uploading') acc.processing += 1
    else if (status === 'failed') acc.failed += 1
    else if (status === 'local') acc.localOnly += 1
    if (signal.radioTrackStatus === 'submitted_for_review') acc.radioReview += 1
    return acc
  }, { uploaded: 0, processing: 0, failed: 0, localOnly: 0, radioReview: 0 })
}

export function buildLaunchReadinessSnapshot({ configured = false, user = null, backend = {}, signals = [] } = {}) {
  const media = getMediaProcessingSummary(signals)
  return [
    ['Recommendation engine', 'Active v1', 'Local For You scoring tracks impressions, watch time, creator affinity, tags, and media type affinity. Supabase event tables added for production scoring.'],
    ['Real-time scale', backend.liveRooms?.ready ? 'Cloud ready' : 'Partial', backend.liveRooms?.ready ? 'Live rooms and presence tables are available.' : 'Presence and LiveKit shell exist; production fanout needs live rooms migration and load history.'],
    ['Media processing', media.uploaded ? 'Active v1' : 'Partial', media.uploaded ? 'Cloud uploads and radio review queue are active.' : 'Upload flow exists; adaptive transcoding worker is the next infrastructure piece.'],
    ['Native apps', 'PWA ready', 'Installable web app manifest and service worker are ready. App Store shells come after launch QA.'],
    ['Trust and safety', backend.reports?.ready ? 'Cloud ready' : 'Partial', backend.reports?.ready ? 'Reports table is available.' : 'Report flow exists; appeals/takedown tables added for launch ops.'],
    ['Creator analytics', 'Active v1', 'Profile analytics estimate views, engagement, retention, saves, shares, comments, and radio plays.'],
    ['Monetization', backend.orders?.ready ? 'Cloud ready' : 'Partial', backend.orders?.ready ? 'Stripe checkout and wallet tables are available.' : 'Stripe functions exist; coins/payout ledger needs migration verification.'],
    ['Messaging polish', backend.directThreads?.ready ? 'Cloud ready' : 'Partial', backend.directThreads?.ready ? 'Threads/messages/read state are available.' : 'Messaging UI exists; media messages and calls need live room linkage.'],
    ['Search/discovery', 'Active v1', 'Search supports creators, posts, hashtags, media type filters, and trending tokens.'],
    ['Battle testing', configured ? 'Needs traffic' : 'Local only', user ? 'Run launch audit, provider tests, backups, and monitoring after deployment.' : 'Owner login required for final production checks.'],
  ]
}

if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushRemoteLaunchEventsOnExit()
  })
  window.addEventListener('pagehide', flushRemoteLaunchEventsOnExit)
}
