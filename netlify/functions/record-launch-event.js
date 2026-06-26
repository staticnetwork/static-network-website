import { json, parseBody, rateLimit, requirePost } from './_provider-utils.js'
import { bearerToken, requireSupabaseUser, serviceRoleInsert, supabaseEnv } from './_supabase-auth.js'

const allowedTables = new Set([
  'content_impressions',
  'search_events',
  'ops_events',
])

function clean(value = '', max = 240) {
  return String(value || '').trim().slice(0, max)
}

function publicRow(table, body, userId = null) {
  if (table === 'content_impressions') {
    return {
      owner_id: userId,
      target_id: clean(body.targetId || body.target_id, 160),
      target_type: clean(body.targetType || body.target_type || 'signal', 80),
      session_id: clean(body.sessionId || body.session_id, 120),
      event_type: clean(body.eventType || body.event_type || 'impression', 80),
      dwell_seconds: Number(body.dwellSeconds || body.dwell_seconds || 0),
      route: clean(body.route || '/feed', 160),
      data: body.data || {},
    }
  }
  if (table === 'search_events') {
    return {
      owner_id: userId,
      query: clean(body.query, 160),
      filter: clean(body.filter, 80),
      result_count: Number(body.resultCount || body.result_count || 0),
      clicked_target_id: clean(body.clickedTargetId || body.clicked_target_id, 160),
      clicked_target_type: clean(body.clickedTargetType || body.clicked_target_type, 80),
      route: clean(body.route || '/search', 160),
      data: body.data || {},
    }
  }
  return {
    owner_id: userId,
    severity: clean(body.severity || 'info', 40),
    source: clean(body.source || 'web', 80),
    event_name: clean(body.eventName || body.event_name || 'client_event', 120),
    message: clean(body.message, 500),
    route: clean(body.route, 160),
    data: body.data || {},
  }
}

export const handler = async (event) => {
  const methodError = requirePost(event)
  if (methodError) return methodError
  const limited = rateLimit(event, 120, 60000)
  if (limited) return limited

  const { serviceRoleKey } = supabaseEnv()
  if (!serviceRoleKey) return json(503, { ok: false, error: 'Launch event storage is not configured.' })

  const body = parseBody(event)
  let userId = null
  if (bearerToken(event)) {
    try {
      const { user } = await requireSupabaseUser(event)
      userId = user.id
    } catch {
      userId = null
    }
  }

  const events = Array.isArray(body.events) ? body.events.slice(0, 40) : [body]
  const rowsByTable = new Map()

  for (const item of events) {
    const table = clean(item.table || body.table, 80)
    if (!allowedTables.has(table)) return json(400, { ok: false, error: 'Unsupported launch event table.' })
    const row = publicRow(table, item, userId)
    if (!row.target_id && table === 'content_impressions') return json(400, { ok: false, error: 'targetId is required.' })
    if (!row.query && table === 'search_events') return json(400, { ok: false, error: 'query is required.' })
    rowsByTable.set(table, [...(rowsByTable.get(table) || []), row])
  }

  try {
    await Promise.all([...rowsByTable.entries()].map(([table, rows]) => serviceRoleInsert(table, rows.length === 1 ? rows[0] : rows)))
    return json(200, { ok: true, stored: events.length })
  } catch (error) {
    return json(502, { ok: false, error: error.message || 'Launch event could not be stored.' })
  }
}
