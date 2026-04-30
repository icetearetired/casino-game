export class TurnstileError extends Error {
  constructor(
    message: string,
    public readonly errorCodes: string[] = []
  ) {
    super(message)
    this.name = "TurnstileError"
  }
}

interface VerifyTurnstileOptions {
  secretKey?: string
  ip?: string
  headers?: Headers
  action?: string
  hostname?: string
  timeout?: number
}

interface SiteVerifyResponse {
  success: boolean
  hostname?: string
  action?: string
  "error-codes"?: string[]
}

function detectIp(headers?: Headers): string | undefined {
  if (!headers) {
    return undefined
  }

  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined
}

export async function verifyTurnstile(token: string, options: VerifyTurnstileOptions = {}): Promise<boolean> {
  if (!token) {
    throw new TurnstileError("Missing Turnstile token.", ["missing-input-response"])
  }

  const secretKey = options.secretKey ?? process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    throw new TurnstileError("TURNSTILE_SECRET_KEY is not configured.")
  }

  const formData = new URLSearchParams({
    secret: secretKey,
    response: token,
  })

  const ip = options.ip ?? detectIp(options.headers)
  if (ip) {
    formData.append("remoteip", ip)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeout ?? 10000)

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new TurnstileError(`Turnstile verification failed with status ${response.status}.`)
    }

    const result = (await response.json()) as SiteVerifyResponse

    if (!result.success) {
      throw new TurnstileError("Turnstile verification failed.", result["error-codes"] ?? [])
    }

    if (options.action && result.action !== options.action) {
      throw new TurnstileError("Turnstile action did not match.", ["action-mismatch"])
    }

    if (options.hostname && result.hostname !== options.hostname) {
      throw new TurnstileError("Turnstile hostname did not match.", ["hostname-mismatch"])
    }

    return true
  } catch (error) {
    if (error instanceof TurnstileError) {
      throw error
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new TurnstileError("Turnstile verification timed out.", ["timeout-error"])
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}
