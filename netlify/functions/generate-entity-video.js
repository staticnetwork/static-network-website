import { hasEnv, json, parseBody, requirePaidConfirmation, requirePost } from './_provider-utils.js'

export const handler = async (event) => {
  const methodError = requirePost(event)
  if (methodError) return methodError
  const body = parseBody(event)
  const confirmationError = requirePaidConfirmation(body)
  if (confirmationError) return confirmationError
  const configured = hasEnv(['RUNWAY_API_KEY'])
  if (!configured) return json(503, { ok: false, provider: 'Runway', configured: false, error: 'Runway is not configured.' })
  return json(501, {
    ok: false,
    provider: 'Runway',
    configured: true,
    requiresExplicitLaunch: true,
    error: 'Video generation is intentionally held at the adapter boundary until an owner-approved model, duration, and spend limit are selected.',
  })
}

