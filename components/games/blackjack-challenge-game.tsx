"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { GameHeader } from "@/components/game-header"
import { toast } from "sonner"
import { Coins, Bot, User, Trophy, RotateCcw, Play, ArrowLeft, Swords } from "lucide-react"
import Link from "next/link"
import { recordGameResult } from "@/lib/game-actions"
import { useRouter } from "next/navigation"

interface BlackjackChallengeGameProps {
  initialBalance: number
}

type CardType = { suit: string; value: string; numValue: number }
type GamePhase = "betting" | "playing" | "ai_turn" | "round_end" | "match_end"

const SUITS = ["hearts", "diamonds", "clubs", "spades"]
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

function createDeck(): CardType[] {
  const deck: CardType[] = []
  for (const suit of SUITS) {
    for (let i = 0; i < VALUES.length; i++) {
      const value = VALUES[i]
      let numValue = i + 1
      if (value === "A") numValue = 11
      else if (["J", "Q", "K"].includes(value)) numValue = 10
      else numValue = parseInt(value)
      deck.push({ suit, value, numValue })
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

function calculateHand(cards: CardType[]): number {
  let total = 0
  let aces = 0

  for (const card of cards) {
    if (card.value === "A") {
      aces++
      total += 11
    } else {
      total += card.numValue
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }

  return total
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

export function BlackjackChallengeGame({ initialBalance }: BlackjackChallengeGameProps) {
  const [balance, setBalance] = useState(initialBalance)
  const [bet, setBet] = useState(100)
  const [phase, setPhase] = useState<GamePhase>("betting")
  const [deck, setDeck] = useState<CardType[]>([])
  const [playerHand, setPlayerHand] = useState<CardType[]>([])
  const [aiHand, setAiHand] = useState<CardType[]>([])
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [message, setMessage] = useState("")
  const [showAiCards, setShowAiCards] = useState(false)
  const router = useRouter()

  const TOTAL_ROUNDS = 5
  const totalBet = bet * TOTAL_ROUNDS

  const dealNewRound = useCallback(() => {
    const newDeck = shuffleDeck(createDeck())
    const pHand = [newDeck[0], newDeck[2]]
    const aHand = [newDeck[1], newDeck[3]]
    const remaining = newDeck.slice(4)

    setDeck(remaining)
    setPlayerHand(pHand)
    setAiHand(aHand)
    setShowAiCards(false)
    setPhase("playing")
    setMessage(`Round ${currentRound} - Your turn!`)
  }, [currentRound])

  const startMatch = useCallback(() => {
    if (balance < totalBet) {
      toast.error("Insufficient balance for best of 5")
      return
    }

    setBalance((b) => b - totalBet)
    setPlayerScore(0)
    setAiScore(0)
    setCurrentRound(1)
    
    // Deal first round
    const newDeck = shuffleDeck(createDeck())
    const pHand = [newDeck[0], newDeck[2]]
    const aHand = [newDeck[1], newDeck[3]]
    const remaining = newDeck.slice(4)

    setDeck(remaining)
    setPlayerHand(pHand)
    setAiHand(aHand)
    setShowAiCards(false)
    setPhase("playing")
    setMessage("Round 1 - Your turn!")
  }, [balance, totalBet])

  const handleHit = useCallback(() => {
    const newCard = deck[0]
    const newHand = [...playerHand, newCard]
    setPlayerHand(newHand)
    setDeck((d) => d.slice(1))

    const handValue = calculateHand(newHand)
    if (handValue > 21) {
      setMessage("Bust! AI wins this round.")
      setShowAiCards(true)
      setAiScore((s) => s + 1)
      setPhase("round_end")
    }
  }, [deck, playerHand])

  const handleStand = useCallback(async () => {
    setPhase("ai_turn")
    setShowAiCards(true)
    
    // AI plays
    let currentAiHand = [...aiHand]
    let currentDeck = [...deck]

    // AI hits on 16 or less
    while (calculateHand(currentAiHand) < 17 && currentDeck.length > 0) {
      await new Promise((r) => setTimeout(r, 500))
      currentAiHand = [...currentAiHand, currentDeck[0]]
      currentDeck = currentDeck.slice(1)
      setAiHand(currentAiHand)
      setDeck(currentDeck)
    }

    const playerTotal = calculateHand(playerHand)
    const aiTotal = calculateHand(currentAiHand)

    await new Promise((r) => setTimeout(r, 500))

    if (aiTotal > 21) {
      setMessage(`AI busts with ${aiTotal}! You win this round.`)
      setPlayerScore((s) => s + 1)
    } else if (playerTotal > aiTotal) {
      setMessage(`You win ${playerTotal} to ${aiTotal}!`)
      setPlayerScore((s) => s + 1)
    } else if (aiTotal > playerTotal) {
      setMessage(`AI wins ${aiTotal} to ${playerTotal}.`)
      setAiScore((s) => s + 1)
    } else {
      setMessage(`Tie at ${playerTotal}! No points awarded.`)
    }

    setPhase("round_end")
  }, [aiHand, deck, playerHand])

  const nextRound = useCallback(async () => {
    const newRound = currentRound + 1
    
    // Check if match is decided
    if (playerScore >= 3 || aiScore >= 3 || newRound > TOTAL_ROUNDS) {
      setPhase("match_end")
      
      if (playerScore > aiScore) {
        const winnings = totalBet * 2
        setBalance((b) => b + winnings)
        setMessage(`You win the match ${playerScore}-${aiScore}! Won ${winnings} chips!`)
        await recordGameResult("blackjack-challenge", totalBet, winnings, {
          outcome: "win",
          score: `${playerScore}-${aiScore}`,
        })
      } else if (aiScore > playerScore) {
        setMessage(`AI wins the match ${aiScore}-${playerScore}.`)
        await recordGameResult("blackjack-challenge", totalBet, 0, {
          outcome: "loss",
          score: `${playerScore}-${aiScore}`,
        })
      } else {
        setBalance((b) => b + totalBet)
        setMessage(`Match tied ${playerScore}-${aiScore}. Bet returned.`)
        await recordGameResult("blackjack-challenge", totalBet, totalBet, {
          outcome: "tie",
          score: `${playerScore}-${aiScore}`,
        })
      }
      router.refresh()
      return
    }

    setCurrentRound(newRound)
    dealNewRound()
  }, [currentRound, playerScore, aiScore, totalBet, dealNewRound, router])

  const playerTotal = calculateHand(playerHand)
  const aiTotal = calculateHand(aiHand)

  return (
    <div className="min-h-svh bg-casino-dark">
      <GameHeader balance={balance} gameName="Blackjack Challenge" />

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
                <Swords className="h-5 w-5" />
                Best of 5 Blackjack Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-casino-silver">
                Face off against an AI opponent in a best-of-5 blackjack match. First to 3 wins takes all!
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-casino-silver">Bet Per Round</span>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-casino-gold" />
                    <span className="text-casino-gold font-bold">{bet}</span>
                  </div>
                </div>
                <Slider
                  value={[bet]}
                  onValueChange={([v]) => setBet(v)}
                  min={50}
                  max={Math.min(Math.floor(balance / 5), 2000)}
                  step={50}
                  className="w-full"
                />
                <p className="text-casino-silver text-sm text-center">
                  Total match cost: <span className="text-casino-gold font-bold">{totalBet}</span> chips
                </p>
              </div>

              <Button
                onClick={startMatch}
                disabled={balance < totalBet}
                className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Match
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Game Board */
          <div className="space-y-6">
            {/* Score Display */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <User className="h-5 w-5 mx-auto mb-1 text-casino-gold" />
                <p className="text-3xl font-bold text-casino-gold">{playerScore}</p>
                <p className="text-casino-silver text-sm">You</p>
              </div>
              <div className="text-center">
                <p className="text-casino-silver text-sm">Round {currentRound}/5</p>
                <Trophy className="h-8 w-8 mx-auto text-casino-gold" />
                <p className="text-casino-silver text-xs">First to 3</p>
              </div>
              <div className="text-center">
                <Bot className="h-5 w-5 mx-auto mb-1 text-casino-silver" />
                <p className="text-3xl font-bold text-white">{aiScore}</p>
                <p className="text-casino-silver text-sm">AI</p>
              </div>
            </div>

            {/* AI Hand */}
            <Card className="bg-card border-casino-gold/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-casino-silver" />
                    <span className="text-casino-silver font-medium">AI Hand</span>
                  </div>
                  {showAiCards && (
                    <span className="text-white font-bold">{aiTotal}</span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {aiHand.map((card, i) => (
                    <div
                      key={i}
                      className={`w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 flex items-center justify-center text-lg sm:text-xl font-bold ${
                        showAiCards || i === 0
                          ? `bg-white border-gray-300 ${getSuitColor(card.suit)}`
                          : "bg-casino-gold/20 border-casino-gold/30"
                      }`}
                    >
                      {showAiCards || i === 0 ? getCardDisplay(card) : "?"}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Player Hand */}
            <Card className="bg-card border-casino-gold/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-casino-gold" />
                    <span className="text-casino-gold font-medium">Your Hand</span>
                  </div>
                  <span className="text-casino-gold font-bold">{playerTotal}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {playerHand.map((card, i) => (
                    <div
                      key={i}
                      className={`w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 bg-white border-gray-300 flex items-center justify-center text-lg sm:text-xl font-bold ${getSuitColor(card.suit)}`}
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
            {phase === "playing" && (
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleHit}
                  disabled={playerTotal >= 21}
                  className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
                >
                  Hit
                </Button>
                <Button
                  onClick={handleStand}
                  variant="outline"
                  className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10"
                >
                  Stand
                </Button>
              </div>
            )}

            {phase === "round_end" && (
              <div className="flex justify-center">
                <Button
                  onClick={nextRound}
                  className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
                >
                  {playerScore >= 3 || aiScore >= 3 || currentRound >= TOTAL_ROUNDS
                    ? "See Results"
                    : "Next Round"}
                </Button>
              </div>
            )}

            {phase === "match_end" && (
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
