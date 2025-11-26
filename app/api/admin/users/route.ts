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

    // Check if user is admin
    const [admin] = await sql`SELECT is_admin FROM users WHERE id = ${payload.userId}`
    if (!admin?.is_admin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const users = await sql`
      SELECT id, username, email, is_tester, has_infinite_funds, balance, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 100
    `

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 })
  }
}
