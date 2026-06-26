import { hasEnv, json, parseBody, rateLimit, requirePaidConfirmation, safeFetch } from './_provider-utils.js'

function heyGenHeaders() {
  return {
    'X-Api-Key': process.env.HEYGEN_API_KEY,
    'Content-Type': 'application/json',
  }
}

async function heyGenRequest(path, options = {}, timeout = 30000) {
  const response = await safeFetch(`https://api.heygen.com${path}`, {
    ...options,
    headers: {
      ...heyGenHeaders(),
      ...(options.headers || {}),
    },
  }, timeout)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data.error?.message || data.message || data.error || `HeyGen returned ${response.status}.`
    return { error: json(response.status, { ok: false, provider: 'HeyGen', configured: true, error: message }) }
  }
  return { data: data.data || data }
}

async function getHeyGenAccount() {
  const result = await heyGenRequest('/v3/users/me')
  if (result.error) return result.error
  return json(200, {
    ok: true,
    provider: 'HeyGen',
    configured: true,
    validated: true,
    wallet: result.data.wallet || null,
    subscription: result.data.subscription || null,
  })
}

async function createHeyGenAvatar(body) {
  const sourceUrl = String(body.sourceUrl || '').trim()
  if (!sourceUrl) return json(400, { ok: false, error: 'A public owner-approved Entity image URL is required.' })
  const result = await heyGenRequest('/v3/avatars', {
    method: 'POST',
    body: JSON.stringify({
      type: 'photo',
      name: String(body.name || 'STATIC Network Entity').slice(0, 100),
      file: { type: 'url', url: sourceUrl },
    }),
  })
  if (result.error) return result.error
  return json(200, {
    ok: true,
    provider: 'HeyGen',
    stage: 'avatar',
    avatarId: result.data.avatar_item?.id || '',
    avatarGroupId: result.data.avatar_group?.id || '',
    previewImageUrl: result.data.avatar_item?.preview_image_url || '',
    estimatedChargeUsd: 1,
  })
}

async function createHeyGenTalkingVideo(body) {
  const avatarId = String(body.avatarId || '').trim()
  const audioUrl = String(body.audioUrl || '').trim()
  if (!avatarId || !audioUrl) {
    return json(400, { ok: false, error: 'An approved HeyGen avatar ID and public approved audio URL are required.' })
  }
  const duration = Math.max(2, Math.min(120, Number(body.duration) || 12))
  const prompt = String(body.prompt || '').trim() || [
    'Keep the approved Entity visible and facing the viewer.',
    'Use expressive but natural presenter gestures while speaking.',
    'Preserve the exact face, wardrobe, proportions, background, and identity from the approved avatar.',
  ].join(' ')
  const result = await heyGenRequest('/v3/videos', {
    method: 'POST',
    body: JSON.stringify({
      type: 'avatar',
      avatar_id: avatarId,
      audio_url: audioUrl,
      motion_prompt: prompt,
      expressiveness: body.expressiveness === 'low' ? 'low' : 'high',
      fit: body.fit === 'contain' ? 'contain' : 'cover',
      aspect_ratio: body.aspectRatio === '9:16' ? '9:16' : '16:9',
      resolution: '1080p',
      output_format: 'mp4',
      title: String(body.title || 'STATIC Entity Talking Video').slice(0, 100),
    }),
  })
  if (result.error) return result.error
  return json(200, {
    ok: true,
    provider: 'HeyGen',
    stage: 'talking-video',
    id: result.data.video_id || result.data.id || '',
    status: result.data.status || 'pending',
    estimatedMaximumChargeUsd: Number((duration * 0.051).toFixed(2)),
    note: 'Estimate only. HeyGen controls final usage pricing.',
  })
}

async function getHeyGenVideo(id) {
  const result = await heyGenRequest(`/v3/videos/${encodeURIComponent(id)}`, {}, 20000)
  if (result.error) return result.error
  return json(200, {
    ok: true,
    provider: 'HeyGen',
    stage: 'talking-video',
    id,
    status: result.data.status || '',
    duration: result.data.duration || null,
    resultUrl: result.data.video_url || '',
    error: result.data.failure_message || '',
  })
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'POST required.' })
  const limited = rateLimit(event, 8)
  if (limited) return limited
  const provider = String(process.env.TALKING_AVATAR_PROVIDER || '').toLowerCase()
  if (provider !== 'heygen') {
    return json(503, {
      ok: false,
      provider,
      configured: Boolean(provider),
      error: 'The STATIC Entity talking-video pipeline requires HeyGen. D-ID remains rejected for public use.',
    })
  }
  if (!hasEnv(['HEYGEN_API_KEY'])) {
    return json(503, { ok: false, provider: 'HeyGen', configured: false, error: 'HeyGen is not configured.' })
  }

  const body = parseBody(event)
  if (body.action === 'account') return getHeyGenAccount()
  if (body.action === 'video-status') {
    const id = String(body.id || '').trim()
    return id ? getHeyGenVideo(id) : json(400, { ok: false, error: 'A HeyGen video ID is required.' })
  }

  const confirmationError = requirePaidConfirmation(body)
  if (confirmationError) return confirmationError
  if (body.action === 'create-avatar') return createHeyGenAvatar(body)
  if (body.action === 'create-talking-video') return createHeyGenTalkingVideo(body)
  return json(400, { ok: false, error: 'Unknown HeyGen pipeline action.' })
}
