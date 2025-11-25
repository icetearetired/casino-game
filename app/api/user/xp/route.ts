import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/auth"
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

    const { amount } = await request.json()

    if (typeof amount !== "number" || amount < 0) {
      return NextResponse.json({ message: "Amount must be a positive number" }, { status: 400 })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const newXP = user.xp + amount

    // Calculate level based on XP (100 XP per level)
    const newLevel = Math.floor(newXP / 100) + 1
    const leveledUp = newLevel > user.level

    await sql`
      UPDATE users 
      SET 
        xp = ${newXP},
        level = ${newLevel},
        updated_at = NOW()
      WHERE id = ${decoded.userId}
    `

    // If user leveled up, give them bonus coins
    if (leveledUp) {
      const levelBonus = newLevel * 50 // 50 coins per level
      const newBalance = user.is_admin ? 999999999 : user.balance + levelBonus

      await sql`
        UPDATE users 
        SET balance = ${newBalance}
        WHERE id = ${decoded.userId}
      `

      // Record level up transaction
      const transactionId = crypto.randomUUID()
      await sql`
        INSERT INTO transactions (id, user_id, type, amount, description, created_at)
        VALUES (${transactionId}, ${decoded.userId}, 'level_bonus', ${levelBonus}, ${"Level " + newLevel + " bonus"}, NOW())
      `
    }

    return NextResponse.json({
      xp: newXP,
      level: newLevel,
      leveledUp,
      bonus: leveledUp ? newLevel * 50 : 0,
    })
  } catch (error) {
    console.error("XP update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
