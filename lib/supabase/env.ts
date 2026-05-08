export interface SupabasePublicEnv {
  url: string
  publishableKey: string
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) return null
  return { url, publishableKey }
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = getSupabasePublicEnv()
  if (!env) throw new Error('Variaveis do Supabase nao configuradas.')
  return env
}
