import jwt, { type JwtPayload } from "jsonwebtoken"
import { sql } from "@/lib/database"

type AuthTokenPayload = {
  userId: string
  email?: string
  role?: string
}

const jwtSecret = process.env.SUPABASE_JWT_SECRET ?? process.env.JWT_SECRET

const getUserIdFromPayload = (payload: JwtPayload): string | null => {
  const possibleUserId = payload.sub ?? payload.userId ?? payload.user_id
  return typeof possibleUserId === "string" ? possibleUserId : null
}

export function verifyToken(token: string): AuthTokenPayload | null {
  if (!jwtSecret) {
    console.warn("Missing SUPABASE_JWT_SECRET or JWT_SECRET for token verification")
    return null
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)

    if (typeof decoded === "string") {
      return null
    }

    const userId = getUserIdFromPayload(decoded)
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
  const [user] = await sql`
    SELECT * FROM users WHERE id = ${userId}
  `

  return user ?? null
}
