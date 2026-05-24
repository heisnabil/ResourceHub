import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types/erp'
import { parseSupabaseError } from '@/lib/errors'
import { createAdminClient } from '@/lib/supabase-admin'
import { profileFromAuthUser } from '@/lib/auth-user-display'
import { isAllowedAdminEmail } from '@/lib/admin-config'

interface DbProfile {
  id: string
  name: string
  email: string
  avatar: string | null
  department: string | null
  role: UserRole
  created_at: string
}

function mapProfile(row: DbProfile): Profile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    department: row.department,
    role: row.role,
    createdAt: row.created_at,
  }
}

function authUserToRow(user: User) {
  const fallback = profileFromAuthUser(user)
  return {
    id: user.id,
    name: fallback.name,
    email: fallback.email,
    avatar: fallback.avatar,
  }
}

export const ProfileService = {
  /** Remove admin/manager from accounts not on ADMIN_EMAILS allowlist. */
  async enforceRoleSecurity(user: User): Promise<void> {
    const admin = createAdminClient()
    if (!admin || !user.email) return

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) return

    if (!isAllowedAdminEmail(user.email) && profile.role !== 'employee') {
      await admin.from('profiles').update({ role: 'employee' }).eq('id', user.id)
    }
  },

  /** Create or update profile — new users are always employee. */
  async ensureFromAuthUser(user: User): Promise<Profile> {
    const admin = createAdminClient()
    if (!admin) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to create your profile')
    }

    const base = authUserToRow(user)
    const { data: existing } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existing) {
      const { error } = await admin.from('profiles').insert({
        ...base,
        role: 'employee',
      })
      if (error) throw parseSupabaseError(error)
    } else {
      const { error } = await admin
        .from('profiles')
        .update({
          name: base.name,
          email: base.email,
          avatar: base.avatar,
        })
        .eq('id', user.id)
      if (error) throw parseSupabaseError(error)
    }

    await ProfileService.enforceRoleSecurity(user)

    const { data, error: readError } = await admin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (readError || !data) {
      throw parseSupabaseError(readError ?? { message: 'Profile not found after create' })
    }
    return mapProfile(data as DbProfile)
  },

  async getById(supabase: SupabaseClient, id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return mapProfile(data as DbProfile)
  },

  async list(supabase: SupabaseClient): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name')

    if (error) throw parseSupabaseError(error)
    return (data as DbProfile[]).map(mapProfile)
  },

  async update(
    supabase: SupabaseClient,
    id: string,
    input: { name?: string; department?: string; avatar?: string }
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.department !== undefined && { department: input.department }),
        ...(input.avatar !== undefined && { avatar: input.avatar }),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw parseSupabaseError(error)
    return mapProfile(data as DbProfile)
  },

  async updateRole(
    supabase: SupabaseClient,
    id: string,
    role: UserRole
  ): Promise<Profile> {
    const target = await ProfileService.getById(supabase, id)
    if (!target) throw parseSupabaseError({ message: 'User not found' })

    if (role === 'admin' && !isAllowedAdminEmail(target.email)) {
      throw parseSupabaseError({
        message: 'FORBIDDEN: Admin role requires an allowlisted email (ADMIN_EMAILS)',
      })
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw parseSupabaseError(error)
    return mapProfile(data as DbProfile)
  },
}
