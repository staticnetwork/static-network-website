import { existsSync, readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { writeActivationOutput } from './provider-activation-utils.mjs'

const lockedScript = "Welcome to Static Network. I'm Sage, here to guide you through the home of AI entertainment. I can help you create, or take you where you need to go. I'll be in the corner if you need me."

function loadLocalEnv() {
  const target = resolve('.env.local')
  if (!existsSync(target)) return
  for (const rawLine of readFileSync(target, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    if (index > 0 && !process.env[line.slice(0, index)]) {
      process.env[line.slice(0, index)] = line.slice(index + 1)
    }
  }
}

loadLocalEnv()

if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_SAGE_VOICE_ID) {
  throw new Error('ElevenLabs S.A.G.E. voice is not configured.')
}

const words = lockedScript.split(/\s+/)
if (words.length !== 38 || !/\bI'm Sage\b/.test(lockedScript) || /\bS\.A\.G\.E\b/i.test(lockedScript)) {
  throw new Error('The locked production script failed its pronunciation or length guard.')
}

const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(process.env.ELEVENLABS_SAGE_VOICE_ID)}`, {
  method: 'POST',
  headers: {
    'xi-api-key': process.env.ELEVENLABS_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: lockedScript,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.52,
      similarity_boost: 0.78,
      style: 0.3,
      use_speaker_boost: true,
    },
  }),
})

if (!response.ok) {
  throw new Error(`ElevenLabs voice generation returned ${response.status}.`)
}

const target = writeActivationOutput('sage-heygen-final-voice.mp3', Buffer.from(await response.arrayBuffer()))
console.log(`Locked 38-word S.A.G.E. voice generated at ${target}`)
console.log(`Script: "${lockedScript}"`)

if (process.platform === 'darwin') {
  const child = spawn('open', [target], { detached: true, stdio: 'ignore' })
  child.unref()
}
