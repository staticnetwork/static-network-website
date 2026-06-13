import { ask, confirm, heading, offerNetlifyImport, openProviderPage, safeJsonFetch, writeActivationOutput, writeLocalEnv } from './provider-activation-utils.mjs'

heading('ELEVENLABS', 'Required for S.A.G.E. speech. Without a validated key and voice ID, S.A.G.E. remains honestly text-only and muted.')
openProviderPage('https://elevenlabs.io/app/settings/api-keys')

if (await confirm('Have you created or selected an ElevenLabs API key?') !== true) {
  console.log('Skipped. No file was changed.')
  process.exit(0)
}

const apiKey = await ask('Paste the ElevenLabs API key', { secret: true })
if (!apiKey) throw new Error('An API key is required.')

const validation = await safeJsonFetch('https://api.elevenlabs.io/v1/user', {
  headers: { 'xi-api-key': apiKey },
})
if (!validation.response.ok) throw new Error(`ElevenLabs validation returned ${validation.response.status}. No settings were saved.`)
console.log('ElevenLabs account validation passed. This validation did not generate audio.')

const voicesResult = await safeJsonFetch('https://api.elevenlabs.io/v2/voices?page_size=100', {
  headers: { 'xi-api-key': apiKey },
})
const voices = Array.isArray(voicesResult.data?.voices) ? voicesResult.data.voices : []
if (voices.length) {
  console.log('\nAvailable voices:')
  voices.slice(0, 30).forEach((voice, index) => console.log(`  ${index + 1}. ${voice.name} // ${voice.voice_id}`))
}

const voiceId = await ask('Enter the approved S.A.G.E. voice ID')
if (!voiceId) throw new Error('A S.A.G.E. voice ID is required.')
const matchedVoice = voices.find((voice) => voice.voice_id === voiceId)
const voiceLabel = matchedVoice?.name || await ask('Enter a private label for this voice', { optional: true }) || 'British Executive Female'

writeLocalEnv({
  ELEVENLABS_API_KEY: apiKey,
  ELEVENLABS_SAGE_VOICE_ID: voiceId,
  ELEVENLABS_SAGE_VOICE_LABEL: voiceLabel,
})

console.log('\nA short audio test consumes ElevenLabs credits. It will not run without explicit approval.')
if (await confirm('Generate the approved S.A.G.E. test line now?') === true) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Hello. I’m S.A.G.E. Welcome to STATIC.',
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.48, similarity_boost: 0.72, style: 0.28 },
    }),
  })
  if (!response.ok) throw new Error(`ElevenLabs test generation returned ${response.status}.`)
  const target = writeActivationOutput('sage-elevenlabs-test.mp3', Buffer.from(await response.arrayBuffer()))
  console.log(`Test audio saved privately at ${target}`)
}

await offerNetlifyImport()
console.log('ElevenLabs activation complete. Restart the local dev server after changing environment variables.')
