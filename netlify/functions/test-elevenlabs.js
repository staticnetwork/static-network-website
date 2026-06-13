import { hasEnv, json, providerFailure, safeFetch } from './_provider-utils.js'

export const handler = async () => {
  if (!hasEnv(['ELEVENLABS_API_KEY'])) return json(200, { ok: true, provider: 'ElevenLabs', configured: false, validated: false })
  try {
    const response = await safeFetch('https://api.elevenlabs.io/v2/voices?page_size=1', {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
    })
    if (!response.ok) return providerFailure('ElevenLabs', response)
    return json(200, {
      ok: true,
      provider: 'ElevenLabs',
      configured: true,
      validated: true,
      voiceIdsConfigured: Boolean(process.env.ELEVENLABS_SAGE_VOICE_ID || process.env.ELEVENLABS_ENTITY_VOICE_ID),
    })
  } catch {
    return json(502, { ok: false, provider: 'ElevenLabs', configured: true, validated: false, error: 'Validation request failed.' })
  }
}
