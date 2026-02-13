import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    const secret = process.env.TURNSTILE_SECRET_KEY

    if (!secret) {
      return NextResponse.json({
        success: false,
        error: "Missing secret key"
      })
    }

    const formData = new URLSearchParams()
    formData.append("secret", secret)
    formData.append("response", token)

    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    )

    const data = await result.json()

    return NextResponse.json({
      success: data.success,
      errors: data["error-codes"] || []
    })

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Server error"
    })
  }
}
