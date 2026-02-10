import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Coins, Sparkles, Spade, TrendingUp } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

export default async function GamesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile with balance
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch recent game history
  const { data: gameHistory } = await supabase
    .from("game_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-svh bg-casino-dark text-white">
      {/* Header */}
      <header className="border-b border-casino-gold/20 bg-casino-dark/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/games" className="text-2xl font-bold text-casino-gold">
              Lucky Streak Casino
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-casino-gold/10 px-4 py-2 rounded-lg border border-casino-gold/30">
                <Coins className="w-5 h-5 text-casino-gold" />
                <span className="text-casino-gold font-semibold">{profile?.balance?.toLocaleString() || 0}</span>
                <span className="text-casino-silver text-sm">chips</span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-casino-gold">Welcome, {profile?.username || "Player"}!</h1>
          <p className="text-casino-silver text-lg">Choose your game and start playing</p>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card border-casino-gold/20 hover:border-casino-gold/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-casino-gold/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-casino-gold" />
              </div>
              <CardTitle className="text-casino-gold">Slot Machine</CardTitle>
              <CardDescription className="text-casino-silver">
                Spin the reels and match symbols to win big!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90">
                <Link href="/games/slots">Play Slots</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-casino-gold/20 hover:border-casino-gold/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-casino-gold/10 rounded-lg flex items-center justify-center mb-4">
                <Spade className="w-6 h-6 text-casino-gold" />
              </div>
              <CardTitle className="text-casino-gold">Blackjack</CardTitle>
              <CardDescription className="text-casino-silver">
                Beat the dealer and get as close to 21 as possible!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90">
                <Link href="/games/blackjack">Play Blackjack</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-casino-gold/20 hover:border-casino-gold/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-casino-gold/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-casino-gold" />
              </div>
              <CardTitle className="text-casino-gold">Roulette</CardTitle>
              <CardDescription className="text-casino-silver">
                Place your bets on red, black, or a number!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90">
                <Link href="/games/roulette">Play Roulette</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {gameHistory && gameHistory.length > 0 && (
          <Card className="bg-card border-casino-gold/20">
            <CardHeader>
              <CardTitle className="text-casino-gold">Recent Activity</CardTitle>
              <CardDescription className="text-casino-silver">Your last 5 games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gameHistory.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-3 bg-casino-dark rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-casino-gold font-medium capitalize">{game.game_type}</span>
                      <span className="text-casino-silver text-sm">{game.result}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-casino-silver text-sm">Bet: {game.bet_amount}</span>
                      <span
                        className={`font-semibold ${game.payout > game.bet_amount ? "text-green-400" : game.payout === game.bet_amount ? "text-casino-silver" : "text-red-400"}`}
                      >
                        {game.payout > game.bet_amount
                          ? `+${game.payout - game.bet_amount}`
                          : game.payout === game.bet_amount
                            ? "Push"
                            : `-${game.bet_amount - game.payout}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
