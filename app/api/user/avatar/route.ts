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

    const { avatarUrl } = await request.json()

    await sql`
      UPDATE users SET avatar_url = ${avatarUrl}, updated_at = NOW()
      WHERE id = ${payload.userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating avatar:", error)
    return NextResponse.json({ message: "Failed to update avatar" }, { status: 500 })
  }
}
