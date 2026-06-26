import { useEffect, useState } from 'react'

const capabilities = {
  supabase: { endpoint: 'test-supabase', label: 'Supabase' },
  google: { endpoint: 'test-google-ai', label: 'Google AI' },
  media: { endpoint: 'test-media-storage', label: 'Supabase media storage' },
  livekit: { endpoint: 'create-livekit-token', label: 'LiveKit' },
  stripe: { endpoint: 'test-stripe', label: 'Stripe' },
}

const cache = new Map()

export async function checkBackendCapability(key) {
  const config = capabilities[key]
  if (!config) return { ok: false, configured: false, validated: false, provider: key, error: 'Unknown capability.' }
  if (cache.has(key)) return cache.get(key)
  try {
    const response = await fetch(`/.netlify/functions/${config.endpoint}`, { headers: { Accept: 'application/json' } })
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) throw new Error('Netlify functions are unavailable in this local preview.')
    const data = await response.json()
    const result = {
      ok: response.ok && data.ok !== false,
      configured: Boolean(data.configured),
      validated: Boolean(data.validated),
      provider: data.provider || config.label,
      error: data.error || '',
      ...data,
    }
    cache.set(key, result)
    return result
  } catch (error) {
    const result = {
      ok: false,
      configured: false,
      validated: false,
      provider: config.label,
      unavailable: true,
      error: error.message || 'Capability check failed.',
    }
    cache.set(key, result)
    return result
  }
}

export function clearBackendCapabilityCache(key = '') {
  if (key) cache.delete(key)
  else cache.clear()
}

export function useBackendCapability(key) {
  const [state, setState] = useState(() => ({
    loading: true,
    configured: false,
    validated: false,
    provider: capabilities[key]?.label || key,
    error: '',
  }))

  useEffect(() => {
    let active = true
    setState((current) => ({ ...current, loading: true }))
    checkBackendCapability(key)
      .then((result) => {
        if (active) setState({ loading: false, ...result })
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            configured: false,
            validated: false,
            provider: capabilities[key]?.label || key,
            error: error.message || 'Capability check failed.',
          })
        }
      })
    return () => {
      active = false
    }
  }, [key])

  return state
}
