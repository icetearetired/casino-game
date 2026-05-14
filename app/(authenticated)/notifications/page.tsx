import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Gift, Trophy, Coins, TrendingUp, Users, Settings } from "lucide-react"
import Link from "next/link"

// Types for notifications
type NotificationType = "reward" | "achievement" | "win" | "referral" | "system"

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
}

// Generate mock notifications based on user activity
async function getNotifications(userId: string, supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never) {
  const notifications: Notification[] = []
  const now = new Date()

  // Check daily reward status
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_daily_bonus, balance, level, referral_code")
    .eq("id", userId)
    .single()

  const today = now.toISOString().split("T")[0]
  
  if (profile?.last_daily_bonus !== today) {
    notifications.push({
      id: "daily-reward",
      type: "reward",
      title: "Daily Reward Available!",
      message: "Your daily reward is waiting! Claim it now to build your streak.",
      timestamp: now,
      read: false,
    })
  }

  // Get recent big wins
  const { data: recentWins } = await supabase
    .from("game_history")
    .select("*")
    .eq("user_id", userId)
    .gt("win_amount", 1000)
    .order("created_at", { ascending: false })
    .limit(3)

  recentWins?.forEach((win) => {
    notifications.push({
      id: `win-${win.id}`,
      type: "win",
      title: "Big Win!",
      message: `You won ${win.win_amount.toLocaleString()} chips in ${win.game_type}!`,
      timestamp: new Date(win.created_at),
      read: true,
    })
  })

  // Add some static notifications
  notifications.push({
    id: "welcome",
    type: "system",
    title: "Welcome to Lucky Streak!",
    message: "Explore our games and start building your fortune. Check out the new Cases and AI Battle modes!",
    timestamp: new Date(now.getTime() - 86400000),
    read: true,
  })

  if (profile?.level && profile.level >= 5) {
    notifications.push({
      id: "level-5",
      type: "achievement",
      title: "Level 5 Reached!",
      message: "Congratulations on reaching level 5! Keep playing to unlock more rewards.",
      timestamp: new Date(now.getTime() - 172800000),
      read: true,
    })
  }

  // Sort by timestamp
  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const notifications = await getNotifications(user!.id, supabase)

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "reward":
        return <Gift className="h-5 w-5 text-green-400" />
      case "achievement":
        return <Trophy className="h-5 w-5 text-yellow-400" />
      case "win":
        return <Coins className="h-5 w-5 text-casino-gold" />
      case "referral":
        return <Users className="h-5 w-5 text-blue-400" />
      case "system":
        return <Bell className="h-5 w-5 text-casino-silver" />
    }
  }

  const getActionLink = (notification: Notification) => {
    switch (notification.type) {
      case "reward":
        return "/rewards"
      case "achievement":
        return "/profile"
      case "win":
        return "/profile"
      case "referral":
        return "/profile"
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-casino-gold mb-2">Notifications</h1>
        <p className="text-casino-silver text-lg">Stay updated with your activity</p>
      </div>

      <Card className="bg-card border-casino-gold/20">
        <CardHeader>
          <CardTitle className="text-casino-gold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          <CardDescription className="text-casino-silver">
            Your latest updates and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const actionLink = getActionLink(notification)
                const Content = (
                  <div
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      notification.read
                        ? "bg-casino-dark border-casino-gold/10"
                        : "bg-casino-gold/10 border-casino-gold/30"
                    } ${actionLink ? "hover:border-casino-gold/50 cursor-pointer" : ""}`}
                  >
                    <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium ${notification.read ? "text-white" : "text-casino-gold"}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-casino-gold rounded-full" />
                        )}
                      </div>
                      <p className="text-casino-silver text-sm mt-1">{notification.message}</p>
                      <p className="text-casino-silver/60 text-xs mt-2">
                        {notification.timestamp.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )

                return actionLink ? (
                  <Link key={notification.id} href={actionLink}>
                    {Content}
                  </Link>
                ) : (
                  <div key={notification.id}>{Content}</div>
                )
              })}
            </div>
          ) : (
            <p className="text-casino-silver text-center py-8">
              No notifications yet. Play some games to see updates here!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card className="mt-6 bg-card border-casino-gold/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-casino-silver" />
              <div>
                <h4 className="text-white font-medium">Notification Settings</h4>
                <p className="text-casino-silver text-sm">
                  Manage how you receive notifications
                </p>
              </div>
            </div>
            <Link
              href="/profile/settings"
              className="text-casino-gold hover:underline text-sm"
            >
              Manage
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
