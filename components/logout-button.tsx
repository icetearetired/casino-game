"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="border-casino-gold/30 text-casino-silver hover:bg-casino-gold/10 bg-transparent"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  )
}
