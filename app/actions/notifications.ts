'use server'

import { getSupabase, wrapAction } from '@/app/actions/_utils'
import { AuthService } from '@/lib/services/auth.service'
import { NotificationService } from '@/lib/services/notification.service'
import { ProfileService } from '@/lib/services/profile.service'
import type { ActionResult, Notification, Profile } from '@/types/erp'

export async function fetchNotifications(): Promise<ActionResult<Notification[]>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireProfile(supabase)
    return NotificationService.list(supabase, profile.id)
  })
}

export async function fetchUnreadCount(): Promise<ActionResult<number>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireProfile(supabase)
    return NotificationService.unreadCount(supabase, profile.id)
  })
}

export async function markNotificationRead(id: string): Promise<ActionResult<void>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireProfile(supabase)
    await NotificationService.markRead(supabase, id, profile.id)
  })
}

export async function markAllNotificationsRead(): Promise<ActionResult<void>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireProfile(supabase)
    await NotificationService.markAllRead(supabase, profile.id)
  })
}

export async function fetchProfiles(): Promise<ActionResult<Profile[]>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    await AuthService.requireRole(supabase, ['admin'])
    return ProfileService.list(supabase)
  })
}

export async function updateProfile(input: {
  name?: string
  department?: string
}): Promise<ActionResult<Profile>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireProfile(supabase)
    return ProfileService.update(supabase, profile.id, input)
  })
}

export async function updateUserRole(
  userId: string,
  role: 'employee' | 'manager' | 'admin'
): Promise<ActionResult<Profile>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    await AuthService.requireRole(supabase, ['admin'])
    return ProfileService.updateRole(supabase, userId, role)
  })
}

export async function fetchProfileStats(): Promise<
  ActionResult<{
    submitted: number
    approved: number
    pending: number
    activity: Awaited<ReturnType<typeof import('@/lib/services/activity.service').ActivityService.list>>
  }>
> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireProfile(supabase)
    const { ActivityService } = await import('@/lib/services/activity.service')

    const { data: requests } = await supabase
      .from('requests')
      .select('status')
      .eq('employee_id', profile.id)

    const rows = requests ?? []
    const activity = await ActivityService.list(supabase, { limit: 5, userId: profile.id })

    return {
      submitted: rows.length,
      approved: rows.filter((r) => r.status === 'approved').length,
      pending: rows.filter((r) => r.status === 'pending').length,
      activity,
    }
  })
}
