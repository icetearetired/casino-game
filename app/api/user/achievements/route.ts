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

    // Return user achievements
    const achievements = await sql`
      SELECT * FROM user_titles
      WHERE user_id = ${payload.userId}
      ORDER BY acquired_at DESC
    `

    return NextResponse.json(achievements)
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json({ message: "Failed to fetch achievements" }, { status: 500 })
  }
}
