"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { GameHeader } from "@/components/game-header"
import { toast } from "sonner"
import { Coins, Bot, User, Trophy, RotateCcw, Play, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { recordGameResult } from "@/lib/game-actions"
import { useRouter } from "next/navigation"

interface AIPokerGameProps {
  initialBalance: number
}

type CardType = { suit: string; value: string; numValue: number }
type GamePhase = "betting" | "preflop" | "flop" | "turn" | "river" | "showdown" | "ended"

const SUITS = ["hearts", "diamonds", "clubs", "spades"]
const VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

function createDeck(): CardType[] {
  const deck: CardType[] = []
  for (const suit of SUITS) {
    for (let i = 0; i < VALUES.length; i++) {
      deck.push({ suit, value: VALUES[i], numValue: i + 2 })
    }
  }
  return deck
}

function shuffleDeck(deck: CardType[]): CardType[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getCardDisplay(card: CardType): string {
  const suitSymbols: Record<string, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  }
  return `${card.value}${suitSymbols[card.suit]}`
}

function getSuitColor(suit: string): string {
  return suit === "hearts" || suit === "diamonds" ? "text-red-500" : "text-white"
}

// Simple hand evaluation (simplified for this demo)
function evaluateHand(cards: CardType[]): { rank: number; name: string } {
  const values = cards.map((c) => c.numValue).sort((a, b) => b - a)
  const suits = cards.map((c) => c.suit)
  
  const isFlush = suits.filter((s) => s === suits[0]).length >= 5
  const valueCounts = values.reduce((acc, v) => {
    acc[v] = (acc[v] || 0) + 1
    return acc
  }, {} as Record<number, number>)
  
  const counts = Object.values(valueCounts).sort((a, b) => b - a)
  
  if (isFlush) return { rank: 6, name: "Flush" }
  if (counts[0] === 4) return { rank: 8, name: "Four of a Kind" }
  if (counts[0] === 3 && counts[1] === 2) return { rank: 7, name: "Full House" }
  if (counts[0] === 3) return { rank: 4, name: "Three of a Kind" }
  if (counts[0] === 2 && counts[1] === 2) return { rank: 3, name: "Two Pair" }
  if (counts[0] === 2) return { rank: 2, name: "Pair" }
  
  return { rank: 1, name: "High Card" }
}

export function AIPokerGame({ initialBalance }: AIPokerGameProps) {
  const [balance, setBalance] = useState(initialBalance)
  const [bet, setBet] = useState(100)
  const [pot, setPot] = useState(0)
  const [phase, setPhase] = useState<GamePhase>("betting")
  const [deck, setDeck] = useState<CardType[]>([])
  const [playerHand, setPlayerHand] = useState<CardType[]>([])
  const [aiHand, setAiHand] = useState<CardType[]>([])
  const [communityCards, setCommunityCards] = useState<CardType[]>([])
  const [message, setMessage] = useState("")
  const [aiThinking, setAiThinking] = useState(false)
  const [showAiCards, setShowAiCards] = useState(false)
  const router = useRouter()

  const startGame = useCallback(() => {
    if (balance < bet) {
      toast.error("Insufficient balance")
      return
    }

    const newDeck = shuffleDeck(createDeck())
    
    // Deal cards
    const pHand = [newDeck[0], newDeck[2]]
    const aHand = [newDeck[1], newDeck[3]]
    const remaining = newDeck.slice(4)

    setDeck(remaining)
    setPlayerHand(pHand)
    setAiHand(aHand)
    setCommunityCards([])
    setBalance((b) => b - bet)
    setPot(bet * 2) // Both players ante
    setPhase("preflop")
    setMessage("Cards dealt! Choose your action.")
    setShowAiCards(false)
  }, [balance, bet])

  const dealCommunityCards = useCallback((count: number) => {
    setCommunityCards((prev) => {
      const newCards = deck.slice(0, count)
      setDeck((d) => d.slice(count))
      return [...prev, ...newCards]
    })
  }, [deck])

  const aiDecision = useCallback((): "fold" | "call" | "raise" => {
    const random = Math.random()
    if (random < 0.1) return "fold"
    if (random < 0.7) return "call"
    return "raise"
  }, [])

  const handleCheck = useCallback(async () => {
    setAiThinking(true)
    await new Promise((r) => setTimeout(r, 1000))

    const aiAction = aiDecision()
    
    if (aiAction === "fold") {
      setMessage("AI folds! You win the pot!")
      setBalance((b) => b + pot)
      setPhase("ended")
      await recordGameResult("poker-ai", bet, pot, { outcome: "win", method: "ai_fold" })
    } else {
      // Progress to next phase
      if (phase === "preflop") {
        dealCommunityCards(3)
        setPhase("flop")
        setMessage("Flop dealt!")
      } else if (phase === "flop") {
        dealCommunityCards(1)
        setPhase("turn")
        setMessage("Turn dealt!")
      } else if (phase === "turn") {
        dealCommunityCards(1)
        setPhase("river")
        setMessage("River dealt!")
      } else if (phase === "river") {
        setPhase("showdown")
        setShowAiCards(true)
        
        // Evaluate hands
        const playerScore = evaluateHand([...playerHand, ...communityCards, ...deck.slice(0, 1)])
        const aiScore = evaluateHand([...aiHand, ...communityCards, ...deck.slice(0, 1)])
        
        if (playerScore.rank > aiScore.rank) {
          setMessage(`You win with ${playerScore.name}!`)
          setBalance((b) => b + pot)
          await recordGameResult("poker-ai", bet, pot, { outcome: "win", hand: playerScore.name })
        } else if (aiScore.rank > playerScore.rank) {
          setMessage(`AI wins with ${aiScore.name}!`)
          await recordGameResult("poker-ai", bet, 0, { outcome: "loss", hand: aiScore.name })
        } else {
          setMessage("It's a tie! Pot split.")
          setBalance((b) => b + pot / 2)
          await recordGameResult("poker-ai", bet, pot / 2, { outcome: "tie" })
        }
        setPhase("ended")
      }
    }
    
    setAiThinking(false)
    router.refresh()
  }, [phase, pot, bet, aiDecision, dealCommunityCards, playerHand, aiHand, communityCards, deck, router])

  const handleFold = useCallback(async () => {
    setMessage("You folded. AI wins the pot.")
    setPhase("ended")
    await recordGameResult("poker-ai", bet, 0, { outcome: "loss", method: "fold" })
    router.refresh()
  }, [bet, router])

  const handleRaise = useCallback(async () => {
    const raiseAmount = Math.min(bet, balance)
    if (raiseAmount <= 0) {
      toast.error("Cannot raise")
      return
    }

    setBalance((b) => b - raiseAmount)
    setPot((p) => p + raiseAmount * 2) // AI matches

    setAiThinking(true)
    await new Promise((r) => setTimeout(r, 1000))

    const aiAction = aiDecision()
    
    if (aiAction === "fold") {
      setMessage("AI folds to your raise! You win!")
      setBalance((b) => b + pot + raiseAmount * 2)
      setPhase("ended")
      await recordGameResult("poker-ai", bet + raiseAmount, pot + raiseAmount * 2, { outcome: "win", method: "ai_fold" })
    } else {
      setMessage("AI calls your raise!")
      // Continue to next street
      if (phase === "preflop") {
        dealCommunityCards(3)
        setPhase("flop")
      } else if (phase === "flop") {
        dealCommunityCards(1)
        setPhase("turn")
      } else if (phase === "turn") {
        dealCommunityCards(1)
        setPhase("river")
      }
    }

    setAiThinking(false)
    router.refresh()
  }, [balance, bet, pot, phase, aiDecision, dealCommunityCards, router])

  return (
    <div className="min-h-svh bg-casino-dark">
      <GameHeader balance={balance} gameName="AI Poker" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          asChild
          variant="ghost"
          className="mb-4 text-casino-silver hover:text-casino-gold"
        >
          <Link href="/games">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Link>
        </Button>

        {phase === "betting" ? (
          /* Betting Phase */
          <Card className="bg-card border-casino-gold/20">
            <CardHeader>
              <CardTitle className="text-casino-gold flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Challenge the AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-casino-silver">
                Play Texas Hold&apos;em against an AI opponent. Best hand wins the pot!
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-casino-silver">Bet Amount</span>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-casino-gold" />
                    <span className="text-casino-gold font-bold">{bet}</span>
                  </div>
                </div>
                <Slider
                  value={[bet]}
                  onValueChange={([v]) => setBet(v)}
                  min={50}
                  max={Math.min(balance, 5000)}
                  step={50}
                  className="w-full"
                />
              </div>

              <Button
                onClick={startGame}
                disabled={balance < bet}
                className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Game ({bet} chips)
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Game Board */
          <div className="space-y-6">
            {/* Pot Display */}
            <div className="text-center">
              <span className="text-casino-silver">Pot: </span>
              <span className="text-casino-gold font-bold text-2xl">{pot}</span>
            </div>

            {/* AI Hand */}
            <Card className="bg-card border-casino-gold/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="h-5 w-5 text-casino-silver" />
                  <span className="text-casino-silver font-medium">AI Opponent</span>
                  {aiThinking && (
                    <span className="text-casino-gold text-sm animate-pulse">Thinking...</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {aiHand.map((card, i) => (
                    <div
                      key={i}
                      className={`w-16 h-24 rounded-lg border-2 flex items-center justify-center text-xl font-bold ${
                        showAiCards
                          ? `bg-white border-gray-300 ${getSuitColor(card.suit)}`
                          : "bg-casino-gold/20 border-casino-gold/30"
                      }`}
                    >
                      {showAiCards ? getCardDisplay(card) : "?"}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Cards */}
            <Card className="bg-green-900/30 border-green-700/30">
              <CardContent className="pt-6">
                <p className="text-green-400 text-sm mb-3">Community Cards</p>
                <div className="flex gap-2 min-h-24">
                  {communityCards.map((card, i) => (
                    <div
                      key={i}
                      className={`w-16 h-24 rounded-lg border-2 bg-white border-gray-300 flex items-center justify-center text-xl font-bold ${getSuitColor(card.suit)}`}
                    >
                      {getCardDisplay(card)}
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array(5 - communityCards.length)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="w-16 h-24 rounded-lg border-2 border-dashed border-green-700/30"
                      />
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Player Hand */}
            <Card className="bg-card border-casino-gold/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-5 w-5 text-casino-gold" />
                  <span className="text-casino-gold font-medium">Your Hand</span>
                </div>
                <div className="flex gap-2">
                  {playerHand.map((card, i) => (
                    <div
                      key={i}
                      className={`w-16 h-24 rounded-lg border-2 bg-white border-gray-300 flex items-center justify-center text-xl font-bold ${getSuitColor(card.suit)}`}
                    >
                      {getCardDisplay(card)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Message */}
            {message && (
              <div className="text-center p-4 bg-casino-gold/10 rounded-lg border border-casino-gold/30">
                <p className="text-casino-gold font-medium">{message}</p>
              </div>
            )}

            {/* Actions */}
            {phase !== "ended" && phase !== "showdown" && !aiThinking && (
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleFold}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Fold
                </Button>
                <Button
                  onClick={handleCheck}
                  variant="outline"
                  className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10"
                >
                  Check/Call
                </Button>
                <Button
                  onClick={handleRaise}
                  disabled={balance < bet}
                  className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
                >
                  Raise
                </Button>
              </div>
            )}

            {/* Play Again */}
            {phase === "ended" && (
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setPhase("betting")}
                  className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
