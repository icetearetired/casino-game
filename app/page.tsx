import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Dice1Icon as Dice, Target, WalletCardsIcon as Cards } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Hero Section */}
      <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-rose-900/80 z-10" />
        <div
          className="absolute inset-0 bg-[url('/placeholder.svg?height=500&width=1200')] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/casino-bg.jpg')" }}
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
            Lucky Casino
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-zinc-100">
            Experience the thrill of gambling with zero risk - play with virtual currency!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
            >
              <Link href="/games">Start Playing</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
            >
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-amber-500">Popular Games</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GameCard
            title="Slot Machine"
            description="Try your luck with our exciting slot machine. Match symbols and win big!"
            icon={<DollarSign className="h-8 w-8 text-amber-500" />}
            href="/games/slots"
          />

          <GameCard
            title="Roulette"
            description="Place your bets and watch the wheel spin. Will your number come up?"
            icon={<Target className="h-8 w-8 text-amber-500" />}
            href="/games/roulette"
          />

          <GameCard
            title="Dice Roll"
            description="Predict the outcome of the dice and multiply your winnings!"
            icon={<Dice className="h-8 w-8 text-amber-500" />}
            href="/games/dice"
          />

          <GameCard
            title="Blackjack"
            description="Beat the dealer to 21 without going bust in this classic card game."
            icon={<Cards className="h-8 w-8 text-amber-500" />}
            href="/games/blackjack"
          />

          <GameCard
            title="Scratch Cards"
            description="Scratch and reveal instant prizes with our virtual scratch cards."
            icon={<DollarSign className="h-8 w-8 text-amber-500" />}
            href="/games/scratch"
          />

          <GameCard
            title="Daily Bonus"
            description="Claim your daily bonus to boost your balance and keep playing!"
            icon={<DollarSign className="h-8 w-8 text-amber-500" />}
            href="/dashboard/bonus"
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-zinc-800 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-amber-500">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Account</h3>
              <p className="text-zinc-300">Sign up for free and receive 1,000 virtual coins to start playing.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Play Games</h3>
              <p className="text-zinc-300">Choose from a variety of casino games and place your bets.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Win Prizes</h3>
              <p className="text-zinc-300">Accumulate virtual wealth and compete on our leaderboards.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-950 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-zinc-400 mb-2">
            Lucky Casino is for entertainment purposes only. No real money is involved.
          </p>
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Lucky Casino. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function GameCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <Card className="bg-zinc-800 border-zinc-700 hover:border-amber-500 transition-all duration-300">
      <CardContent className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-zinc-300 mb-4">{description}</p>
        <Button asChild variant="link" className="text-amber-500 p-0">
          <Link href={href}>Play Now →</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
