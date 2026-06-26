import { isSupabaseConfigured, supabase } from './supabaseClient'

const LOCAL_KEY = 'static_beta_access_requests'

function saveLocally(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...existing, entry].slice(-50)))
    return true
  } catch {
    return false
  }
}

export async function saveBetaRequest(input) {
  const entry = {
    name: String(input.name || '').trim().slice(0, 120),
    email: String(input.email || '').trim().toLowerCase().slice(0, 240),
    creator_type: String(input.creatorType || '').trim().slice(0, 80),
    build_goal: String(input.buildGoal || '').trim().slice(0, 2000),
    social_link: String(input.socialLink || '').trim().slice(0, 500),
    source: 'public-beta-gate',
    created_at: new Date().toISOString(),
  }

  const localSaved = saveLocally(entry)
  if (!isSupabaseConfigured || !supabase) return { localSaved, cloudSaved: false }

  const { error } = await supabase.from('beta_access_requests').insert(entry)
  if (error) return { localSaved, cloudSaved: false, cloudError: true }
  return { localSaved, cloudSaved: true }
}

