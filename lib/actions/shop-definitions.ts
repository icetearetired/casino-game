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
} as const

export type ShopItem = (typeof SHOP_ITEMS)["chips"][number] | (typeof SHOP_ITEMS)["avatars"][number] | (typeof SHOP_ITEMS)["boosters"][number]
