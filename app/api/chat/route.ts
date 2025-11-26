import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get("channel") || "global"
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)

    const messages = await sql`
      SELECT cm.*, u.username
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.channel = ${channel}
        AND cm.is_deleted = false
      ORDER BY cm.created_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ message: "Failed to fetch messages" }, { status: 500 })
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

    const { message, channel = "global" } = await request.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ message: "Message cannot be empty" }, { status: 400 })
    }

    if (message.length > 200) {
      return NextResponse.json({ message: "Message too long (max 200 characters)" }, { status: 400 })
    }

    // Check for chat ban
    const [ban] = await sql`
      SELECT * FROM chat_bans 
      WHERE user_id = ${payload.userId}
        AND (channel IS NULL OR channel = ${channel})
        AND (expires_at IS NULL OR expires_at > NOW())
    `
    if (ban) {
      return NextResponse.json({ message: "You are banned from chat" }, { status: 403 })
    }

    // Insert message
    const [newMessage] = await sql`
      INSERT INTO chat_messages (user_id, channel, message)
      VALUES (${payload.userId}, ${channel}, ${message.trim()})
      RETURNING *
    `

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 })
  }
}
