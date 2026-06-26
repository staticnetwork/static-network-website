import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(fileName) {
  const path = resolve(fileName)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const providers = [
  { name: 'Supabase', launch: true, required: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'] },
  { name: 'Google AI', launch: true, required: ['GOOGLE_AI_API_KEY'] },
  { name: 'Stripe', launch: true, required: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_STATIC_PLUS_PRICE_ID', 'STRIPE_CREATOR_PRO_PRICE_ID', 'STRIPE_COINS_500_PRICE_ID', 'STRIPE_COINS_2500_PRICE_ID', 'STRIPE_COINS_10000_PRICE_ID', 'SUPABASE_SERVICE_ROLE_KEY'] },
  { name: 'LiveKit', launch: true, required: ['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'] },
  { name: 'Cloudflare R2', launch: true, required: ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'], optional: ['R2_PUBLIC_BASE_URL'] },
  { name: 'OpenAI', launch: false, required: ['OPENAI_API_KEY'] },
  { name: 'ElevenLabs', launch: false, required: ['ELEVENLABS_API_KEY'], optional: ['ELEVENLABS_SAGE_VOICE_ID', 'ELEVENLABS_ENTITY_VOICE_ID'] },
  { name: 'Runway', launch: false, required: ['RUNWAY_API_KEY'] },
]

const report = providers.map((provider) => {
  const missing = provider.required.filter((name) => !process.env[name])
  const optionalMissing = (provider.optional || []).filter((name) => !process.env[name])
  return {
    provider: provider.name,
    launchCritical: Boolean(provider.launch),
    configured: missing.length === 0,
    missing,
    optionalMissing,
  }
})

console.log(JSON.stringify({
  safeMode: true,
  note: 'No paid generation request was made and no secret value was printed.',
  providers: report,
}, null, 2))

if (report.some((provider) => provider.launchCritical && !provider.configured)) process.exitCode = 1
