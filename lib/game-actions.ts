"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateBalance(
  newBalance: number,
  gameType: string,
  betAmount: number,
  payout: number,
  result: string,
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  // Update balance
  const { error: updateError } = await supabase.from("profiles").update({ balance: newBalance }).eq("id", user.id)

  if (updateError) {
    throw new Error("Failed to update balance")
  }

  // Record game history
  const { error: historyError } = await supabase.from("game_history").insert({
    user_id: user.id,
    game_type: gameType,
    bet_amount: betAmount,
    payout: payout,
    result: result,
  })

  if (historyError) {
    throw new Error("Failed to record game history")
  }

  revalidatePath("/games")
  return { success: true }
}

export async function getBalance() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).single()

  return profile?.balance || 0
}
