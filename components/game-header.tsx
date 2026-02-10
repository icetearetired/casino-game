"use client"

import { Coins, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface GameHeaderProps {
  balance: number
  gameName: string
}

export function GameHeader({ balance, gameName }: GameHeaderProps) {
  return (
    <header className="border-b border-casino-gold/20 bg-casino-dark/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-casino-silver hover:text-casino-gold hover:bg-casino-gold/10"
            >
              <Link href="/games">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-casino-gold">{gameName}</h1>
          </div>
          <div className="flex items-center gap-2 bg-casino-gold/10 px-4 py-2 rounded-lg border border-casino-gold/30">
            <Coins className="w-5 h-5 text-casino-gold" />
            <span className="text-casino-gold font-semibold">{balance.toLocaleString()}</span>
            <span className="text-casino-silver text-sm">chips</span>
          </div>
        </div>
      </div>
    </header>
  )
}
