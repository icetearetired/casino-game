import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    let userId = null
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    const { searchParams } = new URL(request.url)
    const challengeType = searchParams.get("type") || "all"

    let query = `
      SELECT c.*,
             cp.current_progress,
             cp.completed_at,
             cp.reward_claimed,
             CASE WHEN cp.completed_at IS NOT NULL THEN true ELSE false END as is_completed
      FROM challenges c
      LEFT JOIN challenge_progress cp ON c.id = cp.challenge_id AND cp.user_id = $1
      WHERE c.is_active = true AND c.end_time > NOW()
    `

    const params = [userId]

    if (challengeType !== "all") {
      query += ` AND c.challenge_type = $${params.length + 1}`
      params.push(challengeType)
    }

    query += ` ORDER BY c.challenge_type, c.created_at ASC`

    const challenges = await sql(query, params)

    return NextResponse.json(challenges)
  } catch (error) {
    console.error("Error fetching challenges:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
