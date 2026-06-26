#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)

function argValue(name) {
  const index = args.indexOf(name)
  return index === -1 ? '' : args[index + 1] || ''
}

const name = argValue('--name')
const sourceFile = argValue('--file')
const targetFile = argValue('--target') || '.env.local'

if (!/^[A-Z0-9_]+$/.test(name) || !sourceFile) {
  console.log('Usage: node scripts/import-local-secret.mjs --name ENV_NAME --file .secret.local [--target .env.local]')
  process.exit(1)
}

const sourcePath = resolve(sourceFile)
if (!existsSync(sourcePath)) {
  console.error(`Missing secret source file: ${sourceFile}`)
  process.exit(1)
}

const value = readFileSync(sourcePath, 'utf8').trim()
if (!value) {
  console.error(`Secret source file is empty: ${sourceFile}`)
  process.exit(1)
}

const targetPath = resolve(targetFile)
const current = existsSync(targetPath) ? readFileSync(targetPath, 'utf8') : ''
const lines = current.split(/\r?\n/).filter(Boolean)
const nextLines = []
let replaced = false

for (const line of lines) {
  if (line.startsWith(`${name}=`)) {
    nextLines.push(`${name}=${value}`)
    replaced = true
  } else {
    nextLines.push(line)
  }
}

if (!replaced) nextLines.push(`${name}=${value}`)
writeFileSync(targetPath, `${nextLines.join('\n')}\n`, { mode: 0o600 })
console.log(JSON.stringify({ imported: true, name, target: targetFile, secretPrinted: false }, null, 2))
