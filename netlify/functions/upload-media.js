import { HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { hasEnv, json, parseBody, requirePost } from './_provider-utils.js'

const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET']

function client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
}

export const handler = async (event) => {
  const configured = hasEnv(required)
  if (event.httpMethod === 'GET') {
    if (!configured) return json(200, { ok: true, provider: 'Cloudflare R2', configured: false, validated: false })
    try {
      await client().send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET }))
      return json(200, { ok: true, provider: 'Cloudflare R2', configured: true, validated: true })
    } catch {
      return json(502, { ok: false, provider: 'Cloudflare R2', configured: true, validated: false, error: 'Bucket validation failed.' })
    }
  }

  const methodError = requirePost(event)
  if (methodError) return methodError
  if (!configured) return json(503, { ok: false, provider: 'Cloudflare R2', configured: false, error: 'R2 is not configured.' })
  const body = parseBody(event)
  const fileName = String(body.fileName || 'upload.bin').replace(/[^a-zA-Z0-9._-]/g, '-')
  const contentType = String(body.contentType || 'application/octet-stream')
  const allowed = /^(image|video|audio)\//.test(contentType)
  if (!allowed || !body.base64) return json(400, { ok: false, error: 'A base64 image, video, or audio file is required.' })
  const bytes = Buffer.from(body.base64, 'base64')
  if (bytes.length > 10 * 1024 * 1024) return json(413, { ok: false, error: 'Direct uploads are limited to 10 MB.' })

  const key = `entity-media/${Date.now()}-${fileName}`
  await client().send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, Body: bytes, ContentType: contentType }))
  const publicUrl = process.env.R2_PUBLIC_BASE_URL ? `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}` : ''
  return json(200, { ok: true, key, publicUrl })
}
