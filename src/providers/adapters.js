/**
 * Provider adapter registry.
 *
 * TODO: Add only approved production adapters here. Each adapter should isolate
 * vendor-specific SDKs, validate environment configuration on the server, and
 * expose a narrow internal interface. Never place private keys in client code.
 */
export const providerAdapters = {
  audioGeneration: null,
  videoGeneration: null,
  imageGeneration: null,
  gameGeneration: null,
  authentication: null,
  database: null,
  storage: null,
  payments: null,
  analytics: null,
  moderation: null,
}

export function assertProviderConfigured(providerName) {
  const adapter = providerAdapters[providerName]

  if (!adapter) {
    throw new Error(`${providerName} provider is not configured`)
  }

  return adapter
}
