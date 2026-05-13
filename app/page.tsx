import Link from "next/link"
import {
  BadgeDollarSign,
  Clock3,
  Crown,
  Dice5,
  Flame,
  Gem,
  Gift,
  Home,
  Layers,
  Radio,
  Swords,
  Trophy,
} from "lucide-react"
import { SidebarNavItem } from "@/components/casino/SidebarNavItem"
import { StatusCard } from "@/components/casino/StatusCard"
import { ActivityFeed } from "@/components/casino/ActivityFeed"
import { TopBar } from "@/components/casino/TopBar"
import { CategoryTabs } from "@/components/casino/CategoryTabs"
import { SectionBlock } from "@/components/casino/SectionBlock"
import { ActivityItem, Category, Game, NavItem } from "@/components/casino/types"

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "originals", label: "Originals", icon: Dice5, href: "/games" },
  { id: "slots", label: "Slots", icon: Layers, href: "/games/slots" },
  { id: "live", label: "Live Casino", icon: Radio, href: "/games/roulette" },
  { id: "tournaments", label: "Tournaments", icon: Trophy, badge: "4", href: "/games/leaderboard" },
  { id: "vip", label: "VIP", icon: Crown, href: "/games/shop" },
  { id: "missions", label: "Missions", icon: Flame, href: "/games/daily-rewards" },
  { id: "rewards", label: "Rewards", icon: Gift, href: "/games/achievements" },
  { id: "duels", label: "Duels", icon: Swords, href: "/games/duels" },
  { id: "collectibles", label: "Collectibles", icon: Gem, href: "/games/cases" },
  { id: "wallet", label: "Wallet", icon: BadgeDollarSign, href: "/games/profile" },
  { id: "history", label: "History", icon: Clock3, href: "/games/blackjack" },
]

const categories: Category[] = [
  { id: "all", label: "All", active: true },
  { id: "new", label: "New" },
  { id: "trending", label: "Trending" },
  { id: "instant", label: "Instant" },
  { id: "table", label: "Table" },
  { id: "jackpots", label: "Jackpots" },
]

const activities: ActivityItem[] = [
  { id: "1", user: "player_12", action: "Won Neon Blackjack", amount: "+$232", positive: true },
  { id: "2", user: "ice_spin", action: "Opened Lucky Case", amount: "-$40" },
  { id: "3", user: "deck_ace", action: "Hit Roulette Streak", amount: "+$510", positive: true },
]

const palette = ["bg-gradient-to-br from-cyan-500 to-blue-700", "bg-gradient-to-br from-violet-500 to-fuchsia-700", "bg-gradient-to-br from-emerald-500 to-teal-700", "bg-gradient-to-br from-rose-500 to-orange-600"]

const gameFactory = (prefix: string): Game[] =>
  Array.from({ length: 10 }).map((_, idx) => ({
    id: `${prefix}-${idx}`,
    title: `${prefix} ${idx + 1}`,
    subtitle: idx % 2 ? "High volatility" : "Fast rounds",
    players: `${1200 + idx * 91}`,
    colorClass: palette[idx % palette.length],
  }))

export default function Page() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)] p-4 lg:flex xl:w-[260px]">
        <Link href="/games" className="mb-4 rounded-[var(--radius-pill)] border border-[var(--border)] bg-white/5 px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]">Nova Casino</Link>
        <nav className="space-y-1" aria-label="Sidebar navigation">
          {navItems.map((item, idx) => <SidebarNavItem key={item.id} item={item} active={idx === 0} />)}
        </nav>
        <div className="mt-4 space-y-3">
          <StatusCard />
          <ActivityFeed items={activities} />
          <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] p-4 text-sm">
            <p className="text-[var(--text-muted)]">Portfolio</p>
            <p className="mt-2 text-xl font-semibold">$14,892</p>
            <p className="text-xs text-[var(--accent-green)]">+3.4% today</p>
          </section>
        </div>
      </aside>

      <main className="lg:ml-[220px] xl:ml-[260px]">
        <TopBar />
        <div className="space-y-8 px-4 py-4 md:px-6">
          <CategoryTabs categories={categories} />
          <SectionBlock title="Originals" games={gameFactory("Original")} />
          <SectionBlock title="Slots" games={gameFactory("Slot")} />
          <SectionBlock title="Live Casino" games={gameFactory("Live")} />
        </div>
      </main>
    </div>
  )
}
