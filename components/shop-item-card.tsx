"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { purchaseItem } from "@/lib/actions/shop"
import { toast } from "sonner"
import { Coins, Loader2, Check, Gift } from "lucide-react"
import { useRouter } from "next/navigation"

interface ShopItemCardProps {
  item: {
    id: string
    name: string
    price: number
    description: string
    category: string
    chips?: number
    oneTime?: boolean
    preview?: string
    duration?: string
  }
  balance: number
  owned: boolean
}

export function ShopItemCard({ item, balance, owned }: ShopItemCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const canAfford = balance >= item.price
  const isFree = item.price === 0

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      const result = await purchaseItem(item.id)

      if (result.success) {
        toast.success(`Successfully purchased ${result.item}!`, {
          description: `New balance: ${result.newBalance?.toLocaleString()} chips`,
        })
        router.refresh()
      } else {
        toast.error(result.error || "Failed to purchase")
      }
    } catch (error) {
      toast.error("Failed to purchase")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`relative p-4 rounded-lg border transition-all ${
        owned
          ? "bg-casino-gold/5 border-casino-gold/30"
          : canAfford || isFree
            ? "bg-casino-dark border-casino-gold/20 hover:border-casino-gold/50"
            : "bg-casino-dark/50 border-casino-gold/10 opacity-60"
      }`}
    >
      {item.oneTime && !owned && (
        <div className="absolute -top-2 -right-2">
          <span className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded-full flex items-center gap-1">
            <Gift className="w-3 h-3" />
            FREE
          </span>
        </div>
      )}

      {owned && (
        <div className="absolute -top-2 -right-2">
          <span className="px-2 py-1 text-xs font-semibold bg-casino-gold text-casino-dark rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            OWNED
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-casino-gold mb-1">{item.name}</h3>
        <p className="text-casino-silver text-sm">{item.description}</p>
      </div>

      {item.category === "chips" && item.chips && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-casino-gold/10 rounded-lg">
          <Coins className="w-5 h-5 text-casino-gold" />
          <span className="text-casino-gold font-bold">+{item.chips.toLocaleString()} chips</span>
        </div>
      )}

      {item.duration && (
        <div className="mb-4">
          <span className="text-casino-silver text-sm">Duration: {item.duration}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {!isFree && (
            <>
              <Coins className="w-4 h-4 text-casino-gold" />
              <span className="text-casino-gold font-semibold">{item.price.toLocaleString()}</span>
            </>
          )}
        </div>

        <Button
          onClick={handlePurchase}
          disabled={isLoading || owned || (!canAfford && !isFree)}
          className={`${
            owned
              ? "bg-casino-gold/20 text-casino-gold cursor-not-allowed"
              : isFree
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
          }`}
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : owned ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Owned
            </>
          ) : isFree ? (
            "Claim Free"
          ) : canAfford ? (
            "Purchase"
          ) : (
            "Not Enough"
          )}
        </Button>
      </div>
    </div>
  )
}
