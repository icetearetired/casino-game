"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

import { SHOP_ITEMS } from "./shop-definitions"

// Shop items - in production these would come from the database
/* moved to shop-definitions */
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
