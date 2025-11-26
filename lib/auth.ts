import { sql } from "./database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createUser(username: string, email: string, password: string) {
  console.log("[v0] createUser called with:", { username, email })

  const hashedPassword = await hashPassword(password)

  const isAdmin = email.includes("admin") || email.includes("tester")
  const role = isAdmin ? "admin" : "user"
  const balance = isAdmin ? 999999999 : 1000

  console.log("[v0] Inserting user into database:", { username, email, isAdmin, role, balance })

  try {
    // Use gen_random_uuid() for proper UUID generation in PostgreSQL
    const [user] = await sql`
      INSERT INTO users (
        id, username, email, password_hash, balance, level, xp, 
        total_wagered, total_won, total_winnings, games_played, 
        is_admin, role, referral_code, has_infinite_funds, is_tester, 
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 
        ${username}, 
        ${email}, 
        ${hashedPassword}, 
        ${balance}, 
        1, 
        0,
        0, 
        0, 
        0, 
        0, 
        ${isAdmin}, 
        ${role}, 
        'REF' || substr(md5(random()::text), 1, 8),
        ${isAdmin}, 
        ${isAdmin}, 
        NOW(), 
        NOW()
      ) RETURNING *
    `

    console.log("[v0] User inserted successfully:", { id: user.id, username: user.username })
    return user
  } catch (dbError: any) {
    console.error("[v0] Database error in createUser:", dbError.message || dbError)
    throw dbError
  }
}

export async function authenticateUser(email: string, password: string) {
  const [user] = await sql`
    SELECT * FROM users WHERE email = ${email} AND (banned_until IS NULL OR banned_until < NOW())
  `

  if (!user) return null

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) return null

  await sql`
    UPDATE users SET last_login = NOW() WHERE id = ${user.id}
  `

  return user
}

export async function getUserById(userId: string) {
  const [user] = await sql`
    SELECT * FROM users WHERE id = ${userId} AND (banned_until IS NULL OR banned_until < NOW())
  `
  return user || null
}
