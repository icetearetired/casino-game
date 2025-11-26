import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    console.log("[v0] Registration attempt:", { username, email, hasPassword: !!password })

    if (!username || !email || !password) {
      console.log("[v0] Missing fields:", { username: !username, email: !email, password: !password })
      return NextResponse.json({ message: "Username, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    console.log("[v0] Creating user in database...")
    const user = await createUser(username, email, password)
    console.log("[v0] User created:", { id: user.id, username: user.username })

    const token = generateToken(user.id)

    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error: any) {
    console.error("[v0] Registration error:", error)

    if (error.message?.includes("duplicate key") || error.code === "23505") {
      return NextResponse.json({ message: "Email or username already exists" }, { status: 409 })
    }

    return NextResponse.json(
      {
        message: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.toString() : undefined,
      },
      { status: 500 },
    )
  }
}
