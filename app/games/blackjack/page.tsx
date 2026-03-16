import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BlackjackGame } from "@/components/blackjack-game"

export default async function BlackjackPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).single()

  return <BlackjackGame initialBalance={profile?.balance || 0} />
}
