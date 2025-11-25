import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
