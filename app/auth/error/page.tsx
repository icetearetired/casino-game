import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-casino-dark">
      <div className="w-full max-w-sm">
        <Card className="border-casino-gold/20 bg-casino-dark/95">
          <CardHeader>
            <CardTitle className="text-2xl text-casino-gold">Authentication Error</CardTitle>
            <CardDescription className="text-casino-silver">Something went wrong during authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-casino-silver leading-relaxed">
              {"There was a problem with your authentication request. Please try again."}
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10 bg-transparent"
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
