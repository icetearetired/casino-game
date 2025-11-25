import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "active"
    const gameType = searchParams.get("gameType")

    let query = `
      SELECT t.*, 
             COUNT(tp.user_id) as participant_count,
             CASE WHEN t.end_time < NOW() THEN 'completed'
                  WHEN t.start_time > NOW() THEN 'upcoming'
                  ELSE 'active' END as current_status
      FROM tournaments t
      LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
      WHERE 1=1
    `

    const params: any[] = []

    if (status !== "all") {
      query += ` AND (CASE WHEN t.end_time < NOW() THEN 'completed'
                           WHEN t.start_time > NOW() THEN 'upcoming'
                           ELSE 'active' END) = $${params.length + 1}`
      params.push(status)
    }

    if (gameType) {
      query += ` AND t.game_type = $${params.length + 1}`
      params.push(gameType)
    }

    query += ` GROUP BY t.id ORDER BY t.start_time ASC`

    const tournaments = await sql(query, params)

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

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

    const { name, description, gameType, entryFee, prizePool, maxParticipants, startTime, endTime } =
      await request.json()

    if (!name || !gameType || !startTime || !endTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const tournamentId = crypto.randomUUID()

    const [tournament] = await sql`
      INSERT INTO tournaments (id, name, description, game_type, entry_fee, prize_pool, max_participants, start_time, end_time)
      VALUES (${tournamentId}, ${name}, ${description}, ${gameType}, ${entryFee || 0}, ${prizePool || 0}, ${maxParticipants || 100}, ${startTime}, ${endTime})
      RETURNING *
    `

    return NextResponse.json(tournament)
  } catch (error) {
    console.error("Error creating tournament:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
