"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { ArrowLeft, Camera, Save } from "lucide-react"
import Link from "next/link"

const AVATAR_OPTIONS = [
  "/avatars/avatar-1.png",
  "/avatars/avatar-2.png",
  "/avatars/avatar-3.png",
  "/avatars/avatar-4.png",
  "/avatars/avatar-5.png",
  "/avatars/avatar-6.png",
]

export default function ProfileSettingsPage() {
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single()

        if (profile) {
          setUsername(profile.username || "")
          setAvatarUrl(profile.avatar_url)
        }
      }
      setIsLoading(false)
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const initials = username?.slice(0, 2).toUpperCase() || "U"

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-casino-gold/10 rounded w-48" />
          <div className="h-64 bg-casino-gold/10 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-2xl">
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          className="text-casino-silver hover:text-casino-gold hover:bg-casino-gold/10 mb-4"
        >
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-casino-gold">Profile Settings</h1>
        <p className="text-casino-silver">Customize your profile</p>
      </div>

      <div className="space-y-6">
        {/* Avatar Selection */}
        <Card className="bg-card border-casino-gold/20">
          <CardHeader>
            <CardTitle className="text-casino-gold flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Avatar
            </CardTitle>
            <CardDescription className="text-casino-silver">
              Choose your profile avatar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-casino-gold/30">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-casino-gold/20 text-casino-gold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => setAvatarUrl(avatar)}
                    className={`p-1 rounded-lg border-2 transition-colors ${
                      avatarUrl === avatar
                        ? "border-casino-gold bg-casino-gold/10"
                        : "border-casino-gold/20 hover:border-casino-gold/50"
                    }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="bg-casino-gold/20 text-casino-gold">
                        {index + 1}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                className="border-casino-gold/30 text-casino-silver hover:text-casino-gold hover:bg-casino-gold/10"
                onClick={() => setAvatarUrl(null)}
              >
                Use Initials
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Username */}
        <Card className="bg-card border-casino-gold/20">
          <CardHeader>
            <CardTitle className="text-casino-gold">Display Name</CardTitle>
            <CardDescription className="text-casino-silver">
              This is how other players will see you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-casino-silver">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-casino-dark border-casino-gold/30 focus:border-casino-gold"
                  placeholder="Enter your username"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-casino-gold text-casino-dark hover:bg-casino-gold/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
