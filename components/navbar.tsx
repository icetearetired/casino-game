"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/context/user-context"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, DollarSign } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, balance } = useUser()

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Games", href: "/games" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Dashboard", href: "/dashboard" },
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
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-300 hover:text-amber-500 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full">
                <DollarSign className="h-4 w-4 text-amber-500" />
                <span className="text-amber-500 font-bold">{balance.toLocaleString()}</span>
              </div>
              <Button asChild variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
                <Link href="/dashboard">My Account</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Button asChild variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
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
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-zinc-900 border-zinc-800">
              <div className="flex flex-col gap-6 pt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-zinc-300 hover:text-amber-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}

                {user ? (
                  <>
                    <div className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-full w-fit">
                      <DollarSign className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-500 font-bold">{balance.toLocaleString()}</span>
                    </div>
                    <Button asChild variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        My Account
                      </Link>
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-4 mt-4">
                    <Button asChild variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
