import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Shield } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-svh bg-casino-dark text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-casino-gold/20 via-transparent to-transparent" />

        <div className="relative container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-balance">
              <span className="text-casino-gold">Lucky Streak</span> Casino
            </h1>
            <p className="text-xl md:text-2xl text-casino-silver text-pretty">
              Experience the thrill of Vegas from anywhere. Play slots, blackjack, and roulette with virtual chips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                size="lg"
                className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90 text-lg px-8"
              >
                <Link href="/auth/sign-up">Get 1,000 Free Chips</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-casino-gold text-casino-gold hover:bg-casino-gold/10 text-lg px-8 bg-transparent"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-casino-gold/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-casino-gold" />
            </div>
            <h3 className="text-xl font-semibold text-casino-gold">Multiple Games</h3>
            <p className="text-casino-silver leading-relaxed">
              Choose from slots, blackjack, and roulette. New games added regularly.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-casino-gold/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-casino-gold" />
            </div>
            <h3 className="text-xl font-semibold text-casino-gold">Track Your Stats</h3>
            <p className="text-casino-silver leading-relaxed">
              View your game history and see how your balance grows over time.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-casino-gold/10 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-casino-gold" />
            </div>
            <h3 className="text-xl font-semibold text-casino-gold">100% Risk-Free</h3>
            <p className="text-casino-silver leading-relaxed">
              Play with virtual chips only. No real money involved, just pure entertainment.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-casino-gold/5 border-y border-casino-gold/20">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-casino-gold">Ready to Test Your Luck?</h2>
          <p className="text-xl text-casino-silver mb-8 max-w-2xl mx-auto">
            {"Join thousands of players and start your winning streak today."}
          </p>
          <Button asChild size="lg" className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90 text-lg px-8">
            <Link href="/auth/sign-up">Start Playing Now</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
