/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { getCloudProfile, saveCloudProfile } from '../lib/storage/supabaseStore'
import { syncCloudNetworkToLocal } from '../lib/storage/storageAdapter'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

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
            syncCloudNetworkToLocal(data.session.user),
          ])
          setProfile(nextProfile)
        } catch {
          setProfile(null)
        }
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        try {
          const [nextProfile] = await Promise.all([
            getCloudProfile(nextSession.user.id),
            syncCloudNetworkToLocal(nextSession.user),
          ])
          setProfile(nextProfile)
        } catch {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

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
    session,
    user: session?.user || null,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
