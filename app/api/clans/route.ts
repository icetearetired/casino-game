import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const clans = await sql`
      SELECT c.*, u.username as owner_username
      FROM clans c
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE c.is_public = true
      ORDER BY c.total_winnings DESC, c.member_count DESC
      LIMIT 50
    `
    return NextResponse.json(clans)
  } catch (error) {
    console.error("Error fetching clans:", error)
    return NextResponse.json({ message: "Failed to fetch clans" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { name, tag, description } = await request.json()

    if (!name || name.length < 3 || name.length > 50) {
      return NextResponse.json({ message: "Clan name must be 3-50 characters" }, { status: 400 })
    }

    if (!tag || tag.length < 3 || tag.length > 6) {
      return NextResponse.json({ message: "Clan tag must be 3-6 characters" }, { status: 400 })
    }

    // Check if user already in a clan
    const existingMembership = await sql`
      SELECT * FROM clan_members WHERE user_id = ${payload.userId}
    `
    if (existingMembership.length > 0) {
      return NextResponse.json({ message: "You are already in a clan" }, { status: 400 })
    }

    // Check user balance (1000 coins to create)
    const [user] = await sql`
      SELECT balance FROM users WHERE id = ${payload.userId}
    `
    if (!user || user.balance < 1000) {
      return NextResponse.json({ message: "Insufficient balance (1,000 coins required)" }, { status: 400 })
    }

    // Check for existing clan name/tag
    const existing = await sql`
      SELECT * FROM clans WHERE LOWER(name) = LOWER(${name}) OR LOWER(tag) = LOWER(${tag})
    `
    if (existing.length > 0) {
      return NextResponse.json({ message: "Clan name or tag already exists" }, { status: 400 })
    }

    // Deduct balance and create clan
    await sql`UPDATE users SET balance = balance - 1000 WHERE id = ${payload.userId}`

    const [clan] = await sql`
      INSERT INTO clans (name, tag, description, owner_id)
      VALUES (${name}, ${tag.toUpperCase()}, ${description || null}, ${payload.userId})
      RETURNING *
    `

    // Add owner as member
    await sql`
      INSERT INTO clan_members (clan_id, user_id, role)
      VALUES (${clan.id}, ${payload.userId}, 'owner')
    `

    return NextResponse.json(clan)
  } catch (error) {
    console.error("Error creating clan:", error)
    return NextResponse.json({ message: "Failed to create clan" }, { status: 500 })
  }
}
