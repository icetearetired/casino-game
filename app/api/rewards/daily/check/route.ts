import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ claimed: false })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ claimed: false })
    }

    const [user] = await sql`
      SELECT last_daily_bonus FROM users WHERE id = ${payload.userId}
    `

    const today = new Date().toISOString().split("T")[0]
    const claimed = user?.last_daily_bonus === today

    return NextResponse.json({ claimed })
  } catch (error) {
    console.error("Error checking daily reward:", error)
    return NextResponse.json({ claimed: false })
  }
}
