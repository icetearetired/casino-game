"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { DollarSign, History, Trophy, Gift, ArrowUpRight } from "lucide-react"

export default function DashboardPage() {
  const { user, balance, updateBalance } = useUser()
  const { toast } = useToast()
  const [claimedDaily, setClaimedDaily] = useState(false)

  // Mock transaction history
  const [transactions] = useState([
    { id: 1, type: "win", game: "Slots", amount: 250, date: "2023-04-22T14:30:00Z" },
    { id: 2, type: "loss", game: "Roulette", amount: -100, date: "2023-04-22T13:15:00Z" },
    { id: 3, type: "win", game: "Dice", amount: 75, date: "2023-04-21T18:45:00Z" },
    { id: 4, type: "bonus", game: "Daily Bonus", amount: 100, date: "2023-04-21T10:00:00Z" },
    { id: 5, type: "loss", game: "Blackjack", amount: -50, date: "2023-04-20T20:30:00Z" },
  ])

  // Mock achievements
  const achievements = [
    { id: 1, name: "First Win", description: "Win your first game", completed: true },
    { id: 2, name: "High Roller", description: "Place a bet of 100 coins or more", completed: true },
    { id: 3, name: "Lucky Streak", description: "Win 3 games in a row", completed: false },
    { id: 4, name: "Jackpot", description: "Win 500 coins or more in a single game", completed: false },
    { id: 5, name: "Dedicated Player", description: "Play all available games", completed: false },
  ]

  const claimDailyBonus = () => {
    if (claimedDaily) {
      toast({
        title: "Already Claimed",
        description: "You've already claimed your daily bonus today.",
        variant: "destructive",
      })
      return
    }

    const bonusAmount = 100
    updateBalance(bonusAmount)
    setClaimedDaily(true)

    toast({
      title: "Daily Bonus Claimed!",
      description: `${bonusAmount} coins have been added to your balance.`,
      variant: "default",
      className: "bg-amber-500 text-black border-amber-600",
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6 text-amber-500">Dashboard</h1>
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="text-zinc-300 mb-6">Please login or create an account to access your dashboard.</p>
              <div className="flex flex-col gap-4">
                <Button asChild className="bg-amber-500 text-black hover:bg-amber-600">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-amber-500">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-normal">Your Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-amber-500 mr-2" />
                <span className="text-3xl font-bold text-amber-500">{balance.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Daily Bonus Card */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-normal">Daily Bonus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Gift className="h-6 w-6 text-amber-500 mr-2" />
                  <span className="text-xl font-bold text-zinc-100">100 coins</span>
                </div>
                <Button
                  onClick={claimDailyBonus}
                  disabled={claimedDaily}
                  className={claimedDaily ? "bg-zinc-700" : "bg-amber-500 text-black hover:bg-amber-600"}
                >
                  {claimedDaily ? "Claimed" : "Claim"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-normal">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="border-zinc-700 hover:border-amber-500 hover:text-amber-500"
                >
                  <Link href="/games">Play Games</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-zinc-700 hover:border-amber-500 hover:text-amber-500"
                >
                  <Link href="/leaderboard">Leaderboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="bg-zinc-800 border-zinc-700 p-0 h-auto">
            <TabsTrigger
              value="history"
              className="py-3 px-6 data-[state=active]:bg-zinc-700 data-[state=active]:text-amber-500 rounded-none"
            >
              <History className="h-4 w-4 mr-2" />
              Transaction History
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="py-3 px-6 data-[state=active]:bg-zinc-700 data-[state=active]:text-amber-500 rounded-none"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-6">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Game</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-zinc-700/50">
                          <td className="py-3 px-4">{tx.game}</td>
                          <td className={`py-3 px-4 ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                            {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                          </td>
                          <td className="py-3 px-4 text-zinc-400">{new Date(tx.date).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        achievement.completed ? "border-amber-500/50 bg-amber-500/10" : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold mb-1">{achievement.name}</h3>
                          <p className="text-sm text-zinc-400">{achievement.description}</p>
                        </div>
                        {achievement.completed ? (
                          <Trophy className="h-5 w-5 text-amber-500" />
                        ) : (
                          <div className="text-xs text-zinc-500 bg-zinc-700 px-2 py-1 rounded">In Progress</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Game Recommendations */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-amber-500">Recommended Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Slots", href: "/games/slots", description: "Try your luck with our exciting slot machine!" },
              { name: "Dice Roll", href: "/games/dice", description: "Roll the dice and win big with multipliers!" },
              { name: "Roulette", href: "/games/roulette", description: "Place your bets and watch the wheel spin!" },
            ].map((game, i) => (
              <Card key={i} className="bg-zinc-800 border-zinc-700 hover:border-amber-500 transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                  <p className="text-zinc-400 mb-4">{game.description}</p>
                  <Button asChild variant="link" className="p-0 text-amber-500">
                    <Link href={game.href} className="flex items-center">
                      Play Now
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
