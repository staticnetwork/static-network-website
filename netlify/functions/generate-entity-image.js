import { hasEnv, json, parseBody, rateLimit, requirePaidConfirmation, requirePost, safeFetch } from './_provider-utils.js'

async function googleImage(prompt) {
  const response = await safeFetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent?key=${encodeURIComponent(process.env.GOOGLE_AI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  }, 60000)
  if (!response.ok) throw new Error(`Google AI returned ${response.status}.`)
  const data = await response.json()
  const image = data.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)
  if (!image) throw new Error('Google AI returned no image.')
  return { base64: image.inlineData.data, mimeType: image.inlineData.mimeType || 'image/png' }
}

async function openAIImage(prompt) {
  const response = await safeFetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt, size: '1024x1024', output_format: 'png' }),
  }, 60000)
  if (!response.ok) throw new Error(`OpenAI returned ${response.status}.`)
  const data = await response.json()
  if (!data.data?.[0]?.b64_json) throw new Error('OpenAI returned no image.')
  return { base64: data.data[0].b64_json, mimeType: 'image/png' }
}

export const handler = async (event) => {
  const methodError = requirePost(event)
  if (methodError) return methodError
  const limited = rateLimit(event, 4)
  if (limited) return limited
  const body = parseBody(event)
  const confirmationError = requirePaidConfirmation(body)
  if (confirmationError) return confirmationError
  const prompt = String(body.prompt || '').trim().slice(0, 6000)
  if (!prompt) return json(400, { ok: false, error: 'A prompt is required.' })

  const preferred = body.provider === 'openai' ? 'openai' : 'google'
  const available = preferred === 'google' ? hasEnv(['GOOGLE_AI_API_KEY']) : hasEnv(['OPENAI_API_KEY'])
  if (!available) return json(503, { ok: false, configured: false, provider: preferred, error: `${preferred} is not configured.` })

  try {
    const image = preferred === 'google' ? await googleImage(prompt) : await openAIImage(prompt)
    return json(200, { ok: true, provider: preferred, ...image })
  } catch (error) {
    return json(502, { ok: false, provider: preferred, configured: true, error: error.message || 'Image generation failed.' })
  }
}
