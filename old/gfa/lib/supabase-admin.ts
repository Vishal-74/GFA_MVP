import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '@/lib/supabase-env'

/** Service-role client for trusted server routes (bypasses RLS). */
export function createServiceSupabase(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!key) return null
  return createClient(getSupabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
