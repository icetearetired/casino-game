"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GameHeader } from "@/components/game-header"
import { updateBalance } from "@/lib/game-actions"
import { Minus, Plus } from "lucide-react"

const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

type BetType = "red" | "black" | "even" | "odd" | "low" | "high" | "number"

interface Bet {
  type: BetType
  value?: number
  amount: number
}

export function RouletteGame({ initialBalance }: { initialBalance: number }) {
  const [balance, setBalance] = useState(initialBalance)
  const [betAmount, setBetAmount] = useState(10)
  const [bets, setBets] = useState<Bet[]>([])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [message, setMessage] = useState("")

  const addBet = (type: BetType, value?: number) => {
    const totalBets = bets.reduce((sum, bet) => sum + bet.amount, 0)
    if (totalBets + betAmount > balance) {
      setMessage("Insufficient balance for this bet!")
      return
    }

    setBets([...bets, { type, value, amount: betAmount }])
    setMessage("")
  }

  const clearBets = () => {
    setBets([])
    setMessage("")
  }

  const spin = async () => {
    if (bets.length === 0) {
      setMessage("Place at least one bet first!")
      return
    }

    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0)
    if (totalBet > balance) {
      setMessage("Insufficient balance!")
      return
    }

    setSpinning(true)
    setMessage("Spinning...")

    // Animate spinning
    const spinInterval = setInterval(() => {
      setResult(Math.floor(Math.random() * 37))
    }, 100)

    // Stop after 3 seconds
    setTimeout(async () => {
      clearInterval(spinInterval)

      const finalResult = Math.floor(Math.random() * 37) // 0-36
      setResult(finalResult)

      // Calculate winnings
      let totalPayout = 0

      for (const bet of bets) {
        if (bet.type === "number" && bet.value === finalResult) {
          totalPayout += bet.amount * 36 // 35:1 + original bet
        } else if (bet.type === "red" && redNumbers.includes(finalResult)) {
          totalPayout += bet.amount * 2
        } else if (bet.type === "black" && blackNumbers.includes(finalResult)) {
          totalPayout += bet.amount * 2
        } else if (bet.type === "even" && finalResult !== 0 && finalResult % 2 === 0) {
          totalPayout += bet.amount * 2
        } else if (bet.type === "odd" && finalResult % 2 === 1) {
          totalPayout += bet.amount * 2
        } else if (bet.type === "low" && finalResult >= 1 && finalResult <= 18) {
          totalPayout += bet.amount * 2
        } else if (bet.type === "high" && finalResult >= 19 && finalResult <= 36) {
          totalPayout += bet.amount * 2
        }
      }

      const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0)
      const newBalance = balance - totalBetAmount + totalPayout

      setBalance(newBalance)

      // Determine result message
      const resultColor = finalResult === 0 ? "green" : redNumbers.includes(finalResult) ? "red" : "black"
      let resultMessage = `Result: ${finalResult} (${resultColor})`

      if (totalPayout > totalBetAmount) {
        resultMessage += ` - You won ${totalPayout - totalBetAmount} chips!`
        setMessage(resultMessage)
      } else if (totalPayout === totalBetAmount) {
        resultMessage += " - Break even!"
        setMessage(resultMessage)
      } else {
        resultMessage += " - Better luck next time!"
        setMessage(resultMessage)
      }

      setSpinning(false)
      setBets([])

      // Save to database (after UI update for responsiveness)
      try {
        await updateBalance(newBalance, "roulette", totalBetAmount, totalPayout, `${finalResult} ${resultColor}`)
      } catch {
        // Balance already updated in UI, will sync on next page load
      }
    }, 3000)
  }

  const getNumberColor = (num: number) => {
    if (num === 0) return "bg-green-600"
    return redNumbers.includes(num) ? "bg-red-600" : "bg-casino-dark"
  }

  return (
    <div className="min-h-svh bg-casino-dark">
      <GameHeader balance={balance} gameName="Roulette" />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Roulette Wheel */}
          <Card className="bg-card border-casino-gold/30">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-casino-gold text-5xl font-bold ${
                    result !== null ? getNumberColor(result) : "bg-casino-dark"
                  } text-white ${spinning ? "animate-spin" : ""}`}
                >
                  {result !== null ? result : "?"}
                </div>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`text-center mb-6 text-lg font-semibold ${message.includes("won") ? "text-green-400" : message.includes("Insufficient") ? "text-red-400" : "text-casino-silver"}`}
                >
                  {message}
                </div>
              )}

              {/* Current Bets */}
              {bets.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-casino-gold text-sm mb-2">Your Bets:</h3>
                  <div className="flex flex-wrap gap-2">
                    {bets.map((bet, index) => (
                      <div key={index} className="bg-casino-dark px-3 py-1 rounded text-sm text-casino-silver">
                        {bet.type === "number" ? `#${bet.value}` : bet.type.toUpperCase()} - {bet.amount} chips
                      </div>
                    ))}
                  </div>
                  <div className="text-casino-gold font-semibold mt-2">
                    Total: {bets.reduce((sum, bet) => sum + bet.amount, 0)} chips
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Betting Controls */}
          <Card className="bg-card border-casino-gold/20">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Bet Amount Selector */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
                    disabled={spinning}
                    variant="outline"
                    size="icon"
                    className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-center min-w-32">
                    <div className="text-sm text-casino-silver">Bet Amount</div>
                    <div className="text-2xl font-bold text-casino-gold">{betAmount}</div>
                  </div>
                  <Button
                    onClick={() => setBetAmount(Math.min(balance, betAmount + 10))}
                    disabled={spinning}
                    variant="outline"
                    size="icon"
                    className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Color Bets */}
                <div className="space-y-2">
                  <h3 className="text-casino-silver text-sm font-semibold">Colors (2x payout)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => addBet("red")}
                      disabled={spinning}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Red
                    </Button>
                    <Button
                      onClick={() => addBet("black")}
                      disabled={spinning}
                      className="bg-casino-dark hover:bg-casino-dark/80 text-white border border-casino-gold/30"
                    >
                      Black
                    </Button>
                  </div>
                </div>

                {/* Even/Odd & High/Low */}
                <div className="space-y-2">
                  <h3 className="text-casino-silver text-sm font-semibold">Other Bets (2x payout)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => addBet("even")}
                      disabled={spinning}
                      variant="outline"
                      className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
                    >
                      Even
                    </Button>
                    <Button
                      onClick={() => addBet("odd")}
                      disabled={spinning}
                      variant="outline"
                      className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
                    >
                      Odd
                    </Button>
                    <Button
                      onClick={() => addBet("low")}
                      disabled={spinning}
                      variant="outline"
                      className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
                    >
                      1-18
                    </Button>
                    <Button
                      onClick={() => addBet("high")}
                      disabled={spinning}
                      variant="outline"
                      className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
                    >
                      19-36
                    </Button>
                  </div>
                </div>

                {/* Number Grid */}
                <div className="space-y-2">
                  <h3 className="text-casino-silver text-sm font-semibold">Straight Up (36x payout)</h3>
                  <div className="grid grid-cols-9 gap-1">
                    <Button
                      onClick={() => addBet("number", 0)}
                      disabled={spinning}
                      className="bg-green-600 hover:bg-green-700 text-white h-10 p-0 text-sm col-span-9"
                    >
                      0
                    </Button>
                    {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                      <Button
                        key={num}
                        onClick={() => addBet("number", num)}
                        disabled={spinning}
                        className={`${getNumberColor(num)} hover:opacity-80 text-white h-10 p-0 text-sm`}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={clearBets}
                    disabled={spinning || bets.length === 0}
                    variant="outline"
                    className="flex-1 border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
                  >
                    Clear Bets
                  </Button>
                  <Button
                    onClick={spin}
                    disabled={spinning || bets.length === 0}
                    className="flex-1 bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
                  >
                    {spinning ? "SPINNING..." : "SPIN"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
