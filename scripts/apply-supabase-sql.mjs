#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)

function argValue(name) {
  const index = args.indexOf(name)
  if (index === -1) return ''
  return args[index + 1] || ''
}

function flag(name) {
  return args.includes(name)
}

function readEnvFile() {
  const path = resolve('.env.local')
  if (!existsSync(path)) return {}
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const [key, ...rest] = line.split('=')
        return [key.trim(), rest.join('=').trim().replace(/^['"]|['"]$/g, '')]
      }),
  )
}

function projectRefFromUrl(url = '') {
  const match = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i)
  return match?.[1] || ''
}

function clipboardText() {
  try {
    return execFileSync('pbpaste', { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

function usage() {
  console.log(`
STATIC Supabase SQL runner

Usage:
  SUPABASE_ACCESS_TOKEN=sbp_... npm run supabase:apply -- supabase/social_backbone.sql
  npm run supabase:apply -- supabase/radio_backbone.sql --token-from-clipboard

Options:
  --project-ref <ref>        Supabase project ref. Defaults from VITE_SUPABASE_URL in .env.local.
  --token-from-clipboard     Read the Supabase personal access token from the Mac clipboard.
  --token-file <path>        Read the Supabase personal access token from a local file.

Notes:
  - This calls Supabase's project database query endpoint with a personal access token.
  - Do not put service role keys or personal tokens in VITE_ variables.
  - Keep paid/provider API keys in Netlify server-only environment variables.
`)
}

const envFile = readEnvFile()
const sqlFile = args.find((arg) => !arg.startsWith('--')) || 'supabase/social_backbone.sql'
const sqlPath = resolve(sqlFile)
const projectRef = argValue('--project-ref') || process.env.SUPABASE_PROJECT_REF || projectRefFromUrl(envFile.VITE_SUPABASE_URL)
const tokenFile = argValue('--token-file')
const accessToken = process.env.SUPABASE_ACCESS_TOKEN ||
  (tokenFile && existsSync(resolve(tokenFile)) ? readFileSync(resolve(tokenFile), 'utf8').trim() : '') ||
  (flag('--token-from-clipboard') ? clipboardText() : '')

if (flag('--help') || !existsSync(sqlPath) || !projectRef || !accessToken) {
  usage()
  if (!existsSync(sqlPath)) console.error(`Missing SQL file: ${sqlPath}`)
  if (!projectRef) console.error('Missing Supabase project ref.')
  if (!accessToken) console.error('Missing Supabase access token.')
  process.exit(1)
}

const sql = readFileSync(sqlPath, 'utf8')

console.log(`Applying ${sqlFile} to Supabase project ${projectRef}...`)

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
})

const text = await response.text()
let body
try {
  body = JSON.parse(text)
} catch {
  body = text
}

if (!response.ok) {
  console.error('Supabase SQL apply failed.')
  console.error(typeof body === 'string' ? body : JSON.stringify(body, null, 2))
  process.exit(1)
}

console.log('Supabase SQL apply complete.')
if (Array.isArray(body)) {
  console.log(`Returned ${body.length} row set item(s).`)
} else if (body && typeof body === 'object') {
  console.log(JSON.stringify({
    status: body.status || 'ok',
    rows: Array.isArray(body.result) ? body.result.length : undefined,
  }, null, 2))
}
