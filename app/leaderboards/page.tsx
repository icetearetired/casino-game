"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/context/user-context"
import { Trophy, Medal, Award, Crown, DollarSign } from "lucide-react"

interface LeaderboardEntry {
  user_id: string
  username: string
  avatar_url: string | null
  level: number
  score: number
  rank: number
}

interface Leaderboard {
  id: string
  name: string
  leaderboard_type: string
  game_type: string | null
  metric: string
  prize_pool: number
  entries: LeaderboardEntry[]
}

export default function LeaderboardsPage() {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState("daily")

  const { user } = useUser()

  useEffect(() => {
    fetchLeaderboards()
  }, [selectedType])

  const fetchLeaderboards = async () => {
    try {
      const response = await fetch(`/api/leaderboards?type=${selectedType}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboards(data)
      }
    } catch (error) {
      console.error("Error fetching leaderboards:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-zinc-400">#{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50"
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-zinc-400/20 border-gray-400/50"
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-600/50"
      default:
        return "bg-zinc-800 border-zinc-700"
    }
  }

  const getMetricDisplay = (metric: string) => {
    const metrics: { [key: string]: string } = {
      total_winnings: "Total Winnings",
      biggest_win: "Biggest Win",
      games_won: "Games Won",
      level: "Level",
    }
    return metrics[metric] || metric
  }

  const getGameTypeDisplay = (gameType: string | null) => {
    if (!gameType) return "All Games"
    const gameTypes: { [key: string]: string } = {
      slots: "Slot Machine",
      crash: "Crash",
      plinko: "Plinko",
      dice: "Dice Roll",
      roulette: "Roulette",
      minesweeper: "Minesweeper",
      wheel: "Wheel of Fortune",
    }
    return gameTypes[gameType] || gameType
  }

  const getLeaderboardTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-500"
      case "weekly":
        return "bg-purple-500"
      case "monthly":
        return "bg-green-500"
      case "all_time":
        return "bg-amber-500"
      default:
        return "bg-zinc-500"
    }
  }

  const formatScore = (score: number, metric: string) => {
    if (metric.includes("winnings") || metric.includes("win")) {
      return `${score.toLocaleString()} coins`
    }
    return score.toLocaleString()
  }

  const getUserRank = (leaderboard: Leaderboard) => {
    if (!user) return null
    const userEntry = leaderboard.entries.find((entry) => entry.user_id === user.id)
    return userEntry?.rank || null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading leaderboards...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Leaderboards</h1>
        <p className="text-xl text-center mb-12 max-w-3xl mx-auto text-zinc-300">
          See how you rank against other players and compete for the top spots!
        </p>

        {/* Leaderboard Type Filter */}
        <div className="flex justify-center gap-4 mb-8">
          {["daily", "weekly", "monthly", "all_time"].map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? "bg-amber-500 text-black" : "border-zinc-600 text-zinc-300"}
            >
              {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Button>
          ))}
        </div>

        {/* Leaderboards */}
        <div className="space-y-8">
          {leaderboards.map((leaderboard) => (
            <Card key={leaderboard.id} className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl text-amber-500 mb-2">{leaderboard.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <Badge className={`${getLeaderboardTypeColor(leaderboard.leaderboard_type)} text-white`}>
                        {leaderboard.leaderboard_type.replace("_", " ")}
                      </Badge>
                      <span>{getGameTypeDisplay(leaderboard.game_type)}</span>
                      <span>{getMetricDisplay(leaderboard.metric)}</span>
                    </div>
                  </div>
                  {leaderboard.prize_pool > 0 && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-bold">{leaderboard.prize_pool.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-zinc-400">Prize Pool</div>
                    </div>
                  )}
                </div>

                {/* User's Rank */}
                {user && getUserRank(leaderboard) && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <div className="text-amber-400 text-sm font-medium">Your Rank: #{getUserRank(leaderboard)}</div>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {leaderboard.entries.slice(0, 10).map((entry) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${getRankBgColor(entry.rank)}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10">{getRankIcon(entry.rank)}</div>

                        <Avatar className="h-10 w-10">
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback className="bg-zinc-700 text-zinc-300">
                            {entry.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-bold text-white">{entry.username}</div>
                          <div className="text-sm text-zinc-400">Level {entry.level}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-amber-400">{formatScore(entry.score, leaderboard.metric)}</div>
                      </div>
                    </div>
                  ))}

                  {leaderboard.entries.length === 0 && (
                    <div className="text-center py-8 text-zinc-500">
                      <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No entries yet. Be the first to compete!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {leaderboards.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-zinc-400 mb-2">No Leaderboards Available</h3>
            <p className="text-zinc-500">Check back later for leaderboard competitions!</p>
          </div>
        )}
      </div>
    </div>
  )
}
