import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GamesTopbar } from "@/components/games-topbar"
import { openCase } from "@/lib/feature-actions"

export default async function CasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <div className="min-h-svh bg-casino-dark text-white"><GamesTopbar balance={profile?.balance || 0} /><div className="container mx-auto px-6 py-10"><Card className="bg-card border-casino-gold/20"><CardHeader><CardTitle className="text-casino-gold">Cases</CardTitle><CardDescription className="text-casino-silver">Open mystery cases. Basic costs 100, Elite costs 500.</CardDescription></CardHeader><CardContent><div className="flex gap-3"><form action={openCase}><input type="hidden" name="caseType" value="basic" /><Button className="bg-casino-gold text-casino-dark" disabled={(profile?.balance || 0) < 100}>Open Basic Case</Button></form><form action={openCase}><input type="hidden" name="caseType" value="elite" /><Button variant="outline" className="border-casino-gold text-casino-gold" disabled={(profile?.balance || 0) < 500}>Open Elite Case</Button></form></div></CardContent></Card></div></div>
}
