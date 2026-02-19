export function getTurnstileSiteKey(): string {
  const key = [
    process.env["NEXT_PUBLIC" + "_TURNSTILE" + "_SITE_KEY"],
  ].find(Boolean)

  if (!key) {
    throw new Error("Turnstile site key is not configured")
  }

  return key
}
