import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Spade, TrendingUp, Package, Swords, Gift } from "lucide-react"

export default async function GamesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile with balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  // Fetch recent game history
  const { data: gameHistory } = await supabase
    .from("game_history")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const games = [
    {
      href: "/games/slots",
      icon: Sparkles,
      title: "Slot Machine",
      description: "Spin the reels and match symbols to win big!",
      color: "from-yellow-500/20 to-orange-500/20",
    },
    {
      href: "/games/blackjack",
      icon: Spade,
      title: "Blackjack",
      description: "Beat the dealer and get as close to 21 as possible!",
      color: "from-green-500/20 to-emerald-500/20",
    },
    {
      href: "/games/roulette",
      icon: TrendingUp,
      title: "Roulette",
      description: "Place your bets on red, black, or a number!",
      color: "from-red-500/20 to-rose-500/20",
    },
    {
      href: "/games/cases",
      icon: Package,
      title: "Mystery Cases",
      description: "Open cases for a chance at rare rewards!",
      color: "from-blue-500/20 to-cyan-500/20",
      isNew: true,
    },
    {
      href: "/games/poker-ai",
      icon: Swords,
      title: "AI Poker",
      description: "Challenge the AI in a heads-up poker match!",
      color: "from-purple-500/20 to-pink-500/20",
      isNew: true,
    },
    {
      href: "/games/blackjack-challenge",
      icon: Swords,
      title: "Blackjack Challenge",
      description: "Best of 5 hands against an AI opponent!",
      color: "from-indigo-500/20 to-violet-500/20",
      isNew: true,
    },
  ]

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-casino-gold">
          Welcome back, {profile?.username || "Player"}!
        </h1>
        <p className="text-casino-silver text-lg">Choose your game and start playing</p>
        {profile?.username?.startsWith("Guest_") && (
          <div className="mt-4 p-4 bg-casino-gold/10 border border-casino-gold/30 rounded-lg max-w-xl">
            <p className="text-casino-silver text-sm">
              Playing as a guest? Your progress won&apos;t be saved.{" "}
              <Link href="/auth/sign-up" className="text-casino-gold hover:underline">
                Create an account
              </Link>{" "}
              to keep your winnings!
            </p>
          </div>
        )}
      </div>

      {/* Daily Reward Banner */}
      <Link href="/rewards" className="block mb-8">
        <div className="relative overflow-hidden rounded-xl border border-casino-gold/30 bg-gradient-to-r from-casino-gold/20 via-casino-gold/10 to-casino-gold/20 p-6 hover:border-casino-gold/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-casino-gold/20">
              <Gift className="w-6 h-6 text-casino-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-casino-gold">Daily Reward Available!</h3>
              <p className="text-casino-silver text-sm">Claim your free chips and build your streak</p>
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Button className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90">
              Claim Now
            </Button>
          </div>
        </div>
      </Link>

      {/* Games Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {games.map((game) => {
          const Icon = game.icon
          return (
            <Card
              key={game.href}
              className={`relative bg-gradient-to-br ${game.color} border-casino-gold/20 hover:border-casino-gold/50 transition-all hover:scale-[1.02]`}
            >
              {game.isNew && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-semibold bg-casino-gold text-casino-dark rounded-full">
                    NEW
                  </span>
                </div>
              )}
              <CardHeader>
                <div className="w-12 h-12 bg-casino-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-casino-gold" />
                </div>
                <CardTitle className="text-casino-gold">{game.title}</CardTitle>
                <CardDescription className="text-casino-silver">
                  {game.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
                >
                  <Link href={game.href}>Play Now</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      {gameHistory && gameHistory.length > 0 && (
        <Card className="bg-card border-casino-gold/20">
          <CardHeader>
            <CardTitle className="text-casino-gold">Recent Activity</CardTitle>
            <CardDescription className="text-casino-silver">
              Your last 5 games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gameHistory.map(
                (game: {
                  id: string
                  game_type: string
                  result: { outcome?: string } | null
                  bet_amount: number
                  win_amount: number
                }) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 bg-casino-dark rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-casino-gold font-medium capitalize">
                        {game.game_type}
                      </span>
                      <span className="text-casino-silver text-sm">
                        {game.result?.outcome || ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-casino-silver text-sm">
                        Bet: {game.bet_amount}
                      </span>
                      <span
                        className={`font-semibold ${
                          game.win_amount > game.bet_amount
                            ? "text-green-400"
                            : game.win_amount === game.bet_amount
                              ? "text-casino-silver"
                              : "text-red-400"
                        }`}
                      >
                        {game.win_amount > game.bet_amount
                          ? `+${game.win_amount - game.bet_amount}`
                          : game.win_amount === game.bet_amount
                            ? "Push"
                            : `-${game.bet_amount - game.win_amount}`}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
