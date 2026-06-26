import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const catalog = {
  supabase: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'],
  google: ['GOOGLE_AI_API_KEY'],
  openai: ['OPENAI_API_KEY'],
  elevenlabs: ['ELEVENLABS_API_KEY', 'ELEVENLABS_SAGE_VOICE_ID', 'ELEVENLABS_ENTITY_VOICE_ID'],
  runway: ['RUNWAY_API_KEY'],
  livekit: ['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'],
  r2: ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_BASE_URL'],
  stripe: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_STATIC_PLUS_PRICE_ID',
    'STRIPE_CREATOR_PRO_PRICE_ID',
    'STRIPE_COINS_500_PRICE_ID',
    'STRIPE_COINS_2500_PRICE_ID',
    'STRIPE_COINS_10000_PRICE_ID',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
}

const provider = process.argv.find((arg) => arg.startsWith('--provider='))?.split('=')[1]
const writeLocal = process.argv.includes('--write-local')

if (!provider || !catalog[provider]) {
  console.log('Usage: node scripts/activate-providers.mjs --provider=<supabase|google|openai|elevenlabs|runway|livekit|r2|stripe> --write-local')
  console.log('Load credentials into your shell environment first. This script never accepts secrets as command-line arguments.')
  process.exitCode = 1
} else {
  const names = catalog[provider]
  const missing = names.filter((name) => !process.env[name])
  if (missing.length) {
    console.log(JSON.stringify({ provider, activated: false, missing, note: 'No file was changed.' }, null, 2))
    process.exitCode = 1
  } else if (!writeLocal) {
    console.log(JSON.stringify({ provider, ready: true, note: 'Variables are present in this process. Add --write-local to store them in .env.local.' }, null, 2))
  } else {
    const path = resolve('.env.local')
    const current = existsSync(path) ? readFileSync(path, 'utf8') : ''
    const lines = new Map(
      current.split(/\r?\n/).filter(Boolean).map((line) => {
        const index = line.indexOf('=')
        return index > 0 ? [line.slice(0, index), line.slice(index + 1)] : [line, '']
      }),
    )
    for (const name of names) lines.set(name, process.env[name])
    writeFileSync(path, `${[...lines].map(([name, value]) => `${name}=${value}`).join('\n')}\n`, { mode: 0o600 })
    console.log(JSON.stringify({ provider, activated: true, target: '.env.local', secretsPrinted: false }, null, 2))
  }
}
