import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
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

    const { gameType, betAmount, winAmount, multiplier, result } = await request.json()

    if (!gameType || typeof betAmount !== "number" || typeof winAmount !== "number") {
      return NextResponse.json({ message: "Game type, bet amount, and win amount are required" }, { status: 400 })
    }

    const gameId = crypto.randomUUID()

    await sql`
      INSERT INTO game_history (id, user_id, game_type, bet_amount, win_amount, multiplier, result, created_at)
      VALUES (${gameId}, ${decoded.userId}, ${gameType}, ${betAmount}, ${winAmount}, ${multiplier || null}, ${JSON.stringify(result || {})}, NOW())
    `

    // Update user stats
    await sql`
      UPDATE users 
      SET 
        games_played = games_played + 1,
        total_wagered = total_wagered + ${betAmount},
        total_won = total_won + ${winAmount},
        updated_at = NOW()
      WHERE id = ${decoded.userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Game history error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
