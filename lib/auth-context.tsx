'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { profileFromAuthUser } from '@/lib/auth-user-display'
import { ensureUserProfile } from '@/app/actions/auth'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'employee' | 'manager' | 'admin'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string | null
  avatar?: string | null
}

function mapServerProfile(p: {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string | null
  avatar?: string | null
}): UserProfile {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    department: p.department,
    avatar: p.avatar,
  }
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  displayProfile: UserProfile | null
  role: UserRole
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()
  const ensuringRef = useRef(false)

  const loadProfile = useCallback(async (authUser: User) => {
    setProfile((prev) => prev ?? profileFromAuthUser(authUser))

    const supabase = createClient()
    if (!supabase) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (data) {
      setProfile(data as UserProfile)
      return
    }

    if (ensuringRef.current) return
    ensuringRef.current = true

    ensureUserProfile()
      .then((result) => {
        if (result.success) setProfile(mapServerProfile(result.data))
      })
      .finally(() => {
        ensuringRef.current = false
      })
  }, [])

  const refreshProfile = useCallback(async () => {
    const supabase = createClient()
    if (!supabase) return

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    setUser(authUser)
    await loadProfile(authUser)
  }, [loadProfile])

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    const syncUser = async (authUser: User | null) => {
      if (!mounted) return
      if (!authUser) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(authUser)
      setProfile(profileFromAuthUser(authUser))
      if (mounted) setLoading(false)
      void loadProfile(authUser)
    }

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      syncUser(authUser)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION') return
        syncUser(session?.user ?? null)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [configured, loadProfile])

  const signIn = async (email: string, password: string) => {
    if (!configured) {
      return { error: 'Add Supabase keys in .env.local to sign in' }
    }

    const supabase = createClient()
    if (!supabase) return { error: 'Supabase client unavailable' }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!configured) {
      return { error: 'Add Supabase keys in .env.local to create an account' }
    }

    const supabase = createClient()
    if (!supabase) return { error: 'Supabase client unavailable' }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) return { error: error.message }
    return { error: null }
  }

  const signInWithGoogle = async (redirectTo = '/dashboard') => {
    if (!configured) {
      return { error: 'Add Supabase keys in .env.local to sign in' }
    }

    const supabase = createClient()
    if (!supabase) return { error: 'Supabase client unavailable' }

    // Always use the current browser origin (never NEXT_PUBLIC_SITE_URL on client).
    const siteUrl = window.location.origin.replace(/\/$/, '')

    // No query string on redirectTo — Supabase allowlist must match exactly.
    const callbackUrl = `${siteUrl}/auth/callback`

    if (redirectTo && redirectTo !== '/dashboard') {
      document.cookie = `oauth_next=${encodeURIComponent(redirectTo)}; path=/; max-age=600; SameSite=Lax`
    } else {
      document.cookie = 'oauth_next=; path=/; max-age=0'
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        skipBrowserRedirect: false,
      },
    })

    if (error) return { error: error.message }
    return { error: null }
  }

  const signOut = async () => {
    if (configured) {
      const supabase = createClient()
      if (supabase) await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
  }

  const displayProfile =
    profile ?? (user ? profileFromAuthUser(user) : null)
  const role: UserRole = profile?.role ?? displayProfile?.role ?? 'employee'

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      displayProfile,
      role,
      loading,
      isConfigured: configured,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
