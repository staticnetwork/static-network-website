import { AccessToken } from 'livekit-server-sdk'
import { hasEnv, json, parseBody, requirePost } from './_provider-utils.js'
import { requireSupabaseUser } from './_supabase-auth.js'

export const handler = async (event) => {
  const configured = hasEnv(['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'])
  if (event.httpMethod === 'GET') return json(200, { ok: true, provider: 'LiveKit', configured, validated: configured })
  const methodError = requirePost(event)
  if (methodError) return methodError
  if (!configured) return json(503, { ok: false, provider: 'LiveKit', configured: false, error: 'LiveKit is not configured.' })

  let auth
  try {
    auth = await requireSupabaseUser(event)
  } catch (error) {
    return json(error.statusCode || 401, { ok: false, error: error.message || 'Log in to continue.' })
  }

  const body = parseBody(event)
  const identity = String(auth.user.id).slice(0, 64)
  const requestedRoom = String(body.roomName || '').replace(/[^a-z0-9-]/gi, '').slice(0, 64)
  const roomName = requestedRoom || `static-social-${identity.slice(0, 8)}`

  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    ttl: '10m',
  })
  token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true })
  return json(200, { ok: true, url: process.env.LIVEKIT_URL, token: await token.toJwt() })
}
