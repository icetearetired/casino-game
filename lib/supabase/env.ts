export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return {
      ok: false as const,
      error:
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your deployment environment.",
    }
  }

  return {
    ok: true as const,
    url,
    anonKey,
  }
}
