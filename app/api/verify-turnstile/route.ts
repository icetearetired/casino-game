import { NextResponse } from "next/server"
import { validateTurnstileToken } from "@/lib/next-turnstile-server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = body?.token

    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, error: "Missing CAPTCHA token" }, { status: 400 })
    }

    const secret = process.env.TURNSTILE_SECRET_KEY
    if (!secret) {
      console.error("TURNSTILE_SECRET_KEY is not configured")
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }

    const remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    const result = await validateTurnstileToken({
      token,
      secretKey: secret,
      remoteip: remoteIp,
    })

    return NextResponse.json({
      success: result.success === true,
      errors: result["error-codes"] || [],
    })
  } catch (error) {
    console.error("Turnstile verification error", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
