import { execFileSync } from 'node:child_process'
import { safeJsonFetch, writeLocalEnv } from './provider-activation-utils.mjs'

const apiKey = execFileSync('pbpaste', { encoding: 'utf8' }).trim()

if (!apiKey) {
  throw new Error('The clipboard is empty. Copy the HeyGen API key and try again.')
}

const validation = await safeJsonFetch('https://api.heygen.com/v3/users/me', {
  headers: { 'X-Api-Key': apiKey },
})

if (!validation.response.ok) {
  throw new Error(`HeyGen validation returned ${validation.response.status}. Nothing was saved.`)
}

writeLocalEnv({
  TALKING_AVATAR_PROVIDER: 'heygen',
  HEYGEN_API_KEY: apiKey,
})

const wallet = validation.data?.data?.wallet || validation.data?.wallet
console.log('HeyGen key validated and saved locally. No generation request was submitted.')
if (wallet) console.log(`Wallet status: ${JSON.stringify(wallet)}`)
