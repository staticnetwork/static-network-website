import { json, parseBody, rateLimit, safeFetch } from './_provider-utils.js'
import { requireSupabaseUser, supabaseEnv } from './_supabase-auth.js'

function isOwnerUser(user = {}) {
  const values = [
    user.email,
    user.app_metadata?.role,
    user.user_metadata?.role,
    user.user_metadata?.username,
    user.user_metadata?.display_name,
  ].map((value) => String(value || '').trim().toLowerCase())

  return values.some((value) => (
    value === 'owner'
    || value === 'mrstone'
    || value === 'mr.stone'
    || value === 'mr stone'
    || value === '@mrstone'
    || value === 'thestaticnetwork.com@gmail.com'
  ))
}

function compactIds(values = []) {
  return [...new Set(values.filter(Boolean))]
}

function inFilter(values = []) {
  return `in.(${compactIds(values).join(',')})`
}

async function serviceRequest(path, { method = 'GET', query = {}, body, prefer = 'return=representation' } = {}) {
  const { url, serviceRoleKey } = supabaseEnv()
  if (!url || !serviceRoleKey) throw Object.assign(new Error('Supabase service role is not configured for radio admin.'), { statusCode: 503 })
  const endpoint = new URL(`${url}/rest/v1/${path}`)
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') endpoint.searchParams.set(key, value)
  })
  const response = await safeFetch(endpoint.toString(), {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
  }, 20000)
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.message || data?.error || `Supabase ${method} failed for ${path}.`
    throw Object.assign(new Error(message), { statusCode: response.status })
  }
  return data
}

async function fetchMediaAssets(ids = []) {
  const mediaIds = compactIds(ids)
  if (!mediaIds.length) return new Map()
  const rows = await serviceRequest('media_assets', {
    query: {
      select: 'id,owner_id,type,file_name,mime_type,storage_path,public_url,thumbnail_url,created_at',
      id: inFilter(mediaIds),
    },
  })
  return new Map((rows || []).map((row) => [row.id, row]))
}

async function fetchRights(trackIds = []) {
  const ids = compactIds(trackIds)
  if (!ids.length) return new Map()
  const rows = await serviceRequest('radio_rights_declarations', {
    query: {
      select: 'id,owner_id,track_id,owns_master,owns_publishing,contains_third_party_samples,commercial_use_confirmed,ai_generated,provider,license_url,declaration,status,created_at,updated_at,data',
      track_id: inFilter(ids),
    },
  })
  const byTrack = new Map()
  ;(rows || []).forEach((row) => {
    if (!byTrack.has(row.track_id)) byTrack.set(row.track_id, [])
    byTrack.get(row.track_id).push(row)
  })
  return byTrack
}

async function fetchTracks(query = {}, limit = 80) {
  const rows = await serviceRequest('radio_tracks', {
    query: {
      select: 'id,owner_id,entity_id,media_asset_id,title,artist,source_type,audio_url,duration_seconds,bpm,mood,genres,rights_status,visibility,data,created_at,updated_at',
      order: 'created_at.desc',
      limit: String(limit),
      ...query,
    },
  })
  return rows || []
}

async function hydrateTracks(rows = []) {
  const mediaById = await fetchMediaAssets(rows.map((row) => row.media_asset_id))
  const rightsByTrack = await fetchRights(rows.map((row) => row.id))
  return rows.map((row) => ({
    ...row,
    media_asset: mediaById.get(row.media_asset_id) || null,
    rights: rightsByTrack.get(row.id) || [],
  }))
}

async function getStaticRadioStation(userId) {
  const existing = await serviceRequest('radio_stations', {
    query: {
      select: 'id,owner_id,station_id,name,genre,frequency,route,saved,data,station_slug,description,status,visibility,schedule_strategy,created_at,updated_at',
      station_id: 'eq.static-radio',
      order: 'updated_at.desc',
      limit: '1',
    },
  })
  if (existing?.[0]) return existing[0]

  const inserted = await serviceRequest('radio_stations', {
    method: 'POST',
    body: {
      owner_id: userId,
      station_id: 'static-radio',
      name: 'STATIC Radio',
      genre: 'AI music / creator uploads / music videos',
      frequency: '24/7',
      route: '/radio',
      saved: false,
      station_slug: 'static-radio',
      description: 'The approved STATIC Radio rotation for creator-owned songs and music videos.',
      status: 'active',
      visibility: 'public',
      schedule_strategy: 'curated_rotation',
      data: { source: 'radio-admin' },
      updated_at: new Date().toISOString(),
    },
  })
  return inserted?.[0] || null
}

async function fetchSchedule(stationId) {
  if (!stationId) return []
  const rows = await serviceRequest('radio_station_tracks', {
    query: {
      select: 'id,station_id,track_id,position,starts_at,ends_at,segment_type,weight,data,created_at,updated_at',
      station_id: `eq.${stationId}`,
      order: 'position.asc',
      limit: '120',
    },
  })
  if (!rows?.length) return []
  const hydrated = await hydrateTracks(await fetchTracks({ id: inFilter((rows || []).map((row) => row.track_id)) }, 120))
  const trackById = new Map(hydrated.map((track) => [track.id, track]))
  return (rows || []).map((row) => ({ ...row, track: trackById.get(row.track_id) || null }))
}

