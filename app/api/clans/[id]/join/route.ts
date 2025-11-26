import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Check if user already in a clan
    const existingMembership = await sql`
      SELECT * FROM clan_members WHERE user_id = ${payload.userId}
    `
    if (existingMembership.length > 0) {
      return NextResponse.json({ message: "You are already in a clan" }, { status: 400 })
    }

    // Get clan info
    const [clan] = await sql`SELECT * FROM clans WHERE id = ${id}`
    if (!clan) {
      return NextResponse.json({ message: "Clan not found" }, { status: 404 })
    }

    if (!clan.is_public) {
      return NextResponse.json({ message: "This clan is invite-only" }, { status: 400 })
    }

    if (clan.member_count >= clan.max_members) {
      return NextResponse.json({ message: "Clan is full" }, { status: 400 })
    }

    // Join clan
    await sql`
      INSERT INTO clan_members (clan_id, user_id, role)
      VALUES (${id}, ${payload.userId}, 'member')
    `

    // Update member count
    await sql`
      UPDATE clans SET member_count = member_count + 1 WHERE id = ${id}
    `

    const [updatedClan] = await sql`SELECT * FROM clans WHERE id = ${id}`
    return NextResponse.json(updatedClan)
  } catch (error) {
    console.error("Error joining clan:", error)
    return NextResponse.json({ message: "Failed to join clan" }, { status: 500 })
  }
}
