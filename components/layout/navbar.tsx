"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Coins,
  Menu,
  Sparkles,
  Trophy,
  ShoppingBag,
  Gift,
  User,
  Settings,
  LogOut,
  Bell,
  Gamepad2,
  Package,
  Swords,
  Shield,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NavbarProps {
  user: {
    id: string
    email?: string
  }
  profile: {
    username: string
    balance: number
    avatar_url?: string | null
    is_admin?: boolean
    level?: number
  } | null
  unreadNotifications?: number
}

const navLinks = [
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/games/cases", label: "Cases", icon: Package },
  { href: "/games/poker-ai", label: "AI Battle", icon: Swords },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/rewards", label: "Rewards", icon: Gift },
]

export function Navbar({ user, profile, unreadNotifications = 0 }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const initials = profile?.username?.slice(0, 2).toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-50 border-b border-casino-gold/20 bg-casino-dark/95 backdrop-blur supports-[backdrop-filter]:bg-casino-dark/80">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/games" className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-casino-gold" />
            <span className="text-xl font-bold text-casino-gold hidden sm:inline">
              Lucky Streak
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-casino-gold/20 text-casino-gold"
                      : "text-casino-silver hover:text-casino-gold hover:bg-casino-gold/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Balance Display */}
            <div className="hidden sm:flex items-center gap-2 bg-casino-gold/10 px-4 py-2 rounded-lg border border-casino-gold/30">
              <Coins className="h-4 w-4 text-casino-gold" />
              <span className="text-casino-gold font-semibold">
                {(profile?.balance || 0).toLocaleString()}
              </span>
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-casino-silver hover:text-casino-gold hover:bg-casino-gold/10"
              asChild
            >
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 hover:bg-casino-gold/10"
                >
                  <Avatar className="h-8 w-8 border border-casino-gold/30">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-casino-gold/20 text-casino-gold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm text-casino-gold font-medium">
                      {profile?.username || "Player"}
                    </span>
                    {profile?.level !== undefined && (
                      <span className="text-xs text-casino-silver">
                        Level {profile.level}
                      </span>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-casino-dark border-casino-gold/20"
              >
                {/* Mobile Balance */}
                <div className="sm:hidden px-2 py-2">
                  <div className="flex items-center gap-2 bg-casino-gold/10 px-3 py-2 rounded-lg">
                    <Coins className="h-4 w-4 text-casino-gold" />
                    <span className="text-casino-gold font-semibold">
                      {(profile?.balance || 0).toLocaleString()}
                    </span>
                    <span className="text-casino-silver text-xs">chips</span>
                  </div>
                </div>
                <DropdownMenuSeparator className="sm:hidden bg-casino-gold/20" />
                
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-casino-silver hover:text-casino-gold cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile/settings"
                    className="flex items-center gap-2 text-casino-silver hover:text-casino-gold cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                {profile?.is_admin && (
                  <>
                    <DropdownMenuSeparator className="bg-casino-gold/20" />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 text-casino-gold cursor-pointer"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator className="bg-casino-gold/20" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-casino-silver hover:text-red-400 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-casino-silver hover:text-casino-gold hover:bg-casino-gold/10"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 bg-casino-dark border-casino-gold/20 p-0"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-4 border-b border-casino-gold/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-casino-gold" />
                      <span className="text-lg font-bold text-casino-gold">
                        Lucky Streak Casino
                      </span>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon
                      const isActive =
                        pathname === link.href ||
                        pathname.startsWith(link.href + "/")
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-casino-gold/20 text-casino-gold"
                              : "text-casino-silver hover:text-casino-gold hover:bg-casino-gold/10"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
