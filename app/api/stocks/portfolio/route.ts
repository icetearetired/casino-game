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

    const portfolio = await sql`
      SELECT 
        us.stock_id,
        s.symbol,
        s.name,
        us.quantity,
        us.average_buy_price,
        s.current_price
      FROM user_stocks us
      JOIN stocks s ON us.stock_id = s.id
      WHERE us.user_id = ${payload.userId} AND us.quantity > 0
      ORDER BY (us.quantity * s.current_price) DESC
    `

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ message: "Failed to fetch portfolio" }, { status: 500 })
  }
}
