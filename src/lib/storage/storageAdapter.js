import * as localStore from './localStore'
import * as supabaseStore from './supabaseStore'
import { isSupabaseConfigured } from '../supabaseClient'

export function getStorageMode(user) {
  return isSupabaseConfigured && user ? 'cloud' : 'local'
}

export function getStorageAdapter(user) {
  return getStorageMode(user) === 'cloud'
    ? { mode: 'cloud', local: localStore, cloud: supabaseStore }
    : { mode: 'local', local: localStore, cloud: null }
}

export async function importLocalEntityNetwork(user) {
  if (!isSupabaseConfigured || !user) throw new Error('Sign in to cloud access before importing.')
  const bundle = localStore.getLocalMigrationBundle()
  if (!bundle.entities.length) throw new Error('No local Entity is available to import.')
  return supabaseStore.importLocalBundle(user.id, bundle)
}

export async function syncCloudNetworkToLocal(user) {
  if (!isSupabaseConfigured || !user) return null
  const bundle = await supabaseStore.getCloudNetwork(user.id)
  return localStore.mergeCloudNetworkBundle(bundle)
}

export { localStore, supabaseStore }
