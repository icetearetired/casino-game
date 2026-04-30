import { NextResponse } from "next/server"
import { TurnstileError, verifyTurnstile } from "@/lib/nextjs-turnstile-server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = body?.token

    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, error: "Missing CAPTCHA token" }, { status: 400 })
    }

    // For custom CAPTCHA, we simply validate that a token was provided
    // The token is the challenge ID that was generated on the client side
    // In a production app, you might want to track and invalidate tokens after use
    const isValid = token.length > 0

    return NextResponse.json({
      success: isValid,
      errors: isValid ? [] : ["Invalid CAPTCHA token"],
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
