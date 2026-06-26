import { json, providerFailure, safeFetch } from './_provider-utils.js'

export const handler = async () => {
  const configured = Boolean(
    process.env.VITE_SUPABASE_URL &&
    (process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY)
  )
  if (!configured) return json(200, { ok: true, provider: 'Supabase', configured: false, validated: false })

  try {
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    const headers = { apikey: key }
    if (!key.startsWith('sb_publishable_')) headers.Authorization = `Bearer ${key}`
    const response = await safeFetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
      headers,
    })
    if (!response.ok) return providerFailure('Supabase', response)
    return json(200, { ok: true, provider: 'Supabase', configured: true, validated: true })
  } catch {
    return json(502, { ok: false, provider: 'Supabase', configured: true, validated: false, error: 'Validation request failed.' })
  }
}
