import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { existsSync, readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { safeJsonFetch, writeActivationOutput } from './provider-activation-utils.mjs'

const jobRecordPath = resolve('activation-output/sage-heygen-talking-job.json')
const outputPath = resolve('activation-output/sage-heygen-arrival-final.mp4')
const audioPath = resolve('activation-output/sage-heygen-final-voice.mp3')

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

async function heyGen(path, options = {}, timeout = 30000) {
  const result = await safeJsonFetch(`https://api.heygen.com${path}`, {
    ...options,
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  }, timeout)
  if (!result.response.ok) {
    throw new Error(result.data?.error?.message || result.data?.message || `HeyGen returned ${result.response.status}.`)
  }
  return result.data?.data || result.data
}

function r2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
}

async function uploadAudio() {
  const key = 'sage/sage-heygen-final-voice.mp3'
  await r2Client().send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: readFileSync(audioPath),
    ContentType: 'audio/mpeg',
  }))
  return `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`
}

function readJob() {
  if (!existsSync(jobRecordPath)) return null
  try {
    return JSON.parse(readFileSync(jobRecordPath, 'utf8'))
  } catch {
    return null
  }
}

loadLocalEnv()

const required = [
  'HEYGEN_API_KEY',
  'HEYGEN_SAGE_AVATAR_ID',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_BASE_URL',
]
const missing = required.filter((name) => !process.env[name])
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
if (!existsSync(audioPath)) throw new Error('The owner-approved locked voice master is required.')
if (existsSync(outputPath)) {
  console.log(`Final S.A.G.E. arrival already exists at ${outputPath}. No new HeyGen job was submitted.`)
  process.exit(0)
}

let job = readJob()
if (!job?.videoId) {
  if (!process.argv.includes('--confirm-paid')) {
    throw new Error('This command can spend about $0.61. Re-run with --confirm-paid only after the owner explicitly approves that charge.')
  }
  const audioUrl = await uploadAudio()
  const idempotencyKey = `sage_talking_${randomUUID()}`
  const created = await heyGen('/v3/videos', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      type: 'avatar',
      avatar_id: process.env.HEYGEN_SAGE_AVATAR_ID,
      title: 'S.A.G.E. Landing Performance — Talking Master',
      aspect_ratio: '16:9',
      resolution: '1080p',
      fit: 'contain',
      output_format: 'mp4',
      audio_url: audioUrl,
      motion_prompt: [
        'Keep Sage visible head to toe on her luminous platform in the original futuristic chamber.',
        'She steps forward with confident presenter energy and uses expressive but elegant hand gestures while speaking.',
        'Her posture is warm, intelligent, and executive rather than stiff.',
        'At the final sentence she turns slightly and points clearly toward the lower-right corner, then holds the pointing pose.',
        'Preserve her exact face, hair, silver suit, proportions, background, and identity.',
      ].join(' '),
      expressiveness: 'high',
    }),
  }, 60000)

  const videoId = created.video_id || created.id || ''
  if (!videoId) throw new Error('HeyGen did not return a talking-avatar video ID.')
  job = {
    provider: 'HeyGen',
    videoId,
    idempotencyKey,
    status: created.status || 'pending',
    submittedAt: new Date().toISOString(),
    approvedMaximumChargeUsd: 1.01,
    expectedChargeUsd: 0.61,
  }
  writeActivationOutput('sage-heygen-talking-job.json', Buffer.from(JSON.stringify(job, null, 2)))
  console.log('Approved native talking-avatar job submitted once. Waiting for the same job to complete.')
} else {
  console.log('Existing native talking-avatar job found. Polling it without submitting another charge.')
}

for (let attempt = 0; attempt < 180; attempt += 1) {
  const data = await heyGen(`/v3/videos/${encodeURIComponent(job.videoId)}`, {}, 20000)
  console.log(`Talking-avatar status: ${data.status || 'processing'}`)
  if (data.status === 'completed' && data.video_url) {
    const response = await fetch(data.video_url)
    if (!response.ok) throw new Error(`Completed HeyGen talking-avatar download returned ${response.status}.`)
    writeActivationOutput('sage-heygen-arrival-final.mp4', Buffer.from(await response.arrayBuffer()))
    writeActivationOutput('sage-heygen-talking-result.json', Buffer.from(JSON.stringify({
      provider: 'HeyGen',
      videoId: job.videoId,
      status: data.status,
      videoUrl: data.video_url,
      duration: data.duration || 12,
      completedAt: new Date().toISOString(),
    }, null, 2)))
    console.log(`Final synchronized S.A.G.E. arrival downloaded to ${outputPath}`)
    process.exit(0)
  }
  if (data.status === 'failed') {
    throw new Error(data.failure_message || 'HeyGen native talking-avatar generation failed.')
  }
  await new Promise((resolveWait) => setTimeout(resolveWait, 10000))
}

throw new Error(`HeyGen talking-avatar video is still processing. Re-run this script to poll job ${job.videoId} without creating another charge.`)
