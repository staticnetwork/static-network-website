export async function generateWithOpenAI(payload) {
  const response = await fetch('/.netlify/functions/generate-entity-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, provider: 'openai' }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'OpenAI image generation failed.')
  return [{ ...data, dataUrl: `data:${data.mimeType};base64,${data.base64}` }]
}
