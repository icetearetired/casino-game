"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Daily reward amounts for each streak day (1-7)
const DAILY_REWARDS = [100, 150, 200, 300, 400, 500, 1000]

export async function claimDailyReward() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Get current profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("balance, last_daily_bonus")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "Profile not found" }
  }

  // Check if already claimed today
  const today = new Date().toISOString().split("T")[0]
  const lastClaim = profile.last_daily_bonus

  if (lastClaim === today) {
    return { success: false, error: "Already claimed today" }
  }

  // Calculate streak
  let currentStreak = 1

  if (lastClaim) {
    const lastDate = new Date(lastClaim)
    const todayDate = new Date(today)
    const diffTime = todayDate.getTime() - lastDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      // Continue streak - fetch current streak from transactions or calculate
      const { data: recentClaims } = await supabase
        .from("transactions")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("type", "daily_bonus")
        .order("created_at", { ascending: false })
        .limit(7)

      if (recentClaims && recentClaims.length > 0) {
        // Count consecutive days
        let streak = 1
        const dates = recentClaims.map(c => new Date(c.created_at).toISOString().split("T")[0])
        
        for (let i = 0; i < dates.length - 1 && streak < 7; i++) {
          const current = new Date(dates[i])
          const next = new Date(dates[i + 1])
          const diff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
          
          if (Math.abs(diff - 1) < 0.1) {
            streak++
          } else {
            break
          }
        }
        currentStreak = Math.min(streak + 1, 7)
      }
    }
    // If more than 1 day gap, streak resets to 1
  }

  // Calculate reward based on streak (0-indexed array)
  const rewardAmount = DAILY_REWARDS[currentStreak - 1]

  // Update balance and last claim date
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      balance: profile.balance + rewardAmount,
      last_daily_bonus: today,
    })
    .eq("id", user.id)

  if (updateError) {
    return { success: false, error: "Failed to update balance" }
  }

  // Record transaction
  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "daily_bonus",
    amount: rewardAmount,
    description: `Day ${currentStreak} daily reward`,
  })

  revalidatePath("/rewards", "page")
  revalidatePath("/games", "page")

  return {
    success: true,
    reward: rewardAmount,
    streak: currentStreak,
    newBalance: profile.balance + rewardAmount,
  }
}

export async function getDailyRewardStatus() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { canClaim: false, streak: 0, nextReward: 0 }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_daily_bonus")
    .eq("id", user.id)
    .single()

  const today = new Date().toISOString().split("T")[0]
  const lastClaim = profile?.last_daily_bonus

  const canClaim = lastClaim !== today

  // Calculate current streak
  let currentStreak = 0

  if (lastClaim) {
    const lastDate = new Date(lastClaim)
    const todayDate = new Date(today)
    const diffTime = todayDate.getTime() - lastDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 1) {
      // Get streak from recent transactions
      const { data: recentClaims } = await supabase
        .from("transactions")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("type", "daily_bonus")
        .order("created_at", { ascending: false })
        .limit(7)

      if (recentClaims && recentClaims.length > 0) {
        currentStreak = 1
        const dates = recentClaims.map(c => new Date(c.created_at).toISOString().split("T")[0])
        
        for (let i = 0; i < dates.length - 1 && currentStreak < 7; i++) {
          const current = new Date(dates[i])
          const next = new Date(dates[i + 1])
          const diff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
          
          if (Math.abs(diff - 1) < 0.1) {
            currentStreak++
          } else {
            break
          }
        }
      }
    }
  }

  const nextStreak = canClaim ? Math.min(currentStreak + 1, 7) : currentStreak
  const nextReward = DAILY_REWARDS[Math.max(0, nextStreak - 1)]

  return {
    canClaim,
    streak: currentStreak,
    nextStreak,
    nextReward,
    rewards: DAILY_REWARDS,
  }
}
