import { ask, choose, confirm, heading, offerNetlifyImport, openProviderPage, safeJsonFetch, writeLocalEnv } from './provider-activation-utils.mjs'

heading('TALKING AVATAR', 'D-ID is recommended for the first approved S.A.G.E. still-to-video workflow. Tavus is the Phase 3 realtime candidate; HeyGen remains a strong prepaid alternative.')
console.log('D-ID: 14-day free trial; post-trial pricing is account-specific in its dashboard.')
console.log('Tavus: free tier includes limited conversational and generated video minutes; custom replicas begin on paid plans.')
console.log('HeyGen: API free credits exist, but custom photo-avatar generation may require prepaid usage.')

const provider = await choose('Which talking-avatar provider do you want to activate?', [
  { label: 'D-ID (recommended first talking-video workflow)', value: 'did' },
  { label: 'Tavus (recommended Phase 3 realtime evaluation)', value: 'tavus' },
  { label: 'HeyGen (prepaid alternative)', value: 'heygen' },
])
if (!provider) {
  console.log('Skipped. No file was changed.')
  process.exit(0)
}

const config = {
  did: {
    page: 'https://studio.d-id.com/account-settings',
    env: 'DID_API_KEY',
    validate: (key) => safeJsonFetch('https://api.d-id.com/credits', { headers: { Authorization: `Basic ${key}` } }),
  },
  tavus: {
    page: 'https://platform.tavus.io/api-keys',
    env: 'TAVUS_API_KEY',
    validate: (key) => safeJsonFetch('https://tavusapi.com/v2/replicas', { headers: { 'x-api-key': key } }),
  },
  heygen: {
    page: 'https://app.heygen.com/settings?nav=API',
    env: 'HEYGEN_API_KEY',
    validate: (key) => safeJsonFetch('https://api.heygen.com/v2/avatars', { headers: { 'X-Api-Key': key } }),
  },
}[provider]

openProviderPage(config.page)
if (await confirm(`Have you created a ${provider.toUpperCase()} API key?`) !== true) {
  console.log('Skipped. No provider credential was saved.')
  process.exit(0)
}

const apiKey = await ask(`Paste the ${provider.toUpperCase()} API key`, { secret: true })
if (!apiKey) throw new Error('An API key is required.')
const validation = await config.validate(apiKey)
if (!validation.response.ok) throw new Error(`${provider.toUpperCase()} validation returned ${validation.response.status}. No settings were saved.`)

writeLocalEnv({
  TALKING_AVATAR_PROVIDER: provider,
  [config.env]: apiKey,
})
console.log(`${provider.toUpperCase()} validation passed. No video was generated and no paid credits were used.`)

if (provider === 'did') {
  console.log('A D-ID test needs a public image URL and public audio URL and may consume trial or paid credits.')
  if (await confirm('Create one small D-ID talking-video test now?') === true) {
    const sourceUrl = await ask('Public image URL')
    const audioUrl = await ask('Public audio URL')
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: { Authorization: `Basic ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_url: sourceUrl,
        script: { type: 'audio', audio_url: audioUrl },
        config: { fluent: true, pad_audio: 0, result_format: 'mp4' },
      }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(`D-ID test generation returned ${response.status}: ${data.description || data.message || 'request failed'}`)
    console.log(`D-ID accepted the owner-approved test. Talk ID: ${data.id}. Review the completed result in D-ID before approving it in STATIC.`)
  }
} else {
  console.log(`No paid ${provider.toUpperCase()} generation was run. The current STATIC owner lab adapter supports D-ID; this provider requires a reviewed adapter before media tests.`)
}
console.log('Talking-video generation remains owner-confirmed inside /sage-lab.')

await offerNetlifyImport()
console.log('Talking-avatar activation complete. Restart the local dev server after changing environment variables.')
