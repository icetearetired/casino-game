import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Coins, Gamepad2, TrendingUp, Crown } from "lucide-react"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch top players by balance
  const { data: topBalances } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, balance, level")
    .order("balance", { ascending: false })
    .limit(50)

  // Fetch top players by total won
  const { data: topWinners } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, total_won, level")
    .order("total_won", { ascending: false })
    .limit(50)

  // Fetch top players by games played
  const { data: topPlayers } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, games_played, level")
    .order("games_played", { ascending: false })
    .limit(50)

  // Get current user's ranks
  const userRanks = {
    balance: topBalances?.findIndex((p) => p.id === user?.id) ?? -1,
    totalWon: topWinners?.findIndex((p) => p.id === user?.id) ?? -1,
    gamesPlayed: topPlayers?.findIndex((p) => p.id === user?.id) ?? -1,
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-casino-gold mb-2">Leaderboard</h1>
        <p className="text-casino-silver text-lg">See how you stack up against other players</p>
      </div>

      {/* User's Rankings */}
      {user && (
        <Card className="mb-8 bg-gradient-to-r from-casino-gold/10 to-casino-gold/5 border-casino-gold/30">
          <CardHeader>
            <CardTitle className="text-casino-gold">Your Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-casino-dark rounded-lg">
                <Coins className="w-6 h-6 mx-auto text-casino-gold mb-2" />
                <p className="text-2xl font-bold text-white">
                  {userRanks.balance >= 0 ? `#${userRanks.balance + 1}` : "-"}
                </p>
                <p className="text-casino-silver text-sm">Balance</p>
              </div>
              <div className="text-center p-4 bg-casino-dark rounded-lg">
                <TrendingUp className="w-6 h-6 mx-auto text-green-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {userRanks.totalWon >= 0 ? `#${userRanks.totalWon + 1}` : "-"}
                </p>
                <p className="text-casino-silver text-sm">Total Won</p>
              </div>
              <div className="text-center p-4 bg-casino-dark rounded-lg">
                <Gamepad2 className="w-6 h-6 mx-auto text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {userRanks.gamesPlayed >= 0 ? `#${userRanks.gamesPlayed + 1}` : "-"}
                </p>
                <p className="text-casino-silver text-sm">Games</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="balance" className="space-y-4">
        <TabsList className="bg-casino-dark border border-casino-gold/20 grid w-full grid-cols-3">
          <TabsTrigger
            value="balance"
            className="data-[state=active]:bg-casino-gold/20 data-[state=active]:text-casino-gold"
          >
            <Coins className="w-4 h-4 mr-2 hidden sm:inline" />
            Richest
          </TabsTrigger>
          <TabsTrigger
            value="winners"
            className="data-[state=active]:bg-casino-gold/20 data-[state=active]:text-casino-gold"
          >
            <TrendingUp className="w-4 h-4 mr-2 hidden sm:inline" />
            Top Winners
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-casino-gold/20 data-[state=active]:text-casino-gold"
          >
            <Gamepad2 className="w-4 h-4 mr-2 hidden sm:inline" />
            Most Active
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance">
          <LeaderboardTable
            title="Richest Players"
            description="Players with the highest chip balance"
            data={topBalances || []}
            valueKey="balance"
            valueLabel="Balance"
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="winners">
          <LeaderboardTable
            title="Top Winners"
            description="Players who have won the most chips"
            data={topWinners || []}
            valueKey="total_won"
            valueLabel="Total Won"
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="active">
          <LeaderboardTable
            title="Most Active Players"
            description="Players who have played the most games"
            data={topPlayers || []}
            valueKey="games_played"
            valueLabel="Games"
            currentUserId={user?.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LeaderboardTable({
  title,
  description,
  data,
  valueKey,
  valueLabel,
  currentUserId,
}: {
  title: string
  description: string
  data: Array<{
    id: string
    username: string
    avatar_url?: string | null
    level?: number
    [key: string]: string | number | null | undefined
  }>
  valueKey: string
  valueLabel: string
  currentUserId?: string
}) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-casino-silver font-medium">#{rank + 1}</span>
    }
  }

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-casino-gold/20 border-casino-gold/50"
    switch (rank) {
      case 0:
        return "bg-yellow-500/10 border-yellow-500/30"
      case 1:
        return "bg-gray-400/10 border-gray-400/30"
      case 2:
        return "bg-amber-600/10 border-amber-600/30"
      default:
        return "bg-casino-dark border-casino-gold/10"
    }
  }

  return (
    <Card className="bg-card border-casino-gold/20">
      <CardHeader>
        <CardTitle className="text-casino-gold flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-casino-silver">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.length > 0 ? (
            data.map((player, index) => {
              const isCurrentUser = player.id === currentUserId
              const initials = player.username?.slice(0, 2).toUpperCase() || "U"

              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${getRankBg(index, isCurrentUser)}`}
                >
                  <div className="w-10 flex justify-center">{getRankIcon(index)}</div>

                  <Avatar className="h-10 w-10 border border-casino-gold/30">
                    <AvatarImage src={player.avatar_url || undefined} />
                    <AvatarFallback className="bg-casino-gold/20 text-casino-gold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentUser ? "text-casino-gold" : "text-white"}`}>
                      {player.username}
                      {isCurrentUser && <span className="text-casino-silver text-sm ml-2">(You)</span>}
                    </p>
                    {player.level !== undefined && (
                      <p className="text-casino-silver text-sm">Level {player.level}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className={`font-bold ${index < 3 ? "text-casino-gold" : "text-white"}`}>
                      {((player[valueKey] as number) || 0).toLocaleString()}
                    </p>
                    <p className="text-casino-silver text-xs">{valueLabel}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-casino-silver text-center py-8">No data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
