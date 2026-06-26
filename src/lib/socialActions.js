import {
  addSignalComment,
  getCatalogAction,
  toggleCatalogAction,
  toggleFollow,
  toggleReminder,
  updateSignal,
} from './staticStore'
import { isSupabaseConfigured } from './supabaseClient'
import {
  addCloudComment,
  addCloudSignalPoints,
  createCloudRadioTrack,
  createCloudNotification,
  createCloudModerationReport,
  createCloudProviderJob,
  getCloudDirectMessages,
  getCloudDirectThreads,
  deleteCloudFollow,
  deleteCloudReaction,
  deleteCloudSavedItem,
  getCloudNotifications,
  getCloudPresence,
  markCloudNotificationsRead,
  markCloudDirectThreadRead,
  recordCloudRadioPlayEvent,
  searchCloudProfiles,
  sendCloudDirectMessage,
  syncCloudMarketplaceAction,
  syncCloudReminder,
  upsertCloudFollow,
  upsertCloudLiveEvent,
  upsertCloudPresence,
  upsertCloudPushSubscription,
  upsertCloudReaction,
  upsertCloudRadioStation,
  upsertCloudSavedItem,
  uploadCloudMedia,
} from './storage/supabaseStore'

function canUseCloud(user) {
  return Boolean(isSupabaseConfigured && user?.id)
}

function cloudSignalId(signal) {
  return signal?.cloudId || (/^[0-9a-f-]{36}$/i.test(String(signal?.id || '')) ? signal.id : '')
}

function socialTargetId(target) {
  return target?.cloudId || target?.id || target?.targetId || ''
}

export function normalizeCloudNotification(row) {
  const detail = row?.data || {}
  return {
    id: row?.id || detail.id,
    type: row?.kind || detail.type || 'activity',
    title: row?.title || detail.title || 'STATIC activity',
    text: row?.body || detail.text || detail.body || '',
    actorName: detail.actorName || detail.actor_name || 'STATIC',
    actorHandle: detail.actorHandle || detail.actor_handle || '',
    actorAvatarUrl: detail.actorAvatarUrl || detail.actor_avatar_url || '',
    signalDelta: Number(detail.signalDelta || detail.signal_delta || 0),
    route: row?.route || detail.route || '/notifications',
    read: Boolean(row?.read_at || detail.read),
    createdAt: row?.created_at || detail.createdAt || new Date().toISOString(),
  }
}

export async function recordSocialActivity(user, activity = {}) {
  if (!canUseCloud(user)) return { cloud: null, errors: [] }
  const tasks = []
  if (activity.signal || activity.points || activity.signalDelta) {
    const signalEvent = activity.signal || activity
    tasks.push(
      addCloudSignalPoints(user.id, {
        ...signalEvent,
        points: signalEvent.points || activity.points || activity.signalDelta,
      }).then((result) => ['signal', result]),
    )
  }
  if (activity.notification) {
    tasks.push(createCloudNotification(user.id, activity.notification).then((result) => ['notification', result]))
  }
  if (!tasks.length) return { cloud: null, errors: [] }
  const settled = await Promise.allSettled(tasks)
  return settled.reduce((acc, item) => {
    if (item.status === 'fulfilled') {
      const [key, value] = item.value
      acc.cloud[key] = value
    } else {
      acc.errors.push(item.reason)
    }
    return acc
  }, { cloud: {}, errors: [] })
}

export async function getSocialActivityNotifications(user, limit = 50) {
  if (!canUseCloud(user)) return []
  const rows = await getCloudNotifications(user.id, limit)
  return rows.map(normalizeCloudNotification)
}

export async function searchSocialProfiles(user, query) {
  if (!canUseCloud(user)) return []
  return searchCloudProfiles(query)
}

export async function getSocialMessageThreads(user) {
  if (!canUseCloud(user)) return []
  return getCloudDirectThreads(user.id)
}

export async function getSocialThreadMessages(user, threadId) {
  if (!canUseCloud(user)) return []
  return getCloudDirectMessages(threadId)
}

export async function sendSocialMessage(user, recipient, body) {
  if (!canUseCloud(user)) throw new Error('Log in before sending messages.')
  return sendCloudDirectMessage(user.id, recipient, body)
}

