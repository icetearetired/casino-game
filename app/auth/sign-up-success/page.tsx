import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-casino-dark">
      <div className="w-full max-w-sm">
        <Card className="border-casino-gold/20 bg-casino-dark/95">
          <CardHeader>
            <CardTitle className="text-2xl text-casino-gold">Check Your Email</CardTitle>
            <CardDescription className="text-casino-silver">Confirm your account to start playing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-casino-silver leading-relaxed">
              {
                "We've sent you a confirmation email. Please check your inbox and click the link to activate your account."
              }
            </p>
            <Button asChild className="w-full bg-casino-gold text-casino-dark hover:bg-casino-gold/90">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
