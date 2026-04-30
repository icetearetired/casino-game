import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GamesTopbar } from "@/components/games-topbar"

export default async function DailyRewardsPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return <div className="min-h-svh bg-casino-dark text-white"><GamesTopbar balance={profile?.balance || 0} /><div className="container mx-auto px-6 py-10"><Card className="bg-card border-casino-gold/20"><CardHeader><CardTitle className="text-casino-gold">Daily Rewards</CardTitle><CardDescription className="text-casino-silver">Come back every day to claim bonus chips.</CardDescription></CardHeader><CardContent><div className="grid grid-cols-7 gap-2 mb-6">{[100,150,200,300,400,600,1000].map((reward, i)=><div key={i} className="rounded border border-casino-gold/20 p-3 text-center"><p className="text-xs text-casino-silver">Day {i+1}</p><p className="text-casino-gold font-bold">+{reward}</p></div>)}</div><Button className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90">Claim Today (Demo)</Button></CardContent></Card></div></div>
}
