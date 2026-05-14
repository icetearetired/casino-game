'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, ChevronDown, Ban, Edit2 } from 'lucide-react'

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('balance')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(sortBy, { ascending: false })
        .limit(100)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustBalance = async (userId: string, amount: number) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const user = users.find(u => u.id === userId)
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ balance: Math.max(0, user.balance + amount) })
        .eq('id', userId)

      if (error) throw error
      
      // Refresh users list
      fetchUsers()
      setShowModal(false)
    } catch (error) {
      console.error('Error updating balance:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground placeholder-muted-foreground"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg bg-secondary text-foreground"
        >
          <option value="balance">Sort by Balance</option>
          <option value="created_at">Sort by Join Date</option>
          <option value="level">Sort by Level</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : (
        <div className="bg-secondary rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent/30">
                <th className="px-4 py-3 text-left text-foreground">Username</th>
                <th className="px-4 py-3 text-left text-foreground">Balance</th>
                <th className="px-4 py-3 text-left text-foreground">Level</th>
                <th className="px-4 py-3 text-left text-foreground">Joined</th>
                <th className="px-4 py-3 text-left text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-accent/20 hover:bg-background/50">
                  <td className="px-4 py-3 text-foreground">{user.username}</td>
                  <td className="px-4 py-3 text-accent font-semibold">${user.balance}</td>
                  <td className="px-4 py-3 text-foreground">{user.level || 1}</td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 space-x-2 flex">
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowModal(true)
                      }}
                      className="p-2 rounded hover:bg-accent/20 transition text-accent"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 rounded hover:bg-red-500/20 transition text-red-400">
                      <Ban size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-secondary p-6 rounded-lg max-w-md w-full mx-4 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Adjust Balance</h2>
            <p className="text-muted-foreground">User: {selectedUser.username}</p>
            <p className="text-foreground">Current Balance: <span className="text-accent font-semibold">${selectedUser.balance}</span></p>
            
            <div className="space-y-2">
              <button
                onClick={() => handleAdjustBalance(selectedUser.id, 1000)}
                className="w-full bg-accent text-black py-2 rounded-lg hover:bg-accent/80 transition"
              >
                + $1,000
              </button>
              <button
                onClick={() => handleAdjustBalance(selectedUser.id, -1000)}
                className="w-full bg-red-500/20 text-red-400 py-2 rounded-lg hover:bg-red-500/30 transition"
              >
                - $1,000
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-secondary border border-accent/30 text-foreground py-2 rounded-lg hover:bg-secondary/80 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
