export function getTurnstileSiteKey(): string {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!key) {
    throw new Error("Turnstile site key is not configured")
  }

  return key
}
