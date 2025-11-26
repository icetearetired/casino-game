import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const [membership] = await sql`
      SELECT c.*, cm.role as my_role
      FROM clan_members cm
      JOIN clans c ON cm.clan_id = c.id
      WHERE cm.user_id = ${payload.userId}
    `

    if (!membership) {
      return NextResponse.json(null)
    }

    return NextResponse.json(membership)
  } catch (error) {
    console.error("Error fetching my clan:", error)
    return NextResponse.json({ message: "Failed to fetch clan" }, { status: 500 })
  }
}
