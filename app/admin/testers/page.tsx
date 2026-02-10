"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { getAccessToken } from "@/lib/supabase/client"
import { Shield, Users, Infinity, Search } from "lucide-react"
import Link from "next/link"

interface TesterUser {
  id: string
  username: string
  email: string
  is_tester: boolean
  has_infinite_funds: boolean
  balance: number
  created_at: string
}

export default function AdminTestersPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [users, setUsers] = useState<TesterUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (user?.is_admin) {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      const token = await getAccessToken()
      if (!token) {
        return
      }
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTesterStatus = async (userId: string, isTester: boolean) => {
    try {
      const token = await getAccessToken()
      if (!token) {
        toast({ title: "Login Required", description: "Please login to update users.", variant: "destructive" })
        return
      }
      const response = await fetch("/api/admin/users/tester", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, isTester }),
      })

      if (response.ok) {
        fetchUsers()
        toast({
          title: isTester ? "Tester Access Granted" : "Tester Access Revoked",
          description: `User status updated successfully`,
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" })
    }
  }

  const toggleInfiniteFunds = async (userId: string, hasInfiniteFunds: boolean) => {
    try {
      const token = await getAccessToken()
      if (!token) {
        toast({ title: "Login Required", description: "Please login to update users.", variant: "destructive" })
        return
      }
      const response = await fetch("/api/admin/users/infinite-funds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, hasInfiniteFunds }),
      })

      if (response.ok) {
        fetchUsers()
        toast({
          title: hasInfiniteFunds ? "Infinite Funds Enabled" : "Infinite Funds Disabled",
          description: `User funds status updated`,
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" })
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white py-12 px-4 flex items-center justify-center">
        <Card className="bg-zinc-800 border-zinc-700 p-8 text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p className="text-zinc-400">You need admin privileges to access this page.</p>
          <Button asChild className="mt-4">
            <Link href="/">Go Home</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-zinc-400 hover:text-white">
            Admin
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-3xl font-bold text-amber-500">Tester Management</h1>
        </div>

        <Card className="bg-zinc-800 border-zinc-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Tester & Admin Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 mb-4">
              Grant tester access and infinite funds to users for testing purposes. Testers with infinite funds can play
              without balance restrictions but are hidden from public leaderboards.
            </p>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 bg-zinc-700 border-zinc-600"
              />
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-zinc-400">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">No users found</div>
              ) : (
                filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{u.username}</span>
                          {u.is_tester && <Badge className="bg-purple-500">Tester</Badge>}
                          {u.has_infinite_funds && <Badge className="bg-amber-500 text-black">Infinite Funds</Badge>}
                        </div>
                        <span className="text-sm text-zinc-400">{u.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">Tester</span>
                        <Switch
                          checked={u.is_tester}
                          onCheckedChange={(checked) => toggleTesterStatus(u.id, checked)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Infinity className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-400">Infinite</span>
                        <Switch
                          checked={u.has_infinite_funds}
                          onCheckedChange={(checked) => toggleInfiniteFunds(u.id, checked)}
                        />
                      </div>
                      <div className="text-right min-w-24">
                        <div className="text-amber-500 font-bold">
                          {u.has_infinite_funds ? "∞" : u.balance.toLocaleString()}
                        </div>
                        <div className="text-xs text-zinc-400">coins</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
