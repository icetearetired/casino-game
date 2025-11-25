"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, DollarSign, Clock } from "lucide-react"

// Mock leaderboard data
const mockLeaderboardData = {
  daily: [
    { rank: 1, name: "JackpotKing", balance: 25000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 2, name: "LuckyCharm", balance: 18500, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 3, name: "RoyalFlush", balance: 15200, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 4, name: "GoldenDice", balance: 12800, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 5, name: "SlotMaster", balance: 10500, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 6, name: "HighRoller", balance: 9200, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 7, name: "AcesHigh", balance: 8100, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 8, name: "BlackjackPro", balance: 7500, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 9, name: "RouletteQueen", balance: 6800, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 10, name: "PokerFace", balance: 6200, avatar: "/placeholder.svg?height=40&width=40" },
  ],
  weekly: [
    { rank: 1, name: "CasinoKing", balance: 75000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 2, name: "FortuneWheel", balance: 62000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 3, name: "JackpotHunter", balance: 58000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 4, name: "LuckyStreak", balance: 45000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 5, name: "GoldenTouch", balance: 42000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 6, name: "RoyalFlush", balance: 38000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 7, name: "SlotMaster", balance: 35000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 8, name: "AcesHigh", balance: 32000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 9, name: "BlackjackPro", balance: 28000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 10, name: "HighRoller", balance: 25000, avatar: "/placeholder.svg?height=40&width=40" },
  ],
  allTime: [
    { rank: 1, name: "CasinoLegend", balance: 250000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 2, name: "GamblingGod", balance: 180000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 3, name: "JackpotKing", balance: 150000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 4, name: "LuckyCharm", balance: 120000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 5, name: "RoyalFlush", balance: 100000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 6, name: "SlotMaster", balance: 95000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 7, name: "GoldenDice", balance: 90000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 8, name: "HighRoller", balance: 85000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 9, name: "AcesHigh", balance: 80000, avatar: "/placeholder.svg?height=40&width=40" },
    { rank: 10, name: "BlackjackPro", balance: 75000, avatar: "/placeholder.svg?height=40&width=40" },
  ],
}

export default function LeaderboardPage() {
  const [leaderboardData] = useState(mockLeaderboardData)

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Leaderboard</h1>
        <p className="text-xl text-center mb-12 max-w-3xl mx-auto text-zinc-300">
          See who's winning big at Lucky Casino! Can you make it to the top?
        </p>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="bg-zinc-800 border-zinc-700 p-0 h-auto">
            <TabsTrigger
              value="daily"
              className="py-3 px-6 data-[state=active]:bg-zinc-700 data-[state=active]:text-amber-500 rounded-none"
            >
              <Clock className="h-4 w-4 mr-2" />
              Daily
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="py-3 px-6 data-[state=active]:bg-zinc-700 data-[state=active]:text-amber-500 rounded-none"
            >
              <Clock className="h-4 w-4 mr-2" />
              Weekly
            </TabsTrigger>
            <TabsTrigger
              value="allTime"
              className="py-3 px-6 data-[state=active]:bg-zinc-700 data-[state=active]:text-amber-500 rounded-none"
            >
              <Trophy className="h-4 w-4 mr-2" />
              All Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <LeaderboardTable data={leaderboardData.daily} />
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <LeaderboardTable data={leaderboardData.weekly} />
          </TabsContent>

          <TabsContent value="allTime" className="mt-6">
            <LeaderboardTable data={leaderboardData.allTime} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function LeaderboardTable({ data }: { data: any[] }) {
  return (
    <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader className="pb-0">
        <CardTitle className="text-2xl text-amber-500">Top Players</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Player</th>
                <th className="text-right py-3 px-4 text-zinc-400 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((player) => (
                <tr key={player.rank} className="border-b border-zinc-700/50">
                  <td className="py-4 px-4">
                    {player.rank <= 3 ? (
                      <div
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold
                        ${
                          player.rank === 1
                            ? "bg-amber-500 text-black"
                            : player.rank === 2
                              ? "bg-zinc-300 text-black"
                              : "bg-amber-800 text-amber-200"
                        }
                      `}
                      >
                        {player.rank}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                        {player.rank}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <img
                        src={player.avatar || "/placeholder.svg"}
                        alt={player.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <span className="font-medium">{player.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end">
                      <DollarSign className="h-4 w-4 text-amber-500 mr-1" />
                      <span className="font-bold text-amber-500">{player.balance.toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
