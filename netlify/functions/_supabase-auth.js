import { safeFetch } from './_provider-utils.js'

export function supabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return { url, anonKey, serviceRoleKey, configured: Boolean(url && anonKey) }
}

export function bearerToken(event) {
  const header = event.headers?.authorization || event.headers?.Authorization || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1] || ''
}

export async function requireSupabaseUser(event) {
  const { url, anonKey, configured } = supabaseEnv()
  const token = bearerToken(event)
  if (!configured) throw Object.assign(new Error('Supabase is not configured.'), { statusCode: 503 })
  if (!token) throw Object.assign(new Error('Log in to continue.'), { statusCode: 401 })

  const response = await safeFetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw Object.assign(new Error('Your session could not be verified.'), { statusCode: 401 })
  const user = await response.json()
  return { user, token, url, anonKey }
}

export async function serviceRoleInsert(table, row) {
  const { url, serviceRoleKey } = supabaseEnv()
  if (!url || !serviceRoleKey) throw Object.assign(new Error('Supabase service role is not configured for server fulfillment.'), { statusCode: 503 })
  const response = await safeFetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  })
  if (!response.ok) throw new Error(`Supabase insert failed for ${table}.`)
}

export async function serviceRoleUpsert(table, row, { onConflict = '', returning = false } = {}) {
  const { url, serviceRoleKey } = supabaseEnv()
  if (!url || !serviceRoleKey) throw Object.assign(new Error('Supabase service role is not configured for server fulfillment.'), { statusCode: 503 })
  const endpoint = new URL(`${url}/rest/v1/${table}`)
  if (onConflict) endpoint.searchParams.set('on_conflict', onConflict)
  const response = await safeFetch(endpoint.toString(), {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: `${onConflict ? 'resolution=merge-duplicates,' : ''}${returning ? 'return=representation' : 'return=minimal'}`,
    },
    body: JSON.stringify(row),
  })
  if (!response.ok) throw new Error(`Supabase upsert failed for ${table}.`)
  if (!returning) return null
  return response.json()
}

export async function serviceRoleRpc(functionName, payload) {
  const { url, serviceRoleKey } = supabaseEnv()
  if (!url || !serviceRoleKey) throw Object.assign(new Error('Supabase service role is not configured for server fulfillment.'), { statusCode: 503 })
  const response = await safeFetch(`${url}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Supabase RPC failed for ${functionName}.`)
  return response.json().catch(() => null)
}
