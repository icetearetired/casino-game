"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Package, Gift, Sparkles, DollarSign, Star, Zap } from "lucide-react"

interface LootCrate {
  id: string
  name: string
  description: string
  price: number
  rarity: string
  image_url: string
}

interface CrateReward {
  type: string
  value: number | string
  rarity: string
}

const LOOT_CRATES: LootCrate[] = [
  {
    id: "basic",
    name: "Basic Crate",
    description: "Common rewards with a chance for something special",
    price: 500,
    rarity: "common",
    image_url: "/wooden-loot-crate.jpg",
  },
  {
    id: "premium",
    name: "Premium Crate",
    description: "Better odds for rare rewards",
    price: 1500,
    rarity: "rare",
    image_url: "/silver-loot-crate.jpg",
  },
  {
    id: "elite",
    name: "Elite Crate",
    description: "High chance of epic and legendary items",
    price: 5000,
    rarity: "epic",
    image_url: "/golden-loot-crate.jpg",
  },
  {
    id: "legendary",
    name: "Legendary Crate",
    description: "Guaranteed epic+ rewards with jackpot chance",
    price: 15000,
    rarity: "legendary",
    image_url: "/diamond-loot-crate.jpg",
  },
]

export default function ShopPage() {
  const { user, balance, updateBalance, refreshUser } = useUser()
  const { toast } = useToast()
  const [opening, setOpening] = useState<string | null>(null)
  const [reward, setReward] = useState<CrateReward | null>(null)
  const [showRewardDialog, setShowRewardDialog] = useState(false)
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false)

  useEffect(() => {
    if (user) {
      checkDailyReward()
    }
  }, [user])

  const checkDailyReward = async () => {
    try {
      const token = localStorage.getItem("casino_token")
      const response = await fetch("/api/rewards/daily/check", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDailyRewardClaimed(data.claimed)
      }
    } catch (error) {
      console.error("Error checking daily reward:", error)
    }
  }

  const claimDailyReward = async () => {
    try {
      const token = localStorage.getItem("casino_token")
      const response = await fetch("/api/rewards/daily", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setDailyRewardClaimed(true)
        refreshUser()
        toast({
          title: "Daily Reward Claimed!",
          description: `You received ${data.amount} coins!`,
          className: "bg-amber-500 text-black",
        })
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to claim reward", variant: "destructive" })
    }
  }

  const openCrate = async (crateId: string, price: number) => {
    if (!user) {
      toast({ title: "Login Required", variant: "destructive" })
      return
    }

    if (balance < price) {
      toast({ title: "Insufficient Balance", description: "You don't have enough coins", variant: "destructive" })
      return
    }

    setOpening(crateId)

    try {
      const token = localStorage.getItem("casino_token")
      const response = await fetch("/api/shop/crate/open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ crateId }),
      })

      if (response.ok) {
        const data = await response.json()

        // Animate opening delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setReward(data.reward)
        setShowRewardDialog(true)
        refreshUser()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to open crate", variant: "destructive" })
    } finally {
      setOpening(null)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "text-yellow-400 border-yellow-400"
      case "epic":
        return "text-purple-400 border-purple-400"
      case "rare":
        return "text-blue-400 border-blue-400"
      default:
        return "text-zinc-400 border-zinc-400"
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-amber-500">Shop</h1>
            <p className="text-zinc-400 mt-2">Spend your coins on crates and rewards</p>
          </div>
          {user && (
            <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full">
              <DollarSign className="h-5 w-5 text-amber-500" />
              <span className="text-amber-500 font-bold text-xl">{(balance ?? 0).toLocaleString()}</span>
            </div>
          )}
        </div>

        <Tabs defaultValue="crates" className="space-y-6">
          <TabsList className="bg-zinc-800">
            <TabsTrigger value="crates">Loot Crates</TabsTrigger>
            <TabsTrigger value="daily">Daily Rewards</TabsTrigger>
            <TabsTrigger value="referral">Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="crates">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LOOT_CRATES.map((crate) => (
                <Card key={crate.id} className={`bg-zinc-800 border-2 ${getRarityColor(crate.rarity)} overflow-hidden`}>
                  <CardContent className="p-0">
                    <div className="relative h-40 bg-zinc-900 flex items-center justify-center">
                      <Package
                        className={`h-20 w-20 ${getRarityColor(crate.rarity).split(" ")[0]} ${opening === crate.id ? "animate-bounce" : ""}`}
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${
                          crate.rarity === "legendary"
                            ? "bg-yellow-500"
                            : crate.rarity === "epic"
                              ? "bg-purple-500"
                              : crate.rarity === "rare"
                                ? "bg-blue-500"
                                : "bg-zinc-600"
                        }`}
                      >
                        {crate.rarity}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold">{crate.name}</h3>
                      <p className="text-sm text-zinc-400 mb-4">{crate.description}</p>
                      <Button
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                        onClick={() => openCrate(crate.id, crate.price)}
                        disabled={opening !== null || !user}
                      >
                        {opening === crate.id ? (
                          <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 animate-spin" />
                            Opening...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {crate.price.toLocaleString()}
                          </span>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="daily">
            <Card className="bg-zinc-800 border-zinc-700 max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-amber-500" />
                  Daily Reward
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="py-8">
                  <Gift
                    className={`h-24 w-24 mx-auto mb-4 ${dailyRewardClaimed ? "text-zinc-600" : "text-amber-500"}`}
                  />
                  <h3 className="text-2xl font-bold mb-2">
                    {dailyRewardClaimed ? "Already Claimed!" : "Claim Your Reward"}
                  </h3>
                  <p className="text-zinc-400 mb-6">
                    {dailyRewardClaimed
                      ? "Come back tomorrow for another reward!"
                      : "Login daily to receive free coins!"}
                  </p>
                  <Button
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                    onClick={claimDailyReward}
                    disabled={dailyRewardClaimed || !user}
                  >
                    {dailyRewardClaimed ? "Claimed" : "Claim 100 Coins"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <Card className="bg-zinc-800 border-zinc-700 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Zap className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Invite Friends, Earn Rewards!</h3>
                  <p className="text-zinc-400 mb-6">
                    Share your referral code and both you and your friend get 500 coins!
                  </p>

                  {user ? (
                    <div className="bg-zinc-900 p-4 rounded-lg">
                      <p className="text-sm text-zinc-400 mb-2">Your Referral Code</p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="text-2xl font-bold text-amber-500 bg-zinc-800 px-4 py-2 rounded">
                          {user.referral_code || user.username?.toUpperCase().slice(0, 6) || "CASINO"}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              user.referral_code || user.username?.toUpperCase().slice(0, 6) || "CASINO",
                            )
                            toast({ title: "Copied!", description: "Referral code copied to clipboard" })
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-500">Login to get your referral code</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reward Dialog */}
        <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
          <DialogContent className="bg-zinc-800 border-zinc-700 text-center">
            <DialogHeader>
              <DialogTitle className="text-amber-500 text-2xl">You Won!</DialogTitle>
            </DialogHeader>
            {reward && (
              <div className="py-8">
                <div className={`text-6xl mb-4 ${getRarityColor(reward.rarity).split(" ")[0]}`}>
                  {reward.type === "coins" ? "💰" : reward.type === "xp" ? "⭐" : "🎁"}
                </div>
                <Badge
                  className={`mb-4 ${
                    reward.rarity === "legendary"
                      ? "bg-yellow-500"
                      : reward.rarity === "epic"
                        ? "bg-purple-500"
                        : reward.rarity === "rare"
                          ? "bg-blue-500"
                          : "bg-zinc-600"
                  }`}
                >
                  {reward.rarity}
                </Badge>
                <h3 className="text-3xl font-bold">
                  {typeof reward.value === "number"
                    ? `${reward.value.toLocaleString()} ${reward.type.toUpperCase()}`
                    : reward.value}
                </h3>
              </div>
            )}
            <Button className="bg-amber-500 hover:bg-amber-600 text-black" onClick={() => setShowRewardDialog(false)}>
              Awesome!
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
