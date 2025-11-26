import { neon } from "@neondatabase/serverless"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

const CRATE_REWARDS = {
  basic: {
    price: 500,
    rewards: [
      { type: "coins", min: 100, max: 500, probability: 0.5, rarity: "common" },
      { type: "coins", min: 500, max: 1000, probability: 0.3, rarity: "rare" },
      { type: "xp", min: 50, max: 200, probability: 0.15, rarity: "common" },
      { type: "coins", min: 1000, max: 2500, probability: 0.05, rarity: "epic" },
    ],
  },
  premium: {
    price: 1500,
    rewards: [
      { type: "coins", min: 500, max: 1500, probability: 0.4, rarity: "common" },
      { type: "coins", min: 1500, max: 3000, probability: 0.35, rarity: "rare" },
      { type: "xp", min: 100, max: 500, probability: 0.15, rarity: "rare" },
      { type: "coins", min: 3000, max: 7500, probability: 0.1, rarity: "epic" },
    ],
  },
  elite: {
    price: 5000,
    rewards: [
      { type: "coins", min: 2000, max: 5000, probability: 0.3, rarity: "rare" },
      { type: "coins", min: 5000, max: 10000, probability: 0.4, rarity: "epic" },
      { type: "xp", min: 250, max: 1000, probability: 0.15, rarity: "epic" },
      { type: "coins", min: 10000, max: 25000, probability: 0.15, rarity: "legendary" },
    ],
  },
  legendary: {
    price: 15000,
    rewards: [
      { type: "coins", min: 7500, max: 15000, probability: 0.25, rarity: "epic" },
      { type: "coins", min: 15000, max: 30000, probability: 0.4, rarity: "epic" },
      { type: "xp", min: 500, max: 2000, probability: 0.15, rarity: "legendary" },
      { type: "coins", min: 30000, max: 75000, probability: 0.2, rarity: "legendary" },
    ],
  },
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

    const { crateId } = await request.json()
    const crateConfig = CRATE_REWARDS[crateId as keyof typeof CRATE_REWARDS]

    if (!crateConfig) {
      return NextResponse.json({ message: "Invalid crate" }, { status: 400 })
    }

    // Check balance
    const [user] = await sql`SELECT balance FROM users WHERE id = ${payload.userId}`
    if (!user || user.balance < crateConfig.price) {
      return NextResponse.json({ message: "Insufficient balance" }, { status: 400 })
    }

    // Deduct price
    await sql`UPDATE users SET balance = balance - ${crateConfig.price} WHERE id = ${payload.userId}`

    // Roll for reward
    const roll = Math.random()
    let cumulative = 0
    let selectedReward = crateConfig.rewards[0]

    for (const reward of crateConfig.rewards) {
      cumulative += reward.probability
      if (roll <= cumulative) {
        selectedReward = reward
        break
      }
    }

    // Calculate actual reward value
    const value = Math.floor(Math.random() * (selectedReward.max - selectedReward.min + 1)) + selectedReward.min

    // Apply reward
    if (selectedReward.type === "coins") {
      await sql`UPDATE users SET balance = balance + ${value} WHERE id = ${payload.userId}`
    } else if (selectedReward.type === "xp") {
      await sql`UPDATE users SET xp = xp + ${value} WHERE id = ${payload.userId}`
    }

    // Log transaction
    await sql`
      INSERT INTO transactions (user_id, type, amount, game_type, description)
      VALUES (${payload.userId}, 'crate', ${value}, 'loot_crate', ${`Opened ${crateId} crate - won ${value} ${selectedReward.type}`})
    `

    return NextResponse.json({
      reward: {
        type: selectedReward.type,
        value,
        rarity: selectedReward.rarity,
      },
    })
  } catch (error) {
    console.error("Error opening crate:", error)
    return NextResponse.json({ message: "Failed to open crate" }, { status: 500 })
  }
}
