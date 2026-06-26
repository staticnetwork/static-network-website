import { json, missingEnv, safeFetch } from './_provider-utils.js'

const required = ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

const checks = [
  ['profiles', 'id,banner_url,bio,website_url'],
  ['direct_threads', 'id,participant_key,last_message'],
  ['direct_messages', 'id,thread_id,body'],
  ['notifications', 'id,owner_id,title'],
  ['moderation_reports', 'id,reporter_id,target_type'],
  ['content_impressions', 'id,target_id,event_type'],
  ['creator_affinity', 'owner_id,creator_id,score'],
  ['interest_affinity', 'owner_id,interest_key,score'],
  ['creator_analytics_daily', 'id,creator_id,views'],
  ['media_derivatives', 'id,derivative_type,status'],
  ['search_events', 'id,query,result_count'],
  ['push_subscriptions', 'id,endpoint,platform'],
  ['moderation_appeals', 'id,target_id,status'],
  ['copyright_takedowns', 'id,target_id,status'],
  ['creator_payouts', 'id,owner_id,status'],
  ['ops_events', 'id,source,event_name'],
]

export const handler = async () => {
  const missing = missingEnv(required)
  if (missing.length) {
    return json(200, {
      ok: true,
      provider: 'STATIC Social launch tables',
      configured: false,
      validated: false,
      missing,
    })
  }

  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  }

  try {
    const results = await Promise.all(checks.map(async ([table, select]) => {
      const endpoint = new URL(`${process.env.VITE_SUPABASE_URL}/rest/v1/${table}`)
      endpoint.searchParams.set('select', select)
      endpoint.searchParams.set('limit', '1')
      const response = await safeFetch(endpoint.toString(), { headers })
      return { table, ok: response.ok, status: response.status }
    }))
    const missingTables = results.filter((result) => !result.ok).map((result) => result.table)
    return json(200, {
      ok: missingTables.length === 0,
      provider: 'STATIC Social launch tables',
      configured: true,
      validated: missingTables.length === 0,
      checked: checks.map(([table]) => table),
      missingTables,
    })
  } catch {
    return json(502, {
      ok: false,
      provider: 'STATIC Social launch tables',
      configured: true,
      validated: false,
      error: 'Launch table validation failed.',
    })
  }
}
