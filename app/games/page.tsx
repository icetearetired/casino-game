import type React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Dice1Icon as Dice, Target, WalletCardsIcon as Cards, TrendingUp, Zap, Grid3X3 } from "lucide-react"

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Casino Games</h1>
        <p className="text-xl text-center mb-12 max-w-3xl mx-auto text-zinc-300">
          Choose from our selection of exciting casino games and try your luck with virtual currency!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GameCard
            title="Slot Machine"
            description="Try your luck with our exciting slot machine. Match symbols and win big!"
            icon={<DollarSign className="h-12 w-12 text-amber-500" />}
            href="/games/slots"
            imagePath="/slot-machine-casino.png"
          />

          <GameCard
            title="Roulette"
            description="Place your bets and watch the wheel spin. Will your number come up?"
            icon={<Target className="h-12 w-12 text-amber-500" />}
            href="/games/roulette"
            imagePath="/placeholder-qlv5q.png"
          />

          <GameCard
            title="Dice Roll"
            description="Predict the outcome of the dice and multiply your winnings!"
            icon={<Dice className="h-12 w-12 text-amber-500" />}
            href="/games/dice"
            imagePath="/placeholder-viyzw.png"
          />

          <GameCard
            title="Crash"
            description="Watch the multiplier rise and cash out before it crashes! High risk, high reward."
            icon={<TrendingUp className="h-12 w-12 text-amber-500" />}
            href="/games/crash"
            imagePath="/crash-game-multiplier-chart.png"
          />

          <GameCard
            title="Plinko"
            description="Drop the ball and watch it bounce through pegs to win massive multipliers!"
            icon={<Zap className="h-12 w-12 text-amber-500" />}
            href="/games/plinko"
            imagePath="/plinko-pegs.png"
          />

          <GameCard
            title="Minesweeper"
            description="Navigate the minefield and cash out before hitting a bomb. Strategy meets luck!"
            icon={<Grid3X3 className="h-12 w-12 text-amber-500" />}
            href="/games/minesweeper"
            imagePath="/minesweeper-grid.png"
          />

          <GameCard
            title="Blackjack"
            description="Beat the dealer to 21 without going bust in this classic card game."
            icon={<Cards className="h-12 w-12 text-amber-500" />}
            href="/games/blackjack"
            imagePath="/placeholder-f44wp.png"
          />

          <GameCard
            title="Wheel of Fortune"
            description="Spin the wheel and win amazing prizes! Simple and exciting."
            icon={<Target className="h-12 w-12 text-amber-500" />}
            href="/games/wheel"
            imagePath="/spinning-wheel-of-fortune.png"
          />

          <GameCard
            title="Scratch Cards"
            description="Scratch and reveal instant prizes with our virtual scratch cards."
            icon={<DollarSign className="h-12 w-12 text-amber-500" />}
            href="/games/scratch"
            imagePath="/scratch-card-lottery.png"
          />
        </div>
      </div>
    </div>
  )
}

function GameCard({
  title,
  description,
  icon,
  href,
  imagePath,
  disabled = false,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  imagePath: string
  disabled?: boolean
}) {
  const content = (
    <Card
      className={`overflow-hidden bg-zinc-800 border-zinc-700 ${!disabled ? "hover:border-amber-500" : "opacity-70"} transition-all duration-300`}
    >
      <div className="relative h-40 bg-zinc-700">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10" />
        <img src={imagePath || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-zinc-900/80 p-2 rounded-full">{icon}</div>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-zinc-300 mb-4">{description}</p>
        {!disabled && <div className="text-amber-500 font-medium">Play Now →</div>}
        {disabled && <div className="text-zinc-500 font-medium">Coming Soon</div>}
      </CardContent>
    </Card>
  )

  if (disabled) {
    return content
  }

  return <Link href={href}>{content}</Link>
}
