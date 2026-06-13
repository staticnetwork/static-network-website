export async function generateWithGoogle(payload) {
  const response = await fetch('/.netlify/functions/generate-entity-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, provider: 'google' }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Google image generation failed.')
  return [{ ...data, dataUrl: `data:${data.mimeType};base64,${data.base64}` }]
}

