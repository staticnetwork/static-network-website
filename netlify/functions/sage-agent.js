import { hasEnv, json, parseBody, rateLimit, requirePaidConfirmation, requirePost, safeFetch } from './_provider-utils.js'

export const handler = async (event) => {
  const methodError = requirePost(event)
  if (methodError) return methodError
  const limited = rateLimit(event, 12)
  if (limited) return limited
  const body = parseBody(event)
  const confirmationError = requirePaidConfirmation(body)
  if (confirmationError) return confirmationError
  if (!hasEnv(['OPENAI_API_KEY'])) return json(503, { ok: false, provider: 'OpenAI', configured: false, error: 'OpenAI is not configured.' })
  const input = String(body.input || '').trim().slice(0, 4000)
  if (!input) return json(400, { ok: false, error: 'Input is required.' })
  try {
    const response = await safeFetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5.5',
        instructions: 'You are S.A.G.E., the concise British concierge and operating guide for STATIC Network. Never claim an action happened unless the client confirms it. Keep answers under 120 words.',
        input,
      }),
    }, 45000)
    if (!response.ok) throw new Error(`OpenAI returned ${response.status}.`)
    const data = await response.json()
    const text = data.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text || data.output_text
    return json(200, { ok: true, provider: 'OpenAI', text: text || 'The network returned no response.' })
  } catch (error) {
    return json(502, { ok: false, provider: 'OpenAI', configured: true, error: error.message || 'S.A.G.E. request failed.' })
  }
}

