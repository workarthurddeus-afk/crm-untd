import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireSupabasePublicEnv } from './env'

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowserClient(): SupabaseClient {
  const { url, publishableKey } = requireSupabasePublicEnv()
  browserClient ??= createBrowserClient(url, publishableKey)
  return browserClient
}
