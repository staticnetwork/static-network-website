#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const name = process.argv[2]
const target = resolve(process.argv[3] || '.env.local')

if (!/^[A-Z0-9_]+$/.test(name || '')) {
  console.error('Usage: node scripts/normalize-env-var.mjs ENV_NAME [.env.local]')
  process.exit(1)
}

if (!existsSync(target)) {
  console.error(`Missing env file: ${target}`)
  process.exit(1)
}

const lines = readFileSync(target, 'utf8').split(/\r?\n/)
let changed = false
const next = lines.map((line) => {
  if (!line.startsWith(`${name}=`)) return line
  const raw = line.slice(name.length + 1)
  const normalized = raw.startsWith(`${name}=`) ? raw.slice(name.length + 1) : raw
  changed = changed || normalized !== raw
  return `${name}=${normalized}`
})

writeFileSync(target, next.join('\n').replace(/\n*$/, '\n'), { mode: 0o600 })
console.log(JSON.stringify({ normalized: name, changed, target: process.argv[3] || '.env.local', secretPrinted: false }, null, 2))
