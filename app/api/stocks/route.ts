import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Update prices with random fluctuation before returning
    await sql`
      UPDATE stocks SET 
        previous_price = current_price,
        current_price = current_price * (1 + (RANDOM() - 0.5) * 0.02),
        change_percent = ((current_price * (1 + (RANDOM() - 0.5) * 0.02)) - previous_price) / previous_price * 100,
        updated_at = NOW()
      WHERE is_active = true
    `

    const stocks = await sql`
      SELECT * FROM stocks WHERE is_active = true ORDER BY market_cap DESC
    `

    return NextResponse.json(stocks)
  } catch (error) {
    console.error("Error fetching stocks:", error)
    return NextResponse.json({ message: "Failed to fetch stocks" }, { status: 500 })
  }
}
