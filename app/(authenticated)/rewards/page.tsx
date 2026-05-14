import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Flame, Coins, Calendar, Trophy } from "lucide-react"
import { getDailyRewardStatus } from "@/lib/actions/rewards"
import { DailyRewardClaim } from "@/components/daily-reward-claim"

const DAILY_REWARDS = [100, 150, 200, 300, 400, 500, 1000]

export default async function RewardsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rewardStatus = await getDailyRewardStatus()

  // Fetch recent reward history
  const { data: rewardHistory } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user!.id)
    .eq("type", "daily_bonus")
    .order("created_at", { ascending: false })
    .limit(7)

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-casino-gold mb-2">Daily Rewards</h1>
        <p className="text-casino-silver text-lg">
          Claim your daily bonus and build your streak for bigger rewards!
        </p>
      </div>

      {/* Claim Card */}
      <Card className="mb-8 bg-gradient-to-br from-casino-gold/20 via-casino-gold/10 to-casino-gold/5 border-casino-gold/30">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-casino-gold/20 flex items-center justify-center">
                  <Gift className="w-16 h-16 text-casino-gold" />
                </div>
                {rewardStatus.streak > 0 && (
                  <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-casino-dark px-3 py-1 rounded-full border border-casino-gold/30">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-casino-gold font-bold">{rewardStatus.streak}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-casino-gold mb-2">
                {rewardStatus.canClaim
                  ? `Day ${rewardStatus.nextStreak} Reward Available!`
                  : "Come Back Tomorrow!"}
              </h2>
              <p className="text-casino-silver mb-4">
                {rewardStatus.canClaim
                  ? `Claim ${rewardStatus.nextReward.toLocaleString()} chips now!`
                  : `You've already claimed today. Current streak: ${rewardStatus.streak} days.`}
              </p>

              <DailyRewardClaim
                canClaim={rewardStatus.canClaim}
                nextReward={rewardStatus.nextReward}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Progress */}
      <Card className="mb-8 bg-card border-casino-gold/20">
        <CardHeader>
          <CardTitle className="text-casino-gold flex items-center gap-2">
            <Flame className="h-5 w-5" />
            7-Day Streak Rewards
          </CardTitle>
          <CardDescription className="text-casino-silver">
            Login daily to build your streak and earn bigger rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {DAILY_REWARDS.map((reward, index) => {
              const day = index + 1
              const isClaimed = day <= rewardStatus.streak
              const isToday = day === rewardStatus.nextStreak && rewardStatus.canClaim
              const isUpcoming = day > rewardStatus.nextStreak || (day === rewardStatus.nextStreak && !rewardStatus.canClaim)

              return (
                <div
                  key={day}
                  className={`relative flex flex-col items-center p-2 md:p-4 rounded-lg border transition-all ${
                    isClaimed
                      ? "bg-casino-gold/20 border-casino-gold/50"
                      : isToday
                        ? "bg-casino-gold/10 border-casino-gold animate-pulse"
                        : "bg-casino-dark border-casino-gold/10"
                  }`}
                >
                  <span className={`text-xs md:text-sm font-medium mb-1 ${isClaimed ? "text-casino-gold" : "text-casino-silver"}`}>
                    Day {day}
                  </span>
                  <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1 ${
                    isClaimed
                      ? "bg-casino-gold/30"
                      : isToday
                        ? "bg-casino-gold/20"
                        : "bg-casino-dark"
                  }`}>
                    {day === 7 ? (
                      <Trophy className={`w-4 h-4 md:w-6 md:h-6 ${isClaimed ? "text-casino-gold" : "text-casino-silver"}`} />
                    ) : (
                      <Coins className={`w-4 h-4 md:w-6 md:h-6 ${isClaimed ? "text-casino-gold" : "text-casino-silver"}`} />
                    )}
                  </div>
                  <span className={`text-xs md:text-sm font-bold ${isClaimed ? "text-casino-gold" : isUpcoming ? "text-casino-silver" : "text-white"}`}>
                    {reward}
                  </span>
                  {isClaimed && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-casino-dark rounded-lg">
            <p className="text-casino-silver text-sm text-center">
              <Flame className="inline w-4 h-4 text-orange-400 mr-1" />
              Complete all 7 days to earn a <span className="text-casino-gold font-bold">1,000 chip jackpot bonus!</span>
              {" "}Missing a day resets your streak.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reward History */}
      <Card className="bg-card border-casino-gold/20">
        <CardHeader>
          <CardTitle className="text-casino-gold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Claims
          </CardTitle>
          <CardDescription className="text-casino-silver">
            Your recent daily reward claims
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rewardHistory && rewardHistory.length > 0 ? (
            <div className="space-y-3">
              {rewardHistory.map((reward: {
                id: string
                amount: number
                description: string
                created_at: string
              }) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-3 bg-casino-dark rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-casino-gold/20 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-casino-gold" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{reward.description}</p>
                      <p className="text-casino-silver text-sm">
                        {new Date(reward.created_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-casino-gold font-bold">+{reward.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-casino-silver text-center py-8">
              No rewards claimed yet. Claim your first daily reward above!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
