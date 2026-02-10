import { neon } from "@neondatabase/serverless"
import jwt, { type JwtPayload } from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)

type AuthPayload = {
  userId: string
  email?: string
  role?: string
}

export function verifyToken(token: string): AuthPayload | null {
  const secret = process.env.SUPABASE_JWT_SECRET

  if (!secret) {
    console.error("SUPABASE_JWT_SECRET is not set")
    return null
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as JwtPayload
    const userId = typeof decoded.sub === "string" ? decoded.sub : typeof decoded.user_id === "string" ? decoded.user_id : null

    if (!userId) {
      return null
    }

    return {
      userId,
      email: typeof decoded.email === "string" ? decoded.email : undefined,
      role: typeof decoded.role === "string" ? decoded.role : undefined,
    }
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function getUserById(userId: string) {
  if (!userId) {
    return null
  }

  const [user] = await sql`
    SELECT *
    FROM users
    WHERE id = ${userId}
  `

  return user ?? null
}
