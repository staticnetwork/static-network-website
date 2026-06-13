import { hasEnv, json, providerFailure, safeFetch } from './_provider-utils.js'

export const handler = async () => {
  if (!hasEnv(['OPENAI_API_KEY'])) return json(200, { ok: true, provider: 'OpenAI', configured: false, validated: false })
  try {
    const response = await safeFetch('https://api.openai.com/v1/models/gpt-5.5', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    })
    if (!response.ok) return providerFailure('OpenAI', response)
    return json(200, { ok: true, provider: 'OpenAI', configured: true, validated: true, capabilities: ['S.A.G.E. reasoning', 'entity image'] })
  } catch {
    return json(502, { ok: false, provider: 'OpenAI', configured: true, validated: false, error: 'Validation request failed.' })
  }
}

