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

    if (typeof amount !== "number") {
      return NextResponse.json({ message: "Amount must be a number" }, { status: 400 })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // For admin/tester accounts, maintain infinite funds
    const newBalance = user.is_admin ? 999999999 : Math.max(0, user.balance + amount)

    await sql`
      UPDATE users 
      SET balance = ${newBalance}, updated_at = NOW()
      WHERE id = ${decoded.userId}
    `

    return NextResponse.json({ balance: newBalance })
  } catch (error) {
    console.error("Balance update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
