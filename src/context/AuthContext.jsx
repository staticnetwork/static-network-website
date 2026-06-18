/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { getCloudProfile, saveCloudProfile } from '../lib/storage/supabaseStore'
import { syncCloudNetworkToLocal, syncLocalNetworkToCloud } from '../lib/storage/storageAdapter'
import { subscribeToNetworkUpdates } from '../lib/staticStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [cloudSync, setCloudSync] = useState(() => ({
    mode: isSupabaseConfigured ? 'cloud-ready' : 'local-only',
    status: isSupabaseConfigured ? 'signed-out' : 'local-only',
    lastSyncedAt: '',
    message: isSupabaseConfigured ? 'Sign in to save the network to cloud.' : 'Cloud access is not configured in this environment.',
  }))
  const syncTimerRef = useRef(null)
  const pullingCloudRef = useRef(false)
  const user = session?.user || null

  const pullCloudNetwork = useCallback(async (nextUser) => {
    if (!isSupabaseConfigured || !nextUser) return null
    pullingCloudRef.current = true
    setCloudSync((current) => ({
      ...current,
      mode: 'cloud',
      status: 'syncing',
      message: 'Reading your cloud network...',
    }))
    try {
      const result = await syncCloudNetworkToLocal(nextUser)
      setCloudSync({
        mode: 'cloud',
        status: 'synced',
        lastSyncedAt: new Date().toISOString(),
        message: 'Cloud network loaded on this device.',
      })
      return result
    } catch (error) {
      setCloudSync({
        mode: 'cloud',
        status: 'error',
        lastSyncedAt: '',
        message: error.message || 'Cloud sync could not read your network.',
      })
      throw error
    } finally {
      pullingCloudRef.current = false
    }
  }, [])

  const syncNow = useCallback(async (reason = 'manual') => {
    if (!isSupabaseConfigured) {
      setCloudSync({
        mode: 'local-only',
        status: 'local-only',
        lastSyncedAt: '',
        message: 'Cloud access is not configured in this environment.',
      })
      return null
    }
    if (!user) {
      setCloudSync({
        mode: 'cloud-ready',
        status: 'signed-out',
        lastSyncedAt: '',
        message: 'Sign in to save this device network to cloud.',
      })
      return null
    }
    setCloudSync((current) => ({
      ...current,
      mode: 'cloud',
      status: 'syncing',
      message: reason === 'auto' ? 'Saving latest local changes to cloud...' : 'Saving your local network to cloud...',
    }))
    try {
      const result = await syncLocalNetworkToCloud(user)
      setCloudSync({
        mode: 'cloud',
        status: 'synced',
        lastSyncedAt: new Date().toISOString(),
        message: 'Cloud saved.',
      })
      return result
    } catch (error) {
      setCloudSync({
        mode: 'cloud',
        status: 'error',
        lastSyncedAt: '',
        message: error.message || 'Cloud sync could not save your latest changes.',
      })
      throw error
    }
  }, [user])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session?.user) {
        try {
          const [nextProfile] = await Promise.all([
            getCloudProfile(data.session.user.id),
            pullCloudNetwork(data.session.user),
          ])
          setProfile(nextProfile)
        } catch {
          setProfile(null)
        }
      } else {
        setCloudSync({
          mode: isSupabaseConfigured ? 'cloud-ready' : 'local-only',
          status: isSupabaseConfigured ? 'signed-out' : 'local-only',
          lastSyncedAt: '',
          message: isSupabaseConfigured ? 'Sign in to save the network to cloud.' : 'Cloud access is not configured in this environment.',
        })
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        try {
          const [nextProfile] = await Promise.all([
            getCloudProfile(nextSession.user.id),
            pullCloudNetwork(nextSession.user),
          ])
          setProfile(nextProfile)
        } catch {
          setProfile(null)
        }
      } else {
        setProfile(null)
        setCloudSync({
          mode: isSupabaseConfigured ? 'cloud-ready' : 'local-only',
          status: isSupabaseConfigured ? 'signed-out' : 'local-only',
          lastSyncedAt: '',
          message: isSupabaseConfigured ? 'Sign in to save the network to cloud.' : 'Cloud access is not configured in this environment.',
        })
      }
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [pullCloudNetwork])

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return undefined
    const unsubscribe = subscribeToNetworkUpdates(() => {
      if (pullingCloudRef.current) return
      window.clearTimeout(syncTimerRef.current)
      setCloudSync((current) => ({
        ...current,
        mode: 'cloud',
        status: 'queued',
        message: 'Local changes queued for cloud save.',
      }))
      syncTimerRef.current = window.setTimeout(() => {
        syncNow('auto').catch(() => {})
      }, 1400)
    })
    return () => {
      window.clearTimeout(syncTimerRef.current)
      unsubscribe()
    }
  }, [syncNow, user])

  async function signIn(email, password) {
    if (!supabase) throw new Error('Account access is preparing for private beta.')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp({ email, password, displayName, username, accountType }) {
    if (!supabase) throw new Error('Account access is preparing for private beta.')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, username, account_type: accountType },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    })
    if (error) throw error
    if (data.user && data.session) {
      const nextProfile = await saveCloudProfile(data.user.id, { displayName, username, accountType })
      setProfile(nextProfile)
    }
    return data
  }

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function updateProfile(nextProfile) {
    if (!session?.user) throw new Error('Sign in to update your account.')
    const saved = await saveCloudProfile(session.user.id, nextProfile)
    setProfile(saved)
    return saved
  }

  const value = {
    configured: isSupabaseConfigured,
    cloudSync,
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    syncNow,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
