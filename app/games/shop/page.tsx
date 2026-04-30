import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GamesTopbar } from "@/components/games-topbar"
import { buyShopItem } from "@/lib/feature-actions"

const items = [
  { name: "Bronze Boost", price: 500 },
  { name: "Lucky Charm", price: 1200 },
  { name: "VIP Flair", price: 2500 },
]

export default async function ShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <div className="min-h-svh bg-casino-dark text-white"><GamesTopbar balance={profile?.balance || 0} /><div className="container mx-auto px-6 py-10"><div className="grid md:grid-cols-3 gap-4">{items.map((item)=><Card key={item.name} className="bg-card border-casino-gold/20"><CardHeader><CardTitle className="text-casino-gold">{item.name}</CardTitle></CardHeader><CardContent><p className="text-casino-silver mb-3">{item.price} chips</p><form action={buyShopItem}><input type="hidden" name="item" value={item.name} /><input type="hidden" name="price" value={item.price} /><Button className="w-full bg-casino-gold text-casino-dark" disabled={(profile?.balance || 0) < item.price}>Buy</Button></form></CardContent></Card>)}</div></div></div>
}
