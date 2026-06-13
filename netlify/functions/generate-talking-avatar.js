import { hasEnv, json, parseBody, rateLimit, requirePaidConfirmation, safeFetch } from './_provider-utils.js'

function didHeaders() {
  return {
    Authorization: `Basic ${process.env.DID_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function createDidTalk(body) {
  const sourceUrl = String(body.sourceUrl || '').trim()
  const audioUrl = String(body.audioUrl || '').trim()
  if (!sourceUrl || !audioUrl) {
    return json(400, { ok: false, error: 'A public S.A.G.E. image URL and public ElevenLabs audio URL are required.' })
  }
  const response = await safeFetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: didHeaders(),
    body: JSON.stringify({
      source_url: sourceUrl,
      script: { type: 'audio', audio_url: audioUrl },
      config: { fluent: true, pad_audio: 0, result_format: 'mp4' },
    }),
  }, 30000)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return json(response.status, { ok: false, provider: 'D-ID', configured: true, error: data.description || data.message || `D-ID returned ${response.status}.` })
  return json(200, { ok: true, provider: 'D-ID', id: data.id, status: data.status || 'created' })
}

async function getDidTalk(id) {
  const response = await safeFetch(`https://api.d-id.com/talks/${encodeURIComponent(id)}`, {
    headers: didHeaders(),
  }, 20000)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return json(response.status, { ok: false, provider: 'D-ID', configured: true, error: data.description || data.message || `D-ID returned ${response.status}.` })
  return json(200, {
    ok: true,
    provider: 'D-ID',
    id: data.id,
    status: data.status,
    resultUrl: data.result_url || '',
    error: data.error?.description || '',
  })
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'POST required.' })
  const limited = rateLimit(event, 5)
  if (limited) return limited
  const provider = String(process.env.TALKING_AVATAR_PROVIDER || '').toLowerCase()
  if (provider !== 'did') {
    return json(503, {
      ok: false,
      provider,
      configured: Boolean(provider),
      error: 'The owner lab currently supports real generated talking video through D-ID. Select D-ID or add a reviewed adapter before generation.',
    })
  }
  if (!hasEnv(['DID_API_KEY'])) return json(503, { ok: false, provider: 'D-ID', configured: false, error: 'D-ID is not configured.' })
  const body = parseBody(event)
  if (body.action === 'status') {
    const id = String(body.id || '').trim()
    if (!id) return json(400, { ok: false, error: 'A D-ID talk ID is required.' })
    return getDidTalk(id)
  }
  const confirmationError = requirePaidConfirmation(body)
  if (confirmationError) return confirmationError
  return createDidTalk(body)
}
