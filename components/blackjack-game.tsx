"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GameHeader } from "@/components/game-header"
import { updateBalance } from "@/lib/game-actions"
import { Minus, Plus } from "lucide-react"

type BlackjackCard = {
  suit: string
  value: string
  numValue: number
}

const suits = ["♠", "♥", "♦", "♣"]
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

function createDeck(): BlackjackCard[] {
  const deck: BlackjackCard[] = []
  for (const suit of suits) {
    for (const value of values) {
      let numValue = Number.parseInt(value)
      if (value === "A") numValue = 11
      else if (["J", "Q", "K"].includes(value)) numValue = 10
      deck.push({ suit, value, numValue })
    }
  }
  return deck.sort(() => Math.random() - 0.5)
}

function calculateHandValue(hand: BlackjackCard[]): number {
  let value = hand.reduce((sum, card) => sum + card.numValue, 0)
  let aces = hand.filter((card) => card.value === "A").length

  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }

  return value
}

export function BlackjackGame({ initialBalance }: { initialBalance: number }) {
  const [balance, setBalance] = useState(initialBalance)
  const [bet, setBet] = useState(20)
  const [deck, setDeck] = useState<BlackjackCard[]>([])
  const [playerHand, setPlayerHand] = useState<BlackjackCard[]>([])
  const [dealerHand, setDealerHand] = useState<BlackjackCard[]>([])
  const [gameState, setGameState] = useState<"betting" | "playing" | "dealer" | "finished">("betting")
  const [message, setMessage] = useState("")

  const dealCards = () => {
    if (balance < bet) {
      setMessage("Insufficient balance!")
      return
    }

    const newDeck = createDeck()
    const player = [newDeck.pop()!, newDeck.pop()!]
    const dealer = [newDeck.pop()!, newDeck.pop()!]

    setDeck(newDeck)
    setPlayerHand(player)
    setDealerHand(dealer)
    setGameState("playing")
    setMessage("")

    // Check for blackjack
    if (calculateHandValue(player) === 21) {
      if (calculateHandValue(dealer) === 21) {
        endGame(dealerHand, player, "push")
      } else {
        endGame(dealerHand, player, "blackjack")
      }
    }
  }

  const hit = () => {
    const newDeck = [...deck]
    const newCard = newDeck.pop()!
    const newHand = [...playerHand, newCard]

    setDeck(newDeck)
    setPlayerHand(newHand)

    const handValue = calculateHandValue(newHand)
    if (handValue > 21) {
      endGame(dealerHand, newHand, "bust")
    } else if (handValue === 21) {
      stand(newHand)
    }
  }

  const stand = (currentHand?: BlackjackCard[]) => {
    const hand = currentHand || playerHand
    setGameState("dealer")

    // Dealer draws
    const newDealerHand = [...dealerHand]
    const newDeck = [...deck]

    while (calculateHandValue(newDealerHand) < 17) {
      const newCard = newDeck.pop()!
      newDealerHand.push(newCard)
    }

    setDeck(newDeck)
    setDealerHand(newDealerHand)

    // Determine winner
    const playerValue = calculateHandValue(hand)
    const dealerValue = calculateHandValue(newDealerHand)

    if (dealerValue > 21) {
      endGame(newDealerHand, hand, "dealer-bust")
    } else if (dealerValue > playerValue) {
      endGame(newDealerHand, hand, "dealer-win")
    } else if (dealerValue < playerValue) {
      endGame(newDealerHand, hand, "player-win")
    } else {
      endGame(newDealerHand, hand, "push")
    }
  }

  const endGame = async (finalDealerHand: BlackjackCard[], finalPlayerHand: BlackjackCard[], outcome: string) => {
    setGameState("finished")
    setDealerHand(finalDealerHand)
    setPlayerHand(finalPlayerHand)

    let payout = 0
    let result = ""

    switch (outcome) {
      case "blackjack":
        payout = bet * 2.5
        result = "Blackjack! You win!"
        setMessage("Blackjack! You win!")
        break
      case "player-win":
        payout = bet * 2
        result = "You win!"
        setMessage("You win!")
        break
      case "dealer-bust":
        payout = bet * 2
        result = "Dealer busts! You win!"
        setMessage("Dealer busts! You win!")
        break
      case "push":
        payout = bet
        result = "Push"
        setMessage("Push - Tie game!")
        break
      case "bust":
        payout = 0
        result = "Bust"
        setMessage("Bust! You lose.")
        break
      case "dealer-win":
        payout = 0
        result = "Dealer wins"
        setMessage("Dealer wins.")
        break
    }

    const newBalance = balance - bet + payout
    setBalance(newBalance)

    await updateBalance(newBalance, "blackjack", bet, payout, result)
  }

  const reset = () => {
    setPlayerHand([])
    setDealerHand([])
    setGameState("betting")
    setMessage("")
  }

  return (
    <div className="min-h-svh bg-casino-dark">
      <GameHeader balance={balance} gameName="Blackjack" />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Game Table */}
          <Card className="bg-card border-casino-gold/30">
            <CardContent className="p-8">
              {/* Dealer Hand */}
              <div className="mb-12">
                <h3 className="text-casino-silver mb-4">
                  Dealer{" "}
                  {gameState !== "betting" && (
                    <span className="text-casino-gold font-semibold">
                      ({gameState === "playing" ? "?" : calculateHandValue(dealerHand)})
                    </span>
                  )}
                </h3>
                <div className="flex gap-3 justify-center min-h-28">
                  {dealerHand.map((card, index) => (
                    <div
                      key={index}
                      className={`w-20 h-28 bg-white rounded-lg border-2 border-casino-gold/50 flex flex-col items-center justify-center text-3xl font-bold ${
                        card.suit === "♥" || card.suit === "♦" ? "text-red-600" : "text-casino-dark"
                      } ${gameState === "playing" && index === 1 ? "bg-casino-gold/20 text-transparent" : ""}`}
                    >
                      {gameState === "playing" && index === 1 ? "?" : card.value}
                      {gameState !== "playing" || index === 0 ? <span className="text-xl">{card.suit}</span> : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`text-center my-6 text-xl font-semibold ${message.includes("win") || message.includes("Blackjack") ? "text-green-400" : message.includes("lose") || message.includes("Bust") ? "text-red-400" : "text-casino-silver"}`}
                >
                  {message}
                </div>
              )}

              {/* Player Hand */}
              <div>
                <h3 className="text-casino-silver mb-4">
                  You{" "}
                  {gameState !== "betting" && (
                    <span className="text-casino-gold font-semibold">({calculateHandValue(playerHand)})</span>
                  )}
                </h3>
                <div className="flex gap-3 justify-center min-h-28">
                  {playerHand.map((card, index) => (
                    <div
                      key={index}
                      className={`w-20 h-28 bg-white rounded-lg border-2 border-casino-gold/50 flex flex-col items-center justify-center text-3xl font-bold ${
                        card.suit === "♥" || card.suit === "♦" ? "text-red-600" : "text-casino-dark"
                      }`}
                    >
                      {card.value}
                      <span className="text-xl">{card.suit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="mt-8">
                {gameState === "betting" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => setBet(Math.max(10, bet - 10))}
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
                        variant="outline"
                        size="icon"
                        className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      onClick={dealCards}
                      disabled={balance < bet}
                      className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90 text-xl py-6"
                    >
                      DEAL
                    </Button>
                  </div>
                )}

                {gameState === "playing" && (
                  <div className="flex gap-4">
                    <Button
                      onClick={hit}
                      className="flex-1 bg-casino-gold text-casino-dark hover:bg-casino-gold/90 text-xl py-6"
                    >
                      HIT
                    </Button>
                    <Button
                      onClick={() => stand()}
                      className="flex-1 bg-casino-gold text-casino-dark hover:bg-casino-gold/90 text-xl py-6"
                    >
                      STAND
                    </Button>
                  </div>
                )}

                {gameState === "finished" && (
                  <Button
                    onClick={reset}
                    className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90 text-xl py-6"
                  >
                    NEW GAME
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card className="bg-card border-casino-gold/20">
            <CardContent className="p-6">
              <h3 className="text-casino-gold font-semibold mb-4">Rules</h3>
              <ul className="space-y-2 text-sm text-casino-silver list-disc list-inside">
                <li>Get as close to 21 as possible without going over</li>
                <li>Face cards are worth 10, Aces are worth 1 or 11</li>
                <li>Dealer must hit on 16 and stand on 17</li>
                <li>Blackjack pays 2.5x your bet</li>
                <li>Regular win pays 2x your bet</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
