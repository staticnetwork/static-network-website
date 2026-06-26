#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = resolve('.env.local')
const target = resolve(process.argv[2] || 'work/netlify-env-import.env')

const names = [
  'STATIC_APP_URL',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'GOOGLE_AI_API_KEY',
  'LIVEKIT_URL',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_BASE_URL',
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_SAGE_VOICE_ID',
  'ELEVENLABS_ENTITY_VOICE_ID',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_STATIC_PLUS_PRICE_ID',
  'STRIPE_CREATOR_PRO_PRICE_ID',
  'STRIPE_COINS_500_PRICE_ID',
  'STRIPE_COINS_2500_PRICE_ID',
  'STRIPE_COINS_10000_PRICE_ID',
  'SUPABASE_SERVICE_ROLE_KEY',
]

if (!existsSync(source)) {
  console.error('Missing .env.local.')
  process.exit(1)
}

const env = new Map(
  readFileSync(source, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf('=')
      return index > 0 ? [line.slice(0, index), line.slice(index + 1)] : [line, '']
    }),
)

if (!env.get('STATIC_APP_URL')) env.set('STATIC_APP_URL', 'https://thestaticnetwork.com')

const missing = names.filter((name) => name !== 'ELEVENLABS_ENTITY_VOICE_ID' && name !== 'R2_PUBLIC_BASE_URL' && !env.get(name))
if (missing.length) {
  console.error(JSON.stringify({ exported: false, missing, secretsPrinted: false }, null, 2))
  process.exit(1)
}

const lines = names
  .filter((name) => env.get(name))
  .map((name) => `${name}=${env.get(name)}`)

writeFileSync(target, `${lines.join('\n')}\n`, { mode: 0o600 })
console.log(JSON.stringify({ exported: true, target: process.argv[2] || 'work/netlify-env-import.env', names: lines.map((line) => line.split('=')[0]), secretsPrinted: false }, null, 2))
