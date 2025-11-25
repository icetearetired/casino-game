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

    const { type, amount, gameType, description } = await request.json()

    if (!type || typeof amount !== "number") {
      return NextResponse.json({ message: "Type and amount are required" }, { status: 400 })
    }

    const transactionId = crypto.randomUUID()

    await sql`
      INSERT INTO transactions (id, user_id, type, amount, game_type, description, created_at)
      VALUES (${transactionId}, ${decoded.userId}, ${type}, ${amount}, ${gameType || null}, ${description || ""}, NOW())
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Transaction error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
