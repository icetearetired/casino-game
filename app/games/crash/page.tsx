"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { DollarSign, TrendingUp, X } from "lucide-react"

export default function CrashPage() {
  const [betAmount, setBetAmount] = useState(10)
  const [multiplier, setMultiplier] = useState(1.0)
  const [gameState, setGameState] = useState<"waiting" | "flying" | "crashed">("waiting")
  const [hasBet, setHasBet] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [cashOutAt, setCashOutAt] = useState<number | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(5)
  const [autoCashOut, setAutoCashOut] = useState<number | null>(null)

  const { user, balance, updateBalance, addGameHistory, addTransaction, addXP } = useUser()
  const { toast } = useToast()
  const gameInterval = useRef<NodeJS.Timeout | null>(null)
  const countdownInterval = useRef<NodeJS.Timeout | null>(null)

  // Start new game cycle
  const startGame = () => {
    setGameState("waiting")
    setMultiplier(1.0)
    setHasBet(false)
    setCashedOut(false)
    setCashOutAt(null)
    setWinAmount(0)
    setTimeLeft(5)

    // Countdown before game starts
    countdownInterval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (countdownInterval.current) clearInterval(countdownInterval.current)
          startFlying()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startFlying = () => {
    setGameState("flying")
    setTimeLeft(0)

    // Generate crash point (1.00 to 50.00, weighted towards lower values)
    const random = Math.random()
    const crashPoint = Math.max(1.01, Math.pow(random, 0.3) * 50)

    let currentMultiplier = 1.0
    const increment = 0.01
    const speed = 50 // milliseconds

    gameInterval.current = setInterval(() => {
      currentMultiplier += increment
      setMultiplier(currentMultiplier)

      // Check for crash
      if (currentMultiplier >= crashPoint) {
        crash(crashPoint)
        return
      }

      // Auto cash out if enabled
      if (autoCashOut && currentMultiplier >= autoCashOut && hasBet && !cashedOut) {
        cashOut()
      }
    }, speed)
  }

  const crash = (crashPoint: number) => {
    if (gameInterval.current) clearInterval(gameInterval.current)

    setGameState("crashed")
    setMultiplier(crashPoint)
    setHistory((prev) => [crashPoint, ...prev].slice(0, 10))

    // Handle players who didn't cash out
    if (hasBet && !cashedOut) {
      addGameHistory("crash", betAmount, 0, crashPoint, { crashed: true })
      addTransaction("loss", -betAmount, "crash", `Crash game - crashed at ${crashPoint.toFixed(2)}x`)

      toast({
        title: "Crashed!",
        description: `The multiplier crashed at ${crashPoint.toFixed(2)}x. You lost ${betAmount} coins.`,
        variant: "destructive",
      })
    }

    // Start new game after 3 seconds
    setTimeout(() => {
      startGame()
    }, 3000)
  }

  const placeBet = () => {
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

    if (gameState !== "waiting") {
      toast({
        title: "Game in Progress",
        description: "Wait for the next round to place a bet.",
        variant: "destructive",
      })
      return
    }

    updateBalance(-betAmount)
    setHasBet(true)
    addTransaction("bet", -betAmount, "crash", `Crash game bet - ${betAmount} coins`)

    toast({
      title: "Bet Placed",
      description: `You bet ${betAmount} coins. Good luck!`,
      variant: "default",
    })
  }

  const cashOut = () => {
    if (!hasBet || cashedOut || gameState !== "flying") return

    const winnings = Math.floor(betAmount * multiplier)
    setCashedOut(true)
    setCashOutAt(multiplier)
    setWinAmount(winnings)

    updateBalance(winnings)
    addGameHistory("crash", betAmount, winnings, multiplier, { cashedOut: true })
    addTransaction("win", winnings, "crash", `Crash game win - cashed out at ${multiplier.toFixed(2)}x`)
    addXP(Math.floor(winnings / 10)) // 1 XP per 10 coins won

    toast({
      title: "Cashed Out!",
      description: `You cashed out at ${multiplier.toFixed(2)}x and won ${winnings} coins!`,
      variant: "default",
      className: "bg-amber-500 text-black border-amber-600",
    })
  }

  // Initialize game on component mount
  useEffect(() => {
    startGame()

    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current)
      if (countdownInterval.current) clearInterval(countdownInterval.current)
    }
  }, [])

  const increaseBet = () => {
    if (betAmount < 1000 && gameState === "waiting" && !hasBet) {
      setBetAmount((prev) => prev + 10)
    }
  }

  const decreaseBet = () => {
    if (betAmount > 10 && gameState === "waiting" && !hasBet) {
      setBetAmount((prev) => prev - 10)
    }
  }

  const setAutoCashOutValue = (value: number | null) => {
    setAutoCashOut(value)
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Crash</h1>

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

                {/* Game Display */}
                <div className="bg-zinc-950 p-8 rounded-lg mb-8 relative overflow-hidden">
                  <div className="text-center mb-8">
                    {gameState === "waiting" && (
                      <div>
                        <div className="text-6xl font-bold text-amber-500 mb-4">
                          {timeLeft > 0 ? timeLeft : "Starting..."}
                        </div>
                        <div className="text-xl text-zinc-400">
                          {timeLeft > 0 ? "Next round starts in" : "Round starting..."}
                        </div>
                      </div>
                    )}

                    {gameState === "flying" && (
                      <div>
                        <div className="text-8xl font-bold text-green-500 mb-4 animate-pulse">
                          {multiplier.toFixed(2)}x
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xl text-green-400">
                          <TrendingUp className="h-6 w-6" />
                          Flying...
                        </div>
                      </div>
                    )}

                    {gameState === "crashed" && (
                      <div>
                        <div className="text-8xl font-bold text-red-500 mb-4">{multiplier.toFixed(2)}x</div>
                        <div className="flex items-center justify-center gap-2 text-xl text-red-400">
                          <X className="h-6 w-6" />
                          Crashed!
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Player Status */}
                  {hasBet && (
                    <div className="text-center mb-6">
                      {cashedOut ? (
                        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                          <div className="text-green-400 font-bold text-lg">Cashed out at {cashOutAt?.toFixed(2)}x</div>
                          <div className="text-green-300">Won {winAmount} coins!</div>
                        </div>
                      ) : gameState === "crashed" ? (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                          <div className="text-red-400 font-bold text-lg">Didn't cash out in time</div>
                          <div className="text-red-300">Lost {betAmount} coins</div>
                        </div>
                      ) : (
                        <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-4">
                          <div className="text-amber-400 font-bold text-lg">Bet: {betAmount} coins</div>
                          <div className="text-amber-300">
                            Potential win: {Math.floor(betAmount * multiplier)} coins
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cash Out Button */}
                  {hasBet && !cashedOut && gameState === "flying" && (
                    <div className="text-center">
                      <Button
                        size="lg"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold text-xl px-8 py-4"
                        onClick={cashOut}
                      >
                        Cash Out {Math.floor(betAmount * multiplier)} coins
                      </Button>
                    </div>
                  )}
                </div>

                {/* History */}
                <div className="bg-zinc-950 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Recent Crashes</h3>
                  <div className="flex flex-wrap gap-2">
                    {history.map((crash, index) => (
                      <div
                        key={index}
                        className={`px-3 py-1 rounded font-bold ${
                          crash >= 10
                            ? "bg-purple-500"
                            : crash >= 5
                              ? "bg-green-500"
                              : crash >= 2
                                ? "bg-amber-500 text-black"
                                : "bg-red-500"
                        }`}
                      >
                        {crash.toFixed(2)}x
                      </div>
                    ))}
                    {history.length === 0 && <div className="text-zinc-500">No games yet</div>}
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
                        disabled={betAmount <= 10 || gameState !== "waiting" || hasBet}
                        className="border-zinc-600 text-zinc-300 bg-transparent"
                      >
                        -10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={increaseBet}
                        disabled={betAmount >= 1000 || gameState !== "waiting" || hasBet}
                        className="border-zinc-600 text-zinc-300"
                      >
                        +10
                      </Button>
                    </div>
                  </div>

                  {/* Auto Cash Out */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Auto Cash Out</span>
                      <span className="text-amber-500 font-bold">
                        {autoCashOut ? `${autoCashOut.toFixed(2)}x` : "Off"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoCashOutValue(2.0)}
                        className="border-zinc-600 text-zinc-300"
                      >
                        2x
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoCashOutValue(5.0)}
                        className="border-zinc-600 text-zinc-300"
                      >
                        5x
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoCashOutValue(null)}
                        className="border-zinc-600 text-zinc-300"
                      >
                        Off
                      </Button>
                    </div>
                  </div>

                  {/* Bet Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
                    onClick={placeBet}
                    disabled={gameState !== "waiting" || hasBet}
                  >
                    {hasBet ? "Bet Placed" : `Bet ${betAmount} coins`}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Game Rules */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-amber-500">How to Play</h3>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300 text-sm">
                  <li>Place your bet before the round starts</li>
                  <li>Watch the multiplier increase</li>
                  <li>Cash out before it crashes to win</li>
                  <li>The longer you wait, the higher the multiplier</li>
                  <li>But if you don't cash out before the crash, you lose your bet</li>
                  <li>Use auto cash out to automatically cash out at a set multiplier</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
