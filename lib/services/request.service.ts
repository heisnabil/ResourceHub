import type { SupabaseClient } from '@supabase/supabase-js'
import type { InventoryCategory, RequestStatus, ResourceRequest } from '@/types/erp'
import { parseSupabaseError } from '@/lib/errors'

interface DbRequestRow {
  id: string
  employee_id: string
  item_id: string
  quantity: number
  status: RequestStatus
  attachment_path: string | null
  remarks: string | null
  approved_by: string | null
  created_at: string
  employee: { name: string; email: string } | null
  item: { item_name: string; category: InventoryCategory } | null
  approver: { name: string } | null
}

function mapRequest(row: DbRequestRow): ResourceRequest {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee?.name ?? 'Unknown',
    employeeEmail: row.employee?.email ?? '',
    itemId: row.item_id,
    itemName: row.item?.item_name ?? 'Unknown',
    itemCategory: row.item?.category ?? 'accessories',
    quantity: row.quantity,
    status: row.status,
    attachmentPath: row.attachment_path,
    remarks: row.remarks,
    approvedBy: row.approved_by,
    approverName: row.approver?.name ?? null,
    createdAt: row.created_at,
  }
}

const REQUEST_SELECT = `
  *,
  employee:profiles!employee_id(name, email),
  item:inventory!item_id(item_name, category),
  approver:profiles!approved_by(name)
`

export interface CreateRequestInput {
  employeeId: string
  itemId: string
  quantity: number
  remarks?: string
  attachmentPath?: string
}

export const RequestService = {
  async list(
    supabase: SupabaseClient,
    options?: { page?: number; pageSize?: number; status?: string; employeeId?: string }
  ): Promise<{ requests: ResourceRequest[]; total: number }> {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 50
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('requests')
      .select(REQUEST_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status)
    }
    if (options?.employeeId) {
      query = query.eq('employee_id', options.employeeId)
    }

    const { data, error, count } = await query.range(from, to)
    if (error) throw parseSupabaseError(error)

    return {
      requests: (data as DbRequestRow[]).map(mapRequest),
      total: count ?? 0,
    }
  },

  async create(supabase: SupabaseClient, input: CreateRequestInput): Promise<ResourceRequest> {
    const item = await supabase
      .from('inventory')
      .select('available_stock')
      .eq('id', input.itemId)
      .single()

    if (item.error || !item.data) {
      throw parseSupabaseError({ message: 'INVENTORY_NOT_FOUND' })
    }

    if (item.data.available_stock < input.quantity) {
      throw parseSupabaseError({
        message: `INSUFFICIENT_STOCK: Available ${item.data.available_stock}, requested ${input.quantity}`,
      })
    }

    const { data, error } = await supabase
      .from('requests')
      .insert({
        employee_id: input.employeeId,
        item_id: input.itemId,
        quantity: input.quantity,
        remarks: input.remarks ?? null,
        attachment_path: input.attachmentPath ?? null,
      })
      .select(REQUEST_SELECT)
      .single()

    if (error) throw parseSupabaseError(error)
    return mapRequest(data as DbRequestRow)
  },

  async approve(supabase: SupabaseClient, requestId: string, approverId: string) {
    const { data, error } = await supabase.rpc('process_item_request', {
      p_request_id: requestId,
      p_approver_id: approverId,
      p_action: 'approve',
    })

    if (error) throw parseSupabaseError(error)
    return data as { status: string; request_id: string; remaining_stock?: number }
  },

  async reject(supabase: SupabaseClient, requestId: string, approverId: string) {
    const { data, error } = await supabase.rpc('process_item_request', {
      p_request_id: requestId,
      p_approver_id: approverId,
      p_action: 'reject',
    })

    if (error) throw parseSupabaseError(error)
    return data as { status: string; request_id: string }
  },
}
