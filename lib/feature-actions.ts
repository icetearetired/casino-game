"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

async function getUserAndProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data: profile, error } = await supabase.from("profiles").select("id,balance,username").eq("id", user.id).single()
  if (error || !profile) {
    throw new Error("Profile not found")
  }

  return { supabase, profile }
}

async function addHistory(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, gameType: string, bet: number, win: number, outcome: string, meta: Record<string, unknown> = {}) {
  await supabase.from("game_history").insert({
    user_id: userId,
    game_type: gameType,
    bet_amount: bet,
    win_amount: win,
    multiplier: bet > 0 ? win / bet : 0,
    result: { outcome, ...meta },
  })
}

export async function claimDailyReward() {
  const { supabase, profile } = await getUserAndProfile()
  const today = new Date().toISOString().slice(0, 10)

  const { data: alreadyClaimed } = await supabase
    .from("game_history")
    .select("id")
    .eq("user_id", profile.id)
    .eq("game_type", "daily_reward")
    .gte("created_at", `${today}T00:00:00.000Z`)
    .limit(1)

  if (alreadyClaimed && alreadyClaimed.length > 0) {
    throw new Error("Daily reward already claimed today")
  }

  const reward = 250
  await supabase.from("profiles").update({ balance: profile.balance + reward }).eq("id", profile.id)
  await addHistory(supabase, profile.id, "daily_reward", 0, reward, "claimed", { reward })

  revalidatePath("/games")
  revalidatePath("/games/daily-rewards")
}

export async function buyShopItem(formData: FormData) {
  const { supabase, profile } = await getUserAndProfile()
  const item = String(formData.get("item") || "")
  const price = Number(formData.get("price") || 0)
  if (!item || price <= 0) throw new Error("Invalid item")
  if (profile.balance < price) throw new Error("Not enough chips")

  await supabase.from("profiles").update({ balance: profile.balance - price }).eq("id", profile.id)
  await addHistory(supabase, profile.id, "shop", price, 0, "purchased", { item, price })
  revalidatePath("/games/shop")
  revalidatePath("/games")
}

export async function openCase(formData: FormData) {
  const { supabase, profile } = await getUserAndProfile()
  const caseType = String(formData.get("caseType") || "basic")
  const cost = caseType === "elite" ? 500 : 100
  if (profile.balance < cost) throw new Error("Not enough chips")

  const multipliers = caseType === "elite" ? [0, 0.5, 1, 2, 4] : [0, 0.5, 1, 1.5, 2]
  const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)]
  const payout = Math.floor(cost * multiplier)
  const newBalance = profile.balance - cost + payout

  await supabase.from("profiles").update({ balance: newBalance }).eq("id", profile.id)
  await addHistory(supabase, profile.id, "cases", cost, payout, payout > cost ? "win" : payout === cost ? "push" : "lose", { caseType, multiplier })
  revalidatePath("/games/cases")
  revalidatePath("/games")
}

export async function playDuel(formData: FormData) {
  const { supabase, profile } = await getUserAndProfile()
  const stake = Number(formData.get("stake") || 200)
  if (stake <= 0) throw new Error("Invalid stake")
  if (profile.balance < stake) throw new Error("Not enough chips")

  const aiWins = Math.floor(Math.random() * 3)
  const playerWins = 2 - Math.floor(Math.random() * 2) + (aiWins === 2 ? 0 : 1)
  const didWin = playerWins > aiWins
  const payout = didWin ? stake * 2 : 0
  const newBalance = profile.balance - stake + payout

  await supabase.from("profiles").update({ balance: newBalance }).eq("id", profile.id)
  await addHistory(supabase, profile.id, "duel", stake, payout, didWin ? "win" : "lose", { aiWins, playerWins })
  revalidatePath("/games/duels")
  revalidatePath("/games")
}
