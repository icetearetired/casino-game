import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    const [admin] = await sql`SELECT is_admin FROM users WHERE id = ${payload.userId}`
    if (!admin?.is_admin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { userId, isTester } = await request.json()

    await sql`
      UPDATE users SET is_tester = ${isTester}, updated_at = NOW()
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating tester status:", error)
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 })
  }
}
