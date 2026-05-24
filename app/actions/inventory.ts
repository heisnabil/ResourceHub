'use server'

import { getSupabase, wrapAction } from '@/app/actions/_utils'
import { AuthService } from '@/lib/services/auth.service'
import { InventoryService, type CreateInventoryInput, type UpdateInventoryInput } from '@/lib/services/inventory.service'
import type { ActionResult, InventoryCategory, InventoryItem } from '@/types/erp'

export async function fetchInventory(options?: {
  page?: number
  category?: string
  search?: string
}): Promise<ActionResult<{ items: InventoryItem[]; total: number }>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    await AuthService.requireAuth(supabase)
    return InventoryService.list(supabase, options)
  })
}

export async function createInventory(
  input: Omit<CreateInventoryInput, 'createdBy'>
): Promise<ActionResult<InventoryItem>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireRole(supabase, ['admin'])
    return InventoryService.create(supabase, { ...input, createdBy: profile.id })
  })
}

export async function updateInventory(
  id: string,
  input: UpdateInventoryInput
): Promise<ActionResult<InventoryItem>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireRole(supabase, ['admin'])
    return InventoryService.update(supabase, id, profile.id, input)
  })
}
