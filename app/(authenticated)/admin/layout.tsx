import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  ShoppingBag,
  Settings,
  ArrowLeft,
} from "lucide-react"

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/games", label: "Games", icon: Gamepad2 },
  { href: "/admin/shop", label: "Shop", icon: ShoppingBag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    redirect("/games")
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-casino-gold/20 bg-casino-dark/50 hidden lg:block">
        <div className="p-4">
          <Link
            href="/games"
            className="flex items-center gap-2 text-casino-silver hover:text-casino-gold text-sm mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Casino
          </Link>
          <h2 className="text-casino-gold font-bold text-lg mb-4">Admin Panel</h2>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-casino-silver hover:text-casino-gold hover:bg-casino-gold/10 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden border-b border-casino-gold/20 p-4 w-full absolute">
        <nav className="flex gap-2 overflow-x-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-casino-silver hover:text-casino-gold hover:bg-casino-gold/10 transition-colors whitespace-nowrap text-sm"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8">{children}</main>
    </div>
  )
}
