import { ask, choose, confirm, heading, offerNetlifyImport, openProviderPage, safeJsonFetch, writeLocalEnv } from './provider-activation-utils.mjs'

heading('TALKING AVATAR', 'HeyGen is the selected full-body clip candidate. The production workflow uses 1080p Cinematic Avatar motion followed by Precision Lipsync with watermarking disabled.')
console.log('D-ID: rejected for production after its 512x512 face-crop and trial-watermark test.')
console.log('Tavus: free tier includes limited conversational and generated video minutes; custom replicas begin on paid plans.')
console.log('HeyGen: the API uses a separate prepaid wallet; Cinematic Avatar is $7 per video and Precision Lipsync is billed by output duration.')

const provider = await choose('Which talking-avatar provider do you want to activate?', [
  { label: 'HeyGen (selected full-body clip workflow)', value: 'heygen' },
  { label: 'Tavus (recommended Phase 3 realtime evaluation)', value: 'tavus' },
  { label: 'D-ID (rejected; credential validation only)', value: 'did' },
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
    validate: (key) => safeJsonFetch('https://api.heygen.com/v3/users/me', { headers: { 'X-Api-Key': key } }),
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
  console.log('D-ID remains validation-only. STATIC will not submit another D-ID generation.')
} else if (provider === 'heygen') {
  const wallet = validation.data?.data?.wallet || validation.data?.wallet
  console.log('HeyGen production adapter is active: $1 avatar creation, $7 cinematic motion, then $0.0667/sec precision lipsync.')
  if (wallet) console.log(`Wallet status returned by HeyGen: ${JSON.stringify(wallet)}`)
} else {
  console.log(`No paid ${provider.toUpperCase()} generation was run. This provider requires a reviewed adapter before media tests.`)
}
console.log('Talking-video generation remains owner-confirmed inside /sage-lab.')

await offerNetlifyImport()
console.log('Talking-avatar activation complete. Restart the local dev server after changing environment variables.')
