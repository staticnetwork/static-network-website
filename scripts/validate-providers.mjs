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
  { name: 'Supabase', required: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'] },
  { name: 'Google AI', required: ['GOOGLE_AI_API_KEY'] },
  { name: 'OpenAI', required: ['OPENAI_API_KEY'] },
  { name: 'ElevenLabs', required: ['ELEVENLABS_API_KEY'], optional: ['ELEVENLABS_SAGE_VOICE_ID', 'ELEVENLABS_ENTITY_VOICE_ID'] },
  { name: 'Runway', required: ['RUNWAY_API_KEY'] },
  { name: 'LiveKit', required: ['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'] },
  { name: 'Cloudflare R2', required: ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'], optional: ['R2_PUBLIC_BASE_URL'] },
]

const report = providers.map((provider) => {
  const missing = provider.required.filter((name) => !process.env[name])
  const optionalMissing = (provider.optional || []).filter((name) => !process.env[name])
  return {
    provider: provider.name,
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

if (report.some((provider) => !provider.configured)) process.exitCode = 1

