import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { safeJsonFetch, writeActivationOutput } from './provider-activation-utils.mjs'

const jobRecordPath = resolve('activation-output/sage-heygen-lipsync-job.json')
const outputPath = resolve('activation-output/sage-heygen-arrival-final.mp4')
const motionPath = resolve('activation-output/sage-heygen-motion-master.mp4')
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

function getExistingJobId() {
  if (!existsSync(jobRecordPath)) return ''
  try {
    return JSON.parse(readFileSync(jobRecordPath, 'utf8')).lipsyncId || ''
  } catch {
    return ''
  }
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

async function uploadR2(key, filePath, contentType) {
  await r2Client().send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: readFileSync(filePath),
    ContentType: contentType,
  }))
  return `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`
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
if (!existsSync(motionPath) || !existsSync(audioPath)) {
  throw new Error('The approved motion master and locked voice master are both required.')
}
if (existsSync(outputPath)) {
  console.log(`Final lipsynced arrival already exists at ${outputPath}. No new HeyGen job was submitted.`)
  process.exit(0)
}

let lipsyncId = getExistingJobId()
if (!lipsyncId) {
  const videoUrl = await uploadR2('sage/sage-heygen-motion-master.mp4', motionPath, 'video/mp4')
  const audioUrl = await uploadR2('sage/sage-heygen-final-voice.mp3', audioPath, 'audio/mpeg')
  const created = await heyGen('/v3/lipsyncs', {
    method: 'POST',
    body: JSON.stringify({
      video: { type: 'url', url: videoUrl },
      audio: { type: 'url', url: audioUrl },
      mode: 'precision',
      title: 'S.A.G.E. Landing Performance — Final Lipsync',
      enable_caption: false,
      enable_dynamic_duration: false,
      disable_music_track: false,
      enable_speech_enhancement: false,
      enable_watermark: false,
      keep_the_same_format: true,
      fps_mode: 'passthrough',
    }),
  }, 60000)

  lipsyncId = created.lipsync_id || created.id || ''
  if (!lipsyncId) throw new Error('HeyGen did not return a precision lipsync job ID.')
  writeActivationOutput('sage-heygen-lipsync-job.json', Buffer.from(JSON.stringify({
    provider: 'HeyGen',
    lipsyncId,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    approvedMaximumChargeUsd: 1.01,
  }, null, 2)))
  console.log('Approved precision lipsync submitted once. Waiting for the same job to complete.')
} else {
  console.log('Existing precision lipsync job found. Polling it without submitting another charge.')
}

for (let attempt = 0; attempt < 180; attempt += 1) {
  const data = await heyGen(`/v3/lipsyncs/${encodeURIComponent(lipsyncId)}`, {}, 20000)
  console.log(`Lipsync status: ${data.status || 'processing'}`)
  if (data.status === 'completed' && data.video_url) {
    const response = await fetch(data.video_url)
    if (!response.ok) throw new Error(`Completed HeyGen lipsync download returned ${response.status}.`)
    writeActivationOutput('sage-heygen-arrival-final.mp4', Buffer.from(await response.arrayBuffer()))
    writeActivationOutput('sage-heygen-lipsync-result.json', Buffer.from(JSON.stringify({
      provider: 'HeyGen',
      lipsyncId,
      status: data.status,
      videoUrl: data.video_url,
      duration: data.duration || 15,
      completedAt: new Date().toISOString(),
    }, null, 2)))
    console.log(`Final synchronized arrival downloaded to ${outputPath}`)
    process.exit(0)
  }
  if (data.status === 'failed') {
    throw new Error(data.failure_message || 'HeyGen precision lipsync failed.')
  }
  await new Promise((resolveWait) => setTimeout(resolveWait, 10000))
}

throw new Error(`HeyGen lipsync is still processing. Re-run this script to poll job ${lipsyncId} without creating another charge.`)
