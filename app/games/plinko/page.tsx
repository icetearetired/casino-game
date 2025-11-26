"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { DollarSign, Play } from "lucide-react"

// Plinko multipliers for different slots (16 slots)
const multipliers = [1000, 130, 26, 9, 4, 2, 1.5, 1, 0.5, 1, 1.5, 2, 4, 9, 26, 130, 1000]

export default function PlinkoPage() {
  const [betAmount, setBetAmount] = useState(10)
  const [dropping, setDropping] = useState(false)
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 0 })
  const [result, setResult] = useState<number | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [history, setHistory] = useState<{ slot: number; multiplier: number; win: number }[]>([])

  const { user, balance, updateBalance, addGameHistory, addTransaction, addXP } = useUser()
  const { toast } = useToast()
  const animationRef = useRef<number>()

  const dropBall = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or register to play.",
        variant: "destructive",
      })
      return
    }

    if (balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough coins to place this bet.",
        variant: "destructive",
      })
      return
    }

    if (dropping) return

    // Deduct bet amount
    updateBalance(-betAmount)
    addTransaction("bet", -betAmount, "plinko", `Plinko bet - ${betAmount} coins`)

    setDropping(true)
    setResult(null)
    setWinAmount(0)

    // Simulate ball physics
    let currentX = 50 // Start at center (50%)
    let currentY = 0
    const rows = 16
    const animationDuration = 2000
    const stepTime = animationDuration / rows

    let step = 0
    const animate = () => {
      if (step < rows) {
        // Each row, ball bounces left or right randomly
        const bounce = (Math.random() - 0.5) * 6 // Random bounce between -3% and +3%
        currentX = Math.max(5, Math.min(95, currentX + bounce))
        currentY = (step / rows) * 80 // Move down 80% of container height

        setBallPosition({ x: currentX, y: currentY })
        step++

        setTimeout(animate, stepTime)
      } else {
        // Ball reached bottom, determine final slot
        const finalSlot = Math.floor((currentX / 100) * multipliers.length)
        const clampedSlot = Math.max(0, Math.min(multipliers.length - 1, finalSlot))
        const multiplier = multipliers[clampedSlot]
        const winnings = Math.floor(betAmount * multiplier)

        setResult(clampedSlot)
        setWinAmount(winnings)
        setDropping(false)

        // Update balance and history
        if (winnings > 0) {
          updateBalance(winnings)
          addGameHistory("plinko", betAmount, winnings, multiplier, { slot: clampedSlot })
          addTransaction("win", winnings, "plinko", `Plinko win - ${multiplier}x multiplier`)
          addXP(Math.floor(winnings / 10))
        } else {
          addGameHistory("plinko", betAmount, 0, multiplier, { slot: clampedSlot })
        }

        setHistory((prev) => [{ slot: clampedSlot, multiplier, win: winnings }, ...prev].slice(0, 10))

        if (winnings > betAmount) {
          toast({
            title: "Winner!",
            description: `You won ${winnings} coins with a ${multiplier}x multiplier!`,
            variant: "default",
            className: "bg-amber-500 text-black border-amber-600",
          })
        } else if (winnings > 0) {
          toast({
            title: "Small Win",
            description: `You won ${winnings} coins with a ${multiplier}x multiplier.`,
            variant: "default",
          })
        } else {
          toast({
            title: "No Win",
            description: "Better luck next time!",
            variant: "default",
          })
        }
      }
    }

    animate()
  }

  const increaseBet = () => {
    if (betAmount < 1000 && !dropping) {
      setBetAmount((prev) => prev + 10)
    }
  }

  const decreaseBet = () => {
    if (betAmount > 10 && !dropping) {
      setBetAmount((prev) => prev - 10)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Plinko</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
              <CardContent className="p-6">
                {/* Balance Display */}
                <div className="flex items-center gap-2 bg-zinc-700 px-4 py-2 rounded-full mb-8 w-fit">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-500 font-bold text-xl">{(balance ?? 0).toLocaleString()}</span>
                </div>

                {/* Plinko Board */}
                <div className="bg-zinc-950 p-6 rounded-lg mb-8 relative">
                  <div className="relative w-full h-96 border-2 border-zinc-700 rounded-lg overflow-hidden">
                    {/* Pegs */}
                    <div className="absolute inset-0">
                      {Array.from({ length: 15 }, (_, row) => (
                        <div key={row} className="flex justify-center" style={{ top: `${(row + 1) * 5}%` }}>
                          {Array.from({ length: row + 2 }, (_, peg) => (
                            <div
                              key={peg}
                              className="w-2 h-2 bg-zinc-500 rounded-full mx-4"
                              style={{
                                position: "absolute",
                                left: `${((peg + 1) / (row + 3)) * 100}%`,
                                transform: "translateX(-50%)",
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Ball */}
                    {(dropping || result !== null) && (
                      <div
                        className="absolute w-3 h-3 bg-amber-500 rounded-full transition-all duration-100 z-10"
                        style={{
                          left: `${ballPosition.x}%`,
                          top: `${ballPosition.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    )}

                    {/* Drop Zone */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 flex">
                      {multipliers.map((multiplier, index) => (
                        <div
                          key={index}
                          className={`flex-1 flex items-center justify-center text-xs font-bold border-r border-zinc-700 last:border-r-0 ${
                            result === index
                              ? "bg-amber-500 text-black"
                              : multiplier >= 100
                                ? "bg-purple-500"
                                : multiplier >= 10
                                  ? "bg-green-500"
                                  : multiplier >= 2
                                    ? "bg-amber-600"
                                    : multiplier >= 1
                                      ? "bg-zinc-600"
                                      : "bg-red-500"
                          }`}
                        >
                          {multiplier >= 1 ? `${multiplier}x` : `${multiplier}x`}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Result Display */}
                  {result !== null && (
                    <div className="text-center mt-6">
                      <div className="text-2xl font-bold text-amber-500 mb-2">{multipliers[result]}x Multiplier!</div>
                      <div className="text-xl text-zinc-300">
                        {winAmount > 0 ? `Won ${winAmount} coins!` : "No win this time"}
                      </div>
                    </div>
                  )}
                </div>

                {/* History */}
                <div className="bg-zinc-950 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Recent Drops</h3>
                  <div className="space-y-2">
                    {history.map((drop, index) => (
                      <div key={index} className="flex justify-between items-center bg-zinc-800 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              drop.multiplier >= 100
                                ? "bg-purple-500"
                                : drop.multiplier >= 10
                                  ? "bg-green-500"
                                  : drop.multiplier >= 2
                                    ? "bg-amber-500"
                                    : drop.multiplier >= 1
                                      ? "bg-zinc-500"
                                      : "bg-red-500"
                            }`}
                          />
                          <span>{drop.multiplier}x</span>
                        </div>
                        <div className={`font-bold ${drop.win > 0 ? "text-green-400" : "text-red-400"}`}>
                          {drop.win > 0 ? `+${drop.win}` : "0"} coins
                        </div>
                      </div>
                    ))}
                    {history.length === 0 && <div className="text-zinc-500 text-center">No drops yet</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Betting Panel */}
          <div className="space-y-6">
            {/* Bet Controls */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Drop Ball</h3>

                <div className="space-y-4">
                  {/* Bet Amount */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Bet Amount</span>
                      <span className="text-amber-500 font-bold">{betAmount}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={decreaseBet}
                        disabled={betAmount <= 10 || dropping}
                        className="border-zinc-600 text-zinc-300 bg-transparent"
                      >
                        -10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={increaseBet}
                        disabled={betAmount >= 1000 || dropping}
                        className="border-zinc-600 text-zinc-300"
                      >
                        +10
                      </Button>
                    </div>
                  </div>

                  {/* Drop Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
                    onClick={dropBall}
                    disabled={dropping}
                  >
                    {dropping ? (
                      <>
                        <Play className="mr-2 h-4 w-4 animate-pulse" />
                        Dropping...
                      </>
                    ) : (
                      `Drop Ball (${betAmount} coins)`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Multiplier Guide */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-amber-500">Multipliers</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span>1000x - Jackpot (edges)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>26x-130x - High payout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span>2x-9x - Medium payout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-zinc-500 rounded-full" />
                    <span>1x-1.5x - Low payout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span>0.5x - Loss</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Rules */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-amber-500">How to Play</h3>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300 text-sm">
                  <li>Choose your bet amount</li>
                  <li>Click "Drop Ball" to release the ball</li>
                  <li>Watch the ball bounce through the pegs</li>
                  <li>The ball will land in a multiplier slot</li>
                  <li>Your winnings = bet × multiplier</li>
                  <li>Higher multipliers are at the edges!</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
