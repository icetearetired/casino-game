"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Shop items - in production these would come from the database
export const SHOP_ITEMS = {
  chips: [
    { id: "chips_500", name: "Starter Pack", chips: 500, price: 0, description: "Free starter chips for new players", category: "chips", oneTime: true },
    { id: "chips_1000", name: "Small Stack", chips: 1000, price: 500, description: "A modest chip boost", category: "chips" },
    { id: "chips_5000", name: "Medium Stack", chips: 5000, price: 2000, description: "A solid chip investment", category: "chips" },
    { id: "chips_10000", name: "High Roller Pack", chips: 10000, price: 3500, description: "For serious players", category: "chips" },
    { id: "chips_50000", name: "VIP Bundle", chips: 50000, price: 15000, description: "The ultimate chip package", category: "chips" },
  ],
  avatars: [
    { id: "avatar_gold", name: "Golden Frame", price: 2000, description: "A luxurious golden avatar frame", category: "avatar", preview: "/avatars/frame-gold.png" },
    { id: "avatar_diamond", name: "Diamond Frame", price: 5000, description: "The most prestigious avatar frame", category: "avatar", preview: "/avatars/frame-diamond.png" },
    { id: "avatar_fire", name: "Fire Frame", price: 3000, description: "A fiery animated frame", category: "avatar", preview: "/avatars/frame-fire.png" },
  ],
  boosters: [
    { id: "xp_boost_2x", name: "2x XP Boost", price: 1000, description: "Double XP for 24 hours", category: "booster", duration: "24h" },
    { id: "lucky_charm", name: "Lucky Charm", price: 500, description: "A cosmetic lucky charm badge", category: "booster" },
  ],
}

export type ShopItem = typeof SHOP_ITEMS.chips[0] | typeof SHOP_ITEMS.avatars[0] | typeof SHOP_ITEMS.boosters[0]

export async function purchaseItem(itemId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Find the item
  const allItems = [...SHOP_ITEMS.chips, ...SHOP_ITEMS.avatars, ...SHOP_ITEMS.boosters]
  const item = allItems.find((i) => i.id === itemId)

  if (!item) {
    return { success: false, error: "Item not found" }
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

  // Check if user can afford (price is in chips for non-free items)
  if (item.price > 0 && profile.balance < item.price) {
    return { success: false, error: "Insufficient balance" }
  }

  // Check if one-time purchase already made
  if ("oneTime" in item && item.oneTime) {
    const { data: existingPurchase } = await supabase
      .from("transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("description", `Purchased ${item.name}`)
      .single()

    if (existingPurchase) {
      return { success: false, error: "Already claimed this item" }
    }
  }

  // Process purchase based on category
  let newBalance = profile.balance - item.price

  if (item.category === "chips" && "chips" in item) {
    newBalance += item.chips
  }

  // Update balance
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", user.id)

  if (updateError) {
    return { success: false, error: "Failed to process purchase" }
  }

  // Record transaction
  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "shop_purchase",
    amount: -item.price,
    description: `Purchased ${item.name}`,
  })

  // If chips were added, record that too
  if (item.category === "chips" && "chips" in item) {
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "chip_bonus",
      amount: item.chips,
      description: `${item.name} - chips received`,
    })
  }

  revalidatePath("/shop", "page")
  revalidatePath("/games", "page")

  return {
    success: true,
    newBalance,
    item: item.name,
  }
}
