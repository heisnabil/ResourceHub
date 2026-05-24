import type { SupabaseClient } from '@supabase/supabase-js'
import type { InventoryCategory, InventoryItem } from '@/types/erp'
import { parseSupabaseError } from '@/lib/errors'

interface DbInventory {
  id: string
  item_name: string
  description: string | null
  category: InventoryCategory
  total_stock: number
  available_stock: number
  minimum_stock: number
  created_by: string | null
  created_at: string
}

function mapInventory(row: DbInventory): InventoryItem {
  return {
    id: row.id,
    itemName: row.item_name,
    description: row.description,
    category: row.category,
    totalStock: row.total_stock,
    availableStock: row.available_stock,
    minimumStock: row.minimum_stock,
    createdBy: row.created_by,
    createdAt: row.created_at,
    isLowStock: row.available_stock <= row.minimum_stock,
  }
}

export interface CreateInventoryInput {
  itemName: string
  description?: string
  category: InventoryCategory
  totalStock: number
  minimumStock: number
  createdBy: string
}

export interface UpdateInventoryInput {
  itemName?: string
  description?: string
  category?: InventoryCategory
  totalStock?: number
  availableStock?: number
  minimumStock?: number
}

export const InventoryService = {
  async list(
    supabase: SupabaseClient,
    options?: { page?: number; pageSize?: number; category?: string; search?: string }
  ): Promise<{ items: InventoryItem[]; total: number }> {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 50
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('inventory')
      .select('*', { count: 'exact' })
      .order('item_name')

    if (options?.category && options.category !== 'all') {
      query = query.eq('category', options.category)
    }
    if (options?.search) {
      query = query.ilike('item_name', `%${options.search}%`)
    }

    const { data, error, count } = await query.range(from, to)
    if (error) throw parseSupabaseError(error)

    return {
      items: (data as DbInventory[]).map(mapInventory),
      total: count ?? 0,
    }
  },

  async getById(supabase: SupabaseClient, id: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return mapInventory(data as DbInventory)
  },

  async create(supabase: SupabaseClient, input: CreateInventoryInput): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        item_name: input.itemName,
        description: input.description ?? null,
        category: input.category,
        total_stock: input.totalStock,
        available_stock: input.totalStock,
        minimum_stock: input.minimumStock,
        created_by: input.createdBy,
      })
      .select('*')
      .single()

    if (error) throw parseSupabaseError(error)

    await supabase.rpc('log_activity', {
      p_user_id: input.createdBy,
      p_action: 'item_added',
      p_metadata: { item_id: data.id, item_name: input.itemName },
    })

    return mapInventory(data as DbInventory)
  },

  async update(
    supabase: SupabaseClient,
    id: string,
    userId: string,
    input: UpdateInventoryInput
  ): Promise<InventoryItem> {
    const updates: Record<string, unknown> = {}
    if (input.itemName !== undefined) updates.item_name = input.itemName
    if (input.description !== undefined) updates.description = input.description
    if (input.category !== undefined) updates.category = input.category
    if (input.totalStock !== undefined) updates.total_stock = input.totalStock
    if (input.availableStock !== undefined) updates.available_stock = input.availableStock
    if (input.minimumStock !== undefined) updates.minimum_stock = input.minimumStock

    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw parseSupabaseError(error)

    await supabase.rpc('log_activity', {
      p_user_id: userId,
      p_action: 'inventory_updated',
      p_metadata: { item_id: id, changes: input },
    })

    return mapInventory(data as DbInventory)
  },
}
