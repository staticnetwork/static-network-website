import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { writeActivationOutput } from './provider-activation-utils.mjs'

const sourcePath = resolve('activation-output/sage-heygen-arrival-final.mp4')
const key = 'sage/sage-heygen-arrival-final.mp4'

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
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_BASE_URL',
]
const missing = required.filter((name) => !process.env[name])
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
if (!existsSync(sourcePath)) throw new Error(`Approved video is missing: ${sourcePath}`)

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

await client.send(new PutObjectCommand({
  Bucket: process.env.R2_BUCKET,
  Key: key,
  Body: readFileSync(sourcePath),
  ContentType: 'video/mp4',
  CacheControl: 'public, max-age=31536000, immutable',
}))

const publicUrl = `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`
const record = {
  approved: true,
  approvedAt: new Date().toISOString(),
  provider: 'HeyGen',
  pipeline: 'photo-avatar-v3-native-audio',
  sourceFile: 'sage-heygen-arrival-final.mp4',
  publicUrl,
  r2Key: key,
  durationSeconds: 11.9564,
  generationCostUsd: 0.55,
  reusablePlaybackCostUsd: 0,
}

writeActivationOutput(
  'sage-heygen-arrival-approved.json',
  Buffer.from(JSON.stringify(record, null, 2)),
)

console.log(`Approved S.A.G.E. arrival published: ${publicUrl}`)
console.log('Playback is served from R2 and does not submit another HeyGen job.')
