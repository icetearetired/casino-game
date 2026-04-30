import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GamesTopbar } from "@/components/games-topbar"

export default async function LeaderboardPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: leaders } = await supabase.from('profiles').select('username,balance').order('balance',{ascending:false}).limit(10)
  return <div className="min-h-svh bg-casino-dark text-white"><GamesTopbar balance={profile?.balance || 0} /><div className="container mx-auto px-6 py-10"><Card className="bg-card border-casino-gold/20"><CardHeader><CardTitle className="text-casino-gold">Leaderboard</CardTitle></CardHeader><CardContent>{leaders?.map((p, i)=><div key={p.username+i} className="flex justify-between border-b border-casino-gold/10 py-2"><span className="text-casino-silver">#{i+1} {p.username || 'Player'}</span><span className="text-casino-gold">{(p.balance || 0).toLocaleString()}</span></div>)}</CardContent></Card></div></div>
}
