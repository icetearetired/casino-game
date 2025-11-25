import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const tournamentId = params.id

    // Get tournament details
    const [tournament] = await sql`
      SELECT * FROM tournaments WHERE id = ${tournamentId}
    `

    if (!tournament) {
      return NextResponse.json({ message: "Tournament not found" }, { status: 404 })
    }

    // Check if tournament is joinable
    if (tournament.start_time < new Date()) {
      return NextResponse.json({ message: "Tournament has already started" }, { status: 400 })
    }

    // Check if user has enough balance for entry fee
    if (user.balance < tournament.entry_fee) {
      return NextResponse.json({ message: "Insufficient balance for entry fee" }, { status: 400 })
    }

    // Check if tournament is full
    const [participantCount] = await sql`
      SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ${tournamentId}
    `

    if (participantCount.count >= tournament.max_participants) {
      return NextResponse.json({ message: "Tournament is full" }, { status: 400 })
    }

    // Check if user is already joined
    const [existingParticipant] = await sql`
      SELECT * FROM tournament_participants WHERE tournament_id = ${tournamentId} AND user_id = ${decoded.userId}
    `

    if (existingParticipant) {
      return NextResponse.json({ message: "Already joined this tournament" }, { status: 400 })
    }

    // Deduct entry fee and join tournament
    await sql`
      UPDATE users SET balance = balance - ${tournament.entry_fee} WHERE id = ${decoded.userId}
    `

    const participantId = crypto.randomUUID()
    await sql`
      INSERT INTO tournament_participants (id, tournament_id, user_id)
      VALUES (${participantId}, ${tournamentId}, ${decoded.userId})
    `

    // Add transaction record
    const transactionId = crypto.randomUUID()
    await sql`
      INSERT INTO transactions (id, user_id, type, amount, description)
      VALUES (${transactionId}, ${decoded.userId}, 'tournament_entry', ${-tournament.entry_fee}, ${"Tournament entry: " + tournament.name})
    `

    return NextResponse.json({ message: "Successfully joined tournament" })
  } catch (error) {
    console.error("Error joining tournament:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
