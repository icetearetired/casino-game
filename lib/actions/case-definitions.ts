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
      { name: "100 Chips", value: 100, odds: 0.2, rarity: "uncommon" },
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
      { name: "250 Chips", value: 250, odds: 0.3, rarity: "common" },
      { name: "400 Chips", value: 400, odds: 0.25, rarity: "uncommon" },
      { name: "600 Chips", value: 600, odds: 0.2, rarity: "uncommon" },
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
      { name: "1,000 Chips", value: 1000, odds: 0.3, rarity: "common" },
      { name: "1,500 Chips", value: 1500, odds: 0.25, rarity: "uncommon" },
      { name: "2,500 Chips", value: 2500, odds: 0.2, rarity: "uncommon" },
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
      { name: "5,000 Chips", value: 5000, odds: 0.3, rarity: "common" },
      { name: "8,000 Chips", value: 8000, odds: 0.25, rarity: "uncommon" },
      { name: "12,000 Chips", value: 12000, odds: 0.2, rarity: "uncommon" },
      { name: "20,000 Chips", value: 20000, odds: 0.15, rarity: "rare" },
      { name: "50,000 Chips", value: 50000, odds: 0.07, rarity: "epic" },
      { name: "100,000 Chips", value: 100000, odds: 0.03, rarity: "legendary" },
    ],
  },
} as const

export type CaseType = keyof typeof CASES
export type Prize = (typeof CASES)["common"]["prizes"][number]
