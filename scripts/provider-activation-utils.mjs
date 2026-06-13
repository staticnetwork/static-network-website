import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import { basename, resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

export function heading(title, copy) {
  console.log(`\nSTATIC PROVIDER ACTIVATION // ${title}`)
  console.log(copy)
}

export async function ask(question, { secret = false, optional = false } = {}) {
  if (!stdin.isTTY || !stdout.isTTY) throw new Error('Run this command in an interactive terminal.')
  if (!secret) {
    const rl = createInterface({ input: stdin, output: stdout })
    const answer = (await rl.question(`${question}${optional ? ' (optional)' : ''}: `)).trim()
    rl.close()
    return answer
  }

  stdout.write(`${question}${optional ? ' (optional)' : ''}: `)
  stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf8')
  let value = ''
  await new Promise((resolveValue, reject) => {
    function cleanup() {
      stdin.off('data', onData)
      stdin.setRawMode(false)
      stdin.pause()
      stdout.write('\n')
    }
    function onData(character) {
      if (character === '\u0003') {
        cleanup()
        reject(new Error('Activation cancelled.'))
        return
      }
      if (character === '\r' || character === '\n') {
        cleanup()
        resolveValue()
        return
      }
      if (character === '\u007f') {
        value = value.slice(0, -1)
        return
      }
      value += character
    }
    stdin.on('data', onData)
  })
  return value
    .replaceAll(`${String.fromCharCode(27)}[200~`, '')
    .replaceAll(`${String.fromCharCode(27)}[201~`, '')
    .replace(/\s+/g, '')
}

export async function choose(question, options) {
  console.log(`\n${question}`)
  options.forEach((option, index) => console.log(`  ${index + 1}. ${option.label}`))
  const answer = await ask('Choose a number, or type skip')
  if (answer.toLowerCase() === 'skip') return null
  const selection = Number.parseInt(answer, 10) - 1
  if (!options[selection]) throw new Error('That selection is not available.')
  return options[selection].value
}

export async function confirm(question, { allowSkip = true } = {}) {
  const answer = (await ask(`${question} (${allowSkip ? 'y/n/skip' : 'y/n'})`)).toLowerCase()
  if (allowSkip && answer === 'skip') return null
  return answer === 'y' || answer === 'yes'
}

export function openProviderPage(url) {
  console.log(`\nOpen this provider page: ${url}`)
  if (process.platform === 'darwin') {
    const child = spawn('open', [url], { detached: true, stdio: 'ignore' })
    child.unref()
  }
}

function parseEnv(text) {
  const entries = new Map()
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    if (index > 0) entries.set(line.slice(0, index), line.slice(index + 1))
  }
  return entries
}

export function writeLocalEnv(values) {
  const target = resolve('.env.local')
  const entries = existsSync(target) ? parseEnv(readFileSync(target, 'utf8')) : new Map()
  Object.entries(values).forEach(([name, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) entries.set(name, String(value).trim())
  })
  writeFileSync(target, `${[...entries].map(([name, value]) => `${name}=${value}`).join('\n')}\n`, { mode: 0o600 })
  console.log(`Saved ${Object.keys(values).length} setting(s) to ${basename(target)}. Secret values were not printed.`)
}

export function writeActivationOutput(fileName, bytes) {
  const directory = resolve('activation-output')
  mkdirSync(directory, { recursive: true, mode: 0o700 })
  const target = resolve(directory, fileName)
  writeFileSync(target, bytes, { mode: 0o600 })
  return target
}

export async function safeJsonFetch(url, options = {}, timeout = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    const text = await response.text()
    let data = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = {}
    }
    return { response, data }
  } finally {
    clearTimeout(timer)
  }
}

export async function offerNetlifyImport() {
  const shouldImport = await confirm('Import .env.local into the linked Netlify site now? This updates server environment variables.')
  if (!shouldImport) return
  const cli = resolve('work/netlify-cli/node_modules/netlify-cli/bin/run.js')
  if (!existsSync(cli)) {
    printNetlifyInstructions()
    return
  }
  const status = spawnSync(process.execPath, [cli, 'status', '--json'], { stdio: 'ignore' })
  if (status.status !== 0) {
    console.log('Netlify CLI is not authenticated or this folder is not linked.')
    printNetlifyInstructions()
    return
  }
  const result = spawnSync(process.execPath, [cli, 'env:import', '.env.local'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.status !== 0) {
    console.log('Netlify environment import did not complete.')
    if (result.stderr) console.log(result.stderr.replace(/sk_[a-zA-Z0-9_-]+/g, '[REDACTED]'))
    printNetlifyInstructions()
    return
  }
  console.log('Netlify environment import completed.')
}

function printNetlifyInstructions() {
  const entries = existsSync(resolve('.env.local')) ? parseEnv(readFileSync(resolve('.env.local'), 'utf8')) : new Map()
  console.log('\nExact Netlify steps:')
  console.log('  1. Open Netlify > your STATIC site > Project configuration > Environment variables.')
  console.log('  2. Add the server variables listed below using the values stored in .env.local.')
  console.log('  3. Keep secret variables scoped to Functions/Builds, never expose them as VITE_*.')
  console.log('  4. Save, then trigger a new production deploy.')
  console.log(`  Variable names: ${[...entries.keys()].join(', ') || 'See .env.example'}`)
}

export function runActivationScript(fileName) {
  const result = spawnSync(process.execPath, [resolve('scripts', fileName)], { stdio: 'inherit' })
  return result.status === 0
}
