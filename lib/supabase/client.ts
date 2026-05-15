import { getSupabasePublicEnv } from "@/lib/supabase/env"
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const env = getSupabasePublicEnv()
  if (!env.ok) {
    throw new Error(env.error)
  }

  return createBrowserClient(env.url, env.anonKey)
}
