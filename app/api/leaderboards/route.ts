import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leaderboardType = searchParams.get("type") || "daily"
    const gameType = searchParams.get("gameType")

    let query = `
      SELECT l.*, 
             le.user_id,
             le.score,
             le.rank,
             u.username,
             u.avatar_url,
             u.level
      FROM leaderboards l
      LEFT JOIN leaderboard_entries le ON l.id = le.leaderboard_id
      LEFT JOIN users u ON le.user_id = u.id
      WHERE l.is_active = true
    `

    const params: any[] = []

    if (leaderboardType !== "all") {
      query += ` AND l.leaderboard_type = $${params.length + 1}`
      params.push(leaderboardType)
    }

    if (gameType) {
      query += ` AND (l.game_type = $${params.length + 1} OR l.game_type IS NULL)`
      params.push(gameType)
    }

    query += ` ORDER BY l.leaderboard_type, le.rank ASC NULLS LAST`

    const results = await sql(query, params)

    // Group results by leaderboard
    const leaderboards = results.reduce((acc: any, row: any) => {
      const leaderboardId = row.id

      if (!acc[leaderboardId]) {
        acc[leaderboardId] = {
          id: row.id,
          name: row.name,
          leaderboard_type: row.leaderboard_type,
          game_type: row.game_type,
          metric: row.metric,
          prize_pool: row.prize_pool,
          entries: [],
        }
      }

      if (row.user_id) {
        acc[leaderboardId].entries.push({
          user_id: row.user_id,
          username: row.username,
          avatar_url: row.avatar_url,
          level: row.level,
          score: row.score,
          rank: row.rank,
        })
      }

      return acc
    }, {})

    return NextResponse.json(Object.values(leaderboards))
  } catch (error) {
    console.error("Error fetching leaderboards:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
