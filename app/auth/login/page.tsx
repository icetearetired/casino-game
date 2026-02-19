"use client"

import type React from "react"
import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Turnstile } from "@marsidev/react-turnstile"
import { UserRound } from "lucide-react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)
  const router = useRouter()
  const turnstileRef = useRef<{ reset: () => void } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!captchaToken) {
      setError("Please complete the captcha.")
      return
    }

    setIsLoading(true)

    try {
      // Verify captcha on server
      const verifyRes = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      })
      const verifyData = await verifyRes.json()

      if (!verifyData.success) {
        turnstileRef.current?.reset()
        setCaptchaToken(null)
        throw new Error("Captcha verification failed. Try again.")
      }

      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/games")
    } catch (error: unknown) {
      if (error instanceof Error && error.message.toLowerCase().includes("captcha")) {
        turnstileRef.current?.reset()
        setCaptchaToken(null)
      }
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestPlay = async () => {
    setError(null)
    setIsGuestLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      router.push("/games")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to start guest session")
    } finally {
      setIsGuestLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-casino-dark">
      <div className="w-full max-w-sm">
        <Card className="border-casino-gold/20 bg-casino-dark/95">
          <CardHeader>
            <CardTitle className="text-2xl text-casino-gold">Login</CardTitle>
            <CardDescription className="text-casino-silver">
              Enter your credentials to access the casino
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-casino-dark border-casino-gold/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-casino-dark border-casino-gold/30"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => {
                    setCaptchaToken(null)
                    setError("Captcha failed to load.")
                  }}
                />

                <Button
                  type="submit"
                  className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
                  disabled={isLoading || !captchaToken}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-casino-gold/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-casino-dark/95 px-2 text-casino-silver">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
              onClick={handleGuestPlay}
              disabled={isGuestLoading}
            >
              <UserRound className="mr-2 h-4 w-4" />
              {isGuestLoading ? "Starting guest session..." : "Play as Guest"}
            </Button>

            <div className="mt-4 text-center text-sm text-casino-silver">
              {"Don't have an account? "}
              <Link href="/auth/sign-up" className="underline underline-offset-4 text-casino-gold">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
