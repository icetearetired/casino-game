"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { getAccessToken } from "@/lib/supabase/client"
import { Users, Trophy, Plus, Search, Shield } from "lucide-react"
import Link from "next/link"

interface Clan {
  id: string
  name: string
  tag: string
  description: string
  owner_id: string
  owner_username?: string
  level: number
  xp: number
  total_winnings: number
  member_count: number
  max_members: number
  is_public: boolean
  created_at: string
}

export default function ClansPage() {
  const [clans, setClans] = useState<Clan[]>([])
  const [myClan, setMyClan] = useState<Clan | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newClan, setNewClan] = useState({ name: "", tag: "", description: "" })

  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    fetchClans()
    if (user) {
      fetchMyClan()
    }
  }, [user])

  const fetchClans = async () => {
    try {
      const response = await fetch("/api/clans")
      if (response.ok) {
        const data = await response.json()
        setClans(data)
      }
    } catch (error) {
      console.error("Error fetching clans:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyClan = async () => {
    try {
      const token = await getAccessToken()
      if (!token) {
        return
      }
      const response = await fetch("/api/clans/my-clan", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setMyClan(data)
      }
    } catch (error) {
      console.error("Error fetching my clan:", error)
    }
  }

  const createClan = async () => {
    if (!user) {
      toast({ title: "Login Required", variant: "destructive" })
      return
    }

    try {
      const token = await getAccessToken()
      if (!token) {
        toast({ title: "Login Required", variant: "destructive" })
        return
      }
      const response = await fetch("/api/clans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClan),
      })

      if (response.ok) {
        const clan = await response.json()
        setMyClan(clan)
        setCreateDialogOpen(false)
        setNewClan({ name: "", tag: "", description: "" })
        fetchClans()
        toast({ title: "Clan Created!", description: `Welcome to ${clan.name}!` })
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create clan", variant: "destructive" })
    }
  }

  const joinClan = async (clanId: string) => {
    if (!user) {
      toast({ title: "Login Required", variant: "destructive" })
      return
    }

    try {
      const token = await getAccessToken()
      if (!token) {
        toast({ title: "Login Required", variant: "destructive" })
        return
      }
      const response = await fetch(`/api/clans/${clanId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const clan = await response.json()
        setMyClan(clan)
        fetchClans()
        toast({ title: "Joined Clan!", description: `Welcome to ${clan.name}!` })
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to join clan", variant: "destructive" })
    }
  }

  const filteredClans = clans.filter(
    (clan) =>
      clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clan.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-amber-500">Clans</h1>
            <p className="text-zinc-400 mt-2">Join forces with other players and compete together!</p>
          </div>

          {!myClan && user && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Clan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-800 border-zinc-700">
                <DialogHeader>
                  <DialogTitle className="text-amber-500">Create a New Clan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm text-zinc-400">Clan Name</label>
                    <Input
                      value={newClan.name}
                      onChange={(e) => setNewClan((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter clan name"
                      className="bg-zinc-700 border-zinc-600 mt-1"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Clan Tag (3-6 characters)</label>
                    <Input
                      value={newClan.tag}
                      onChange={(e) => setNewClan((prev) => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                      placeholder="e.g., ELITE"
                      className="bg-zinc-700 border-zinc-600 mt-1"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Description</label>
                    <Textarea
                      value={newClan.description}
                      onChange={(e) => setNewClan((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell others about your clan..."
                      className="bg-zinc-700 border-zinc-600 mt-1"
                      maxLength={500}
                    />
                  </div>
                  <Button
                    onClick={createClan}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                    disabled={!newClan.name || newClan.tag.length < 3}
                  >
                    Create Clan (1,000 coins)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* My Clan Card */}
        {myClan && (
          <Card className="bg-zinc-800 border-zinc-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-500">
                <Shield className="h-5 w-5" />
                My Clan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/clans/${myClan.id}`}>
                <div className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-500">[{myClan.tag}]</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{myClan.name}</h3>
                      <p className="text-zinc-400">
                        Level {myClan.level} • {myClan.member_count}/{myClan.max_members} members
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Trophy className="h-4 w-4" />
                      <span className="font-bold">{myClan.total_winnings.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-zinc-400">Total Winnings</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clans..."
            className="pl-10 bg-zinc-800 border-zinc-700"
          />
        </div>

        {/* Clan List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12 text-zinc-400">Loading clans...</div>
          ) : filteredClans.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              {searchQuery ? "No clans found matching your search" : "No clans yet. Be the first to create one!"}
            </div>
          ) : (
            filteredClans.map((clan) => (
              <Card key={clan.id} className="bg-zinc-800 border-zinc-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-zinc-700 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-amber-500">[{clan.tag}]</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold">{clan.name}</h3>
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            Lv. {clan.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-1">{clan.description || "No description"}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {clan.member_count}/{clan.max_members}
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {clan.total_winnings.toLocaleString()} coins
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {myClan?.id === clan.id ? (
                        <Badge className="bg-green-500">Joined</Badge>
                      ) : !myClan && clan.is_public && clan.member_count < clan.max_members ? (
                        <Button
                          size="sm"
                          onClick={() => joinClan(clan.id)}
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                        >
                          Join
                        </Button>
                      ) : clan.member_count >= clan.max_members ? (
                        <Badge variant="outline" className="border-red-500 text-red-500">
                          Full
                        </Badge>
                      ) : !clan.is_public ? (
                        <Badge variant="outline" className="border-zinc-500">
                          Invite Only
                        </Badge>
                      ) : null}
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/clans/${clan.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
