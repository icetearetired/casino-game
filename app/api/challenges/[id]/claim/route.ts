import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
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

    const challengeId = params.id

    // Get challenge and progress
    const [challengeProgress] = await sql`
      SELECT cp.*, c.reward_type, c.reward_amount, c.name
      FROM challenge_progress cp
      JOIN challenges c ON cp.challenge_id = c.id
      WHERE cp.challenge_id = ${challengeId} AND cp.user_id = ${decoded.userId}
    `

    if (!challengeProgress) {
      return NextResponse.json({ message: "Challenge progress not found" }, { status: 404 })
    }

    if (!challengeProgress.completed_at) {
      return NextResponse.json({ message: "Challenge not completed yet" }, { status: 400 })
    }

    if (challengeProgress.reward_claimed) {
      return NextResponse.json({ message: "Reward already claimed" }, { status: 400 })
    }

    // Claim reward
    if (challengeProgress.reward_type === "coins") {
      await sql`
        UPDATE users SET balance = balance + ${challengeProgress.reward_amount} WHERE id = ${decoded.userId}
      `

      // Add transaction record
      const transactionId = crypto.randomUUID()
      await sql`
        INSERT INTO transactions (id, user_id, type, amount, description)
        VALUES (${transactionId}, ${decoded.userId}, 'challenge_reward', ${challengeProgress.reward_amount}, ${"Challenge reward: " + challengeProgress.name})
      `
    } else if (challengeProgress.reward_type === "xp") {
      await sql`
        UPDATE users SET xp = xp + ${challengeProgress.reward_amount} WHERE id = ${decoded.userId}
      `
    }

    // Mark reward as claimed
    await sql`
      UPDATE challenge_progress SET reward_claimed = true WHERE id = ${challengeProgress.id}
    `

    return NextResponse.json({
      message: "Reward claimed successfully",
      reward: {
        type: challengeProgress.reward_type,
        amount: challengeProgress.reward_amount,
      },
    })
  } catch (error) {
    console.error("Error claiming challenge reward:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
