'use server'

import { getSupabase, wrapAction } from '@/app/actions/_utils'
import { AuthService } from '@/lib/services/auth.service'
import { isAllowedAdminEmail } from '@/lib/admin-config'
import type { ActionResult, Profile } from '@/types/erp'

export async function ensureUserProfile(): Promise<ActionResult<Profile>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    return AuthService.requireProfile(supabase)
  })
}

/** Employee portal (/login, Google) — admins must use /admin/login */
export async function verifyEmployeePortalAccess(): Promise<ActionResult<{ ok: true }>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const user = await AuthService.requireAuth(supabase)
    const profile = await AuthService.requireProfile(supabase)

    if (profile.role === 'admin') {
      await supabase.auth.signOut()
      throw new Error('Admin accounts must sign in at /admin/login')
    }

    if (isAllowedAdminEmail(user.email)) {
      await supabase.auth.signOut()
      throw new Error('This email is reserved for admin access. Use /admin/login')
    }

    return { ok: true }
  })
}

/** Admin portal (/admin/login) — allowlisted email + admin role required */
export async function verifyAdminPortalAccess(): Promise<ActionResult<{ ok: true }>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const user = await AuthService.requireAuth(supabase)
    const profile = await AuthService.requireProfile(supabase)

    if (!isAllowedAdminEmail(user.email)) {
      await supabase.auth.signOut()
      throw new Error('This email is not authorized for admin access')
    }

    if (profile.role !== 'admin') {
      await supabase.auth.signOut()
      throw new Error('Admin account not provisioned. Run: npm run admin:create')
    }

    return { ok: true }
  })
}
