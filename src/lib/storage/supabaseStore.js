import { isSupabaseConfigured, supabase } from '../supabaseClient'

function requireClient() {
  if (!supabase) throw new Error('Cloud access is not configured.')
  return supabase
}

function entityToRow(entity, ownerId) {
  return {
    id: entity.cloudId || undefined,
    owner_id: ownerId,
    name: entity.name,
    handle: entity.handle.replace(/^@/, ''),
    role: entity.role,
    genre: entity.genre,
    company_brand: entity.companyBrand || entity.company,
    title_position: entity.titlePosition || entity.title,
    bio: entity.bio,
    channel_name: entity.channelName,
    channel_tagline: entity.channelTagline,
    avatar_config: entity.avatarConfig,
    profile_image_url: entity.profileImageUrl || null,
    signal_score: entity.signalScore,
    rank: entity.rank,
    status: entity.status,
    badge: entity.badge,
    metadata: {
      local_id: entity.id,
      backstory: entity.backstory,
      fanbase_name: entity.fanbaseName || entity.fanbase,
      links: entity.links || [],
      channel_theme: entity.channelTheme || {},
    },
  }
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''))
}

function localIdentity(item) {
  return item?.localId || item?.metadata?.local_id || item?.id || ''
}

function cloudEntityId(entityId, entityIdMap) {
  if (!entityId) return null
  return entityIdMap.get(entityId) || (isUuid(entityId) ? entityId : null)
}

function cleanTarget(value) {
  return String(value || '').trim().slice(0, 160)
}

function normalizeRoute(route, fallback = '/discover') {
  return String(route || fallback).startsWith('/') ? String(route || fallback) : fallback
}

