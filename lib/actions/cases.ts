"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CASES, type CaseType, type Prize } from "./case-definitions"

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

  return caseData.prizes[0]
}

export async function openCase(caseType: CaseType) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Not authenticated" }

  const caseData = CASES[caseType]
  if (!caseData) return { success: false, error: "Invalid case type" }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("balance").eq("id", user.id).single()
  if (profileError || !profile) return { success: false, error: "Profile not found" }
  if (profile.balance < caseData.price) return { success: false, error: "Insufficient balance" }

  const prize = selectPrize(caseType)
  const newBalance = profile.balance - caseData.price + prize.value

  const { error: updateError } = await supabase.from("profiles").update({ balance: newBalance }).eq("id", user.id)
  if (updateError) return { success: false, error: "Failed to update balance" }

  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "case_open",
    amount: prize.value - caseData.price,
    game_type: "cases",
    description: `Opened ${caseData.name} - Won ${prize.name}`,
  })

  await supabase.from("game_history").insert({
    user_id: user.id,
    game_type: "cases",
    bet_amount: caseData.price,
    win_amount: prize.value,
    multiplier: prize.value / caseData.price,
    result: { case: caseType, prize: prize.name, rarity: prize.rarity },
  })

  revalidatePath("/games/cases", "page")
  return { success: true, prize, newBalance }
}
