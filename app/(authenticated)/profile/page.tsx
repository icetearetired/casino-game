import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  Coins,
  Trophy,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  Settings,
  Calendar,
  Target,
  Flame,
  Award,
} from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  // Fetch game statistics
  const { data: gameStats } = await supabase
    .from("game_history")
    .select("game_type, bet_amount, win_amount")
    .eq("user_id", user!.id)

  // Calculate statistics
  const stats = {
    totalGames: gameStats?.length || 0,
    totalWagered: gameStats?.reduce((sum, g) => sum + (g.bet_amount || 0), 0) || 0,
    totalWon: gameStats?.reduce((sum, g) => sum + (g.win_amount || 0), 0) || 0,
    netProfit: 0,
    winRate: 0,
    biggestWin: 0,
    gameBreakdown: {} as Record<string, { played: number; won: number; wagered: number }>,
  }

  stats.netProfit = stats.totalWon - stats.totalWagered
  stats.winRate = stats.totalGames > 0
    ? Math.round((gameStats?.filter((g) => g.win_amount > g.bet_amount).length || 0) / stats.totalGames * 100)
    : 0
  stats.biggestWin = gameStats?.reduce((max, g) => Math.max(max, g.win_amount - g.bet_amount), 0) || 0

  // Game breakdown
  gameStats?.forEach((game) => {
    if (!stats.gameBreakdown[game.game_type]) {
      stats.gameBreakdown[game.game_type] = { played: 0, won: 0, wagered: 0 }
    }
    stats.gameBreakdown[game.game_type].played++
    stats.gameBreakdown[game.game_type].won += game.win_amount || 0
    stats.gameBreakdown[game.game_type].wagered += game.bet_amount || 0
  })

  // Fetch recent game history
  const { data: recentGames } = await supabase
    .from("game_history")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // XP calculation
  const xpForNextLevel = (profile?.level || 1) * 1000
  const xpProgress = ((profile?.xp || 0) / xpForNextLevel) * 100

  const initials = profile?.username?.slice(0, 2).toUpperCase() || "U"

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      {/* Profile Header */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <Card className="flex-1 bg-card border-casino-gold/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-casino-gold/30">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-casino-gold/20 text-casino-gold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-casino-gold mb-1">
                  {profile?.username || "Player"}
                </h1>
                <p className="text-casino-silver text-sm mb-4">
                  Member since{" "}
                  {new Date(profile?.created_at || Date.now()).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {/* Level Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-casino-gold flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Level {profile?.level || 1}
                    </span>
                    <span className="text-casino-silver">
                      {profile?.xp || 0} / {xpForNextLevel} XP
                    </span>
                  </div>
                  <Progress value={xpProgress} className="h-2 bg-casino-dark" />
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Button asChild variant="outline" className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10">
                    <Link href="/profile/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card className="lg:w-80 bg-gradient-to-br from-casino-gold/20 to-casino-gold/5 border-casino-gold/30">
          <CardHeader>
            <CardTitle className="text-casino-gold flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-casino-gold mb-2">
              {(profile?.balance || 0).toLocaleString()}
            </p>
            <p className="text-casino-silver text-sm">Virtual Chips</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-casino-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-casino-gold/10 rounded-lg">
                <Gamepad2 className="h-5 w-5 text-casino-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
                <p className="text-casino-silver text-sm">Games Played</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-casino-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-casino-gold/10 rounded-lg">
                <Target className="h-5 w-5 text-casino-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.winRate}%</p>
                <p className="text-casino-silver text-sm">Win Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-casino-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.netProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                {stats.netProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div>
                <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {stats.netProfit >= 0 ? "+" : ""}{stats.netProfit.toLocaleString()}
                </p>
                <p className="text-casino-silver text-sm">Net Profit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-casino-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-casino-gold/10 rounded-lg">
                <Trophy className="h-5 w-5 text-casino-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-casino-gold">
                  {stats.biggestWin.toLocaleString()}
                </p>
                <p className="text-casino-silver text-sm">Biggest Win</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed stats */}
      <Tabs defaultValue="games" className="space-y-4">
        <TabsList className="bg-casino-dark border border-casino-gold/20">
          <TabsTrigger value="games" className="data-[state=active]:bg-casino-gold/20 data-[state=active]:text-casino-gold">
            Game Stats
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-casino-gold/20 data-[state=active]:text-casino-gold">
            Recent Games
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-casino-gold/20 data-[state=active]:text-casino-gold">
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="games">
          <Card className="bg-card border-casino-gold/20">
            <CardHeader>
              <CardTitle className="text-casino-gold">Performance by Game</CardTitle>
              <CardDescription className="text-casino-silver">
                Your statistics broken down by game type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.gameBreakdown).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.gameBreakdown).map(([game, data]) => {
                    const profit = data.won - data.wagered
                    return (
                      <div key={game} className="p-4 bg-casino-dark rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-casino-gold font-medium capitalize">{game}</span>
                          <span className={profit >= 0 ? "text-green-400" : "text-red-400"}>
                            {profit >= 0 ? "+" : ""}{profit.toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-casino-silver">Played</p>
                            <p className="text-white font-medium">{data.played}</p>
                          </div>
                          <div>
                            <p className="text-casino-silver">Wagered</p>
                            <p className="text-white font-medium">{data.wagered.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-casino-silver">Won</p>
                            <p className="text-white font-medium">{data.won.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-casino-silver text-center py-8">
                  No games played yet. Start playing to see your stats!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-card border-casino-gold/20">
            <CardHeader>
              <CardTitle className="text-casino-gold">Recent Games</CardTitle>
              <CardDescription className="text-casino-silver">
                Your last 10 games
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentGames && recentGames.length > 0 ? (
                <div className="space-y-3">
                  {recentGames.map((game: {
                    id: string
                    game_type: string
                    bet_amount: number
                    win_amount: number
                    created_at: string
                  }) => {
                    const profit = game.win_amount - game.bet_amount
                    return (
                      <div key={game.id} className="flex items-center justify-between p-3 bg-casino-dark rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-casino-gold font-medium capitalize">{game.game_type}</span>
                          <span className="text-casino-silver text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(game.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-casino-silver text-sm">Bet: {game.bet_amount}</span>
                          <span className={`font-semibold ${profit > 0 ? "text-green-400" : profit === 0 ? "text-casino-silver" : "text-red-400"}`}>
                            {profit > 0 ? `+${profit}` : profit === 0 ? "Push" : profit}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-casino-silver text-center py-8">
                  No games played yet. Start playing to see your history!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card className="bg-card border-casino-gold/20">
            <CardHeader>
              <CardTitle className="text-casino-gold">Achievements</CardTitle>
              <CardDescription className="text-casino-silver">
                Unlock achievements by playing games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Achievement examples - would be fetched from DB in production */}
                <AchievementCard
                  title="First Steps"
                  description="Play your first game"
                  icon={Gamepad2}
                  unlocked={stats.totalGames >= 1}
                />
                <AchievementCard
                  title="High Roller"
                  description="Wager 10,000 chips total"
                  icon={Coins}
                  unlocked={stats.totalWagered >= 10000}
                  progress={Math.min(100, (stats.totalWagered / 10000) * 100)}
                />
                <AchievementCard
                  title="Lucky Streak"
                  description="Win 5 games in a row"
                  icon={Flame}
                  unlocked={false}
                />
                <AchievementCard
                  title="Big Winner"
                  description="Win 1,000+ chips in a single game"
                  icon={Trophy}
                  unlocked={stats.biggestWin >= 1000}
                />
                <AchievementCard
                  title="Veteran"
                  description="Play 100 games"
                  icon={Award}
                  unlocked={stats.totalGames >= 100}
                  progress={Math.min(100, (stats.totalGames / 100) * 100)}
                />
                <AchievementCard
                  title="Jackpot Hunter"
                  description="Win 10,000+ chips in a single game"
                  icon={Target}
                  unlocked={stats.biggestWin >= 10000}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AchievementCard({
  title,
  description,
  icon: Icon,
  unlocked,
  progress,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  unlocked: boolean
  progress?: number
}) {
  return (
    <div className={`p-4 rounded-lg border ${unlocked ? "bg-casino-gold/10 border-casino-gold/30" : "bg-casino-dark/50 border-casino-gold/10 opacity-60"}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${unlocked ? "bg-casino-gold/20" : "bg-casino-dark"}`}>
          <Icon className={`h-5 w-5 ${unlocked ? "text-casino-gold" : "text-casino-silver"}`} />
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${unlocked ? "text-casino-gold" : "text-casino-silver"}`}>
            {title}
          </h4>
          <p className="text-casino-silver text-sm">{description}</p>
          {progress !== undefined && !unlocked && (
            <Progress value={progress} className="h-1 mt-2 bg-casino-dark" />
          )}
        </div>
      </div>
    </div>
  )
}
