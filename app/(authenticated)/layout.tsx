import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, balance, avatar_url, is_admin, level")
    .eq("id", user.id)
    .single()

  // TODO: Fetch unread notifications count
  const unreadNotifications = 0

  return (
    <div className="min-h-svh bg-casino-dark">
      <Navbar
        user={{ id: user.id, email: user.email }}
        profile={profile}
        unreadNotifications={unreadNotifications}
      />
      {children}
    </div>
  )
}
