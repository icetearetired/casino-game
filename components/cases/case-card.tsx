"use client"

import { useState } from "react"
import { openCase, type CaseType, type Prize } from "@/lib/actions/cases"
import { Package, Coins, Loader2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface CaseCardProps {
  caseData: {
    id: string
    name: string
    price: number
    color: string
    prizes: Prize[]
  }
  balance: number
}

const rarityColors: Record<string, string> = {
  common: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  uncommon: "bg-green-500/20 text-green-400 border-green-500/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
}

export function CaseCard({ caseData, balance }: CaseCardProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [wonPrize, setWonPrize] = useState<Prize | null>(null)
  const router = useRouter()

  const canAfford = balance >= caseData.price

  const handleOpen = async () => {
    if (!canAfford) return

    setIsOpening(true)
    try {
      const result = await openCase(caseData.id as CaseType)

      if (result.success && result.prize) {
        // Simulate suspense with a delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setWonPrize(result.prize)
        setShowResult(true)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to open case")
      }
    } catch (error) {
      toast.error("Failed to open case")
      console.error(error)
    } finally {
      setIsOpening(false)
    }
  }

  const handleCloseResult = () => {
    setShowResult(false)
    setWonPrize(null)
  }

  return (
    <>
      <Card className={`relative overflow-hidden bg-gradient-to-br ${caseData.color} border-white/10`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            {caseData.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Case Visual */}
          <div className="relative mb-4">
            <div className="aspect-square bg-black/20 rounded-lg flex items-center justify-center">
              <Package className={`w-20 h-20 text-white/80 ${isOpening ? "animate-bounce" : ""}`} />
            </div>
            {isOpening && (
              <div className="absolute inset-0 bg-white/10 rounded-lg animate-pulse flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-black/20 rounded-lg">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-bold text-lg">{caseData.price.toLocaleString()}</span>
          </div>

          {/* Possible Prizes */}
          <div className="space-y-1 mb-4">
            <p className="text-white/70 text-xs font-medium mb-2">Possible Prizes:</p>
            <div className="grid grid-cols-2 gap-1">
              {caseData.prizes.map((prize, index) => (
                <div
                  key={index}
                  className={`text-xs px-2 py-1 rounded border ${rarityColors[prize.rarity]}`}
                >
                  {prize.name} <span className="opacity-60">({(prize.odds * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Open Button */}
          <Button
            onClick={handleOpen}
            disabled={isOpening || !canAfford}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/20"
          >
            {isOpening ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening...
              </>
            ) : canAfford ? (
              "Open Case"
            ) : (
              "Not Enough Chips"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={handleCloseResult}>
        <DialogContent className="bg-casino-dark border-casino-gold/30 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl text-casino-gold">Congratulations!</DialogTitle>
            <DialogDescription className="text-casino-silver">
              You opened a {caseData.name}
            </DialogDescription>
          </DialogHeader>

          {wonPrize && (
            <div className="py-8">
              <div
                className={`inline-flex items-center gap-3 px-6 py-4 rounded-lg border-2 ${rarityColors[wonPrize.rarity]}`}
              >
                <Sparkles className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-70 capitalize">{wonPrize.rarity}</p>
                  <p className="text-2xl font-bold">{wonPrize.name}</p>
                </div>
              </div>

              <p className="mt-6 text-casino-silver">
                Won <span className="text-casino-gold font-bold">{wonPrize.value.toLocaleString()}</span> chips!
              </p>
            </div>
          )}

          <Button
            onClick={handleCloseResult}
            className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
          >
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