async function addTrackToSchedule(userId, trackId) {
  const station = await getStaticRadioStation(userId)
  if (!station?.id) throw new Error('STATIC Radio station could not be prepared.')

  const existing = await serviceRequest('radio_station_tracks', {
    query: {
      select: 'id,position',
      station_id: `eq.${station.id}`,
      track_id: `eq.${trackId}`,
      limit: '1',
    },
  })
  if (existing?.[0]) return existing[0]

  const last = await serviceRequest('radio_station_tracks', {
    query: {
      select: 'position',
      station_id: `eq.${station.id}`,
      order: 'position.desc',
      limit: '1',
    },
  })
  const position = Number(last?.[0]?.position || 0) + 1
  const inserted = await serviceRequest('radio_station_tracks', {
    method: 'POST',
    body: {
      station_id: station.id,
      track_id: trackId,
      position,
      segment_type: 'track',
      weight: 1,
      data: { source: 'radio-admin', approvedAt: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    },
  })
  return inserted?.[0] || null
}

async function removeTrackFromSchedule(trackId) {
  await serviceRequest('radio_station_tracks', {
    method: 'DELETE',
    query: { track_id: `eq.${trackId}` },
    prefer: 'return=minimal',
  })
}

async function patchRights(track, status) {
  const existing = await serviceRequest('radio_rights_declarations', {
    query: {
      select: 'id',
      track_id: `eq.${track.id}`,
      owner_id: `eq.${track.owner_id}`,
      limit: '1',
    },
  })
  if (existing?.[0]) {
    await serviceRequest('radio_rights_declarations', {
      method: 'PATCH',
      query: { id: `eq.${existing[0].id}` },
      body: { status, updated_at: new Date().toISOString() },
    })
    return
  }
  await serviceRequest('radio_rights_declarations', {
    method: 'POST',
    body: {
      owner_id: track.owner_id,
      track_id: track.id,
      owns_master: false,
      owns_publishing: false,
      contains_third_party_samples: false,
      commercial_use_confirmed: false,
      ai_generated: true,
      declaration: 'Owner moderation record created from STATIC Radio admin.',
      status,
      data: { source: 'radio-admin' },
    },
  })
}

async function getConsole(userId) {
  const queue = await hydrateTracks(await fetchTracks({ rights_status: 'in.(pending,needs_review)' }, 80))
  const approved = await hydrateTracks(await fetchTracks({ rights_status: 'eq.approved', visibility: 'eq.public' }, 80))
  const station = await getStaticRadioStation(userId)
  const schedule = await fetchSchedule(station?.id)
  return {
    queue,
    approved,
    station,
    schedule,
    stats: {
      queue: queue.length,
      approved: approved.length,
      scheduled: schedule.length,
    },
  }
}

export const handler = async (event) => {
  const limited = rateLimit(event, 30)
  if (limited) return limited

  try {
    const { user } = await requireSupabaseUser(event)
    if (!isOwnerUser(user)) return json(403, { ok: false, error: 'Owner authorization required.' })

    if (event.httpMethod === 'GET') {
      return json(200, { ok: true, ...(await getConsole(user.id)) })
    }

    if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'GET or POST required.' })

    const body = parseBody(event)
    const action = String(body.action || '').trim()
    const trackId = String(body.trackId || body.track_id || '').trim()
    if (!trackId) return json(400, { ok: false, error: 'trackId is required.' })

    const [track] = await fetchTracks({ id: `eq.${trackId}` }, 1)
    if (!track?.id) return json(404, { ok: false, error: 'Radio track was not found.' })

    if (action === 'approve') {
      await serviceRequest('radio_tracks', {
        method: 'PATCH',
        query: { id: `eq.${track.id}` },
        body: {
          rights_status: 'approved',
          visibility: 'public',
          updated_at: new Date().toISOString(),
        },
      })
      await patchRights(track, 'approved')
      if (body.schedule !== false) await addTrackToSchedule(user.id, track.id)
      return json(200, { ok: true, action: 'approve', ...(await getConsole(user.id)) })
    }

    if (action === 'reject') {
      await serviceRequest('radio_tracks', {
        method: 'PATCH',
        query: { id: `eq.${track.id}` },
        body: {
          rights_status: 'rejected',
          visibility: 'blocked',
          updated_at: new Date().toISOString(),
        },
      })
      await patchRights(track, 'rejected')
      await removeTrackFromSchedule(track.id)
      return json(200, { ok: true, action: 'reject', ...(await getConsole(user.id)) })
    }

    if (action === 'schedule') {
      if (track.rights_status !== 'approved' || track.visibility !== 'public') {
        return json(409, { ok: false, error: 'Approve the track before scheduling it.' })
      }
      await addTrackToSchedule(user.id, track.id)
      return json(200, { ok: true, action: 'schedule', ...(await getConsole(user.id)) })
    }

    if (action === 'unschedule') {
      await removeTrackFromSchedule(track.id)
      return json(200, { ok: true, action: 'unschedule', ...(await getConsole(user.id)) })
    }

    return json(400, { ok: false, error: 'Unknown radio admin action.' })
  } catch (error) {
    return json(error.statusCode || 502, {
      ok: false,
      error: error.message || 'STATIC Radio admin is unavailable.',
    })
  }
}
