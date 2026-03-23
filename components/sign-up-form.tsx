"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TurnstileWidget } from "@/components/turnstile-widget"
import { normalizeUsername } from "@/lib/utils"

export function SignUpForm({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [captchaKey, setCaptchaKey] = useState(0)
  const router = useRouter()

  const handleCaptchaSuccess = useCallback((token: string) => {
    setCaptchaToken(token)
  }, [])

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null)
  }, [])

  const handleCaptchaError = useCallback(() => {
    setCaptchaToken(null)
    setError("CAPTCHA failed to load. Please refresh the page.")
  }, [])

  const resetCaptcha = () => {
    setCaptchaToken(null)
    // Changing the key forces the Turnstile widget to re-mount and reset
    setCaptchaKey((k) => k + 1)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic Validation
    if (turnstileSiteKey && !captchaToken) {
      setError("Please complete the CAPTCHA verification.")
      return
    }

    const normalizedUsername = normalizeUsername(username)
    if (!normalizedUsername) {
      setError("Please enter a username.")
      return
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // ✅ Pass the CAPTCHA token directly to Supabase Auth
      // Supabase will automatically securely verify the Turnstile token on their backend
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/games`,
          data: { username: normalizedUsername },
          captchaToken: captchaToken ?? undefined, // Add the token here!
        },
      })

      if (authError) {
        throw authError
      }

      router.push("/auth/sign-up-success")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      // Always reset the CAPTCHA on failure so the user can try again
      resetCaptcha() 
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-casino-dark">
      <div className="w-full max-w-sm">
        <Card className="border-casino-gold/20 bg-casino-dark/95">
          <CardHeader>
            <CardTitle className="text-2xl text-casino-gold">Sign Up</CardTitle>
            <CardDescription className="text-casino-silver">
              Create an account and get 1,000 free chips!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-casino-dark border-casino-gold/30"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
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

                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Confirm Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-casino-dark border-casino-gold/30"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                {turnstileSiteKey ? (
                  <TurnstileWidget
                    key={captchaKey}
                    siteKey={turnstileSiteKey}
                    onSuccess={handleCaptchaSuccess}
                    onExpire={handleCaptchaExpire}
                    onError={handleCaptchaError}
                  />
                ) : (
                  <p className="text-sm text-casino-silver">
                    CAPTCHA is unavailable in this environment.
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || (turnstileSiteKey ? !captchaToken : false)}
                  className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm text-casino-silver">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline text-casino-gold">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
