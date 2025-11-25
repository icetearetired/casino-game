"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { DollarSign, RotateCw } from "lucide-react"

// Wheel segments with different multipliers and probabilities
const wheelSegments = [
  { multiplier: 0, color: "bg-zinc-600", label: "0x", probability: 0.3 },
  { multiplier: 1.2, color: "bg-blue-500", label: "1.2x", probability: 0.25 },
  { multiplier: 1.5, color: "bg-green-500", label: "1.5x", probability: 0.2 },
  { multiplier: 2, color: "bg-amber-500", label: "2x", probability: 0.15 },
  { multiplier: 3, color: "bg-orange-500", label: "3x", probability: 0.06 },
  { multiplier: 5, color: "bg-red-500", label: "5x", probability: 0.03 },
  { multiplier: 10, color: "bg-purple-500", label: "10x", probability: 0.009 },
  { multiplier: 50, color: "bg-pink-500", label: "50x", probability: 0.001 },
]

export default function WheelPage() {
  const [betAmount, setBetAmount] = useState(10)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [history, setHistory] = useState<{ multiplier: number; win: number }[]>([])

  const { user, balance, updateBalance, addGameHistory, addTransaction, addXP } = useUser()
  const { toast } = useToast()
  const wheelRef = useRef<HTMLDivElement>(null)

  // Generate weighted random result
  const getRandomResult = () => {
    const random = Math.random()
    let cumulativeProbability = 0

    for (let i = 0; i < wheelSegments.length; i++) {
      cumulativeProbability += wheelSegments[i].probability
      if (random <= cumulativeProbability) {
        return i
      }
    }
    return 0 // Fallback to first segment
  }

  const spinWheel = () => {
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

    if (spinning) return

    // Deduct bet amount
    updateBalance(-betAmount)
    addTransaction("bet", -betAmount, "wheel", `Wheel of Fortune bet - ${betAmount} coins`)

    setSpinning(true)
    setResult(null)
    setWinAmount(0)

    // Determine result
    const resultIndex = getRandomResult()
    const resultSegment = wheelSegments[resultIndex]

    // Calculate rotation (multiple full spins + final position)
    const segmentAngle = 360 / wheelSegments.length
    const finalAngle = resultIndex * segmentAngle
    const spins = 5 + Math.random() * 3 // 5-8 full rotations
    const totalRotation = rotation + spins * 360 + (360 - finalAngle) // Subtract to account for clockwise spin

    setRotation(totalRotation)

    // Wait for animation to complete
    setTimeout(() => {
      setResult(resultIndex)
      setSpinning(false)

      const winnings = Math.floor(betAmount * resultSegment.multiplier)
      setWinAmount(winnings)

      if (winnings > 0) {
        updateBalance(winnings)
        addGameHistory("wheel", betAmount, winnings, resultSegment.multiplier, { segment: resultIndex })
        addTransaction("win", winnings, "wheel", `Wheel of Fortune win - ${resultSegment.multiplier}x multiplier`)
        addXP(Math.floor(winnings / 10))
      } else {
        addGameHistory("wheel", betAmount, 0, 0, { segment: resultIndex })
      }

      setHistory((prev) => [{ multiplier: resultSegment.multiplier, win: winnings }, ...prev].slice(0, 10))

      if (winnings > betAmount) {
        toast({
          title: "Big Win! 🎉",
          description: `You won ${winnings} coins with a ${resultSegment.multiplier}x multiplier!`,
          variant: "default",
          className: "bg-amber-500 text-black border-amber-600",
        })
      } else if (winnings > 0) {
        toast({
          title: "Winner!",
          description: `You won ${winnings} coins!`,
          variant: "default",
        })
      } else {
        toast({
          title: "No Win",
          description: "Better luck next time!",
          variant: "default",
        })
      }
    }, 3000) // 3 second spin animation
  }

  const increaseBet = () => {
    if (betAmount < 1000 && !spinning) {
      setBetAmount((prev) => prev + 10)
    }
  }

  const decreaseBet = () => {
    if (betAmount > 10 && !spinning) {
      setBetAmount((prev) => prev - 10)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Wheel of Fortune</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
              <CardContent className="p-6">
                {/* Balance Display */}
                <div className="flex items-center gap-2 bg-zinc-700 px-4 py-2 rounded-full mb-8 w-fit">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-500 font-bold text-xl">{balance.toLocaleString()}</span>
                </div>

                {/* Wheel */}
                <div className="bg-zinc-950 p-8 rounded-lg mb-8">
                  <div className="relative flex items-center justify-center">
                    {/* Pointer */}
                    <div className="absolute top-0 z-20 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-amber-500 transform -translate-y-2" />

                    {/* Wheel */}
                    <div
                      ref={wheelRef}
                      className="relative w-80 h-80 rounded-full border-4 border-amber-500 overflow-hidden transition-transform duration-3000 ease-out"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      {wheelSegments.map((segment, index) => {
                        const angle = 360 / wheelSegments.length
                        const rotation = index * angle

                        return (
                          <div
                            key={index}
                            className={`absolute w-full h-full ${segment.color} flex items-center justify-center`}
                            style={{
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((angle * Math.PI) / 180)}% ${50 - 50 * Math.sin((angle * Math.PI) / 180)}%)`,
                              transform: `rotate(${rotation}deg)`,
                              transformOrigin: "center",
                            }}
                          >
                            <div
                              className="text-white font-bold text-lg"
                              style={{ transform: `rotate(${angle / 2}deg)` }}
                            >
                              {segment.label}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Result Display */}
                  {result !== null && !spinning && (
                    <div className="text-center mt-8">
                      <div className="text-3xl font-bold text-amber-500 mb-2">
                        {wheelSegments[result].label} Multiplier!
                      </div>
                      <div className="text-xl text-zinc-300">
                        {winAmount > 0 ? `Won ${winAmount} coins!` : "No win this time"}
                      </div>
                    </div>
                  )}

                  {/* Spin Status */}
                  {spinning && (
                    <div className="text-center mt-8">
                      <div className="flex items-center justify-center gap-2 text-2xl font-bold text-amber-500">
                        <RotateCw className="h-8 w-8 animate-spin" />
                        Spinning...
                      </div>
                    </div>
                  )}
                </div>

                {/* History */}
                <div className="bg-zinc-950 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Recent Spins</h3>
                  <div className="space-y-2">
                    {history.map((spin, index) => (
                      <div key={index} className="flex justify-between items-center bg-zinc-800 p-3 rounded">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              spin.multiplier >= 10
                                ? "bg-purple-500"
                                : spin.multiplier >= 5
                                  ? "bg-pink-500"
                                  : spin.multiplier >= 3
                                    ? "bg-red-500"
                                    : spin.multiplier >= 2
                                      ? "bg-orange-500"
                                      : spin.multiplier >= 1.5
                                        ? "bg-amber-500"
                                        : spin.multiplier >= 1.2
                                          ? "bg-green-500"
                                          : spin.multiplier > 0
                                            ? "bg-blue-500"
                                            : "bg-zinc-600"
                            }`}
                          />
                          <span>{spin.multiplier}x</span>
                        </div>
                        <div className={`font-bold ${spin.win > 0 ? "text-green-400" : "text-red-400"}`}>
                          {spin.win > 0 ? `+${spin.win}` : "0"} coins
                        </div>
                      </div>
                    ))}
                    {history.length === 0 && <div className="text-zinc-500 text-center">No spins yet</div>}
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
                <h3 className="text-lg font-bold mb-4">Place Bet</h3>

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
                        disabled={betAmount <= 10 || spinning}
                        className="border-zinc-600 text-zinc-300 bg-transparent"
                      >
                        -10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={increaseBet}
                        disabled={betAmount >= 1000 || spinning}
                        className="border-zinc-600 text-zinc-300"
                      >
                        +10
                      </Button>
                    </div>
                  </div>

                  {/* Spin Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
                    onClick={spinWheel}
                    disabled={spinning}
                  >
                    {spinning ? (
                      <>
                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                        Spinning...
                      </>
                    ) : (
                      `Spin Wheel (${betAmount} coins)`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payout Table */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-amber-500">Payouts</h3>
                <div className="space-y-2">
                  {wheelSegments.map((segment, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                        <span>{segment.label}</span>
                      </div>
                      <div className="text-zinc-400 text-sm">{(segment.probability * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Rules */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-amber-500">How to Play</h3>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300 text-sm">
                  <li>Choose your bet amount</li>
                  <li>Click "Spin Wheel" to start</li>
                  <li>Watch the wheel spin and stop</li>
                  <li>Win based on the multiplier where it lands</li>
                  <li>Higher multipliers are rarer but pay more!</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
