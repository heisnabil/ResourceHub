import type { SupabaseClient } from '@supabase/supabase-js'
import type { Notification } from '@/types/erp'
import { parseSupabaseError } from '@/lib/errors'

interface DbNotification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

function mapNotification(row: DbNotification): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  }
}

export const NotificationService = {
  async list(
    supabase: SupabaseClient,
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number }
  ): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(options?.limit ?? 50)

    if (options?.unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query
    if (error) throw parseSupabaseError(error)
    return (data as DbNotification[]).map(mapNotification)
  },

  async markRead(supabase: SupabaseClient, id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw parseSupabaseError(error)
  },

  async markAllRead(supabase: SupabaseClient, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw parseSupabaseError(error)
  },

  async unreadCount(supabase: SupabaseClient, userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw parseSupabaseError(error)
    return count ?? 0
  },
}
