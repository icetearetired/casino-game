import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GamesTopbar } from "@/components/games-topbar"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <div className="min-h-svh bg-casino-dark text-white"><GamesTopbar balance={profile?.balance || 0} /><div className="container mx-auto px-6 py-10"><Card className="bg-card border-casino-gold/20"><CardHeader><CardTitle className="text-casino-gold">Your Profile</CardTitle></CardHeader><CardContent className="space-y-2 text-casino-silver"><p>Username: {profile?.username || "Player"}</p><p>Balance: {(profile?.balance || 0).toLocaleString()} chips</p><p>Status: {profile?.username?.startsWith("Guest_") ? "Guest" : "Registered"}</p></CardContent></Card></div></div>
}
