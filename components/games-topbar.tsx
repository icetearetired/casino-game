import Link from "next/link"
import { Coins, Crown, Gift, ShieldCheck, ShoppingBag, Swords, Trophy, UserCircle2, Medal } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

export function GamesTopbar({ balance = 0 }: { balance?: number }) {
  const nav = [
    { href: "/games/profile", label: "Profile", icon: UserCircle2 },
    { href: "/games/daily-rewards", label: "Daily Rewards", icon: Gift },
    { href: "/games/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/games/shop", label: "Shop", icon: ShoppingBag },
    { href: "/games/cases", label: "Cases", icon: Crown },
    { href: "/games/duels", label: "AI 1v1", icon: Swords },
    { href: "/games/achievements", label: "Achievements", icon: Medal },
    { href: "/games/admin", label: "Admin", icon: ShieldCheck },
  ]

  return (
    <header className="border-b border-casino-gold/20 bg-casino-dark/95 backdrop-blur">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/games" className="text-2xl font-bold text-casino-gold">
            Lucky Streak Casino
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-casino-gold/10 px-4 py-2 rounded-lg border border-casino-gold/30">
              <Coins className="w-5 h-5 text-casino-gold" />
              <span className="text-casino-gold font-semibold">{balance.toLocaleString()}</span>
              <span className="text-casino-silver text-sm">chips</span>
            </div>
            <LogoutButton />
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-2">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-md border border-casino-gold/30 bg-casino-gold/10 px-3 py-2 text-sm text-casino-silver hover:text-casino-gold"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
