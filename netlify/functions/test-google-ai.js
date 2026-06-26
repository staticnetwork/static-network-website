import { hasEnv, json, providerFailure, safeFetch } from './_provider-utils.js'

export const handler = async () => {
  if (!hasEnv(['GOOGLE_AI_API_KEY'])) return json(200, { ok: true, provider: 'Google AI', configured: false, validated: false })
  try {
    const response = await safeFetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=${encodeURIComponent(process.env.GOOGLE_AI_API_KEY)}`)
    if (!response.ok) return providerFailure('Google AI', response)
    return json(200, { ok: true, provider: 'Google AI', configured: true, validated: true, capabilities: ['Nano Banana entity image'] })
  } catch {
    return json(502, { ok: false, provider: 'Google AI', configured: true, validated: false, error: 'Validation request failed.' })
  }
}
