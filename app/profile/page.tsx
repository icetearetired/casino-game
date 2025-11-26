"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Trophy, Star, Target, Gamepad2, TrendingUp, Calendar, Shield, Award, Sparkles } from "lucide-react"

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 23000, 30000, 40000, 52000, 67000, 85000, 107000,
  133000, 165000,
]

const AVATARS = [
  { id: "default", url: "/default-avatar.png", name: "Default", unlockLevel: 1 },
  { id: "gambler", url: "/poker-player-avatar.png", name: "Gambler", unlockLevel: 5 },
  { id: "vip", url: "/vip-crown-avatar.jpg", name: "VIP", unlockLevel: 10 },
  { id: "high-roller", url: "/diamond-avatar.jpg", name: "High Roller", unlockLevel: 15 },
  { id: "legend", url: "/golden-trophy-avatar.jpg", name: "Legend", unlockLevel: 20 },
  { id: "whale", url: "/whale-ocean-avatar.jpg", name: "Whale", unlockLevel: 25 },
]

const TITLES = [
  { id: "newcomer", name: "Newcomer", unlockLevel: 1 },
  { id: "regular", name: "Regular", unlockLevel: 3 },
  { id: "experienced", name: "Experienced", unlockLevel: 5 },
  { id: "veteran", name: "Veteran", unlockLevel: 10 },
  { id: "expert", name: "Expert", unlockLevel: 15 },
  { id: "master", name: "Master", unlockLevel: 20 },
  { id: "grandmaster", name: "Grandmaster", unlockLevel: 25 },
  { id: "legend", name: "Legend", unlockLevel: 30 },
]

