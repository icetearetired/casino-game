"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Case definitions with prizes and odds
export const CASES = {
  common: {
    id: "common",
    name: "Common Case",
    price: 100,
    color: "from-gray-500 to-gray-600",
    prizes: [
      { name: "50 Chips", value: 50, odds: 0.35, rarity: "common" },
      { name: "75 Chips", value: 75, odds: 0.25, rarity: "common" },
      { name: "100 Chips", value: 100, odds: 0.20, rarity: "uncommon" },
      { name: "150 Chips", value: 150, odds: 0.12, rarity: "uncommon" },
      { name: "250 Chips", value: 250, odds: 0.06, rarity: "rare" },
      { name: "500 Chips", value: 500, odds: 0.02, rarity: "epic" },
    ],
  },
  rare: {
    id: "rare",
    name: "Rare Case",
    price: 500,
    color: "from-blue-500 to-blue-600",
    prizes: [
      { name: "250 Chips", value: 250, odds: 0.30, rarity: "common" },
      { name: "400 Chips", value: 400, odds: 0.25, rarity: "uncommon" },
      { name: "600 Chips", value: 600, odds: 0.20, rarity: "uncommon" },
      { name: "1,000 Chips", value: 1000, odds: 0.15, rarity: "rare" },
      { name: "2,000 Chips", value: 2000, odds: 0.07, rarity: "epic" },
      { name: "5,000 Chips", value: 5000, odds: 0.03, rarity: "legendary" },
    ],
  },
  epic: {
    id: "epic",
    name: "Epic Case",
    price: 2000,
    color: "from-purple-500 to-purple-600",
    prizes: [
      { name: "1,000 Chips", value: 1000, odds: 0.30, rarity: "common" },
      { name: "1,500 Chips", value: 1500, odds: 0.25, rarity: "uncommon" },
      { name: "2,500 Chips", value: 2500, odds: 0.20, rarity: "uncommon" },
      { name: "4,000 Chips", value: 4000, odds: 0.15, rarity: "rare" },
      { name: "8,000 Chips", value: 8000, odds: 0.07, rarity: "epic" },
      { name: "20,000 Chips", value: 20000, odds: 0.03, rarity: "legendary" },
    ],
  },
  legendary: {
    id: "legendary",
    name: "Legendary Case",
    price: 10000,
    color: "from-yellow-500 to-orange-500",
    prizes: [
      { name: "5,000 Chips", value: 5000, odds: 0.30, rarity: "common" },
      { name: "8,000 Chips", value: 8000, odds: 0.25, rarity: "uncommon" },
      { name: "12,000 Chips", value: 12000, odds: 0.20, rarity: "uncommon" },
      { name: "20,000 Chips", value: 20000, odds: 0.15, rarity: "rare" },
      { name: "50,000 Chips", value: 50000, odds: 0.07, rarity: "epic" },
      { name: "100,000 Chips", value: 100000, odds: 0.03, rarity: "legendary" },
    ],
  },
}

export type CaseType = keyof typeof CASES
export type Prize = typeof CASES.common.prizes[0]

function selectPrize(caseType: CaseType): Prize {
  const caseData = CASES[caseType]
  const random = Math.random()
  let cumulative = 0

  for (const prize of caseData.prizes) {
    cumulative += prize.odds
    if (random <= cumulative) {
      return prize
    }
  }

  // Fallback to first prize if something goes wrong
  return caseData.prizes[0]
}

export async function openCase(caseType: CaseType) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const caseData = CASES[caseType]
  if (!caseData) {
    return { success: false, error: "Invalid case type" }
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "Profile not found" }
  }

  // Check balance
  if (profile.balance < caseData.price) {
    return { success: false, error: "Insufficient balance" }
  }

  // Select a prize
  const prize = selectPrize(caseType)

  // Calculate new balance
  const newBalance = profile.balance - caseData.price + prize.value

  // Update balance
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", user.id)

  if (updateError) {
    return { success: false, error: "Failed to update balance" }
  }

  // Record transaction
  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "case_open",
    amount: prize.value - caseData.price,
    game_type: "cases",
    description: `Opened ${caseData.name} - Won ${prize.name}`,
  })

  // Record game history
  await supabase.from("game_history").insert({
    user_id: user.id,
    game_type: "cases",
    bet_amount: caseData.price,
    win_amount: prize.value,
    multiplier: prize.value / caseData.price,
    result: {
      case: caseType,
      prize: prize.name,
      rarity: prize.rarity,
    },
  })

  revalidatePath("/games/cases", "page")

  return {
    success: true,
    prize,
    newBalance,
  }
}
