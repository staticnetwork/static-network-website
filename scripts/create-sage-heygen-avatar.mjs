import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { safeJsonFetch, writeActivationOutput, writeLocalEnv } from './provider-activation-utils.mjs'

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

const required = [
  'HEYGEN_API_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_BASE_URL',
]
const missing = required.filter((name) => !process.env[name])
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
if (process.env.HEYGEN_SAGE_AVATAR_ID) {
  console.log('A reusable HeyGen S.A.G.E. avatar ID is already saved. No request was submitted.')
  process.exit(0)
}

const imageBytes = readFileSync(resolve('public/assets/sage/official-sage-foundation.jpg'))
const imageKey = 'sage/official-sage-foundation.jpg'
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})
await s3.send(new PutObjectCommand({
  Bucket: process.env.R2_BUCKET,
  Key: imageKey,
  Body: imageBytes,
  ContentType: 'image/jpeg',
}))
const imageUrl = `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${imageKey}`

const response = await safeJsonFetch('https://api.heygen.com/v3/avatars', {
  method: 'POST',
  headers: {
    'X-Api-Key': process.env.HEYGEN_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'photo',
    name: 'S.A.G.E. — STATIC Network',
    file: { type: 'url', url: imageUrl },
  }),
}, 60000)

if (!response.response.ok) {
  throw new Error(response.data?.error?.message || response.data?.message || `HeyGen avatar creation returned ${response.response.status}.`)
}

const data = response.data?.data || response.data
const avatarId = data.avatar_item?.id || ''
if (!avatarId) throw new Error('HeyGen accepted the request but did not return an avatar ID.')

writeLocalEnv({ HEYGEN_SAGE_AVATAR_ID: avatarId })
writeActivationOutput('sage-heygen-avatar.json', Buffer.from(JSON.stringify({
  provider: 'HeyGen',
  avatarId,
  avatarGroupId: data.avatar_group?.id || '',
  previewImageUrl: data.avatar_item?.preview_image_url || '',
  sourceUrl: imageUrl,
  createdAt: new Date().toISOString(),
}, null, 2)))

console.log('HeyGen S.A.G.E. avatar look created and saved.')
console.log('Stopped before cinematic motion. No $7 video request was submitted.')
