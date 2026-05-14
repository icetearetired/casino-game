import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, History, Info } from "lucide-react"
import { CASES } from "@/lib/actions/cases"
import { CaseCard } from "@/components/cases/case-card"

export default async function CasesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user!.id)
    .single()

  // Fetch recent case opens
  const { data: recentOpens } = await supabase
    .from("game_history")
    .select("*")
    .eq("user_id", user!.id)
    .eq("game_type", "cases")
    .order("created_at", { ascending: false })
    .limit(10)

  const balance = profile?.balance || 0

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-casino-gold mb-2">Mystery Cases</h1>
        <p className="text-casino-silver text-lg">
          Open cases for a chance at amazing chip rewards!
        </p>
      </div>

      {/* Info Banner */}
      <Card className="mb-8 bg-casino-gold/5 border-casino-gold/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-casino-gold/10 rounded-lg">
              <Info className="h-5 w-5 text-casino-gold" />
            </div>
            <div>
              <h3 className="text-casino-gold font-semibold mb-1">How It Works</h3>
              <p className="text-casino-silver text-sm">
                Each case contains a random prize from the displayed pool. Higher tier cases cost more
                but offer bigger potential rewards. The odds for each prize are shown below each case.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Object.values(CASES).map((caseData) => (
          <CaseCard key={caseData.id} caseData={caseData} balance={balance} />
        ))}
      </div>

      {/* Recent Opens */}
      <Card className="bg-card border-casino-gold/20">
        <CardHeader>
          <CardTitle className="text-casino-gold flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Opens
          </CardTitle>
          <CardDescription className="text-casino-silver">
            Your case opening history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentOpens && recentOpens.length > 0 ? (
            <div className="space-y-3">
              {recentOpens.map((open: {
                id: string
                bet_amount: number
                win_amount: number
                result: { case: string; prize: string; rarity: string }
                created_at: string
              }) => {
                const profit = open.win_amount - open.bet_amount
                const rarityColors: Record<string, string> = {
                  common: "text-gray-400",
                  uncommon: "text-green-400",
                  rare: "text-blue-400",
                  epic: "text-purple-400",
                  legendary: "text-yellow-400",
                }

                return (
                  <div
                    key={open.id}
                    className="flex items-center justify-between p-3 bg-casino-dark rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Package className="h-5 w-5 text-casino-gold" />
                      <div>
                        <span className="text-white font-medium capitalize">
                          {open.result?.case || "Unknown"} Case
                        </span>
                        <span className={`ml-2 text-sm ${rarityColors[open.result?.rarity] || "text-casino-silver"}`}>
                          {open.result?.prize}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${profit > 0 ? "text-green-400" : profit === 0 ? "text-casino-silver" : "text-red-400"}`}>
                        {profit > 0 ? `+${profit}` : profit}
                      </span>
                      <p className="text-casino-silver text-xs">
                        {new Date(open.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-casino-silver text-center py-8">
              No cases opened yet. Try your luck above!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
