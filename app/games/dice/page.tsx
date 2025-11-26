"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { DollarSign, Dice1 as Dice, RotateCw } from "lucide-react"

export default function DicePage() {
  const [betAmount, setBetAmount] = useState(10)
  const [targetNumber, setTargetNumber] = useState(3)
  const [diceResult, setDiceResult] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [winAmount, setWinAmount] = useState(0)
  const { balance, updateBalance, user } = useUser()
  const { toast } = useToast()

  // Calculate win multiplier based on probability
  const getMultiplier = (target: number) => {
    // Probability of rolling target or higher
    const probability = (7 - target) / 6
    // Multiplier is inverse of probability with a house edge
    const multiplier = (1 / probability) * 0.9
    return Number.parseFloat(multiplier.toFixed(2))
  }

  const multiplier = getMultiplier(targetNumber)
  const potentialWin = Math.floor(betAmount * multiplier)

  const rollDice = () => {
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

    setRolling(true)
    setWinAmount(0)

    // Animate rolling
    const rollInterval = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * 6) + 1)
    }, 100)

    // Stop rolling after 2 seconds
    setTimeout(() => {
      clearInterval(rollInterval)

      // Generate final result
      const result = Math.floor(Math.random() * 6) + 1
      setDiceResult(result)
      setRolling(false)

      // Check for win
      if (result >= targetNumber) {
        const win = Math.floor(betAmount * multiplier)
        setWinAmount(win)
        updateBalance(win)

        toast({
          title: "Winner!",
          description: `You rolled a ${result} and won ${win} coins!`,
          variant: "default",
          className: "bg-amber-500 text-black border-amber-600",
        })
      } else {
        toast({
          title: "No win",
          description: `You rolled a ${result}. Better luck next time!`,
          variant: "default",
        })
      }
    }, 2000)
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
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Dice Roll</h1>

        <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {/* Balance Display */}
              <div className="flex items-center gap-2 bg-zinc-700 px-4 py-2 rounded-full mb-8">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <span className="text-amber-500 font-bold text-xl">{(balance ?? 0).toLocaleString()}</span>
              </div>

              {/* Dice Game */}
              <div className="bg-zinc-950 p-8 rounded-lg mb-8 w-full max-w-md">
                {/* Dice Display */}
                <div className="flex justify-center mb-8">
                  <div
                    className={`w-24 h-24 flex items-center justify-center bg-zinc-800 rounded-lg text-5xl
                      ${rolling ? "animate-bounce" : ""}`}
                  >
                    {diceResult !== null ? diceResult : <Dice className="h-12 w-12 text-zinc-500" />}
                  </div>
                </div>

                {/* Target Number Selector */}
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-zinc-400">Target Number (Roll this or higher to win)</span>
                    <span className="text-amber-500 font-bold">{targetNumber}+</span>
                  </div>
                  <Slider
                    value={[targetNumber]}
                    min={2}
                    max={6}
                    step={1}
                    onValueChange={(value) => setTargetNumber(value[0])}
                    disabled={rolling}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                  </div>
                </div>

                {/* Win Display */}
                {winAmount > 0 && (
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-amber-500">You Won!</div>
                    <div className="text-3xl font-bold text-amber-400">{winAmount} coins</div>
                  </div>
                )}

                {/* Multiplier Display */}
                <div className="flex justify-between items-center mb-6 bg-zinc-800 p-3 rounded">
                  <div>
                    <div className="text-sm text-zinc-400">Win Chance</div>
                    <div className="text-lg font-bold text-zinc-300">
                      {(((7 - targetNumber) / 6) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Multiplier</div>
                    <div className="text-lg font-bold text-amber-500">{multiplier}x</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Potential Win</div>
                    <div className="text-lg font-bold text-zinc-300">{potentialWin} coins</div>
                  </div>
                </div>

                {/* Bet Controls */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseBet}
                    disabled={betAmount <= 10 || rolling}
                    className="border-zinc-600 text-zinc-300 bg-transparent"
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
                    disabled={betAmount >= 100 || rolling}
                    className="border-zinc-600 text-zinc-300"
                  >
                    +
                  </Button>
                </div>

                {/* Roll Button */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-amber-500 text-amber-500 hover:bg-amber-500/10 bg-transparent"
                    onClick={maxBet}
                    disabled={rolling}
                  >
                    Max Bet
                  </Button>

                  <Button
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
                    onClick={rollDice}
                    disabled={rolling}
                  >
                    {rolling ? (
                      <>
                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                        Rolling...
                      </>
                    ) : (
                      "Roll Dice"
                    )}
                  </Button>
                </div>
              </div>

              {/* Rules */}
              <div className="w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-amber-500">How to Play</h3>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                  <li>Select your target number (2-6)</li>
                  <li>Choose your bet amount</li>
                  <li>Roll the dice</li>
                  <li>If you roll your target number or higher, you win!</li>
                  <li>The lower your target number, the higher your chance to win but the lower your payout</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
