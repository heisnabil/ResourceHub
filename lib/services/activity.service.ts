import type { SupabaseClient } from '@supabase/supabase-js'
import type { ActivityLog } from '@/types/erp'
import { parseSupabaseError } from '@/lib/errors'

interface DbActivity {
  id: string
  user_id: string | null
  action: string
  metadata: Record<string, unknown>
  created_at: string
  profiles: { name: string } | null
}

function mapActivity(row: DbActivity): ActivityLog {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.profiles?.name ?? null,
    action: row.action,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  }
}

function describeAction(row: DbActivity): string {
  const meta = row.metadata ?? {}
  switch (row.action) {
    case 'request_submitted':
      return `Submitted a resource request (qty: ${meta.quantity ?? '?'})`
    case 'request_approved':
      return `Approved a resource request`
    case 'request_rejected':
      return `Rejected a resource request`
    case 'inventory_updated':
      return `Updated inventory item`
    case 'item_added':
      return `Added inventory item: ${meta.item_name ?? 'new item'}`
    case 'low_stock_alert':
      return `Low stock alert: ${meta.item_name ?? 'item'} (${meta.available_stock}/${meta.minimum_stock})`
    default:
      return row.action.replace(/_/g, ' ')
  }
}

export const ActivityService = {
  async list(
    supabase: SupabaseClient,
    options?: { limit?: number; userId?: string }
  ): Promise<(ActivityLog & { description: string })[]> {
    const limit = options?.limit ?? 20

    let query = supabase
      .from('activity_logs')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (options?.userId) {
      query = query.eq('user_id', options.userId)
    }

    const { data, error } = await query
    if (error) throw parseSupabaseError(error)

    return (data as DbActivity[]).map((row) => ({
      ...mapActivity(row),
      description: describeAction(row),
    }))
  },
}
