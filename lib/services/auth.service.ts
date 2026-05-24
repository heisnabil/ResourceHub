import type { SupabaseClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/erp'
import { ProfileService } from '@/lib/services/profile.service'

export const AuthService = {
  async getSessionUser(supabase: SupabaseClient) {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return user
  },

  async requireAuth(supabase: SupabaseClient) {
    const user = await AuthService.getSessionUser(supabase)
    if (!user) throw new Error('UNAUTHORIZED')
    return user
  },

  async getProfile(supabase: SupabaseClient): Promise<Profile | null> {
    const user = await AuthService.getSessionUser(supabase)
    if (!user) return null

    let profile = await ProfileService.getById(supabase, user.id)
    if (profile) return profile

    try {
      return await ProfileService.ensureFromAuthUser(user)
    } catch {
      return null
    }
  },

  async requireProfile(supabase: SupabaseClient): Promise<Profile> {
    const user = await AuthService.requireAuth(supabase)
    const profile = await AuthService.getProfile(supabase)
    if (profile) return profile

    return ProfileService.ensureFromAuthUser(user)
  },

  async requireRole(
    supabase: SupabaseClient,
    roles: Array<'employee' | 'manager' | 'admin'>
  ): Promise<Profile> {
    const profile = await AuthService.requireProfile(supabase)
    if (!roles.includes(profile.role)) {
      throw new Error('FORBIDDEN')
    }
    return profile
  },
}
