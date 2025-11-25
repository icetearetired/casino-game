import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

export type User = {
  id: string
  username: string
  email: string
  balance: number
  level: number
  xp: number
  total_wagered: number
  total_won: number
  games_played: number
  avatar_url: string | null
  is_admin: boolean
  role: string
  created_at: string
  last_login: string | null
  banned_until: string | null
}

export type GameHistory = {
  id: string
  user_id: string
  game_type: string
  bet_amount: number
  win_amount: number
  multiplier: number | null
  result: any
  created_at: string
}

export type Transaction = {
  id: string
  user_id: string
  type: string
  amount: number
  game_type: string | null
  description: string
  created_at: string
}
