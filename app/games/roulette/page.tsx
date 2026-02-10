import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RouletteGame } from "@/components/roulette-game"

export default async function RoulettePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).single()

  return <RouletteGame initialBalance={profile?.balance || 0} />
}