export default function ProfilePage() {
  const { user, refreshUser } = useUser()
  const { toast } = useToast()
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchAchievements()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("casino_token")
      const response = await fetch("/api/user/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem("casino_token")
      const response = await fetch("/api/user/achievements", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAchievements(data)
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
    }
  }

  const updateAvatar = async (avatarId: string) => {
    try {
      const token = localStorage.getItem("casino_token")
      const avatar = AVATARS.find((a) => a.id === avatarId)
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarUrl: avatar?.url }),
      })
      if (response.ok) {
        setSelectedAvatar(avatarId)
        refreshUser()
        toast({ title: "Avatar Updated!", description: `You are now using the ${avatar?.name} avatar.` })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update avatar", variant: "destructive" })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white py-12 px-4 flex items-center justify-center">
        <Card className="bg-zinc-800 border-zinc-700 p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Please login to view your profile</h2>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black">
            <a href="/login">Login</a>
          </Button>
        </Card>
      </div>
    )
  }

  const currentLevel = user.level || 1
  const currentXP = user.xp || 0
  const xpForCurrentLevel = LEVEL_THRESHOLDS[currentLevel - 1] || 0
  const xpForNextLevel = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const xpProgress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-500 mb-8">My Profile</h1>

        {/* Profile Header */}
        <Card className="bg-zinc-800 border-zinc-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-amber-500">
                <AvatarImage src={user.avatar_url || "/placeholder.svg?height=100&width=100&query=user avatar"} />
                <AvatarFallback className="bg-zinc-700 text-2xl">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <Badge className="bg-amber-500 text-black">Level {currentLevel}</Badge>
                  {user.is_admin && <Badge className="bg-red-500">Admin</Badge>}
                </div>
                <p className="text-zinc-400 mb-3">{user.email}</p>

                {/* XP Progress */}
                <div className="max-w-md">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">Level {currentLevel}</span>
                    <span className="text-amber-500">
                      {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                    </span>
                    <span className="text-zinc-400">Level {currentLevel + 1}</span>
                  </div>
                  <Progress value={xpProgress} className="h-3 bg-zinc-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-zinc-700 rounded-lg p-4">
                  <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{(user.total_won || 0).toLocaleString()}</div>
                  <div className="text-xs text-zinc-400">Total Won</div>
                </div>
                <div className="bg-zinc-700 rounded-lg p-4">
                  <Gamepad2 className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{user.games_played || 0}</div>
                  <div className="text-xs text-zinc-400">Games Played</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="avatars">Avatars</TabsTrigger>
            <TabsTrigger value="titles">Titles</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-zinc-800 border-zinc-700">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{(user.total_wagered || 0).toLocaleString()}</div>
                  <div className="text-sm text-zinc-400">Total Wagered</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800 border-zinc-700">
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{currentXP.toLocaleString()}</div>
                  <div className="text-sm text-zinc-400">Total XP</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800 border-zinc-700">
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {user.games_played > 0 ? ((user.total_won / user.total_wagered) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-zinc-400">Win Rate</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800 border-zinc-700">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{new Date(user.created_at).toLocaleDateString()}</div>
                  <div className="text-sm text-zinc-400">Member Since</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="avatars">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-500" />
                  Avatar Customization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {AVATARS.map((avatar) => {
                    const isUnlocked = currentLevel >= avatar.unlockLevel
                    const isSelected = user.avatar_url === avatar.url

                    return (
                      <div
                        key={avatar.id}
                        className={`relative p-2 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/20"
                            : isUnlocked
                              ? "border-zinc-600 hover:border-zinc-500 cursor-pointer"
                              : "border-zinc-700 opacity-50"
                        }`}
                        onClick={() => isUnlocked && !isSelected && updateAvatar(avatar.id)}
                      >
                        <Avatar className="h-16 w-16 mx-auto mb-2">
                          <AvatarImage src={avatar.url || "/placeholder.svg"} />
                          <AvatarFallback>{avatar.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <div className="text-sm font-medium">{avatar.name}</div>
                          {!isUnlocked && <div className="text-xs text-zinc-500">Lv. {avatar.unlockLevel}</div>}
                          {isSelected && <Badge className="mt-1 bg-amber-500 text-black text-xs">Active</Badge>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="titles">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Titles & Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {TITLES.map((title) => {
                    const isUnlocked = currentLevel >= title.unlockLevel

                    return (
                      <div
                        key={title.id}
                        className={`p-4 rounded-lg border text-center ${
                          isUnlocked ? "border-amber-500/50 bg-amber-500/10" : "border-zinc-700 opacity-50"
                        }`}
                      >
                        <Shield className={`h-8 w-8 mx-auto mb-2 ${isUnlocked ? "text-amber-500" : "text-zinc-600"}`} />
                        <div className="font-medium">{title.name}</div>
                        {!isUnlocked && (
                          <div className="text-xs text-zinc-500 mt-1">Unlock at Lv. {title.unlockLevel}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: "First Win",
                      description: "Win your first game",
                      icon: "🏆",
                      unlocked: (user.total_won || 0) > 0,
                    },
                    {
                      name: "High Roller",
                      description: "Wager 10,000 coins total",
                      icon: "💰",
                      unlocked: (user.total_wagered || 0) >= 10000,
                    },
                    { name: "Lucky Streak", description: "Win 5 games in a row", icon: "🍀", unlocked: false },
                    {
                      name: "Veteran",
                      description: "Play 100 games",
                      icon: "🎮",
                      unlocked: (user.games_played || 0) >= 100,
                    },
                    {
                      name: "Big Winner",
                      description: "Win 50,000 coins in a single game",
                      icon: "🎰",
                      unlocked: false,
                    },
                    { name: "Social Butterfly", description: "Join a clan", icon: "🦋", unlocked: false },
                  ].map((achievement, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        achievement.unlocked ? "border-amber-500/50 bg-amber-500/10" : "border-zinc-700 opacity-60"
                      }`}
                    >
                      <div className="text-3xl">{achievement.icon}</div>
                      <div>
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-sm text-zinc-400">{achievement.description}</div>
                      </div>
                      {achievement.unlocked && <Badge className="ml-auto bg-green-500">Unlocked</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
