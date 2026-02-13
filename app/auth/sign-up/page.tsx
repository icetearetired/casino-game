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

export default function Page() {
  const supabase = createClient() // ✅ create once
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const turnstileRef = useRef<any>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!captchaToken) {
      setError("Please complete the captcha.")
      return
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)

    try {
      // 🔐 Verify captcha on server
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

      // ✅ Create account
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/games`,
          data: { username },
        },
      })

           if (error) {
        if (error.message?.toLowerCase().includes("captcha")) {
          turnstileRef.current?.reset()
          setCaptchaToken(null)
        }
        throw error
      }

      router.push("/auth/sign-up-success")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
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
                  <Label>Username</Label>
                  <Input
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Repeat Password</Label>
                  <Input
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                {/* 🔐 Turnstile */}
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
                  disabled={isLoading || !captchaToken}
                  className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
                >
                  {isLoading ? "Creating account..." : "Sign up"}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm text-casino-silver">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4 text-casino-gold"
                >
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