export async function markSocialThreadRead(user, threadId) {
  if (!canUseCloud(user)) return true
  return markCloudDirectThreadRead(user.id, threadId)
}

export async function markSocialActivityRead(user) {
  if (!canUseCloud(user)) return true
  return markCloudNotificationsRead(user.id)
}

export async function updateSocialPresence(user, profile, detail = {}) {
  if (!canUseCloud(user)) return null
  return upsertCloudPresence(user.id, {
    displayName: profile?.display_name || profile?.displayName || user?.user_metadata?.display_name || user.email?.split('@')[0] || 'STATIC Creator',
    username: profile?.username || user?.user_metadata?.username || '',
    avatarUrl: profile?.avatar_url || user?.user_metadata?.avatar_url || '',
    ...detail,
  })
}

export async function saveSocialPushSubscription(user, subscription, detail = {}) {
  if (!canUseCloud(user)) throw new Error('Log in to save notification delivery.')
  return upsertCloudPushSubscription(user.id, subscription, detail)
}

export async function getActiveSocialPresence(limit = 40) {
  const rows = await getCloudPresence(limit)
  return rows.map((row) => ({
    id: row.owner_id,
    displayName: row.display_name || 'STATIC Creator',
    handle: row.username ? `@${row.username}` : '@static.creator',
    avatarUrl: row.avatar_url || '',
    route: row.route || '/feed',
    status: row.status || 'online',
    lastSeenAt: row.last_seen_at,
    expiresAt: row.expires_at,
    data: row.data || {},
  }))
}

export async function toggleSocialFollow(user, targetId, detail = {}) {
  const next = toggleFollow(targetId, detail)
  if (!canUseCloud(user)) return { local: next, cloud: null }
  if (next) {
    const cloud = await upsertCloudFollow(user.id, {
      ...detail,
      targetId,
      targetType: detail.targetType || 'entity',
      title: detail.title || targetId,
      route: detail.route || '/discover',
    })
    return { local: next, cloud }
  }
  await deleteCloudFollow(user.id, targetId, detail.targetType || 'entity')
  return { local: null, cloud: null }
}

export async function toggleSignalReaction(user, signal, reactionKey) {
  const currentReactions = signal.reactions || {}
  const nextActive = !currentReactions[reactionKey]
  const nextSignal = updateSignal(signal.id, {
    reactions: {
      ...currentReactions,
      [reactionKey]: nextActive,
    },
  })

  if (!canUseCloud(user)) return { local: nextSignal, cloud: null }

  const targetId = cloudSignalId(signal) || signal.id
  const payload = {
    signalId: cloudSignalId(signal),
    targetId,
    targetType: 'signal',
    reactionType: reactionKey,
    data: {
      signalTitle: signal.title,
      route: `/feed#${signal.id}`,
      localId: signal.localId || signal.id,
    },
  }

  if (nextActive) {
    const cloud = await upsertCloudReaction(user.id, payload)
    if (reactionKey === 'saved') {
      await upsertCloudSavedItem(user.id, {
        itemId: targetId,
        itemType: 'signal',
        title: signal.title || signal.text || 'Saved Signal',
        route: `/feed#${signal.id}`,
        signal,
      })
    }
    return { local: nextSignal, cloud }
  }

  await deleteCloudReaction(user.id, payload)
  if (reactionKey === 'saved') await deleteCloudSavedItem(user.id, targetId, 'signal').catch(() => null)
  return { local: nextSignal, cloud: null }
}

export async function addSocialComment(user, signal, comment) {
  const local = addSignalComment(signal.id, comment)
  if (!canUseCloud(user)) return { local, cloud: null }
  const signalId = cloudSignalId(signal)
  if (!signalId) return { local, cloud: null }
  const cloud = await addCloudComment(user.id, {
    ...comment,
    signalId,
    targetId: signalId,
    targetType: 'signal',
  })
  return { local, cloud }
}

export async function toggleSocialReminder(user, itemId, detail = {}) {
  const active = toggleReminder(itemId, detail)
  if (!canUseCloud(user)) return { local: active, cloud: null }
  const cloud = await syncCloudReminder(user.id, itemId, detail, active)
  return { local: active, cloud }
}

