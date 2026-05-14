'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { BarChart3, TrendingUp, Users } from 'lucide-react'

interface GameStats {
  game_type: string
  games_played: number
  total_wagered: number
  total_won: number
  total_lost: number
  average_bet: number
}

export default function GameManagementPage() {
  const [games, setGames] = useState<GameStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalToday, setTotalToday] = useState(0)

  useEffect(() => {
    fetchGameStats()
  }, [])

  const fetchGameStats = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase
        .from('game_history')
        .select('game_type, bet_amount, win_amount')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      // Process stats by game type
      const statsMap = new Map<string, GameStats>()

      data?.forEach(record => {
        const type = record.game_type
        if (!statsMap.has(type)) {
          statsMap.set(type, {
            game_type: type,
            games_played: 0,
            total_wagered: 0,
            total_won: 0,
            total_lost: 0,
            average_bet: 0,
          })
        }

        const stat = statsMap.get(type)!
        stat.games_played++
        stat.total_wagered += record.bet_amount || 0
        stat.total_won += record.win_amount || 0
        stat.total_lost += (record.bet_amount || 0) - (record.win_amount || 0)
      })

      const gamesList = Array.from(statsMap.values())
      gamesList.forEach(g => {
        g.average_bet = g.total_wagered / Math.max(1, g.games_played)
      })

      setGames(gamesList)
      setTotalToday(gamesList.length)
    } catch (error) {
      console.error('Error fetching game stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Game Management</h1>
        <p className="text-muted-foreground">Monitor and manage game statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-secondary p-6 rounded-lg border border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Games (30 days)</p>
              <p className="text-3xl font-bold text-accent">
                {games.reduce((sum, g) => sum + g.games_played, 0).toLocaleString()}
              </p>
            </div>
            <BarChart3 className="text-accent" size={32} />
          </div>
        </div>

        <div className="bg-secondary p-6 rounded-lg border border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Wagered</p>
              <p className="text-3xl font-bold text-accent">
                ${games.reduce((sum, g) => sum + g.total_wagered, 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="text-accent" size={32} />
          </div>
        </div>

        <div className="bg-secondary p-6 rounded-lg border border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">House Edge</p>
              <p className="text-3xl font-bold text-accent">
                {(
                  (games.reduce((sum, g) => sum + g.total_lost, 0) /
                  Math.max(1, games.reduce((sum, g) => sum + g.total_wagered, 0))) *
                  100
                ).toFixed(1)}%
              </p>
            </div>
            <Users className="text-accent" size={32} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading game statistics...</p>
        </div>
      ) : (
        <div className="bg-secondary rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent/30">
                <th className="px-4 py-3 text-left text-foreground">Game Type</th>
                <th className="px-4 py-3 text-left text-foreground">Games Played</th>
                <th className="px-4 py-3 text-left text-foreground">Total Wagered</th>
                <th className="px-4 py-3 text-left text-foreground">Total Won</th>
                <th className="px-4 py-3 text-left text-foreground">Avg Bet</th>
                <th className="px-4 py-3 text-left text-foreground">House Win</th>
              </tr>
            </thead>
            <tbody>
              {games.map(game => (
                <tr key={game.game_type} className="border-b border-accent/20 hover:bg-background/50">
                  <td className="px-4 py-3 text-foreground capitalize font-semibold">{game.game_type}</td>
                  <td className="px-4 py-3 text-foreground">{game.games_played.toLocaleString()}</td>
                  <td className="px-4 py-3 text-accent">${game.total_wagered.toLocaleString()}</td>
                  <td className="px-4 py-3 text-foreground">${game.total_won.toLocaleString()}</td>
                  <td className="px-4 py-3 text-foreground">${game.average_bet.toFixed(2)}</td>
                  <td className="px-4 py-3 text-green-400">${game.total_lost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
