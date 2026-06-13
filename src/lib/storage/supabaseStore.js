import { supabase } from '../supabaseClient'

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
      account_type: profile.accountType || 'Entity Operator',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getCloudEntities(ownerId) {
  const client = requireClient()
  const { data, error } = await client.from('entities').select('*').eq('owner_id', ownerId).order('created_at')
  if (error) throw error
  return data || []
}

export async function getCloudNetwork(ownerId) {
  const client = requireClient()
  const [entitiesResult, channelsResult, signalsResult, worldsResult, dropsResult] = await Promise.all([
    client.from('entities').select('*').eq('owner_id', ownerId).order('created_at'),
    client.from('channels').select('*').eq('owner_id', ownerId).order('created_at'),
    client.from('signals').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
    client.from('worlds').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
    client.from('drops').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
  ])

  const failure = [entitiesResult, channelsResult, signalsResult, worldsResult, dropsResult].find((result) => result.error)
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
    worlds: (worldsResult.data || []).map((row) => ({ ...row.data, id: row.id, cloudId: row.id, localId: row.data?.id, entityId: row.entity_id, createdAt: row.created_at })),
    drops: (dropsResult.data || []).map((row) => ({ ...row.data, id: row.id, cloudId: row.id, localId: row.data?.id, entityId: row.entity_id, createdAt: row.created_at })),
  }
}

export async function importLocalBundle(ownerId, bundle) {
  const client = requireClient()
  const entityIdMap = new Map()
  const channelIdMap = new Map()
  const [{ data: existingSignals }, { data: existingWorlds }, { data: existingDrops }] = await Promise.all([
    client.from('signals').select('metadata').eq('owner_id', ownerId),
    client.from('worlds').select('data').eq('owner_id', ownerId),
    client.from('drops').select('data').eq('owner_id', ownerId),
  ])
  const importedSignalIds = new Set((existingSignals || []).map((item) => item.metadata?.local_id).filter(Boolean))
  const importedWorldIds = new Set((existingWorlds || []).map((item) => item.data?.id).filter(Boolean))
  const importedDropIds = new Set((existingDrops || []).map((item) => item.data?.id).filter(Boolean))

  for (const entity of bundle.entities) {
    const { data, error } = await client.from('entities').upsert(entityToRow(entity, ownerId), { onConflict: 'owner_id,handle' }).select().single()
    if (error) throw error
    entityIdMap.set(entity.id, data.id)

    const channel = bundle.channels.find((item) => item.entityId === entity.id)
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
    }
  }

  for (const signal of bundle.signals) {
    const entityId = entityIdMap.get(signal.entityId)
    if (!entityId || importedSignalIds.has(signal.id)) continue
    const { error } = await client.from('signals').insert({
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
      metadata: { local_id: signal.id, tags: signal.tags || '' },
    })
    if (error) throw error
  }

  for (const world of bundle.worlds) {
    const entityId = entityIdMap.get(world.entityId)
    if (!entityId || importedWorldIds.has(world.id)) continue
    const { error } = await client.from('worlds').insert({
      entity_id: entityId,
      owner_id: ownerId,
      title: world.title,
      setting: world.setting,
      mood: world.mood,
      visual_style: world.visualStyle,
      data: world,
    })
    if (error) throw error
  }

  for (const drop of bundle.drops) {
    const entityId = entityIdMap.get(drop.entityId)
    if (!entityId || importedDropIds.has(drop.id)) continue
    const { error } = await client.from('drops').insert({
      entity_id: entityId,
      owner_id: ownerId,
      name: drop.name,
      type: drop.type,
      description: drop.description,
      data: drop,
    })
    if (error) throw error
  }

  return { importedEntities: entityIdMap.size }
}

export async function uploadCloudMedia({ bucket, ownerId, entityId, file }) {
  const client = requireClient()
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
  const path = `${ownerId}/${entityId || 'account'}/${crypto.randomUUID()}-${safeName}`
  const { error } = await client.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = client.storage.from(bucket).getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}

// TODO: Add paginated cloud feed reads, media metadata insertion, realtime
// subscriptions, conflict resolution, and resumable uploads after launch policy.
