import { getSupabasePublicEnv } from "@/lib/supabase/env"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  const env = getSupabasePublicEnv()
  if (!env.ok) {
    throw new Error(env.error)
  }

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Ignored
        }
      },
    },
  })
}
