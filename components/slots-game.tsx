"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GameHeader } from "@/components/game-header"
import { updateBalance } from "@/lib/game-actions"
import { Minus, Plus } from "lucide-react"

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣"]

export function SlotsGame({ initialBalance }: { initialBalance: number }) {
  const [balance, setBalance] = useState(initialBalance)
  const [bet, setBet] = useState(10)
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]])
  const [spinning, setSpinning] = useState(false)
  const [message, setMessage] = useState("")

  const spin = async () => {
    if (balance < bet) {
      setMessage("Insufficient balance!")
      return
    }

    setSpinning(true)
    setMessage("")

    // Animate spinning
    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ])
    }, 100)

    // Stop after 2 seconds
    setTimeout(async () => {
      clearInterval(spinInterval)

      // Generate final result
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]
      setReels(finalReels)

      // Calculate payout
      let payout = 0
      let result = ""

      if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        // All three match
        if (finalReels[0] === "💎") {
          payout = bet * 10
          result = "Diamond Jackpot!"
        } else if (finalReels[0] === "7️⃣") {
          payout = bet * 7
          result = "Lucky Sevens!"
        } else {
          payout = bet * 5
          result = "Triple Match!"
        }
      } else if (
        finalReels[0] === finalReels[1] ||
        finalReels[1] === finalReels[2] ||
        finalReels[0] === finalReels[2]
      ) {
        // Two match
        payout = bet * 2
        result = "Double Match!"
      } else {
        // No match
        payout = 0
        result = "No match"
      }

      const newBalance = balance - bet + payout
      setBalance(newBalance)

      if (payout > bet) {
        setMessage(`${result} You won ${payout - bet} chips!`)
      } else if (payout === bet) {
        setMessage(`${result} Break even!`)
      } else {
        setMessage(`${result} Try again!`)
      }

      setSpinning(false)

      // Save to database (after UI update for responsiveness)
      try {
        await updateBalance(newBalance, "slots", bet, payout, result)
      } catch {
        // Balance already updated in UI, will sync on next page load
      }
    }, 2000)
  }

  return (
    <div className="min-h-svh bg-casino-dark">
      <GameHeader balance={balance} gameName="Slot Machine" />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Slot Machine */}
          <Card className="bg-card border-casino-gold/30">
            <CardContent className="p-8">
              <div className="flex justify-center gap-4 mb-8">
                {reels.map((symbol, index) => (
                  <div
                    key={index}
                    className="w-24 h-24 bg-casino-dark border-2 border-casino-gold/50 rounded-lg flex items-center justify-center text-5xl"
                  >
                    {symbol}
                  </div>
                ))}
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`text-center mb-6 text-lg font-semibold ${message.includes("won") ? "text-green-400" : message.includes("Insufficient") ? "text-red-400" : "text-casino-silver"}`}
                >
                  {message}
                </div>
              )}

              {/* Bet Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => setBet(Math.max(10, bet - 10))}
                    disabled={spinning}
                    variant="outline"
                    size="icon"
                    className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-center min-w-32">
                    <div className="text-sm text-casino-silver">Bet Amount</div>
                    <div className="text-2xl font-bold text-casino-gold">{bet}</div>
                  </div>
                  <Button
                    onClick={() => setBet(Math.min(balance, bet + 10))}
                    disabled={spinning}
                    variant="outline"
                    size="icon"
                    className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  onClick={spin}
                  disabled={spinning || balance < bet}
                  className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90 text-xl py-6"
                >
                  {spinning ? "SPINNING..." : "SPIN"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payout Table */}
          <Card className="bg-card border-casino-gold/20">
            <CardContent className="p-6">
              <h3 className="text-casino-gold font-semibold mb-4">Payout Table</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-casino-silver">
                  <span>💎 💎 💎</span>
                  <span>10x bet</span>
                </div>
                <div className="flex justify-between text-casino-silver">
                  <span>7️⃣ 7️⃣ 7️⃣</span>
                  <span>7x bet</span>
                </div>
                <div className="flex justify-between text-casino-silver">
                  <span>Any triple match</span>
                  <span>5x bet</span>
                </div>
                <div className="flex justify-between text-casino-silver">
                  <span>Any double match</span>
                  <span>2x bet</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
