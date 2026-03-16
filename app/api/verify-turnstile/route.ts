import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = body?.token

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing CAPTCHA token" },
        { status: 400 }
      )
    }

    const secret = "0x4AAAAAACC-E0fcg8kmECnFT31Cpz9LDYc"
    if (!secret) {
      console.error("TURNSTILE_SECRET_KEY is not configured")
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      )
    }

    const formData = new URLSearchParams()
    formData.append("secret", secret)
    formData.append("response", token)

    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      }
    )

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to verify with Cloudflare" },
        { status: 502 }
      )
    }

    const data = await result.json()

    return NextResponse.json({
      success: data.success === true,
      errors: data["error-codes"] || [],
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
