import { hasEnv, json, providerFailure, safeFetch } from './_provider-utils.js'

export const handler = async () => {
  const names = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']
  if (!hasEnv(names)) return json(200, { ok: true, provider: 'Supabase', configured: false, validated: false })

  try {
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    const response = await safeFetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!response.ok) return providerFailure('Supabase', response)
    return json(200, { ok: true, provider: 'Supabase', configured: true, validated: true })
  } catch {
    return json(502, { ok: false, provider: 'Supabase', configured: true, validated: false, error: 'Validation request failed.' })
  }
}