export async function syncRadioStation(user, station) {
  if (!canUseCloud(user)) return null
  return upsertCloudRadioStation(user.id, station)
}

export async function recordRadioStationPlay(user, station, eventType = 'play', detail = {}) {
  if (!canUseCloud(user)) return null
  return recordCloudRadioPlayEvent(user.id, station, eventType, detail)
}

export async function createRadioTrackShell(user, track, rights = {}) {
  if (!canUseCloud(user)) throw new Error('Sign in before creating radio tracks.')
  return createCloudRadioTrack(user.id, track, rights)
}

export async function queueRadioMusicGenerationJob(user, prompt, options = {}) {
  if (!canUseCloud(user)) throw new Error('Sign in before queueing music generation.')
  return createCloudProviderJob(user.id, {
    provider: options.provider || 'music-provider-adapter',
    jobType: 'music_generation',
    prompt,
    approved: Boolean(options.approved),
    costCents: options.costCents || 0,
    input: {
      route: '/radio',
      outputType: 'radio_track',
      ...options,
    },
  })
}

export async function toggleSocialCatalogAction(user, item, action) {
  const itemId = item.id || item.itemId
  const next = toggleCatalogAction(itemId, action)
  const current = {
    ...item,
    ...getCatalogAction(itemId),
    ...next,
    itemId,
    title: item.title || item.name,
    route: item.route || '/marketplace',
  }
  if (!canUseCloud(user)) return { local: next, cloud: null }
  const cloud = await syncCloudMarketplaceAction(user.id, itemId, current)
  return { local: next, cloud }
}

export async function uploadSocialMedia(user, { bucket = 'media', entityId = '', channelId = '', file, metadata = {} }) {
  if (!canUseCloud(user) || !file) return null
  return uploadCloudMedia({
    bucket,
    ownerId: user.id,
    entityId,
    channelId,
    file,
    metadata,
  })
}

export async function syncSocialLiveEvent(user, entity, live) {
  if (!canUseCloud(user) || !entity) return null
  return upsertCloudLiveEvent(user.id, entity, live)
}

export async function queueSocialProviderJob(user, job) {
  if (!canUseCloud(user)) throw new Error('Sign in before queueing provider jobs.')
  return createCloudProviderJob(user.id, job)
}

export async function reportSocialContent(user, target, report) {
  if (!canUseCloud(user)) throw new Error('Sign in before reporting content.')
  return createCloudModerationReport(user.id, {
    targetId: socialTargetId(target),
    targetType: target?.targetType || target?.type || 'signal',
    route: target?.route || '/discover',
    ...report,
  })
}

export async function assistSocialPost(session, draft) {
  if (!session?.access_token) throw new Error('Log in to use the AI post assistant.')
  const response = await fetch('/.netlify/functions/assist-social-post', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draft),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    const error = new Error(data.error || 'AI post assistant is unavailable.')
    error.detail = data
    throw error
  }
  return data
}

export async function startStripeCheckout(session, product) {
  if (!session?.access_token) throw new Error('Log in before checkout.')
  const response = await fetch('/.netlify/functions/create-stripe-checkout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    const error = new Error(data.error || 'Checkout is unavailable.')
    error.detail = data
    throw error
  }
  if (data.url) window.location.assign(data.url)
  return data
}

export async function getStaticWallet(session) {
  if (!session?.access_token) return { ok: false, ready: false, wallet: null, ledger: [] }
  const response = await fetch('/.netlify/functions/get-static-wallet', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    const error = new Error(data.error || 'Static Coin wallet is unavailable.')
    error.detail = data
    throw error
  }
  return data
}

export async function getRadioAdminConsole(session) {
  if (!session?.access_token) throw new Error('Log in as owner before opening radio admin.')
  const response = await fetch('/.netlify/functions/radio-admin', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    const error = new Error(data.error || 'STATIC Radio admin is unavailable.')
    error.detail = data
    throw error
  }
  return data
}

export async function reviewRadioTrack(session, payload) {
  if (!session?.access_token) throw new Error('Log in as owner before reviewing radio tracks.')
  const response = await fetch('/.netlify/functions/radio-admin', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    const error = new Error(data.error || 'Radio review action failed.')
    error.detail = data
    throw error
  }
  return data
}
