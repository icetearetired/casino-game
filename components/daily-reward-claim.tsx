"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { claimDailyReward } from "@/lib/actions/rewards"
import { toast } from "sonner"
import { Gift, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface DailyRewardClaimProps {
  canClaim: boolean
  nextReward: number
}

export function DailyRewardClaim({ canClaim, nextReward }: DailyRewardClaimProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleClaim = async () => {
    setIsLoading(true)
    try {
      const result = await claimDailyReward()

      if (result.success) {
        toast.success(
          `Claimed ${result.reward?.toLocaleString()} chips! Day ${result.streak} streak!`,
          {
            description: `New balance: ${result.newBalance?.toLocaleString()} chips`,
          }
        )
        router.refresh()
      } else {
        toast.error(result.error || "Failed to claim reward")
      }
    } catch (error) {
      toast.error("Failed to claim reward")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!canClaim) {
    return (
      <Button
        disabled
        className="bg-casino-dark/50 text-casino-silver border border-casino-gold/20 cursor-not-allowed"
      >
        <Gift className="w-4 h-4 mr-2" />
        Already Claimed Today
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClaim}
      disabled={isLoading}
      className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90 font-bold text-lg px-8 py-6"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Claiming...
        </>
      ) : (
        <>
          <Gift className="w-5 h-5 mr-2" />
          Claim {nextReward.toLocaleString()} Chips
        </>
      )}
    </Button>
  )
}
