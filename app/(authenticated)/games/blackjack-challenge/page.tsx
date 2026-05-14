import { createClient } from "@/lib/supabase/server"
import { BlackjackChallengeGame } from "@/components/games/blackjack-challenge-game"

export default async function BlackjackChallengePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user!.id)
    .single()

  return <BlackjackChallengeGame initialBalance={profile?.balance || 0} />
}
