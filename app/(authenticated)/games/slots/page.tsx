import { createClient } from "@/lib/supabase/server"
import { SlotsGame } from "@/components/slots-game"

export default async function SlotsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user!.id)
    .single()

  return <SlotsGame initialBalance={profile?.balance || 0} />
}
