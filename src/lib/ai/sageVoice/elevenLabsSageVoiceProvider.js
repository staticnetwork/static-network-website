export async function speakWithElevenLabs(text, confirmPaid = false) {
  const response = await fetch('/.netlify/functions/generate-sage-voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, confirmPaid }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'ElevenLabs voice request failed.')
  const audio = new Audio(`data:${data.mimeType};base64,${data.audioBase64}`)
  await audio.play()
  return audio
}

