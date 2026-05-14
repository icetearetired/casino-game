import { createClient } from "@/lib/supabase/server"
import { AIPokerGame } from "@/components/games/ai-poker-game"

export default async function AIPokerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user!.id)
    .single()

  return <AIPokerGame initialBalance={profile?.balance || 0} />
}
