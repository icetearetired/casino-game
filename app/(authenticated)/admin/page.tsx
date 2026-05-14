import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Coins,
  Gamepad2,
  TrendingUp,
  Trophy,
  Clock,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Get total chips in circulation
  const { data: balanceData } = await supabase
    .from("profiles")
    .select("balance")

  const totalChips = balanceData?.reduce((sum, p) => sum + (p.balance || 0), 0) || 0

  // Get games played today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: gamesToday } = await supabase
    .from("game_history")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString())

  // Get total games
  const { count: totalGames } = await supabase
    .from("game_history")
    .select("*", { count: "exact", head: true })

  // Get recent activity
  const { data: recentGames } = await supabase
    .from("game_history")
    .select(`
      id,
      game_type,
      bet_amount,
      win_amount,
      created_at,
      user_id
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get usernames for recent games
  const userIds = [...new Set(recentGames?.map((g) => g.user_id) || [])]
  const { data: users } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", userIds)

  const usernameMap = new Map(users?.map((u) => [u.id, u.username]) || [])

  // Calculate statistics
  const { data: gameStats } = await supabase
    .from("game_history")
    .select("game_type, bet_amount, win_amount")

  const gameTypeStats: Record<string, { played: number; wagered: number; paidOut: number }> = {}

  gameStats?.forEach((game) => {
    if (!gameTypeStats[game.game_type]) {
      gameTypeStats[game.game_type] = { played: 0, wagered: 0, paidOut: 0 }
    }
    gameTypeStats[game.game_type].played++
    gameTypeStats[game.game_type].wagered += game.bet_amount || 0
    gameTypeStats[game.game_type].paidOut += game.win_amount || 0
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-casino-gold mb-2">Admin Dashboard</h1>
        <p className="text-casino-silver">Overview of casino statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-casino-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalUsers || 0}</p>
                <p className="text-casino-silver text-sm">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-casino-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-casino-gold/10 rounded-lg">
                <Coins className="h-5 w-5 text-casino-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalChips.toLocaleString()}</p>
                <p className="text-casino-silver text-sm">Chips in Circulation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-casino-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Gamepad2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{gamesToday || 0}</p>
                <p className="text-casino-silver text-sm">Games Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-casino-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Trophy className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalGames || 0}</p>
                <p className="text-casino-silver text-sm">Total Games</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Game Statistics */}
        <Card className="bg-card border-casino-gold/20">
          <CardHeader>
            <CardTitle className="text-casino-gold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Game Statistics
            </CardTitle>
            <CardDescription className="text-casino-silver">
              Performance by game type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(gameTypeStats).map(([game, stats]) => {
                const houseEdge = stats.wagered - stats.paidOut
                const houseEdgePercent = stats.wagered > 0 ? ((houseEdge / stats.wagered) * 100).toFixed(1) : 0
                return (
                  <div key={game} className="p-4 bg-casino-dark rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-casino-gold font-medium capitalize">{game}</span>
                      <span className={houseEdge >= 0 ? "text-green-400" : "text-red-400"}>
                        {houseEdge >= 0 ? "+" : ""}{houseEdge.toLocaleString()} ({houseEdgePercent}%)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-casino-silver">Played</p>
                        <p className="text-white">{stats.played}</p>
                      </div>
                      <div>
                        <p className="text-casino-silver">Wagered</p>
                        <p className="text-white">{stats.wagered.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-casino-silver">Paid Out</p>
                        <p className="text-white">{stats.paidOut.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
              {Object.keys(gameTypeStats).length === 0 && (
                <p className="text-casino-silver text-center py-4">No game data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-casino-gold/20">
          <CardHeader>
            <CardTitle className="text-casino-gold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-casino-silver">
              Latest games played
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentGames && recentGames.length > 0 ? (
                recentGames.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-3 bg-casino-dark rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {usernameMap.get(game.user_id) || "Unknown"}
                      </p>
                      <p className="text-casino-silver text-xs capitalize">{game.game_type}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        game.win_amount > game.bet_amount ? "text-green-400" : "text-red-400"
                      }`}>
                        {game.win_amount > game.bet_amount
                          ? `+${game.win_amount - game.bet_amount}`
                          : `-${game.bet_amount - game.win_amount}`}
                      </p>
                      <p className="text-casino-silver text-xs">
                        {new Date(game.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-casino-silver text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
