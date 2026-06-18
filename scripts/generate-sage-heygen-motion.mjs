import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { safeJsonFetch, writeActivationOutput } from './provider-activation-utils.mjs'

const jobRecordPath = resolve('activation-output/sage-heygen-motion-job.json')
const outputPath = resolve('activation-output/sage-heygen-motion-master.mp4')

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
    return JSON.parse(readFileSync(jobRecordPath, 'utf8')).videoId || ''
  } catch {
    return ''
  }
}

loadLocalEnv()

const required = ['HEYGEN_API_KEY', 'HEYGEN_SAGE_AVATAR_ID', 'R2_PUBLIC_BASE_URL']
const missing = required.filter((name) => !process.env[name])
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`)

if (existsSync(outputPath)) {
  console.log(`Motion master already exists at ${outputPath}. No new HeyGen job was submitted.`)
  process.exit(0)
}

let videoId = getExistingJobId()
if (!videoId) {
  const sourceUrl = `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/sage/official-sage-foundation.jpg`
  const created = await heyGen('/v3/videos', {
    method: 'POST',
    body: JSON.stringify({
      type: 'cinematic_avatar',
      prompt: [
        'One continuous locked wide full-body cinematic shot inside the exact premium black and icy-cyan futuristic broadcast chamber shown in the reference.',
        'Sage materializes on the luminous circular platform, steps off naturally, then walks slowly and confidently across the stage while presenting with restrained executive hand gestures.',
        'Keep Sage fully visible from head to toe for the entire shot. Preserve her exact face, short dark hair, silver tailored suit, body proportions, platform, and environment.',
        'She looks toward the viewer. Near the end she stops, points clearly toward the lower-right corner, and holds the final pointing pose for two seconds.',
        'Elegant realistic movement, premium cinematic lighting, stable identity, stable hands.',
        'No camera cuts, no zoom, no close-up, no text, no logo, no extra people, no duplicate body, no wardrobe change, no disappearance, and no speaking mouth movement.',
      ].join(' '),
      avatar_id: [process.env.HEYGEN_SAGE_AVATAR_ID],
      references: [{ type: 'url', url: sourceUrl }],
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: 15,
      enhance_prompt: false,
      title: 'S.A.G.E. Landing Performance — Motion Master',
    }),
  }, 60000)

  videoId = created.video_id || created.id || ''
  if (!videoId) throw new Error('HeyGen did not return a cinematic video job ID.')
  writeActivationOutput('sage-heygen-motion-job.json', Buffer.from(JSON.stringify({
    provider: 'HeyGen',
    videoId,
    status: created.status || 'pending',
    submittedAt: new Date().toISOString(),
    approvedChargeUsd: 7,
  }, null, 2)))
  console.log('Approved $7 cinematic motion job submitted once. Waiting for the same job to complete.')
} else {
  console.log('Existing cinematic motion job found. Polling it without submitting another charge.')
}

for (let attempt = 0; attempt < 180; attempt += 1) {
  const data = await heyGen(`/v3/videos/${encodeURIComponent(videoId)}`, {}, 20000)
  console.log(`Motion status: ${data.status || 'processing'}`)
  if (data.status === 'completed' && data.video_url) {
    const response = await fetch(data.video_url)
    if (!response.ok) throw new Error(`Completed HeyGen video download returned ${response.status}.`)
    writeActivationOutput('sage-heygen-motion-master.mp4', Buffer.from(await response.arrayBuffer()))
    writeActivationOutput('sage-heygen-motion-result.json', Buffer.from(JSON.stringify({
      provider: 'HeyGen',
      videoId,
      status: data.status,
      videoUrl: data.video_url,
      duration: data.duration || 15,
      completedAt: new Date().toISOString(),
    }, null, 2)))
    console.log(`Motion master downloaded to ${outputPath}`)
    console.log('Stopped before precision lipsync. No lipsync request was submitted.')
    process.exit(0)
  }
  if (data.status === 'failed') {
    throw new Error(data.failure_message || 'HeyGen cinematic motion failed.')
  }
  await new Promise((resolveWait) => setTimeout(resolveWait, 10000))
}

throw new Error(`HeyGen motion is still processing. Re-run this script to poll job ${videoId} without creating another charge.`)
