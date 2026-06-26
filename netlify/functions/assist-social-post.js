import { hasEnv, json, parseBody, rateLimit, requirePost, safeFetch } from './_provider-utils.js'
import { requireSupabaseUser } from './_supabase-auth.js'

const FREE_WEEKLY_LIMIT = Number(process.env.STATIC_AI_FREE_WEEKLY_LIMIT || 3)
const PLUS_WEEKLY_LIMIT = Number(process.env.STATIC_AI_PLUS_WEEKLY_LIMIT || 30)
const OWNER_WEEKLY_LIMIT = Number(process.env.STATIC_AI_OWNER_WEEKLY_LIMIT || 100)
const GOOGLE_TEXT_MODEL = process.env.GOOGLE_AI_TEXT_MODEL || 'gemini-2.5-flash'

function startOfWeekIso() {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = (day + 6) % 7
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff, 0, 0, 0, 0))
  return start.toISOString()
}

function nextWeekIso() {
  const start = new Date(startOfWeekIso())
  start.setUTCDate(start.getUTCDate() + 7)
  return start.toISOString()
}

function userLimit(user) {
  const role = String(user?.app_metadata?.role || user?.user_metadata?.role || '').toLowerCase()
  const plan = String(user?.app_metadata?.plan || user?.user_metadata?.plan || '').toLowerCase()
  if (role === 'owner' || role === 'admin' || user?.email === 'thestaticnetwork.com@gmail.com') return OWNER_WEEKLY_LIMIT
  if (plan === 'static_plus' || plan === 'static+') return PLUS_WEEKLY_LIMIT
  return FREE_WEEKLY_LIMIT
}

async function weeklyUsage({ url, anonKey, token, user }) {
  const since = startOfWeekIso()
  const endpoint = new URL(`${url}/rest/v1/provider_jobs`)
  endpoint.searchParams.set('select', 'id')
  endpoint.searchParams.set('owner_id', `eq.${user.id}`)
  endpoint.searchParams.set('provider', 'eq.google-ai')
  endpoint.searchParams.set('job_type', 'eq.social_post_assist')
  endpoint.searchParams.set('created_at', `gte.${since}`)
  endpoint.searchParams.set('limit', '101')

  const response = await safeFetch(endpoint.toString(), {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error('AI usage quota could not be checked. Run the social backbone migration if this keeps happening.')
  const rows = await response.json()
  return Array.isArray(rows) ? rows.length : 0
}

async function recordUsage({ url, anonKey, token, user }, prompt, result) {
  const response = await safeFetch(`${url}/rest/v1/provider_jobs`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      owner_id: user.id,
      provider: 'google-ai',
      job_type: 'social_post_assist',
      status: 'completed',
      prompt,
      input: { model: GOOGLE_TEXT_MODEL, product: 'static-social' },
      output: result,
      cost_cents: 0,
      approved: true,
    }),
  })
  if (!response.ok) throw new Error('AI usage could not be recorded. The assistant result was not saved against quota.')
}

function cleanDraft(body) {
  return {
    postType: String(body.postType || 'Text').slice(0, 60),
    title: String(body.title || '').slice(0, 180),
    text: String(body.text || '').slice(0, 1600),
    tags: String(body.tags || '').slice(0, 300),
    aiTools: String(body.aiTools || '').slice(0, 240),
    aiProcess: String(body.aiProcess || '').slice(0, 500),
  }
}

function systemPrompt(draft) {
  return [
    'You are the STATIC Social AI Post Assistant.',
    'Help a human creator post AI-made or AI-assisted work in a polished social-media voice.',
    'Return ONLY valid JSON with these keys: title, caption, tags, category, aiDisclosure, signalEligible, improvementNote.',
    'Rules:',
    '- The caption should sound like the creator experienced or made the work, not like a brochure.',
    '- Keep title under 80 characters.',
    '- Keep caption under 500 characters.',
    '- Return 4 to 8 hashtags in tags as an array.',
    '- category must be one of Image, Video, Audio, Music, Fashion, Worldbuilding, Marketplace, Live, Channel, Other.',
    '- aiDisclosure must be a short honest sentence.',
    '- signalEligible must be false if the draft does not describe AI-made or AI-assisted work.',
    '- Do not claim tools, rights, payments, streaming, or backend actions happened.',
    '',
    `Draft type: ${draft.postType}`,
    `Draft title: ${draft.title || '(empty)'}`,
    `Draft text: ${draft.text || '(empty)'}`,
    `Current tags: ${draft.tags || '(empty)'}`,
    `AI tools: ${draft.aiTools || '(empty)'}`,
    `AI process: ${draft.aiProcess || '(empty)'}`,
  ].join('\n')
}

function parseAssistantJson(text) {
  const raw = String(text || '').trim()
  const stripped = raw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  const match = stripped.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(match ? match[0] : stripped)
  return {
    title: String(parsed.title || '').slice(0, 100),
    caption: String(parsed.caption || '').slice(0, 700),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map((tag) => String(tag || '').trim()).filter(Boolean).slice(0, 8) : [],
    category: String(parsed.category || 'Other').slice(0, 60),
    aiDisclosure: String(parsed.aiDisclosure || '').slice(0, 240),
    signalEligible: parsed.signalEligible !== false,
    improvementNote: String(parsed.improvementNote || '').slice(0, 300),
  }
}

async function googleAssist(prompt) {
  const response = await safeFetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GOOGLE_TEXT_MODEL)}:generateContent?key=${encodeURIComponent(process.env.GOOGLE_AI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,
        responseMimeType: 'application/json',
      },
    }),
  }, 45000)
  if (!response.ok) throw new Error(`Google AI returned ${response.status}.`)
  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim()
  if (!text) throw new Error('Google AI returned no assistant text.')
  return parseAssistantJson(text)
}

export const handler = async (event) => {
  const methodError = requirePost(event)
  if (methodError) return methodError
  const limited = rateLimit(event, 12)
  if (limited) return limited
  if (!hasEnv(['GOOGLE_AI_API_KEY'])) return json(503, { ok: false, provider: 'Google AI', configured: false, error: 'Google AI is not configured.' })

  try {
    const auth = await requireSupabaseUser(event)
    const limit = userLimit(auth.user)
    const used = await weeklyUsage(auth)
    if (used >= limit) {
      return json(402, {
        ok: false,
        provider: 'Google AI',
        quotaExceeded: true,
        used,
        limit,
        resetAt: nextWeekIso(),
        upgrade: 'Static+ will unlock a larger weekly AI-assist allowance once payments are connected.',
        error: `Weekly AI assist limit reached (${used}/${limit}).`,
      })
    }

    const draft = cleanDraft(parseBody(event))
    const prompt = systemPrompt(draft)
    const result = await googleAssist(prompt)
    await recordUsage(auth, prompt, result)
    return json(200, {
      ok: true,
      provider: 'Google AI',
      model: GOOGLE_TEXT_MODEL,
      used: used + 1,
      limit,
      resetAt: nextWeekIso(),
      result,
    })
  } catch (error) {
    return json(error.statusCode || 502, {
      ok: false,
      provider: 'Google AI',
      configured: true,
      error: error.message || 'AI post assistant failed.',
    })
  }
}
