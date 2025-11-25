"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { DollarSign, RotateCw } from "lucide-react"

// Roulette wheel numbers in order
const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7,
  28, 12, 35, 3, 26,
]

// Define bet types and payouts
const betTypes = {
  number: { payout: 35, label: "Single Number" },
  red: { payout: 1, label: "Red" },
  black: { payout: 1, label: "Black" },
  even: { payout: 1, label: "Even" },
  odd: { payout: 1, label: "Odd" },
  low: { payout: 1, label: "1-18" },
  high: { payout: 1, label: "19-36" },
  dozen1: { payout: 2, label: "1st Dozen (1-12)" },
  dozen2: { payout: 2, label: "2nd Dozen (13-24)" },
  dozen3: { payout: 2, label: "3rd Dozen (25-36)" },
  column1: { payout: 2, label: "1st Column" },
  column2: { payout: 2, label: "2nd Column" },
  column3: { payout: 2, label: "3rd Column" },
}

// Define red numbers
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export default function RoulettePage() {
  const [selectedBets, setSelectedBets] = useState<{ [key: string]: number }>({})
  const [betAmount, setBetAmount] = useState(10)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [lastWin, setLastWin] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const { balance, updateBalance, user } = useUser()
  const { toast } = useToast()

  // Calculate total bet amount
  const totalBet = Object.values(selectedBets).reduce((sum, bet) => sum + bet, 0)

  const placeBet = (betType: string, value?: number) => {
    if (spinning) return

    const betKey = value !== undefined ? `number_${value}` : betType

    setSelectedBets((prev) => {
      const newBets = { ...prev }

      if (newBets[betKey]) {
        newBets[betKey] += betAmount
      } else {
        newBets[betKey] = betAmount
      }

      return newBets
    })
  }

  const clearBets = () => {
    if (spinning) return
    setSelectedBets({})
  }

  const spin = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or register to play.",
        variant: "destructive",
      })
      return
    }

    if (totalBet <= 0) {
      toast({
        title: "No Bets Placed",
        description: "Please place at least one bet before spinning.",
        variant: "destructive",
      })
      return
    }

    if (balance < totalBet) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough coins to place these bets.",
        variant: "destructive",
      })
      return
    }

    // Deduct bet amount
    updateBalance(-totalBet)

    setSpinning(true)
    setWinAmount(0)

    // Simulate spinning
    let spinCount = 0
    const spinInterval = setInterval(() => {
      setResult(Math.floor(Math.random() * 37))
      spinCount++

      if (spinCount > 20) {
        clearInterval(spinInterval)

        // Generate final result
        const finalResult = Math.floor(Math.random() * 37)
        setResult(finalResult)
        setHistory((prev) => [finalResult, ...prev].slice(0, 10))
        setSpinning(false)

        // Check for wins
        checkWins(finalResult)
      }
    }, 100)
  }

  const checkWins = (number: number) => {
    let totalWin = 0
    const isRed = redNumbers.includes(number)
    const isBlack = number !== 0 && !isRed
    const isEven = number !== 0 && number % 2 === 0
    const isOdd = number !== 0 && number % 2 !== 0
    const isLow = number >= 1 && number <= 18
    const isHigh = number >= 19 && number <= 36
    const isDozen1 = number >= 1 && number <= 12
    const isDozen2 = number >= 13 && number <= 24
    const isDozen3 = number >= 25 && number <= 36
    const column = number !== 0 ? (number % 3 === 0 ? 3 : number % 3) : 0

    // Check each bet
    Object.entries(selectedBets).forEach(([betKey, amount]) => {
      let win = 0

      if (betKey.startsWith("number_")) {
        const betNumber = Number.parseInt(betKey.split("_")[1])
        if (betNumber === number) {
          win = amount * (betTypes.number.payout + 1) // +1 to include the original bet
        }
      } else if (betKey === "red" && isRed) {
        win = amount * (betTypes.red.payout + 1)
      } else if (betKey === "black" && isBlack) {
        win = amount * (betTypes.black.payout + 1)
      } else if (betKey === "even" && isEven) {
        win = amount * (betTypes.even.payout + 1)
      } else if (betKey === "odd" && isOdd) {
        win = amount * (betTypes.odd.payout + 1)
      } else if (betKey === "low" && isLow) {
        win = amount * (betTypes.low.payout + 1)
      } else if (betKey === "high" && isHigh) {
        win = amount * (betTypes.high.payout + 1)
      } else if (betKey === "dozen1" && isDozen1) {
        win = amount * (betTypes.dozen1.payout + 1)
      } else if (betKey === "dozen2" && isDozen2) {
        win = amount * (betTypes.dozen2.payout + 1)
      } else if (betKey === "dozen3" && isDozen3) {
        win = amount * (betTypes.dozen3.payout + 1)
      } else if (betKey === "column1" && column === 1) {
        win = amount * (betTypes.column1.payout + 1)
      } else if (betKey === "column2" && column === 2) {
        win = amount * (betTypes.column2.payout + 1)
      } else if (betKey === "column3" && column === 3) {
        win = amount * (betTypes.column3.payout + 1)
      }

      totalWin += win
    })

    if (totalWin > 0) {
      setWinAmount(totalWin)
      setLastWin(totalWin)
      updateBalance(totalWin)

      toast({
        title: "Winner!",
        description: `You won ${totalWin} coins!`,
        variant: "default",
        className: "bg-amber-500 text-black border-amber-600",
      })
    } else {
      setLastWin(0)
      toast({
        title: "No win",
        description: "Better luck next time!",
        variant: "default",
      })
    }
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

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Roulette</h1>

        <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Wheel and Controls */}
              <div className="flex-1">
                {/* Balance Display */}
                <div className="flex items-center gap-2 bg-zinc-700 px-4 py-2 rounded-full mb-8 w-fit">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-500 font-bold text-xl">{balance.toLocaleString()}</span>
                </div>

                {/* Roulette Wheel */}
                <div className="bg-zinc-950 p-6 rounded-lg mb-8">
                  <div className="relative w-64 h-64 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500 flex items-center justify-center">
                      <div className="text-6xl font-bold">{result !== null ? result : "?"}</div>
                    </div>
                    {spinning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RotateCw className="h-16 w-16 text-amber-500 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Result Display */}
                  {result !== null && (
                    <div className="text-center mb-6">
                      <div className="text-xl font-bold">
                        Result:{" "}
                        <span
                          className={`
                          ${
                            result === 0
                              ? "text-green-500"
                              : redNumbers.includes(result)
                                ? "text-red-500"
                                : "text-zinc-300"
                          }
                        `}
                        >
                          {result}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Win Display */}
                  {winAmount > 0 && (
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-amber-500">You Won!</div>
                      <div className="text-3xl font-bold text-amber-400">{winAmount} coins</div>
                    </div>
                  )}

                  {/* History */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">History</h3>
                    <div className="flex flex-wrap gap-2">
                      {history.map((num, index) => (
                        <div
                          key={index}
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold
                            ${
                              num === 0
                                ? "bg-green-500 text-white"
                                : redNumbers.includes(num)
                                  ? "bg-red-500 text-white"
                                  : "bg-zinc-800 text-white"
                            }
                          `}
                        >
                          {num}
                        </div>
                      ))}
                      {history.length === 0 && <div className="text-zinc-500">No spins yet</div>}
                    </div>
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

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-amber-500 text-amber-500 hover:bg-amber-500/10"
                      onClick={clearBets}
                      disabled={spinning || Object.keys(selectedBets).length === 0}
                    >
                      Clear Bets
                    </Button>

                    <Button
                      className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
                      onClick={spin}
                      disabled={spinning || totalBet === 0}
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

                {/* Current Bets */}
                <div className="bg-zinc-950 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Current Bets</h3>
                  {Object.keys(selectedBets).length === 0 ? (
                    <div className="text-zinc-500">No bets placed</div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(selectedBets).map(([betKey, amount]) => {
                        let betLabel = ""

                        if (betKey.startsWith("number_")) {
                          const number = betKey.split("_")[1]
                          betLabel = `Number ${number}`
                        } else {
                          const betTypeKey = betKey as keyof typeof betTypes
                          betLabel = betTypes[betTypeKey].label
                        }

                        return (
                          <div key={betKey} className="flex justify-between items-center bg-zinc-800 p-2 rounded">
                            <div>{betLabel}</div>
                            <div className="text-amber-500 font-bold">{amount} coins</div>
                          </div>
                        )
                      })}
                      <div className="flex justify-between items-center bg-zinc-700 p-2 rounded mt-4">
                        <div className="font-bold">Total Bet</div>
                        <div className="text-amber-500 font-bold">{totalBet} coins</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Betting Table */}
              <div className="flex-1">
                <div className="bg-zinc-950 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Betting Table</h3>

                  {/* Zero */}
                  <div className="grid grid-cols-13 gap-1 mb-4">
                    <Button
                      variant="outline"
                      className={`col-span-1 h-16 bg-green-600 hover:bg-green-700 border-green-500 ${
                        selectedBets["number_0"] ? "ring-2 ring-amber-500" : ""
                      }`}
                      onClick={() => placeBet("number", 0)}
                      disabled={spinning}
                    >
                      0
                    </Button>

                    {/* Outside bets - top */}
                    <div className="col-span-12 grid grid-cols-4 gap-1">
                      <Button
                        variant="outline"
                        className={`col-span-1 h-16 bg-zinc-700 hover:bg-zinc-600 ${
                          selectedBets["dozen1"] ? "ring-2 ring-amber-500" : ""
                        }`}
                        onClick={() => placeBet("dozen1")}
                        disabled={spinning}
                      >
                        1st 12
                      </Button>
                      <Button
                        variant="outline"
                        className={`col-span-1 h-16 bg-zinc-700 hover:bg-zinc-600 ${
                          selectedBets["dozen2"] ? "ring-2 ring-amber-500" : ""
                        }`}
                        onClick={() => placeBet("dozen2")}
                        disabled={spinning}
                      >
                        2nd 12
                      </Button>
                      <Button
                        variant="outline"
                        className={`col-span-1 h-16 bg-zinc-700 hover:bg-zinc-600 ${
                          selectedBets["dozen3"] ? "ring-2 ring-amber-500" : ""
                        }`}
                        onClick={() => placeBet("dozen3")}
                        disabled={spinning}
                      >
                        3rd 12
                      </Button>
                    </div>
                  </div>

                  {/* Numbers grid */}
                  <div className="grid grid-cols-12 gap-1 mb-4">
                    {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        className={`h-12 ${
                          redNumbers.includes(num)
                            ? "bg-red-600 hover:bg-red-700 border-red-500"
                            : "bg-zinc-800 hover:bg-zinc-700 border-zinc-600"
                        } ${selectedBets[`number_${num}`] ? "ring-2 ring-amber-500" : ""}`}
                        onClick={() => placeBet("number", num)}
                        disabled={spinning}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>

                  {/* Outside bets - bottom */}
                  <div className="grid grid-cols-6 gap-1">
                    <Button
                      variant="outline"
                      className={`col-span-2 h-12 bg-zinc-700 hover:bg-zinc-600 ${
                        selectedBets["low"] ? "ring-2 ring-amber-500" : ""
                      }`}
                      onClick={() => placeBet("low")}
                      disabled={spinning}
                    >
                      1-18
                    </Button>
                    <Button
                      variant="outline"
                      className={`col-span-1 h-12 bg-zinc-700 hover:bg-zinc-600 ${
                        selectedBets["even"] ? "ring-2 ring-amber-500" : ""
                      }`}
                      onClick={() => placeBet("even")}
                      disabled={spinning}
                    >
                      Even
                    </Button>
                    <Button
                      variant="outline"
                      className={`col-span-1 h-12 bg-red-600 hover:bg-red-700 border-red-500 ${
                        selectedBets["red"] ? "ring-2 ring-amber-500" : ""
                      }`}
                      onClick={() => placeBet("red")}
                      disabled={spinning}
                    >
                      Red
                    </Button>
                    <Button
                      variant="outline"
                      className={`col-span-1 h-12 bg-zinc-800 hover:bg-zinc-700 border-zinc-600 ${
                        selectedBets["black"] ? "ring-2 ring-amber-500" : ""
                      }`}
                      onClick={() => placeBet("black")}
                      disabled={spinning}
                    >
                      Black
                    </Button>
                    <Button
                      variant="outline"
                      className={`col-span-1 h-12 bg-zinc-700 hover:bg-zinc-600 ${
                        selectedBets["odd"] ? "ring-2 ring-amber-500" : ""
                      }`}
                      onClick={() => placeBet("odd")}
                      disabled={spinning}
                    >
                      Odd
                    </Button>
                    <Button
                      variant="outline"
                      className={`col-span-2 h-12 bg-zinc-700 hover:bg-zinc-600 ${
                        selectedBets["high"] ? "ring-2 ring-amber-500" : ""
                      }`}
                      onClick={() => placeBet("high")}
                      disabled={spinning}
                    >
                      19-36
                    </Button>
                  </div>
                </div>

                {/* Payouts */}
                <div className="bg-zinc-950 p-6 rounded-lg mt-6">
                  <h3 className="text-lg font-bold mb-4">Payouts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(betTypes).map(([key, { label, payout }]) => (
                      <div key={key} className="flex justify-between items-center bg-zinc-800 p-2 rounded">
                        <div>{label}</div>
                        <div className="text-amber-500 font-bold">{payout}:1</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
