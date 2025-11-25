"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { DollarSign, RotateCw } from "lucide-react"

// Slot machine symbols
const symbols = ["🍒", "🍋", "🍊", "🍇", "🍉", "7️⃣", "💰"]

// Payouts for different combinations
const payouts = {
  "🍒🍒🍒": 5,
  "🍋🍋🍋": 10,
  "🍊🍊🍊": 15,
  "🍇🍇🍇": 20,
  "🍉🍉🍉": 25,
  "7️⃣7️⃣7️⃣": 50,
  "💰💰💰": 100,
  // Two of a kind
  "🍒🍒": 2,
  "🍋🍋": 3,
  "🍊🍊": 4,
  "🍇🍇": 5,
  "🍉🍉": 6,
  "7️⃣7️⃣": 10,
  "💰💰": 20,
}

export default function SlotsPage() {
  const [reels, setReels] = useState(["🍒", "🍋", "🍊"])
  const [spinning, setSpinning] = useState(false)
  const [betAmount, setBetAmount] = useState(10)
  const [winAmount, setWinAmount] = useState(0)
  const [lastWin, setLastWin] = useState(0)
  const { balance, updateBalance, user } = useUser()
  const { toast } = useToast()

  const spin = () => {
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

    // Deduct bet amount
    updateBalance(-betAmount)

    setSpinning(true)
    setWinAmount(0)

    // Animate spinning
    const spinInterval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ])
    }, 100)

    // Stop spinning after 2 seconds
    setTimeout(() => {
      clearInterval(spinInterval)

      // Generate final result
      const finalReels = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]

      setReels(finalReels)
      setSpinning(false)

      // Check for wins
      checkWin(finalReels)
    }, 2000)
  }

  const checkWin = (result: string[]) => {
    // Check for three of a kind
    if (result[0] === result[1] && result[1] === result[2]) {
      const combination = `${result[0]}${result[1]}${result[2]}`
      const multiplier = payouts[combination as keyof typeof payouts] || 0
      const win = betAmount * multiplier

      setWinAmount(win)
      setLastWin(win)
      updateBalance(win)

      if (win > 0) {
        toast({
          title: "Winner!",
          description: `You won ${win} coins!`,
          variant: "default",
          className: "bg-amber-500 text-black border-amber-600",
        })
      }
      return
    }

    // Check for two of a kind
    if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
      let symbol
      if (result[0] === result[1]) symbol = result[0]
      else if (result[1] === result[2]) symbol = result[1]
      else symbol = result[0]

      const combination = `${symbol}${symbol}`
      const multiplier = payouts[combination as keyof typeof payouts] || 0
      const win = betAmount * multiplier

      setWinAmount(win)
      setLastWin(win)
      updateBalance(win)

      if (win > 0) {
        toast({
          title: "Winner!",
          description: `You won ${win} coins!`,
          variant: "default",
          className: "bg-amber-500 text-black border-amber-600",
        })
      }
      return
    }

    // No win
    setLastWin(0)
    toast({
      title: "No win",
      description: "Better luck next time!",
      variant: "default",
    })
  }

  const increaseBet = () => {
    if (betAmount < 100) {
      setBetAmount((prev) => prev + 10)
    }
  }

  const decreaseBet = () => {
    if (betAmount > 10) {
      setBetAmount((prev) => prev - 10)
    }
  }

  const maxBet = () => {
    setBetAmount(100)
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Slot Machine</h1>

        <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {/* Balance Display */}
              <div className="flex items-center gap-2 bg-zinc-700 px-4 py-2 rounded-full mb-8">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <span className="text-amber-500 font-bold text-xl">{balance.toLocaleString()}</span>
              </div>

              {/* Slot Machine */}
              <div className="bg-zinc-950 p-8 rounded-lg mb-8 w-full max-w-md">
                <div className="flex justify-center gap-4 mb-8">
                  {reels.map((symbol, index) => (
                    <div
                      key={index}
                      className={`w-20 h-20 flex items-center justify-center bg-zinc-800 rounded-lg text-4xl
                        ${spinning ? "animate-pulse" : ""}`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>

                {/* Win Display */}
                {winAmount > 0 && (
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-amber-500">You Won!</div>
                    <div className="text-3xl font-bold text-amber-400">{winAmount} coins</div>
                  </div>
                )}

                {/* Last Win */}
                <div className="text-center mb-6">
                  <div className="text-sm text-zinc-400">Last Win</div>
                  <div className="text-xl font-bold text-zinc-300">{lastWin > 0 ? `${lastWin} coins` : "-"}</div>
                </div>

                {/* Bet Controls */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseBet}
                    disabled={betAmount <= 10 || spinning}
                    className="border-zinc-600 text-zinc-300"
                  >
                    -
                  </Button>

                  <div className="text-center">
                    <div className="text-sm text-zinc-400">Bet Amount</div>
                    <div className="text-xl font-bold text-amber-500">{betAmount}</div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseBet}
                    disabled={betAmount >= 100 || spinning}
                    className="border-zinc-600 text-zinc-300"
                  >
                    +
                  </Button>
                </div>

                {/* Spin Button */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-amber-500 text-amber-500 hover:bg-amber-500/10"
                    onClick={maxBet}
                    disabled={spinning}
                  >
                    Max Bet
                  </Button>

                  <Button
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
                    onClick={spin}
                    disabled={spinning}
                  >
                    {spinning ? (
                      <>
                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                        Spinning...
                      </>
                    ) : (
                      "Spin"
                    )}
                  </Button>
                </div>
              </div>

              {/* Paytable */}
              <div className="w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-amber-500">Paytable</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(payouts).map(([combo, multiplier]) => (
                    <div key={combo} className="flex justify-between items-center bg-zinc-700/50 p-2 rounded">
                      <div className="text-lg">{combo}</div>
                      <div className="text-amber-500 font-bold">{multiplier}x</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
