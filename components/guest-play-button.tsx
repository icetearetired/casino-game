"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { UserRound } from "lucide-react"
import { generateGuestUsername } from "@/lib/utils"

export function GuestPlayButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGuestPlay = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            username: generateGuestUsername(),
          },
        },
      })
      if (error) throw error
      router.push("/games")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to start guest session")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="ghost"
        className="text-casino-silver hover:text-casino-gold hover:bg-casino-gold/5"
        onClick={handleGuestPlay}
        disabled={isLoading}
      >
        <UserRound className="mr-2 h-4 w-4" />
        {isLoading ? "Starting guest session..." : "Play as Guest (no account needed)"}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
