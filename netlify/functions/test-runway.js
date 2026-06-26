import { hasEnv, json, providerFailure, safeFetch } from './_provider-utils.js'

export const handler = async () => {
  if (!hasEnv(['RUNWAY_API_KEY'])) return json(200, { ok: true, provider: 'Runway', configured: false, validated: false })
  try {
    const response = await safeFetch('https://api.dev.runwayml.com/v1/organization', {
      headers: {
        Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06',
      },
    })
    if (!response.ok) return providerFailure('Runway', response)
    return json(200, { ok: true, provider: 'Runway', configured: true, validated: true, capabilities: ['entity video'] })
  } catch {
    return json(502, { ok: false, provider: 'Runway', configured: true, validated: false, error: 'Validation request failed.' })
  }
}
