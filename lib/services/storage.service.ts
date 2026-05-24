import type { SupabaseClient } from '@supabase/supabase-js'
import { parseSupabaseError } from '@/lib/errors'

const BUCKET = 'request-receipts'

export const StorageService = {
  async uploadReceipt(
    supabase: SupabaseClient,
    userId: string,
    file: File
  ): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type })

    if (error) throw parseSupabaseError(error)
    return path
  },

  async getSignedUrl(
    supabase: SupabaseClient,
    path: string,
    expiresIn = 3600
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn)

    if (error) throw parseSupabaseError(error)
    return data.signedUrl
  },
}
