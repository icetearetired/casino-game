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

    // Get game stats by type
    const gameStats = await sql`
      SELECT 
        game_type,
        COUNT(*) as games_played,
        SUM(bet_amount) as total_wagered,
        SUM(win_amount) as total_won,
        MAX(win_amount) as biggest_win
      FROM game_history
      WHERE user_id = ${payload.userId}
      GROUP BY game_type
    `

    // Get recent games
    const recentGames = await sql`
      SELECT * FROM game_history
      WHERE user_id = ${payload.userId}
      ORDER BY created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      gameStats,
      recentGames,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 })
  }
}
