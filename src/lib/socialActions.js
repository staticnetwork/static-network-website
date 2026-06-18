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
  createCloudRadioTrack,
  createCloudModerationReport,
  createCloudProviderJob,
  deleteCloudFollow,
  deleteCloudReaction,
  deleteCloudSavedItem,
  recordCloudRadioPlayEvent,
  syncCloudMarketplaceAction,
  syncCloudReminder,
  upsertCloudFollow,
  upsertCloudLiveEvent,
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
