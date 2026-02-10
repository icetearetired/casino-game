"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { getAccessToken } from "@/lib/supabase/client"
import { Target, Calendar, Gift, CheckCircle } from "lucide-react"

interface Challenge {
  id: string
  name: string
  description: string
  challenge_type: string
  game_type: string | null
  target_type: string
  target_value: number
  reward_type: string
  reward_amount: number
  start_time: string
  end_time: string
  current_progress: number | null
  completed_at: string | null
  reward_claimed: boolean
  is_completed: boolean
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState("all")

  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    fetchChallenges()
  }, [selectedType, user])

  const fetchChallenges = async () => {
    try {
      const token = await getAccessToken()
      const response = await fetch(`/api/challenges?type=${selectedType}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (response.ok) {
        const data = await response.json()
        setChallenges(data)
      }
    } catch (error) {
      console.error("Error fetching challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  const claimReward = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to claim rewards.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = await getAccessToken()
      if (!token) {
        toast({
          title: "Login Required",
          description: "Please login to claim rewards.",
          variant: "destructive",
        })
        return
      }
      const response = await fetch(`/api/challenges/${challengeId}/claim`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Reward Claimed!",
          description: `You received ${data.reward.amount} ${data.reward.type}!`,
          variant: "default",
          className: "bg-amber-500 text-black border-amber-600",
        })
        fetchChallenges() // Refresh challenges
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive",
      })
    }
  }

  const getProgressPercentage = (challenge: Challenge) => {
    if (!challenge.current_progress) return 0
    return Math.min((challenge.current_progress / challenge.target_value) * 100, 100)
  }

  const getTargetTypeDisplay = (targetType: string) => {
    const types: { [key: string]: string } = {
      win_amount: "Win Amount",
      games_played: "Games Played",
      streak: "Win Streak",
      multiplier: "Multiplier",
    }
    return types[targetType] || targetType
  }

  const getGameTypeDisplay = (gameType: string | null) => {
    if (!gameType) return "Any Game"
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

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-500"
      case "weekly":
        return "bg-purple-500"
      case "special":
        return "bg-amber-500"
      default:
        return "bg-zinc-500"
    }
  }

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }

    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading challenges...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Challenges</h1>
        <p className="text-xl text-center mb-12 max-w-3xl mx-auto text-zinc-300">
          Complete daily and weekly challenges to earn coins, XP, and special rewards!
        </p>

        {/* Challenge Type Filter */}
        <div className="flex justify-center gap-4 mb-8">
          {["all", "daily", "weekly", "special"].map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? "bg-amber-500 text-black" : "border-zinc-600 text-zinc-300"}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="bg-zinc-800 border-zinc-700 relative overflow-hidden">
              {challenge.is_completed && (
                <div className="absolute top-4 right-4 z-10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              )}

              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-amber-500 pr-8">{challenge.name}</CardTitle>
                  <Badge className={`${getChallengeTypeColor(challenge.challenge_type)} text-white`}>
                    {challenge.challenge_type}
                  </Badge>
                </div>
                <p className="text-zinc-300 text-sm">{challenge.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Game Type */}
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">{getGameTypeDisplay(challenge.game_type)}</span>
                </div>

                {/* Target */}
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">
                    {getTargetTypeDisplay(challenge.target_type)}: {challenge.target_value.toLocaleString()}
                  </span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {challenge.current_progress || 0} / {challenge.target_value}
                    </span>
                  </div>
                  <Progress value={getProgressPercentage(challenge)} className="h-2" />
                </div>

                {/* Reward */}
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">
                    Reward: {challenge.reward_amount} {challenge.reward_type}
                  </span>
                </div>

                {/* Time Remaining */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Time left: {formatTimeRemaining(challenge.end_time)}</span>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {challenge.is_completed && !challenge.reward_claimed ? (
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
                      onClick={() => claimReward(challenge.id)}
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Claim Reward
                    </Button>
                  ) : challenge.reward_claimed ? (
                    <Button className="w-full bg-zinc-600 text-zinc-300" disabled>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Completed
                    </Button>
                  ) : (
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold" disabled>
                      In Progress ({getProgressPercentage(challenge).toFixed(0)}%)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {challenges.length === 0 && (
          <div className="text-center py-16">
            <Target className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-zinc-400 mb-2">No Challenges Available</h3>
            <p className="text-zinc-500">Check back later for new challenges!</p>
          </div>
        )}
      </div>
    </div>
  )
}
