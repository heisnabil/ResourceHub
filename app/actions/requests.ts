'use server'

import { getSupabase, wrapAction } from '@/app/actions/_utils'
import { AuthService } from '@/lib/services/auth.service'
import { RequestService } from '@/lib/services/request.service'
import { StorageService } from '@/lib/services/storage.service'
import type { ActionResult, ResourceRequest } from '@/types/erp'

export async function fetchRequests(options?: {
  page?: number
  status?: string
}): Promise<ActionResult<{ requests: ResourceRequest[]; total: number }>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireProfile(supabase)

    return RequestService.list(supabase, {
      ...options,
      employeeId: profile.role === 'employee' ? profile.id : undefined,
    })
  })
}

export async function fetchInventoryForRequest(): Promise<
  ActionResult<Array<{ id: string; itemName: string; category: string; availableStock: number }>>
> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    await AuthService.requireAuth(supabase)

    const { data, error } = await supabase
      .from('inventory')
      .select('id, item_name, category, available_stock')
      .gt('available_stock', 0)
      .order('item_name')

    if (error) throw error

    return (data ?? []).map((row) => ({
      id: row.id,
      itemName: row.item_name,
      category: row.category,
      availableStock: row.available_stock,
    }))
  })
}

export async function createRequest(input: {
  itemId: string
  quantity: number
  remarks?: string
  attachmentPath?: string
}): Promise<ActionResult<ResourceRequest>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireProfile(supabase)

    return RequestService.create(supabase, {
      employeeId: profile.id,
      itemId: input.itemId,
      quantity: input.quantity,
      remarks: input.remarks,
      attachmentPath: input.attachmentPath,
    })
  })
}

export async function approveRequest(requestId: string): Promise<ActionResult<{ status: string }>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireRole(supabase, ['manager', 'admin'])
    return RequestService.approve(supabase, requestId, profile.id)
  })
}

export async function rejectRequest(requestId: string): Promise<ActionResult<{ status: string }>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireRole(supabase, ['manager', 'admin'])
    return RequestService.reject(supabase, requestId, profile.id)
  })
}

export async function uploadReceipt(formData: FormData): Promise<ActionResult<{ path: string }>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireProfile(supabase)

    const file = formData.get('file') as File | null
    if (!file || file.size === 0) {
      throw new Error('No file provided')
    }

    const path = await StorageService.uploadReceipt(supabase, profile.id, file)
    return { path }
  })
}
