import { base64FromBuffer, hasEnv, json, parseBody, rateLimit, requirePaidConfirmation, requirePost, safeFetch } from './_provider-utils.js'

export function normalizeSagePronunciation(text) {
  return text
    .replace(/\bS\s*\.\s*A\s*\.\s*G\s*\.\s*E\b/gi, 'Sage')
    .replace(/\bSAGE\b/gi, 'Sage')
}

export async function voiceHandler(event, voiceEnv, providerLabel) {
  const methodError = requirePost(event)
  if (methodError) return methodError
  const limited = rateLimit(event, 10)
  if (limited) return limited
  const body = parseBody(event)
  const confirmationError = requirePaidConfirmation(body)
  if (confirmationError) return confirmationError
  if (!hasEnv(['ELEVENLABS_API_KEY', voiceEnv])) {
    return json(503, { ok: false, provider: 'ElevenLabs', configured: false, error: `${providerLabel} voice is not configured.` })
  }
  const text = normalizeSagePronunciation(String(body.text || '').trim().slice(0, 1800))
  if (!text) return json(400, { ok: false, error: 'Text is required.' })
  try {
    const response = await safeFetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(process.env[voiceEnv])}`, {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.48, similarity_boost: 0.72, style: 0.28 },
      }),
    }, 45000)
    if (!response.ok) throw new Error(`ElevenLabs returned ${response.status}.`)
    return json(200, { ok: true, provider: 'ElevenLabs', audioBase64: base64FromBuffer(await response.arrayBuffer()), mimeType: 'audio/mpeg' })
  } catch (error) {
    return json(502, { ok: false, provider: 'ElevenLabs', configured: true, error: error.message || 'Voice generation failed.' })
  }
}
