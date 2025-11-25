import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Username, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    const user = await createUser(username, email, password)
    const token = generateToken(user.id)

    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ message: "Email or username already exists" }, { status: 409 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
