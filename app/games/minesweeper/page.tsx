"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { DollarSign, Bomb, Gem } from "lucide-react"

type CellState = "hidden" | "revealed" | "flagged"
type CellType = "safe" | "mine"

interface Cell {
  state: CellState
  type: CellType
  id: number
}

const GRID_SIZE = 25 // 5x5 grid
const MINE_COUNTS = [1, 3, 5, 8, 12] // Different difficulty levels

export default function MinesweeperPage() {
  const [betAmount, setBetAmount] = useState(10)
  const [mineCount, setMineCount] = useState(3)
  const [gameState, setGameState] = useState<"waiting" | "playing" | "won" | "lost">("waiting")
  const [grid, setGrid] = useState<Cell[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0)
  const [winAmount, setWinAmount] = useState(0)
  const [history, setHistory] = useState<{ mines: number; revealed: number; multiplier: number; win: number }[]>([])

  const { user, balance, updateBalance, addGameHistory, addTransaction, addXP } = useUser()
  const { toast } = useToast()

  // Calculate multiplier based on revealed cells and mine count
  const calculateMultiplier = (revealed: number, mines: number) => {
    if (revealed === 0) return 1.0
    const safeSpots = GRID_SIZE - mines
    let probability = 1
    for (let i = 0; i < revealed; i++) {
      probability *= (safeSpots - i) / (GRID_SIZE - i)
    }
    return Math.max(1.1, (1 / probability) * 0.9) // House edge of 10%
  }

  // Initialize new game
  const startNewGame = () => {
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
    addTransaction("bet", -betAmount, "minesweeper", `Minesweeper bet - ${betAmount} coins, ${mineCount} mines`)

    // Generate mine positions
    const minePositions = new Set<number>()
    while (minePositions.size < mineCount) {
      minePositions.add(Math.floor(Math.random() * GRID_SIZE))
    }

    // Create grid
    const newGrid: Cell[] = Array.from({ length: GRID_SIZE }, (_, index) => ({
      state: "hidden",
      type: minePositions.has(index) ? "mine" : "safe",
      id: index,
    }))

    setGrid(newGrid)
    setGameState("playing")
    setRevealedCount(0)
    setCurrentMultiplier(1.0)
    setWinAmount(0)

    toast({
      title: "Game Started",
      description: `Find the safe spots! ${mineCount} mines hidden in the grid.`,
      variant: "default",
    })
  }

  // Reveal a cell
  const revealCell = (index: number) => {
    if (gameState !== "playing") return

    const cell = grid[index]
    if (cell.state !== "hidden") return

    const newGrid = [...grid]
    newGrid[index].state = "revealed"
    setGrid(newGrid)

    if (cell.type === "mine") {
      // Hit a mine - game over
      setGameState("lost")

      // Reveal all mines
      const finalGrid = newGrid.map((c) => (c.type === "mine" ? { ...c, state: "revealed" as CellState } : c))
      setGrid(finalGrid)

      addGameHistory("minesweeper", betAmount, 0, currentMultiplier, {
        mines: mineCount,
        revealed: revealedCount,
        hitMine: true,
      })

      toast({
        title: "Boom! 💥",
        description: `You hit a mine! Lost ${betAmount} coins.`,
        variant: "destructive",
      })

      setHistory((prev) =>
        [
          {
            mines: mineCount,
            revealed: revealedCount,
            multiplier: currentMultiplier,
            win: 0,
          },
          ...prev,
        ].slice(0, 10),
      )
    } else {
      // Safe cell
      const newRevealedCount = revealedCount + 1
      setRevealedCount(newRevealedCount)

      const newMultiplier = calculateMultiplier(newRevealedCount, mineCount)
      setCurrentMultiplier(newMultiplier)

      // Check if won (all safe cells revealed)
      const safeSpots = GRID_SIZE - mineCount
      if (newRevealedCount === safeSpots) {
        setGameState("won")
        const winnings = Math.floor(betAmount * newMultiplier)
        setWinAmount(winnings)

        updateBalance(winnings)
        addGameHistory("minesweeper", betAmount, winnings, newMultiplier, {
          mines: mineCount,
          revealed: newRevealedCount,
          completed: true,
        })
        addTransaction("win", winnings, "minesweeper", `Minesweeper win - ${newMultiplier.toFixed(2)}x multiplier`)
        addXP(Math.floor(winnings / 10))

        setHistory((prev) =>
          [
            {
              mines: mineCount,
              revealed: newRevealedCount,
              multiplier: newMultiplier,
              win: winnings,
            },
            ...prev,
          ].slice(0, 10),
        )

        toast({
          title: "Perfect Clear! 🎉",
          description: `You found all safe spots and won ${winnings} coins!`,
          variant: "default",
          className: "bg-amber-500 text-black border-amber-600",
        })
      }
    }
  }

  // Cash out early
  const cashOut = () => {
    if (gameState !== "playing" || revealedCount === 0) return

    setGameState("won")
    const winnings = Math.floor(betAmount * currentMultiplier)
    setWinAmount(winnings)

    updateBalance(winnings)
    addGameHistory("minesweeper", betAmount, winnings, currentMultiplier, {
      mines: mineCount,
      revealed: revealedCount,
      cashedOut: true,
    })
    addTransaction("win", winnings, "minesweeper", `Minesweeper cash out - ${currentMultiplier.toFixed(2)}x multiplier`)
    addXP(Math.floor(winnings / 10))

    setHistory((prev) =>
      [
        {
          mines: mineCount,
          revealed: revealedCount,
          multiplier: currentMultiplier,
          win: winnings,
        },
        ...prev,
      ].slice(0, 10),
    )

    toast({
      title: "Cashed Out! 💰",
      description: `You cashed out safely and won ${winnings} coins!`,
      variant: "default",
      className: "bg-amber-500 text-black border-amber-600",
    })
  }

  const increaseBet = () => {
    if (betAmount < 1000 && gameState === "waiting") {
      setBetAmount((prev) => prev + 10)
    }
  }

  const decreaseBet = () => {
    if (betAmount > 10 && gameState === "waiting") {
      setBetAmount((prev) => prev - 10)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Minesweeper</h1>

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

                {/* Game Stats */}
                {gameState === "playing" && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-zinc-950 p-4 rounded-lg text-center">
                      <div className="text-sm text-zinc-400">Revealed</div>
                      <div className="text-2xl font-bold text-green-400">{revealedCount}</div>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-lg text-center">
                      <div className="text-sm text-zinc-400">Multiplier</div>
                      <div className="text-2xl font-bold text-amber-400">{currentMultiplier.toFixed(2)}x</div>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-lg text-center">
                      <div className="text-sm text-zinc-400">Potential Win</div>
                      <div className="text-2xl font-bold text-zinc-300">
                        {Math.floor(betAmount * currentMultiplier)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Game Grid */}
                <div className="bg-zinc-950 p-6 rounded-lg mb-8">
                  {gameState === "waiting" ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">💎</div>
                      <div className="text-2xl font-bold mb-4">Ready to Play?</div>
                      <div className="text-zinc-400 mb-8">
                        Find the gems and avoid the mines!
                        <br />
                        {mineCount} mines hidden in {GRID_SIZE} spots
                      </div>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
                        onClick={startNewGame}
                      >
                        Start Game ({betAmount} coins)
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-5 gap-2 mb-6">
                        {grid.map((cell, index) => (
                          <button
                            key={cell.id}
                            className={`aspect-square flex items-center justify-center text-2xl font-bold rounded-lg transition-all ${
                              cell.state === "hidden"
                                ? "bg-zinc-700 hover:bg-zinc-600 cursor-pointer"
                                : cell.type === "mine"
                                  ? "bg-red-500"
                                  : "bg-green-500"
                            }`}
                            onClick={() => revealCell(index)}
                            disabled={gameState !== "playing" || cell.state !== "hidden"}
                          >
                            {cell.state === "revealed" &&
                              (cell.type === "mine" ? <Bomb className="h-6 w-6" /> : <Gem className="h-6 w-6" />)}
                          </button>
                        ))}
                      </div>

                      {/* Game Controls */}
                      {gameState === "playing" && revealedCount > 0 && (
                        <div className="text-center">
                          <Button
                            size="lg"
                            className="bg-green-500 hover:bg-green-600 text-white font-bold"
                            onClick={cashOut}
                          >
                            Cash Out {Math.floor(betAmount * currentMultiplier)} coins
                          </Button>
                        </div>
                      )}

                      {/* Game Over */}
                      {(gameState === "won" || gameState === "lost") && (
                        <div className="text-center">
                          <div
                            className={`text-3xl font-bold mb-4 ${
                              gameState === "won" ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {gameState === "won" ? `Won ${winAmount} coins!` : "Game Over"}
                          </div>
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
                            onClick={() => setGameState("waiting")}
                          >
                            Play Again
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* History */}
                <div className="bg-zinc-950 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Recent Games</h3>
                  <div className="space-y-2">
                    {history.map((game, index) => (
                      <div key={index} className="flex justify-between items-center bg-zinc-800 p-3 rounded">
                        <div className="flex items-center gap-3">
                          <div className="text-sm">
                            <div>
                              {game.mines} mines • {game.revealed} revealed
                            </div>
                            <div className="text-zinc-400">{game.multiplier.toFixed(2)}x multiplier</div>
                          </div>
                        </div>
                        <div className={`font-bold ${game.win > 0 ? "text-green-400" : "text-red-400"}`}>
                          {game.win > 0 ? `+${game.win}` : "0"} coins
                        </div>
                      </div>
                    ))}
                    {history.length === 0 && <div className="text-zinc-500 text-center">No games yet</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Game Settings */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Game Settings</h3>

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
                        disabled={betAmount <= 10 || gameState !== "waiting"}
                        className="border-zinc-600 text-zinc-300 bg-transparent"
                      >
                        -10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={increaseBet}
                        disabled={betAmount >= 1000 || gameState !== "waiting"}
                        className="border-zinc-600 text-zinc-300"
                      >
                        +10
                      </Button>
                    </div>
                  </div>

                  {/* Mine Count */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Mines</span>
                      <span className="text-red-400 font-bold">{mineCount}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {MINE_COUNTS.map((count) => (
                        <Button
                          key={count}
                          variant={mineCount === count ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMineCount(count)}
                          disabled={gameState !== "waiting"}
                          className={mineCount === count ? "bg-amber-500 text-black" : "border-zinc-600 text-zinc-300"}
                        >
                          {count}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Guide */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-amber-500">Difficulty</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>1 Mine</span>
                    <span className="text-green-400">Easy</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3 Mines</span>
                    <span className="text-amber-400">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5 Mines</span>
                    <span className="text-orange-400">Hard</span>
                  </div>
                  <div className="flex justify-between">
                    <span>8 Mines</span>
                    <span className="text-red-400">Expert</span>
                  </div>
                  <div className="flex justify-between">
                    <span>12 Mines</span>
                    <span className="text-purple-400">Insane</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Rules */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-amber-500">How to Play</h3>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300 text-sm">
                  <li>Choose your bet amount and mine count</li>
                  <li>Click "Start Game" to begin</li>
                  <li>Click on cells to reveal them</li>
                  <li>💎 = Safe spot (increases multiplier)</li>
                  <li>💣 = Mine (game over)</li>
                  <li>Cash out anytime to secure winnings</li>
                  <li>More mines = higher risk but bigger rewards!</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
