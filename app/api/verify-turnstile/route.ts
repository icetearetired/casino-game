import { NextResponse } from "next/server"
import { TurnstileError, verifyTurnstile } from "@/lib/nextjs-turnstile-server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = body?.token

    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, error: "Missing CAPTCHA token" }, { status: 400 })
    }

    await verifyTurnstile(token, { headers: req.headers })

    return NextResponse.json({ success: true, errors: [] })
  } catch (error) {
    if (error instanceof TurnstileError) {
      const status = error.errorCodes.includes("missing-input-response") ? 400 : 422
      return NextResponse.json({ success: false, error: error.message, errors: error.errorCodes }, { status })
    }

    console.error("Turnstile verification error", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
