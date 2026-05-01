import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GamesTopbar } from "@/components/games-topbar"
import { claimDailyReward } from "@/lib/feature-actions"

export default async function DailyRewardsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const today = new Date().toISOString().slice(0, 10)
  const { data: claimed } = await supabase
    .from("game_history")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_type", "daily_reward")
    .gte("created_at", `${today}T00:00:00.000Z`)
    .limit(1)

  return (
    <div className="min-h-svh bg-casino-dark text-white">
      <GamesTopbar balance={profile?.balance || 0} />
      <div className="container mx-auto px-6 py-10">
        <Card className="bg-card border-casino-gold/20">
          <CardHeader>
            <CardTitle className="text-casino-gold">Daily Rewards</CardTitle>
            <CardDescription className="text-casino-silver">Claim +250 chips once per day.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={claimDailyReward}>
              <Button disabled={Boolean(claimed?.length)} className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90">
                {claimed?.length ? "Already Claimed Today" : "Claim Today"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
