export async function getEntityImageProviders() {
  const endpoints = [
    ['google', 'test-google-ai'],
    ['openai', 'test-openai'],
  ]
  const providers = await Promise.all(endpoints.map(async ([id, endpoint]) => {
    try {
      const response = await fetch(`/.netlify/functions/${endpoint}`)
      const data = await response.json()
      return { id, configured: Boolean(data.validated) }
    } catch {
      return { id, configured: false }
    }
  }))
  return providers
}

