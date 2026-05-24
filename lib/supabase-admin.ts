import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/lib/supabase/config'

let adminClient: SupabaseClient | null = null

/** Server-only client — bypasses RLS. Never import in client components. */
export function createAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return null

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
  }

  return adminClient
}
