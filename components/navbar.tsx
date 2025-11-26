"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/context/user-context"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, DollarSign, Gamepad2, Trophy, Users, Target, BarChart3, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, balance } = useUser()

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Games", href: "/games", icon: Gamepad2 },
    { name: "Tournaments", href: "/tournaments", icon: Trophy },
    { name: "Challenges", href: "/challenges", icon: Target },
    { name: "Leaderboards", href: "/leaderboards", icon: BarChart3 },
    { name: "Clans", href: "/clans", icon: Users },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-amber-500" />
            <span className="text-xl font-bold text-amber-500">Lucky Casino</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-300 hover:text-amber-500 hover:bg-zinc-800 rounded-md transition-colors"
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full">
                <DollarSign className="h-4 w-4 text-amber-500" />
                <span className="text-amber-500 font-bold">{(balance ?? 0).toLocaleString()}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-amber-500 text-amber-500 hover:bg-amber-500/10 bg-transparent"
                  >
                    {user.username}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/inventory" className="cursor-pointer">
                      Inventory
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Button
                asChild
                variant="outline"
                className="border-amber-500 text-amber-500 hover:bg-amber-500/10 bg-transparent"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-amber-500 text-black hover:bg-amber-600">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-zinc-900 border-zinc-800 w-72">
              <div className="flex flex-col gap-4 pt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium text-zinc-300 hover:text-amber-500 transition-colors p-2 rounded-md hover:bg-zinc-800"
                  >
                    {link.icon && <link.icon className="h-5 w-5" />}
                    {link.name}
                  </Link>
                ))}

                <div className="border-t border-zinc-800 pt-4 mt-2">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-full w-fit mb-4">
                        <DollarSign className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-500 font-bold">{(balance ?? 0).toLocaleString()}</span>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-lg font-medium text-zinc-300 hover:text-amber-500 transition-colors p-2"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-lg font-medium text-zinc-300 hover:text-amber-500 transition-colors p-2"
                      >
                        Profile
                      </Link>
                    </>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Button
                        asChild
                        variant="outline"
                        className="border-amber-500 text-amber-500 hover:bg-amber-500/10 bg-transparent"
                      >
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button asChild className="bg-amber-500 text-black hover:bg-amber-600">
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
