import { confirm, heading, runActivationScript } from './provider-activation-utils.mjs'

heading('CORE PROVIDERS', 'This guided sequence activates ElevenLabs, one image provider, and one talking-avatar provider. Every provider can be skipped.')

const scripts = [
  ['ElevenLabs', 'activate-elevenlabs.mjs'],
  ['image provider', 'activate-image-provider.mjs'],
  ['talking-avatar provider', 'activate-talking-avatar.mjs'],
]

for (const [label, fileName] of scripts) {
  const proceed = await confirm(`Continue to ${label} activation?`)
  if (proceed === null) continue
  if (!proceed) continue
  if (!runActivationScript(fileName)) {
    console.log(`${label} activation did not complete. The remaining providers were not changed.`)
    process.exit(1)
  }
}

console.log('Core provider activation sequence finished. Run npm run providers:validate for a no-generation configuration report.')