function slugify(value) {
  return cleanTarget(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cloudSignalToNetworkCard(row, entity = {}) {
  const handle = entity.handle ? `@${entity.handle}` : '@cloud.entity'
  const caption = row.caption || row.text || ''
  return {
    id: row.id,
    cloudId: row.id,
    publicCloud: true,
    local: true,
    category: 'Entities',
    creator: entity.name || 'Cloud Entity',
    handle,
    entityName: entity.name || 'Cloud Entity',
    entityHandle: handle,
    company: entity.company_brand || '',
    badge: entity.badge || 'PUBLIC CLOUD SIGNAL',
    signalScore: entity.signal_score || 'CLOUD',
    avatarConfig: entity.avatar_config || {},
    profileImageUrl: entity.profile_image_url || '',
    entityId: row.entity_id,
    channelId: row.channel_id,
    ownerId: row.owner_id,
    type: row.type || 'Signal',
    postType: row.type || 'Signal',
    title: row.title || caption || 'Public cloud signal',
    text: row.text || caption,
    caption,
    description: caption,
    mediaUrls: row.media_urls || [],
    avatarPose: row.avatar_pose || 'Idle',
    visibility: row.visibility || 'Public',
    reactions: row.stats || {},
    stats: {
      views: row.stats?.views || 'CLOUD',
      reactions: row.stats?.reactions || row.stats?.likes || 'PUBLIC',
      remixes: row.stats?.remixes || 'SYNC',
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: row.metadata?.tags || 'PUBLIC CLOUD',
  }
}

function projectToRow(project, ownerId, entityIdMap) {
  const localId = localIdentity(project)
  return {
    owner_id: ownerId,
    entity_id: cloudEntityId(project.entityId, entityIdMap),
    local_id: localId || null,
    type: project.type || 'studio',
    title: project.title || 'Untitled Project',
    prompt: project.prompt || '',
    style: project.style || '',
    output_type: project.outputType || '',
    status: project.status || 'Preview saved',
    route: project.route || '/studio',
    data: {
      ...project,
      localId,
      cloudId: project.cloudId || null,
    },
    updated_at: new Date().toISOString(),
  }
}

export async function getCloudProfile(userId) {
  const client = requireClient()
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function saveCloudProfile(userId, profile) {
  const client = requireClient()
  const { data, error } = await client
    .from('profiles')
    .upsert({
      id: userId,
      display_name: profile.displayName,
      username: profile.username,
      avatar_url: profile.avatarUrl || null,
      banner_url: profile.bannerUrl || null,
      bio: profile.bio || null,
      website_url: profile.websiteUrl || null,
	      account_type: profile.accountType || 'Creator',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

function profileFromRow(row = {}) {
  return {
    id: row.id,
    displayName: row.display_name || 'STATIC Creator',
    handle: row.username ? `@${row.username}` : '@static.creator',
    username: row.username || '',
    avatarUrl: row.avatar_url || '',
    bannerUrl: row.banner_url || '',
    bio: row.bio || '',
    websiteUrl: row.website_url || '',
    accountType: row.account_type || 'Creator',
    signalScore: row.signal_score || 0,
  }
}

export async function searchCloudProfiles(query, limit = 12) {
  const client = requireClient()
  const term = cleanTarget(query).replace(/[%_,]/g, '')
  if (!term) return []
  const { data, error } = await client
    .from('profiles')
    .select('id,display_name,username,avatar_url,banner_url,bio,website_url,account_type,signal_score')
    .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
    .limit(limit)
  if (error) throw error
  return (data || []).map(profileFromRow)
}

export async function getCloudEntities(ownerId) {
  const client = requireClient()
  const { data, error } = await client.from('entities').select('*').eq('owner_id', ownerId).order('created_at')
  if (error) throw error
  return data || []
}

export async function getCloudNetwork(ownerId) {
  const client = requireClient()
  const [
    entitiesResult,
    channelsResult,
    signalsResult,
    worldsResult,
    dropsResult,
    projectsResult,
    marketplaceActionsResult,
    followsResult,
    remindersResult,
  ] = await Promise.all([
    client.from('entities').select('*').eq('owner_id', ownerId).order('created_at'),
    client.from('channels').select('*').eq('owner_id', ownerId).order('created_at'),
    client.from('signals').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
    client.from('worlds').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
    client.from('drops').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
    client.from('projects').select('*').eq('owner_id', ownerId).order('updated_at', { ascending: false }),
    client.from('marketplace_actions').select('*').eq('owner_id', ownerId).order('updated_at', { ascending: false }),
    client.from('follows').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
    client.from('reminders').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
  ])

  const failure = [
    entitiesResult,
    channelsResult,
    signalsResult,
    worldsResult,
    dropsResult,
    projectsResult,
    marketplaceActionsResult,
    followsResult,
    remindersResult,
  ].find((result) => result.error)
  if (failure?.error) throw failure.error
  const entityById = new Map((entitiesResult.data || []).map((row) => [row.id, row]))

  return {
    entities: (entitiesResult.data || []).map((row) => ({
      id: row.id,
      cloudId: row.id,
      localId: row.metadata?.local_id,
      ownerId: row.owner_id,
      name: row.name,
      handle: `@${row.handle}`,
      role: row.role,
      genre: row.genre,
      company: row.company_brand,
      companyBrand: row.company_brand,
      title: row.title_position,
      titlePosition: row.title_position,
      bio: row.bio,
      channelName: row.channel_name,
      channelTagline: row.channel_tagline,
      avatarConfig: row.avatar_config,
      profileImageUrl: row.profile_image_url,
      signalScore: row.signal_score,
      rank: row.rank,
      status: row.status,
      badge: row.badge,
      backstory: row.metadata?.backstory || '',
      fanbaseName: row.metadata?.fanbase_name || '',
      fanbase: row.metadata?.fanbase_name || '',
      links: row.metadata?.links || [],
      channelTheme: row.metadata?.channel_theme || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    channels: (channelsResult.data || []).map((row) => ({
      id: row.id,
      cloudId: row.id,
      localId: row.metadata?.local_id,
      entityId: row.entity_id,
      ownerId: row.owner_id,
      handle: `@${row.handle}`,
      name: row.display_name,
      displayName: row.display_name,
      tagline: row.tagline,
      bannerUrl: row.banner_url,
      profileImageUrl: row.profile_image_url,
      theme: row.theme,
      featuredSignalId: row.featured_signal_id,
      modules: row.modules,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    signals: (signalsResult.data || []).map((row) => ({
      entityName: entityById.get(row.entity_id)?.name || 'Cloud Entity',
      entityHandle: `@${entityById.get(row.entity_id)?.handle || 'entity'}`,
      company: entityById.get(row.entity_id)?.company_brand || '',
      badge: entityById.get(row.entity_id)?.badge || 'ENTITY SIGNAL',
      signalScore: entityById.get(row.entity_id)?.signal_score || 'CLOUD',
      avatarConfig: entityById.get(row.entity_id)?.avatar_config || {},
      profileImageUrl: entityById.get(row.entity_id)?.profile_image_url || '',
      id: row.id,
      cloudId: row.id,
      localId: row.metadata?.local_id,
      entityId: row.entity_id,
      channelId: row.channel_id,
      ownerId: row.owner_id,
      type: row.type,
      postType: row.type,
      title: row.title,
      text: row.text,
      caption: row.caption,
      mediaUrls: row.media_urls,
      avatarPose: row.avatar_pose,
      visibility: row.visibility,
      reactions: row.stats,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ...row.metadata,
    })),
    worlds: (worldsResult.data || []).map((row) => ({ ...row.data, id: row.id, cloudId: row.id, localId: row.data?.id || row.data?.localId, entityId: row.entity_id, createdAt: row.created_at })),
    drops: (dropsResult.data || []).map((row) => ({ ...row.data, id: row.id, cloudId: row.id, localId: row.data?.id || row.data?.localId, entityId: row.entity_id, createdAt: row.created_at })),
    projects: (projectsResult.data || []).map((row) => ({
      ...row.data,
      id: row.id,
      cloudId: row.id,
      localId: row.local_id || row.data?.id || row.data?.localId,
      entityId: row.entity_id || row.data?.entityId || '',
      type: row.type,
      title: row.title,
      prompt: row.prompt,
      style: row.style,
      outputType: row.output_type,
      status: row.status,
      route: row.route,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    catalogActions: Object.fromEntries((marketplaceActionsResult.data || []).map((row) => [row.item_id, {
      ...(row.data || {}),
      saved: row.saved,
      requested: row.requested,
      followed: row.followed,
      updatedAt: row.updated_at,
    }])),
    follows: Object.fromEntries((followsResult.data || []).map((row) => [`${row.target_type}:${row.target_id}`, {
      ...(row.data || {}),
      id: `${row.target_type}:${row.target_id}`,
      targetId: row.target_id,
      targetType: row.target_type,
      title: row.title,
      route: row.route,
      createdAt: row.created_at,
    }])),
    reminders: Object.fromEntries((remindersResult.data || []).map((row) => [row.item_id, {
      ...(row.data || {}),
      id: row.item_id,
      kind: row.kind,
      title: row.title,
      detail: row.detail,
      route: row.route,
      createdAt: row.created_at,
    }])),
  }
}

export async function getPublicCloudSignals(limit = 40) {
  if (!isSupabaseConfigured) return []
  const client = requireClient()
  const { data: rows, error } = await client
    .from('signals')
    .select('*')
    .eq('visibility', 'Public')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  const entityIds = [...new Set((rows || []).map((row) => row.entity_id).filter(Boolean))]
  let entityById = new Map()
  if (entityIds.length) {
    const { data: entities, error: entitiesError } = await client
      .from('entities')
      .select('id,name,handle,company_brand,badge,signal_score,avatar_config,profile_image_url')
      .in('id', entityIds)
    if (entitiesError) throw entitiesError
    entityById = new Map((entities || []).map((row) => [row.id, row]))
  }

  return (rows || []).map((row) => cloudSignalToNetworkCard(row, entityById.get(row.entity_id)))
}

export async function upsertCloudFollow(ownerId, follow) {
  const client = requireClient()
  const targetId = cleanTarget(follow.targetId || follow.target_id || follow.id)
  const targetType = cleanTarget(follow.targetType || follow.target_type || 'entity') || 'entity'
  if (!ownerId || !targetId) return null
  const { data, error } = await client.from('follows').upsert({
    owner_id: ownerId,
    target_id: targetId,
    target_type: targetType,
    title: follow.title || targetId,
    route: normalizeRoute(follow.route),
    data: follow,
  }, { onConflict: 'owner_id,target_id,target_type' }).select().single()
  if (error) throw error
  return data
}

export async function deleteCloudFollow(ownerId, targetId, targetType = 'entity') {
  const client = requireClient()
  const { error } = await client
    .from('follows')
    .delete()
    .eq('owner_id', ownerId)
    .eq('target_id', cleanTarget(targetId))
    .eq('target_type', cleanTarget(targetType) || 'entity')
  if (error) throw error
  return true
}

export async function upsertCloudSavedItem(ownerId, item) {
  const client = requireClient()
  const itemId = cleanTarget(item.itemId || item.item_id || item.id)
  const itemType = cleanTarget(item.itemType || item.item_type || item.type || 'signal') || 'signal'
  if (!ownerId || !itemId) return null
  const { data, error } = await client.from('saved_items').upsert({
    owner_id: ownerId,
    item_id: itemId,
    item_type: itemType,
    title: item.title || item.name || itemId,
    route: normalizeRoute(item.route),
    data: item,
  }, { onConflict: 'owner_id,item_id,item_type' }).select().single()
  if (error) throw error
  return data
}

export async function deleteCloudSavedItem(ownerId, itemId, itemType = 'signal') {
  const client = requireClient()
  const { error } = await client
    .from('saved_items')
    .delete()
    .eq('owner_id', ownerId)
    .eq('item_id', cleanTarget(itemId))
    .eq('item_type', cleanTarget(itemType) || 'signal')
  if (error) throw error
  return true
}

export async function upsertCloudReaction(ownerId, reaction) {
  const client = requireClient()
  const targetId = cleanTarget(reaction.targetId || reaction.target_id || reaction.signalId || reaction.signal_id)
  const signalId = isUuid(reaction.signalId || reaction.signal_id || targetId) ? (reaction.signalId || reaction.signal_id || targetId) : null
  const targetType = cleanTarget(reaction.targetType || reaction.target_type || 'signal') || 'signal'
  const reactionType = cleanTarget(reaction.reactionType || reaction.reaction_type || 'amplified') || 'amplified'
  if (!ownerId || !targetId) return null
  const { data, error } = await client.from('signal_reactions').upsert({
    owner_id: ownerId,
    signal_id: signalId,
    target_id: targetId,
    target_type: targetType,
    reaction_type: reactionType,
    data: reaction.data || reaction,
  }, { onConflict: 'owner_id,target_id,target_type,reaction_type' }).select().single()
  if (error) throw error
  return data
}

export async function deleteCloudReaction(ownerId, reaction) {
  const client = requireClient()
  const targetId = cleanTarget(reaction.targetId || reaction.target_id || reaction.signalId || reaction.signal_id)
  const targetType = cleanTarget(reaction.targetType || reaction.target_type || 'signal') || 'signal'
  const reactionType = cleanTarget(reaction.reactionType || reaction.reaction_type || 'amplified') || 'amplified'
  const { error } = await client
    .from('signal_reactions')
    .delete()
    .eq('owner_id', ownerId)
    .eq('target_id', targetId)
    .eq('target_type', targetType)
    .eq('reaction_type', reactionType)
  if (error) throw error
  return true
}

export async function addCloudComment(ownerId, comment) {
  const client = requireClient()
  const signalId = comment.signalId || comment.signal_id || comment.targetId || comment.target_id
  if (!ownerId || !isUuid(signalId) || !comment.text) return null
  const { data, error } = await client.from('comments').insert({
    owner_id: ownerId,
    signal_id: signalId,
    entity_id: isUuid(comment.entityId || comment.entity_id) ? (comment.entityId || comment.entity_id) : null,
    target_id: cleanTarget(comment.targetId || comment.target_id || signalId),
    target_type: cleanTarget(comment.targetType || comment.target_type || 'signal') || 'signal',
    local_id: comment.localId || comment.local_id || null,
    text: String(comment.text).slice(0, 2000),
    data: comment.data || comment,
  }).select().single()
  if (error) throw error
  return data
}

export async function syncCloudReminder(ownerId, itemId, detail = {}, active = true) {
  const client = requireClient()
  const cleanItemId = cleanTarget(itemId)
  if (!ownerId || !cleanItemId) return null
  if (!active) {
    const { error } = await client.from('reminders').delete().eq('owner_id', ownerId).eq('item_id', cleanItemId)
    if (error) throw error
    return null
  }
  const { data, error } = await client.from('reminders').upsert({
    owner_id: ownerId,
    item_id: cleanItemId,
    kind: detail.kind || 'programming',
    title: detail.title || cleanItemId,
    detail: detail.detail || '',
    route: normalizeRoute(detail.route),
    data: detail,
  }, { onConflict: 'owner_id,item_id' }).select().single()
  if (error) throw error
  if (detail.kind === 'radio') {
    const { error: stationError } = await client.from('radio_stations').upsert({
      owner_id: ownerId,
      station_id: cleanItemId,
      name: detail.title || cleanItemId,
      genre: detail.detail || '',
      frequency: detail.frequency || '',
      route: normalizeRoute(detail.route, '/radio'),
      saved: true,
      data: detail,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'owner_id,station_id' })
    if (stationError) throw stationError
  }
  return data
}

export async function upsertCloudRadioStation(ownerId, station = {}) {
  const client = requireClient()
  const stationId = cleanTarget(station.stationId || station.station_id || station.id || station.name)
  if (!ownerId || !stationId) return null

  const baseRow = {
    owner_id: ownerId,
    station_id: stationId,
    name: station.name || station.title || stationId,
    genre: station.genre || station.detail || '',
    frequency: station.frequency || station.signal || '',
    route: normalizeRoute(station.route, '/radio'),
    saved: Boolean(station.saved),
    data: station,
    updated_at: new Date().toISOString(),
  }

  const extendedRow = {
    ...baseRow,
    station_slug: station.stationSlug || station.slug || slugify(station.name || stationId),
    description: station.description || station.copy || station.next || '',
    status: station.status || 'preview',
    visibility: station.visibility || 'public',
    schedule_strategy: station.scheduleStrategy || 'curated_rotation',
  }

  const request = (row) => client
    .from('radio_stations')
    .upsert(row, { onConflict: 'owner_id,station_id' })
    .select()
    .single()

  const { data, error } = await request(extendedRow)
  if (!error) return data

  const message = String(error.message || '')
  const missingExtendedColumn = ['station_slug', 'description', 'status', 'visibility', 'schedule_strategy'].some((column) => message.includes(column))
  if (!missingExtendedColumn) throw error

  const fallback = await request(baseRow)
  if (fallback.error) throw fallback.error
  return fallback.data
}

export async function recordCloudRadioPlayEvent(ownerId, station = {}, eventType = 'play', detail = {}) {
  const client = requireClient()
  if (!ownerId) return null
  const stationRow = await upsertCloudRadioStation(ownerId, {
    ...station,
    saved: eventType === 'save' || station.saved,
  })
  if (!stationRow?.id) return null

  const { data, error } = await client.from('radio_play_events').insert({
    station_id: stationRow.id,
    track_id: isUuid(station.trackId || station.track_id) ? (station.trackId || station.track_id) : null,
    owner_id: ownerId,
    event_type: eventType,
    seconds_listened: Math.max(0, Number(detail.secondsListened || 0)),
    session_id: cleanTarget(detail.sessionId || ''),
    data: {
      stationId: station.id || station.stationId,
      stationName: station.name,
      track: station.track,
      artist: station.artist,
      frequency: station.frequency,
      progress: detail.progress,
      source: 'static-radio-preview',
      ...detail,
    },
  }).select().single()
  if (error) throw error
  return data
}

export async function getCloudApprovedRadioTracks(limit = 60) {
  if (!isSupabaseConfigured) return []
  const client = requireClient()
  const { data, error } = await client
    .from('radio_tracks')
    .select(`
      id,
      owner_id,
      entity_id,
      media_asset_id,
      title,
      artist,
      source_type,
      audio_url,
      duration_seconds,
      bpm,
      mood,
      genres,
      rights_status,
      visibility,
      data,
      created_at,
      media_asset:media_assets (
        id,
        public_url,
        mime_type,
        file_name,
        thumbnail_url,
        type
      )
    `)
    .eq('visibility', 'public')
    .eq('rights_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function getCloudRadioStationSchedule(stationSlug = 'static-radio', limit = 80) {
  if (!isSupabaseConfigured) return []
  const client = requireClient()
  const { data, error } = await client
    .from('radio_station_tracks')
    .select(`
      id,
      position,
      starts_at,
      ends_at,
      segment_type,
      weight,
      data,
      station:radio_stations!inner (
        id,
        station_id,
        name,
        genre,
        frequency,
        station_slug,
        description,
        status,
        visibility,
        data
      ),
      track:radio_tracks (
        id,
        owner_id,
        entity_id,
        media_asset_id,
        title,
        artist,
        source_type,
        audio_url,
        duration_seconds,
        bpm,
        mood,
        genres,
        rights_status,
        visibility,
        data,
        created_at,
        media_asset:media_assets (
          id,
          public_url,
          mime_type,
          file_name,
          thumbnail_url,
          type
        )
      )
    `)
    .order('position', { ascending: true })
    .limit(limit)
  if (error) throw error
  return (data || []).filter((row) => (
    row.station?.visibility === 'public'
    && (!stationSlug || row.station?.station_slug === stationSlug || row.station?.station_id === stationSlug)
    && row.track?.visibility === 'public'
    && row.track?.rights_status === 'approved'
  ))
}

export async function createCloudRadioTrack(ownerId, track = {}, rights = {}) {
  const client = requireClient()
  if (!ownerId || !track.title) return null
  const { data, error } = await client.from('radio_tracks').insert({
    owner_id: ownerId,
    entity_id: isUuid(track.entityId || track.entity_id) ? (track.entityId || track.entity_id) : null,
    media_asset_id: isUuid(track.mediaAssetId || track.media_asset_id) ? (track.mediaAssetId || track.media_asset_id) : null,
    provider_job_id: isUuid(track.providerJobId || track.provider_job_id) ? (track.providerJobId || track.provider_job_id) : null,
    title: track.title,
    artist: track.artist || '',
    source_type: track.sourceType || track.source_type || 'creator_upload',
    audio_url: track.audioUrl || track.audio_url || '',
    duration_seconds: Number(track.durationSeconds || track.duration_seconds || 0) || null,
    bpm: Number(track.bpm || 0) || null,
    mood: track.mood || '',
    genres: track.genres || [],
    rights_status: track.rightsStatus || track.rights_status || 'pending',
    visibility: track.visibility || 'private',
    data: track,
  }).select().single()
  if (error) throw error

  if (rights && Object.keys(rights).length) {
    const { error: rightsError } = await client.from('radio_rights_declarations').upsert({
      owner_id: ownerId,
      track_id: data.id,
      owns_master: Boolean(rights.ownsMaster || rights.owns_master),
      owns_publishing: Boolean(rights.ownsPublishing || rights.owns_publishing),
      contains_third_party_samples: Boolean(rights.containsThirdPartySamples || rights.contains_third_party_samples),
      commercial_use_confirmed: Boolean(rights.commercialUseConfirmed || rights.commercial_use_confirmed),
      ai_generated: Boolean(rights.aiGenerated || rights.ai_generated),
      provider: rights.provider || track.provider || '',
      license_url: rights.licenseUrl || rights.license_url || '',
      declaration: rights.declaration || '',
      status: rights.status || 'pending_review',
      data: rights,
    }, { onConflict: 'owner_id,track_id' })
    if (rightsError) throw rightsError
  }

  return data
}

export async function syncCloudMarketplaceAction(ownerId, itemId, action = {}) {
  const client = requireClient()
  const cleanItemId = cleanTarget(itemId)
  if (!ownerId || !cleanItemId) return null
  const saved = Boolean(action.saved)
  const requested = Boolean(action.requested)
  const followed = Boolean(action.followed)
  const { data, error } = await client.from('marketplace_actions').upsert({
    owner_id: ownerId,
    item_id: cleanItemId,
    saved,
    requested,
    followed,
    data: action,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'owner_id,item_id' }).select().single()
  if (error) throw error

  if (saved) {
    await upsertCloudSavedItem(ownerId, {
      itemId: cleanItemId,
      itemType: action.category || action.type || 'marketplace',
      title: action.title || action.name || cleanItemId,
      route: action.route || '/marketplace',
      ...action,
    })
    const { error: inventoryError } = await client.from('inventory').upsert({
      owner_id: ownerId,
      item_id: cleanItemId,
      item_type: action.category || action.type || 'marketplace',
      title: action.title || action.name || cleanItemId,
      route: normalizeRoute(action.route, '/marketplace'),
      data: action,
    }, { onConflict: 'owner_id,item_id' })
    if (inventoryError) throw inventoryError
  } else {
    await deleteCloudSavedItem(ownerId, cleanItemId, action.category || action.type || 'marketplace').catch(() => null)
    const { error: inventoryDeleteError } = await client.from('inventory').delete().eq('owner_id', ownerId).eq('item_id', cleanItemId)
    if (inventoryDeleteError) throw inventoryDeleteError
  }

  if (followed) {
    await upsertCloudFollow(ownerId, {
      targetId: cleanItemId,
      targetType: action.targetType || 'creator-venue',
      title: action.title || action.name || cleanItemId,
      route: action.route || '/marketplace',
      ...action,
    })
  } else {
    await deleteCloudFollow(ownerId, cleanItemId, action.targetType || 'creator-venue').catch(() => null)
  }

  if (requested) {
    const { error: orderError } = await client.from('marketplace_orders').insert({
      owner_id: ownerId,
      item_id: cleanItemId,
      item_type: action.category || action.type || 'marketplace',
      title: action.title || action.name || cleanItemId,
      status: 'intent_only',
      data: action,
    })
    if (orderError && !String(orderError.message || '').includes('marketplace_orders')) throw orderError
  }

  return data
}

export async function upsertCloudLiveEvent(ownerId, entity, live = true) {
  const client = requireClient()
  const entityId = entity?.cloudId || (isUuid(entity?.id) ? entity.id : null)
  if (!ownerId || !entityId) return null
  const { data, error } = await client.from('live_events').upsert({
    owner_id: ownerId,
    entity_id: entityId,
    title: live ? `${entity.name} is live` : `${entity.name} ended live`,
    creator: entity.name,
    format: entity.liveFormat || 'Entity broadcast',
    live,
    route: '/live',
    data: { entityLocalId: entity.localId || entity.id, source: 'static-live-toggle' },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'owner_id,entity_id' }).select().single()
  if (error) throw error
  if (live) {
    const roomSlug = `${entity.handle || entity.name || entityId}`.replace(/^@/, '').replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
    await client.from('live_rooms').upsert({
      owner_id: ownerId,
      event_id: data.id,
      entity_id: entityId,
      room_slug: roomSlug || entityId,
      title: data.title,
      status: 'live',
      route: '/live',
      data: { liveEventId: data.id },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'room_slug' })
  }
  return data
}

export async function createCloudProviderJob(ownerId, job) {
  const client = requireClient()
  if (!ownerId) return null
  const { data, error } = await client.from('provider_jobs').insert({
    owner_id: ownerId,
    entity_id: isUuid(job.entityId || job.entity_id) ? (job.entityId || job.entity_id) : null,
    provider: job.provider,
    job_type: job.jobType || job.job_type,
    status: job.status || 'queued',
    prompt: job.prompt || '',
    input: job.input || {},
    cost_cents: job.costCents || job.cost_cents || 0,
    approved: Boolean(job.approved),
  }).select().single()
  if (error) throw error
  return data
}

export async function getCloudDirectThreads(ownerId, limit = 30) {
  const client = requireClient()
  if (!ownerId) return []
  const { data, error } = await client
    .from('direct_threads')
    .select('*')
    .or(`participant_one.eq.${ownerId},participant_two.eq.${ownerId}`)
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function getCloudDirectMessages(threadId, limit = 80) {
  const client = requireClient()
  if (!threadId) return []
  const { data, error } = await client
    .from('direct_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function sendCloudDirectMessage(ownerId, recipient, body) {
  const client = requireClient()
  const recipientId = typeof recipient === 'string' ? recipient : recipient?.id
  const message = String(body || '').trim()
  if (!ownerId) throw new Error('Sign in before sending messages.')
  if (!isUuid(recipientId)) throw new Error('Choose a real STATIC account before messaging.')
  if (!message) throw new Error('Write a message before sending.')
  const [participantOne, participantTwo] = [ownerId, recipientId].sort()
  const participantKey = `${participantOne}:${participantTwo}`
  const { data: thread, error: threadError } = await client
    .from('direct_threads')
    .upsert({
      participant_key: participantKey,
      participant_one: participantOne,
      participant_two: participantTwo,
      created_by: ownerId,
      last_message: message.slice(0, 240),
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data: { recipient },
    }, { onConflict: 'participant_key' })
    .select()
    .single()
  if (threadError) throw threadError
  const { data: directMessage, error: messageError } = await client
    .from('direct_messages')
    .insert({
      thread_id: thread.id,
      sender_id: ownerId,
      body: message,
      data: { recipient },
    })
    .select()
    .single()
  if (messageError) throw messageError
  return { thread, message: directMessage }
}

export async function markCloudDirectThreadRead(ownerId, threadId) {
  const client = requireClient()
  if (!ownerId || !threadId) return true
  const { error } = await client
    .from('direct_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('thread_id', threadId)
    .neq('sender_id', ownerId)
    .is('read_at', null)
  if (error) throw error
  return true
}

export async function createCloudModerationReport(ownerId, report) {
  const client = requireClient()
  if (!ownerId) throw new Error('Sign in to report content.')
  const { data, error } = await client.from('moderation_reports').insert({
    reporter_id: ownerId,
    target_id: cleanTarget(report.targetId || report.target_id),
    target_type: cleanTarget(report.targetType || report.target_type || 'signal'),
    reason: report.reason || 'User report',
    detail: report.detail || '',
    route: normalizeRoute(report.route),
    data: report,
  }).select().single()
  if (error) throw error
  return data
}

export async function createCloudNotification(ownerId, notification = {}) {
  const client = requireClient()
  if (!ownerId || !notification.title) return null
  const { data, error } = await client.from('notifications').insert({
    owner_id: ownerId,
    actor_id: isUuid(notification.actorId || notification.actor_id) ? (notification.actorId || notification.actor_id) : null,
    kind: cleanTarget(notification.type || notification.kind || 'activity') || 'activity',
    title: String(notification.title).slice(0, 180),
    body: String(notification.text || notification.body || '').slice(0, 500),
    route: normalizeRoute(notification.route, '/notifications'),
    read_at: notification.read ? new Date().toISOString() : null,
    data: notification,
  }).select().single()
  if (error) throw error
  return data
}

export async function getCloudNotifications(ownerId, limit = 50) {
  const client = requireClient()
  if (!ownerId) return []
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function markCloudNotificationsRead(ownerId) {
  const client = requireClient()
  if (!ownerId) return true
  const { error } = await client
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('owner_id', ownerId)
    .is('read_at', null)
  if (error) throw error
  return true
}

export async function addCloudSignalPoints(ownerId, event = {}) {
  const client = requireClient()
  const points = Number(event.points || event.signalDelta || 0)
  if (!ownerId || !points) return null
  const payload = {
    p_owner_id: ownerId,
    p_points: points,
    p_reason: String(event.reason || 'Signal activity').slice(0, 240),
    p_event_type: cleanTarget(event.eventType || event.event_type || event.type || 'activity') || 'activity',
    p_target_id: cleanTarget(event.targetId || event.target_id || ''),
    p_target_type: cleanTarget(event.targetType || event.target_type || ''),
    p_route: normalizeRoute(event.route, '/feed'),
    p_data: event.data || event,
  }
  const rpc = await client.rpc('add_signal_points', payload)
  if (!rpc.error) return { score: rpc.data }

  const { data, error } = await client.from('signal_events').insert({
    owner_id: ownerId,
    event_type: payload.p_event_type,
    points,
    reason: payload.p_reason,
    target_id: payload.p_target_id || null,
    target_type: payload.p_target_type || null,
    route: payload.p_route,
    data: payload.p_data,
  }).select().single()
  if (error) throw rpc.error
  return { score: null, event: data, rpcError: rpc.error.message }
}

export async function upsertCloudPresence(ownerId, presence = {}) {
  const client = requireClient()
  if (!ownerId) return null
  const { data, error } = await client.from('profile_presence').upsert({
    owner_id: ownerId,
    display_name: presence.displayName || presence.display_name || '',
    username: cleanTarget(presence.username || presence.handle || ''),
    avatar_url: presence.avatarUrl || presence.avatar_url || '',
    route: normalizeRoute(presence.route, '/feed'),
    status: presence.status || 'online',
    last_seen_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + Number(presence.ttlMs || 90_000)).toISOString(),
    data: presence.data || presence,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'owner_id' }).select().single()
  if (error) throw error
  return data
}

export async function getCloudPresence(limit = 40) {
  if (!isSupabaseConfigured) return []
  const client = requireClient()
  const { data, error } = await client
    .from('profile_presence')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('last_seen_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function upsertCloudPushSubscription(ownerId, subscription = {}, detail = {}) {
  const client = requireClient()
  const json = typeof subscription.toJSON === 'function' ? subscription.toJSON() : subscription
  const endpoint = json?.endpoint || subscription.endpoint
  if (!endpoint) throw new Error('Push subscription endpoint is missing.')
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const permission = typeof Notification !== 'undefined' ? Notification.permission : ''
  const { data, error } = await client.from('push_subscriptions').upsert({
    owner_id: ownerId,
    endpoint,
    platform: detail.platform || 'web',
    p256dh: json?.keys?.p256dh || detail.p256dh || null,
    auth_secret: json?.keys?.auth || detail.authSecret || null,
    device_label: detail.deviceLabel || userAgent.slice(0, 120) || 'Web device',
    enabled: detail.enabled !== false,
    data: {
      userAgent,
      permission,
      ...detail.data,
    },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'owner_id,endpoint' }).select().single()
  if (error) throw error
  return data
}

export async function getCloudBackboneStatus(ownerId) {
  if (!isSupabaseConfigured || !ownerId) return { ready: false, mode: 'local-only' }
  const client = requireClient()
  const tables = [
    ['signalEvents', 'signal_events'],
    ['presence', 'profile_presence'],
    ['savedItems', 'saved_items'],
    ['reactions', 'signal_reactions'],
    ['notifications', 'notifications'],
    ['directThreads', 'direct_threads'],
    ['directMessages', 'direct_messages'],
    ['providerJobs', 'provider_jobs'],
    ['liveRooms', 'live_rooms'],
    ['orders', 'marketplace_orders'],
    ['reports', 'moderation_reports'],
    ['radioTracks', 'radio_tracks'],
    ['radioRights', 'radio_rights_declarations'],
    ['radioSchedule', 'radio_station_tracks'],
    ['radioPlayEvents', 'radio_play_events'],
    ['platformLinks', 'platform_links'],
    ['entityLoadouts', 'entity_loadouts'],
    ['companions', 'companion_assets'],
    ['companionSlots', 'companion_slots'],
    ['vehicleBuilds', 'vehicle_builds'],
    ['properties', 'properties'],
    ['propertyAccess', 'property_access'],
    ['worldSessions', 'world_sessions'],
    ['eventAccess', 'event_access'],
    ['sportsEvents', 'sports_events'],
    ['teamRosters', 'team_rosters'],
    ['arenaSessions', 'arena_sessions'],
    ['contentImpressions', 'content_impressions'],
    ['creatorAffinity', 'creator_affinity'],
    ['interestAffinity', 'interest_affinity'],
    ['creatorAnalytics', 'creator_analytics_daily'],
    ['mediaDerivatives', 'media_derivatives'],
    ['searchEvents', 'search_events'],
    ['trendingTerms', 'trending_terms'],
    ['pushSubscriptions', 'push_subscriptions'],
    ['moderationAppeals', 'moderation_appeals'],
    ['copyrightTakedowns', 'copyright_takedowns'],
    ['payoutAccounts', 'creator_payout_accounts'],
    ['creatorPayouts', 'creator_payouts'],
    ['opsEvents', 'ops_events'],
  ]
  const results = await Promise.all(tables.map(async ([key, table]) => {
    const { count, error } = await client.from(table).select('id', { count: 'exact', head: true })
    if (error) return [key, { ready: false, count: 0, error: error.message }]
    return [key, { ready: true, count: count || 0 }]
  }))
  const status = Object.fromEntries(results)
  return {
    ready: Object.values(status).every((item) => item.ready),
    mode: 'cloud',
    ...status,
  }
}

export async function importLocalBundle(ownerId, bundle) {
  const client = requireClient()
  const entityIdMap = new Map()
  const channelIdMap = new Map()
  const [
    { data: existingSignals },
    { data: existingWorlds },
    { data: existingDrops },
    { data: existingProjects },
    { data: existingReminders },
  ] = await Promise.all([
    client.from('signals').select('id,metadata').eq('owner_id', ownerId),
    client.from('worlds').select('id,data').eq('owner_id', ownerId),
    client.from('drops').select('id,data').eq('owner_id', ownerId),
    client.from('projects').select('id,local_id').eq('owner_id', ownerId),
    client.from('reminders').select('item_id').eq('owner_id', ownerId),
  ])
  const signalByLocalId = new Map((existingSignals || []).map((item) => [item.metadata?.local_id, item.id]).filter(([localId]) => localId))
  const worldByLocalId = new Map((existingWorlds || []).map((item) => [item.data?.id || item.data?.localId, item.id]).filter(([localId]) => localId))
  const dropByLocalId = new Map((existingDrops || []).map((item) => [item.data?.id || item.data?.localId, item.id]).filter(([localId]) => localId))
  const projectByLocalId = new Map((existingProjects || []).map((item) => [item.local_id, item.id]).filter(([localId]) => localId))

  for (const entity of bundle.entities || []) {
    const { data, error } = await client.from('entities').upsert(entityToRow(entity, ownerId), { onConflict: 'owner_id,handle' }).select().single()
    if (error) throw error
    entityIdMap.set(entity.id, data.id)
    if (entity.localId) entityIdMap.set(entity.localId, data.id)

    const channel = (bundle.channels || []).find((item) => item.entityId === entity.id || item.entityId === entity.localId)
    if (channel) {
      const { data: savedChannel, error: channelError } = await client.from('channels').upsert({
        entity_id: data.id,
        owner_id: ownerId,
        handle: channel.handle.replace(/^@/, ''),
        display_name: channel.displayName || channel.name,
        tagline: channel.tagline,
        banner_url: channel.bannerUrl || null,
        profile_image_url: channel.profileImageUrl || null,
        theme: channel.theme || {},
        layout_style: channel.theme?.layoutStyle || 'Media Grid',
        modules: channel.modules || [],
        metadata: { local_id: channel.id },
      }, { onConflict: 'entity_id' }).select().single()
      if (channelError) throw channelError
      channelIdMap.set(channel.id, savedChannel.id)
      if (channel.localId) channelIdMap.set(channel.localId, savedChannel.id)
    }
  }

  for (const signal of bundle.signals || []) {
    const entityId = cloudEntityId(signal.entityId, entityIdMap)
    const signalLocalId = localIdentity(signal)
    if (!entityId) continue
    const signalRow = {
      entity_id: entityId,
      channel_id: channelIdMap.get(signal.channelId) || null,
      owner_id: ownerId,
      type: signal.postType || signal.type,
      title: signal.title,
      text: signal.text || signal.caption,
      caption: signal.caption,
      media_urls: signal.mediaUrls || [],
      avatar_pose: signal.avatarPose || 'Idle',
      visibility: signal.visibility || 'Public',
      stats: signal.reactions || {},
      metadata: { local_id: signalLocalId, tags: signal.tags || '' },
      updated_at: new Date().toISOString(),
    }
    const existingSignalId = signalByLocalId.get(signalLocalId)
    const request = existingSignalId
      ? client.from('signals').update(signalRow).eq('id', existingSignalId).eq('owner_id', ownerId).select('id').single()
      : client.from('signals').insert(signalRow).select('id').single()
    const { data: savedSignal, error } = await request
    if (error) throw error

    for (const [reactionType, active] of Object.entries(signal.reactions || {})) {
      if (!active) continue
      await upsertCloudReaction(ownerId, {
        signalId: savedSignal.id,
        targetId: savedSignal.id,
        targetType: 'signal',
        reactionType,
        data: {
          localId: signalLocalId,
          source: 'local-sync',
          signalTitle: signal.title,
        },
      })
      if (reactionType === 'saved') {
        await upsertCloudSavedItem(ownerId, {
          itemId: savedSignal.id,
          itemType: 'signal',
          title: signal.title || signal.text || signal.caption || 'Saved Signal',
          route: `/feed#${signalLocalId || savedSignal.id}`,
          localId: signalLocalId,
        })
      }
    }

    for (const comment of signal.comments || []) {
      if (!comment.text) continue
      const localCommentId = comment.id || `${signalLocalId}-${comment.createdAt || Date.now()}`
      const payload = {
        owner_id: ownerId,
        signal_id: savedSignal.id,
        entity_id: cloudEntityId(comment.entityId, entityIdMap),
        target_id: savedSignal.id,
        target_type: 'signal',
        local_id: localCommentId,
        text: String(comment.text).slice(0, 2000),
        data: {
          ...comment,
          local_id: localCommentId,
          signal_local_id: signalLocalId,
          source: 'local-sync',
        },
      }
      const { error: commentError } = await client
        .from('comments')
        .upsert(payload, { onConflict: 'owner_id,local_id' })
      if (commentError) throw commentError
    }
  }

  for (const world of bundle.worlds || []) {
    const entityId = cloudEntityId(world.entityId, entityIdMap)
    const worldLocalId = localIdentity(world)
    if (!entityId) continue
    const worldRow = {
      entity_id: entityId,
      owner_id: ownerId,
      title: world.title,
      setting: world.setting,
      mood: world.mood,
      visual_style: world.visualStyle,
      data: { ...world, id: worldLocalId, localId: worldLocalId },
    }
    const existingWorldId = worldByLocalId.get(worldLocalId)
    const request = existingWorldId
      ? client.from('worlds').update(worldRow).eq('id', existingWorldId).eq('owner_id', ownerId)
      : client.from('worlds').insert(worldRow)
    const { error } = await request
    if (error) throw error
  }

  for (const drop of bundle.drops || []) {
    const entityId = cloudEntityId(drop.entityId, entityIdMap)
    const dropLocalId = localIdentity(drop)
    if (!entityId) continue
    const dropRow = {
      entity_id: entityId,
      owner_id: ownerId,
      name: drop.name,
      type: drop.type,
      description: drop.description,
      data: { ...drop, id: dropLocalId, localId: dropLocalId },
    }
    const existingDropId = dropByLocalId.get(dropLocalId)
    const request = existingDropId
      ? client.from('drops').update(dropRow).eq('id', existingDropId).eq('owner_id', ownerId)
      : client.from('drops').insert(dropRow)
    const { error } = await request
    if (error) throw error
  }

  let syncedProjects = 0
  for (const project of bundle.projects || []) {
    const projectLocalId = localIdentity(project)
    const row = projectToRow(project, ownerId, entityIdMap)
    const existingId = projectByLocalId.get(projectLocalId) || (isUuid(project.cloudId) ? project.cloudId : null)
    const request = existingId
      ? client.from('projects').update(row).eq('id', existingId).eq('owner_id', ownerId)
      : client.from('projects').insert(row)
    const { error } = await request
    if (error) throw error
    syncedProjects += 1
  }

  let syncedMarketplaceActions = 0
  for (const [itemId, action] of Object.entries(bundle.catalogActions || {})) {
    const saved = Boolean(action.saved)
    const requested = Boolean(action.requested)
    const followed = Boolean(action.followed)
    const payload = {
      owner_id: ownerId,
      item_id: itemId,
      saved,
      requested,
      followed,
      data: action,
      updated_at: new Date().toISOString(),
    }
    const { error } = await client.from('marketplace_actions').upsert(payload, { onConflict: 'owner_id,item_id' })
    if (error) throw error
    if (saved) {
      const { error: inventoryError } = await client.from('inventory').upsert({
        owner_id: ownerId,
        item_id: itemId,
        item_type: action.category || action.type || 'marketplace',
        title: action.title || action.name || itemId,
        route: action.route || '/marketplace',
        data: action,
      }, { onConflict: 'owner_id,item_id' })
      if (inventoryError) throw inventoryError
    } else {
      const { error: inventoryDeleteError } = await client.from('inventory').delete().eq('owner_id', ownerId).eq('item_id', itemId)
      if (inventoryDeleteError) throw inventoryDeleteError
    }
    if (followed) {
      const { error: followsError } = await client.from('follows').upsert({
        owner_id: ownerId,
        target_id: itemId,
        target_type: action.targetType || 'creator-venue',
        title: action.title || action.name || itemId,
        route: action.route || '/marketplace',
        data: action,
      }, { onConflict: 'owner_id,target_id,target_type' })
      if (followsError) throw followsError
    } else {
      const { error: followsDeleteError } = await client.from('follows').delete().eq('owner_id', ownerId).eq('target_id', itemId)
      if (followsDeleteError) throw followsDeleteError
    }
    syncedMarketplaceActions += 1
  }

  let syncedFollows = 0
  for (const follow of Object.values(bundle.follows || {})) {
    const targetId = follow.targetId || follow.target_id || follow.id
    const targetType = follow.targetType || follow.target_type || 'entity'
    if (!targetId) continue
    const { error } = await client.from('follows').upsert({
      owner_id: ownerId,
      target_id: targetId,
      target_type: targetType,
      title: follow.title || targetId,
      route: follow.route || '/discover',
      data: follow,
    }, { onConflict: 'owner_id,target_id,target_type' })
    if (error) throw error
    syncedFollows += 1
  }

  const localReminderIds = new Set(Object.keys(bundle.reminders || {}))
  const remoteReminderIds = new Set((existingReminders || []).map((item) => item.item_id))
  const staleReminderIds = [...remoteReminderIds].filter((itemId) => !localReminderIds.has(itemId))
  if (staleReminderIds.length) {
    const { error } = await client.from('reminders').delete().eq('owner_id', ownerId).in('item_id', staleReminderIds)
    if (error) throw error
  }

  let syncedReminders = 0
  for (const [itemId, reminder] of Object.entries(bundle.reminders || {})) {
    const { error } = await client.from('reminders').upsert({
      owner_id: ownerId,
      item_id: itemId,
      kind: reminder.kind || 'programming',
      title: reminder.title || itemId,
      detail: reminder.detail || '',
      route: reminder.route || '/discover',
      data: reminder,
    }, { onConflict: 'owner_id,item_id' })
    if (error) throw error
    if (reminder.kind === 'radio') {
      const { error: stationError } = await client.from('radio_stations').upsert({
        owner_id: ownerId,
        station_id: itemId,
        name: reminder.title || itemId,
        genre: reminder.detail || '',
        frequency: reminder.frequency || '',
        route: reminder.route || '/radio',
        saved: true,
        data: reminder,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'owner_id,station_id' })
      if (stationError) throw stationError
    }
    syncedReminders += 1
  }

  for (const liveEntity of (bundle.entities || []).filter((item) => item.live)) {
    const entityId = cloudEntityId(liveEntity.id, entityIdMap)
    if (!entityId) continue
    const { error } = await client.from('live_events').upsert({
      owner_id: ownerId,
      entity_id: entityId,
      title: `${liveEntity.name} is live`,
      creator: liveEntity.name,
      format: liveEntity.liveFormat || 'Entity broadcast',
      live: true,
      route: '/live',
      data: { entityLocalId: localIdentity(liveEntity), source: 'static-local-sync' },
    }, { onConflict: 'owner_id,entity_id' })
    if (error) throw error
  }

  return { importedEntities: entityIdMap.size, syncedProjects, syncedMarketplaceActions, syncedFollows, syncedReminders }
}

export async function uploadCloudMedia({ bucket, ownerId, entityId, channelId, file, metadata = {} }) {
  const client = requireClient()
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
  const path = `${ownerId}/${entityId || 'account'}/${crypto.randomUUID()}-${safeName}`
  const { error } = await client.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = client.storage.from(bucket).getPublicUrl(path)
  let asset = null
  let metadataError = null
  let derivativeJobs = []
  let derivativeError = null
  try {
    const { data: assetRow, error: assetError } = await client.from('media_assets').insert({
      owner_id: ownerId,
      entity_id: isUuid(entityId) ? entityId : null,
      channel_id: isUuid(channelId) ? channelId : null,
      bucket,
      type: metadata.type || file.type.split('/')[0] || 'file',
      file_name: file.name,
      mime_type: file.type,
      storage_path: path,
      public_url: data.publicUrl,
      thumbnail_url: metadata.thumbnailUrl || null,
      metadata,
    }).select().single()
    if (assetError) throw assetError
    asset = assetRow
    const mime = String(file.type || '')
    const derivativeTypes = mime.startsWith('image/')
      ? ['thumbnail', 'feed']
      : mime.startsWith('video/')
        ? ['thumbnail', 'preview', 'adaptive-video']
        : mime.startsWith('audio/')
          ? ['waveform', 'adaptive-audio']
          : []
    if (derivativeTypes.length) {
      const { data: derivativeRows, error: derivativeInsertError } = await client
        .from('media_derivatives')
        .insert(derivativeTypes.map((derivativeType) => ({
          media_asset_id: assetRow.id,
          owner_id: ownerId,
          derivative_type: derivativeType,
          status: derivativeType.startsWith('adaptive') || derivativeType === 'waveform' ? 'queued' : 'source-ready',
          storage_path: derivativeType === 'thumbnail' || derivativeType === 'feed' ? path : null,
          public_url: derivativeType === 'thumbnail' || derivativeType === 'feed' ? data.publicUrl : null,
          mime_type: file.type || null,
          data: {
            sourcePath: path,
            sourceUrl: data.publicUrl,
            sourceBytes: file.size || 0,
            sourceName: file.name,
            launchQueue: true,
          },
        })))
        .select('id,derivative_type,status,public_url')
      if (derivativeInsertError) throw derivativeInsertError
      derivativeJobs = derivativeRows || []
    }
  } catch (error) {
    if (!asset) metadataError = error.message || 'Media metadata could not be recorded.'
    else derivativeError = error.message || 'Media derivative jobs could not be queued.'
  }
  return { path, publicUrl: data.publicUrl, asset, metadataError, derivativeJobs, derivativeError }
}

// TODO: Add paginated cloud feed reads, realtime subscriptions, conflict
// resolution, signed/private media, payment webhooks, provider workers,
// moderation dashboards, and resumable uploads after launch policy.
