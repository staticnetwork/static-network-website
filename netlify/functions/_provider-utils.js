const requests = new Map()

export function json(statusCode, data, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
    body: JSON.stringify(data),
  }
}

export function parseBody(event) {
  try {
    return JSON.parse(event.body || '{}')
  } catch {
    return {}
  }
}

export function hasEnv(names) {
  return names.every((name) => Boolean(process.env[name]))
}

export function missingEnv(names) {
  return names.filter((name) => !process.env[name])
}

export async function safeFetch(url, options = {}, timeout = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export function requirePost(event) {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'POST required.' })
  return null
}

export function requirePaidConfirmation(body) {
  if (body.confirmPaid !== true) {
    return json(409, {
      ok: false,
      confirmationRequired: true,
      error: 'This action can use paid provider credits. Explicit confirmation is required.',
    })
  }
  return null
}

export function rateLimit(event, limit = 8, windowMs = 60000) {
  const key = event.headers?.['x-nf-client-connection-ip'] || event.headers?.['client-ip'] || 'local'
  const now = Date.now()
  const recent = (requests.get(key) || []).filter((time) => now - time < windowMs)
  if (recent.length >= limit) return json(429, { ok: false, error: 'Rate limit reached. Try again shortly.' })
  recent.push(now)
  requests.set(key, recent)
  return null
}

export function providerFailure(provider, response) {
  return json(response.status || 502, {
    ok: false,
    provider,
    configured: true,
    validated: false,
    error: `${provider} returned ${response.status}. Check the credential and account status.`,
  })
}

export function base64FromBuffer(buffer) {
  return Buffer.from(buffer).toString('base64')
}

