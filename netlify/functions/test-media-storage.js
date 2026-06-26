import { json, missingEnv, safeFetch } from './_provider-utils.js'

const required = ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const buckets = ['avatars', 'banners', 'media', 'thumbnails']

export const handler = async () => {
  const missing = missingEnv(required)
  if (missing.length) {
    return json(200, {
      ok: true,
      provider: 'Supabase media storage',
      configured: false,
      validated: false,
      missing,
    })
  }

  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  }

  try {
    const checks = await Promise.all(buckets.map(async (bucket) => {
      const response = await safeFetch(`${process.env.VITE_SUPABASE_URL}/storage/v1/bucket/${bucket}`, { headers })
      return { bucket, ok: response.ok, status: response.status }
    }))
    const missingBuckets = checks.filter((check) => !check.ok).map((check) => check.bucket)
    return json(200, {
      ok: missingBuckets.length === 0,
      provider: 'Supabase media storage',
      configured: true,
      validated: missingBuckets.length === 0,
      buckets,
      missingBuckets,
    })
  } catch {
    return json(502, {
      ok: false,
      provider: 'Supabase media storage',
      configured: true,
      validated: false,
      error: 'Storage bucket validation failed.',
    })
  }
}
