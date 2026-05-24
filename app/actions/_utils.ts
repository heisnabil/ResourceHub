'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { toActionError } from '@/lib/errors'
import type { ActionResult } from '@/types/erp'

export async function getSupabase() {
  return createServerSupabaseClient()
}

export async function wrapAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (err) {
    const { error, code } = toActionError(err)
    return { success: false, error, code }
  }
}
