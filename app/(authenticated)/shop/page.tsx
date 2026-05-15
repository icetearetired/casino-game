import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coins, Palette, Sparkles, ShoppingBag, Package } from "lucide-react"
import { SHOP_ITEMS } from "@/lib/actions/shop-definitions"
import { ShopItemCard } from "@/components/shop-item-card"

export default async function ShopPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user!.id)
    .single()

  // Fetch purchase history to show owned items
  const { data: purchases } = await supabase
    .from("transactions")
    .select("description")
    .eq("user_id", user!.id)
    .eq("type", "shop_purchase")

  const ownedItems = new Set(
    purchases?.map((p) => p.description?.replace("Purchased ", "")) || []
  )

  const balance = profile?.balance || 0

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-casino-gold mb-2">Shop</h1>
          <p className="text-casino-silver text-lg">Spend your chips on packs and cosmetics</p>
        </div>
        <div className="flex items-center gap-2 bg-casino-gold/10 px-6 py-3 rounded-lg border border-casino-gold/30">
          <Coins className="h-5 w-5 text-casino-gold" />
          <span className="text-casino-gold font-bold text-xl">{balance.toLocaleString()}</span>
          <span className="text-casino-silver">chips</span>
        </div>
      </div>

      <Tabs defaultValue="chips" className="space-y-6">
        <TabsList className="bg-casino-dark border border-casino-gold/20 grid w-full grid-cols-3">
          <TabsTrigger
            value="chips"
            className="data-[state=active]:bg-casino-gold/20 data-[state=active]:text-casino-gold"
          >
            <Coins className="w-4 h-4 mr-2 hidden sm:inline" />
            Chip Packs
          </TabsTrigger>
          <TabsTrigger
            value="avatars"
            className="data-[state=active]:bg-casino-gold/20 data-[state=active]:text-casino-gold"
          >
            <Palette className="w-4 h-4 mr-2 hidden sm:inline" />
            Avatars
          </TabsTrigger>
          <TabsTrigger
            value="boosters"
            className="data-[state=active]:bg-casino-gold/20 data-[state=active]:text-casino-gold"
          >
            <Sparkles className="w-4 h-4 mr-2 hidden sm:inline" />
            Boosters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chips">
          <Card className="bg-card border-casino-gold/20">
            <CardHeader>
              <CardTitle className="text-casino-gold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Chip Packs
              </CardTitle>
              <CardDescription className="text-casino-silver">
                Get more chips to keep playing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHOP_ITEMS.chips.map((item) => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    balance={balance}
                    owned={ownedItems.has(item.name)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avatars">
          <Card className="bg-card border-casino-gold/20">
            <CardHeader>
              <CardTitle className="text-casino-gold flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Avatar Frames
              </CardTitle>
              <CardDescription className="text-casino-silver">
                Customize your profile with unique frames
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHOP_ITEMS.avatars.map((item) => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    balance={balance}
                    owned={ownedItems.has(item.name)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boosters">
          <Card className="bg-card border-casino-gold/20">
            <CardHeader>
              <CardTitle className="text-casino-gold flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Boosters & Charms
              </CardTitle>
              <CardDescription className="text-casino-silver">
                Temporary boosts and cosmetic badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHOP_ITEMS.boosters.map((item) => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    balance={balance}
                    owned={ownedItems.has(item.name)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Purchase History */}
      <Card className="mt-8 bg-card border-casino-gold/20">
        <CardHeader>
          <CardTitle className="text-casino-gold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Recent Purchases
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchases && purchases.length > 0 ? (
            <div className="space-y-2">
              {purchases.slice(0, 5).map((purchase, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-casino-dark rounded-lg"
                >
                  <span className="text-white">{purchase.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-casino-silver text-center py-4">
              No purchases yet. Start shopping!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
