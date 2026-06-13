import { hasEnv, json, providerFailure, safeFetch } from './_provider-utils.js'

const providerConfig = {
  did: {
    name: 'D-ID',
    required: ['DID_API_KEY'],
    url: 'https://api.d-id.com/credits',
    headers: () => ({ Authorization: `Basic ${process.env.DID_API_KEY}` }),
    generationSupported: true,
  },
  tavus: {
    name: 'Tavus',
    required: ['TAVUS_API_KEY'],
    url: 'https://tavusapi.com/v2/replicas',
    headers: () => ({ 'x-api-key': process.env.TAVUS_API_KEY }),
    generationSupported: false,
  },
  heygen: {
    name: 'HeyGen',
    required: ['HEYGEN_API_KEY'],
    url: 'https://api.heygen.com/v2/avatars',
    headers: () => ({ 'X-Api-Key': process.env.HEYGEN_API_KEY }),
    generationSupported: false,
  },
}

export const handler = async () => {
  const provider = String(process.env.TALKING_AVATAR_PROVIDER || '').toLowerCase()
  const config = providerConfig[provider]
  if (!config || !hasEnv(config.required)) {
    return json(200, {
      ok: true,
      provider: config?.name || 'Talking avatar',
      providerId: provider,
      configured: false,
      validated: false,
      generationSupported: false,
    })
  }

  try {
    const response = await safeFetch(config.url, { headers: config.headers() })
    if (!response.ok) return providerFailure(config.name, response)
    return json(200, {
      ok: true,
      provider: config.name,
      providerId: provider,
      configured: true,
      validated: true,
      generationSupported: config.generationSupported,
    })
  } catch {
    return json(502, {
      ok: false,
      provider: config.name,
      providerId: provider,
      configured: true,
      validated: false,
      generationSupported: config.generationSupported,
      error: 'Talking-avatar validation request failed.',
    })
  }
}
