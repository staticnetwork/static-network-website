import { ask, choose, confirm, heading, offerNetlifyImport, openProviderPage, safeJsonFetch, writeActivationOutput, writeLocalEnv } from './provider-activation-utils.mjs'

heading('IMAGE PROVIDER', 'Choose one real image provider for official S.A.G.E. identity generation. No image request runs during validation.')

const provider = await choose('Which provider do you want to activate?', [
  { label: 'Google Gemini image generation (recommended current primary)', value: 'google' },
  { label: 'OpenAI GPT Image', value: 'openai' },
  { label: 'Manual uploads only, no generated images', value: 'manual' },
])

if (!provider || provider === 'manual') {
  writeLocalEnv({ STATIC_IMAGE_PROVIDER: 'manual' })
  console.log('Manual upload mode selected. No provider secret was requested.')
  process.exit(0)
}

const isGoogle = provider === 'google'
openProviderPage(isGoogle ? 'https://aistudio.google.com/apikey' : 'https://platform.openai.com/api-keys')
if (await confirm(`Have you created a ${isGoogle ? 'Google AI' : 'OpenAI'} API key?`) !== true) {
  console.log('Skipped. No provider credential was saved.')
  process.exit(0)
}

const apiKey = await ask(`Paste the ${isGoogle ? 'Google AI' : 'OpenAI'} API key`, { secret: true })
if (!apiKey) throw new Error('An API key is required.')

const validation = isGoogle
  ? await safeJsonFetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`)
  : await safeJsonFetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${apiKey}` } })
if (!validation.response.ok) throw new Error(`${isGoogle ? 'Google AI' : 'OpenAI'} validation returned ${validation.response.status}. No settings were saved.`)

writeLocalEnv({
  STATIC_IMAGE_PROVIDER: provider,
  [isGoogle ? 'GOOGLE_AI_API_KEY' : 'OPENAI_API_KEY']: apiKey,
})
console.log(`${isGoogle ? 'Google AI' : 'OpenAI'} validation passed. No image was generated and no paid credits were used by this script.`)

console.log(isGoogle
  ? 'A Google Gemini 3.1 Flash Image test is approximately $0.067 for a 1K image at the published June 2026 standard rate.'
  : 'An OpenAI GPT-Image-2 test is token billed. OpenAI API billing is separate from any ChatGPT subscription.')
if (await confirm('Generate one small provider test image now? This may consume paid credits.') === true) {
  const prompt = 'Premium black, silver, and icy-cyan holographic signal orb on a dark studio background, no text, cinematic product lighting.'
  if (isGoogle) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(`Google AI test generation returned ${response.status}.`)
    const image = data.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)
    if (!image) throw new Error('Google AI returned no image for the approved test.')
    console.log(`Test image saved privately at ${writeActivationOutput('image-provider-test.png', Buffer.from(image.inlineData.data, 'base64'))}`)
  } else {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-2', prompt, size: '1024x1024', output_format: 'png' }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(`OpenAI test generation returned ${response.status}.`)
    const base64 = data.data?.[0]?.b64_json
    if (!base64) throw new Error('OpenAI returned no image for the approved test.')
    console.log(`Test image saved privately at ${writeActivationOutput('image-provider-test.png', Buffer.from(base64, 'base64'))}`)
  }
}
console.log('Official S.A.G.E. image generation remains an explicit, confirmed action inside /sage-identity.')

await offerNetlifyImport()
console.log('Image-provider activation complete. Restart the local dev server after changing environment variables.')
