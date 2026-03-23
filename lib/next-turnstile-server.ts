export interface TurnstileValidateOptions {
  token: string
  secretKey: string
  remoteip?: string
  idempotencyKey?: string
}

export interface TurnstileValidateResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  "error-codes"?: string[]
  action?: string
  cdata?: string
}

export async function validateTurnstileToken({
  token,
  secretKey,
  remoteip,
  idempotencyKey,
}: TurnstileValidateOptions): Promise<TurnstileValidateResponse> {
  const formData = new URLSearchParams({
    secret: secretKey,
    response: token,
  })

  if (remoteip) {
    formData.append("remoteip", remoteip)
  }

  if (idempotencyKey) {
    formData.append("idempotency_key", idempotencyKey)
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  })

  if (!response.ok) {
    throw new Error(`Turnstile verification failed with status ${response.status}.`)
  }

  return response.json()
}
