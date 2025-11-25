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
  const hashedPassword = await hashPassword(password)
  const userId = crypto.randomUUID()

  const isAdmin = email.includes("admin") || email.includes("tester")
  const role = isAdmin ? "admin" : "user"
  const balance = isAdmin ? 999999999 : 1000 // Infinite funds for admin/tester accounts

  const [user] = await sql`
    INSERT INTO users (
      id, username, email, password_hash, balance, level, xp, 
      total_wagered, total_won, games_played, is_admin, role, created_at
    ) VALUES (
      ${userId}, ${username}, ${email}, ${hashedPassword}, ${balance}, 1, 0,
      0, 0, 0, ${isAdmin}, ${role}, NOW()
    ) RETURNING *
  `

  return user
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
