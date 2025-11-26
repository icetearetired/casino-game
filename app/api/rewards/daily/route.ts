import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

const DAILY_REWARD = 100

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

    // Check if already claimed today
    const [user] = await sql`
      SELECT last_daily_bonus FROM users WHERE id = ${payload.userId}
    `

    const today = new Date().toISOString().split("T")[0]
    if (user?.last_daily_bonus === today) {
      return NextResponse.json({ message: "Already claimed today" }, { status: 400 })
    }

    // Give reward
    await sql`
      UPDATE users 
      SET balance = balance + ${DAILY_REWARD}, last_daily_bonus = ${today}
      WHERE id = ${payload.userId}
    `

    // Log transaction
    await sql`
      INSERT INTO transactions (user_id, type, amount, description)
      VALUES (${payload.userId}, 'daily_bonus', ${DAILY_REWARD}, 'Daily login bonus')
    `

    return NextResponse.json({ amount: DAILY_REWARD })
  } catch (error) {
    console.error("Error claiming daily reward:", error)
    return NextResponse.json({ message: "Failed to claim reward" }, { status: 500 })
  }
}
