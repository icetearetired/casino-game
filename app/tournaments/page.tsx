"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/context/user-context"
import { getAccessToken } from "@/lib/supabase/client"
import { DollarSign, Users, Trophy, Clock, Calendar } from "lucide-react"

interface Tournament {
  id: string
  name: string
  description: string
  game_type: string
  entry_fee: number
  prize_pool: number
  max_participants: number
  participant_count: number
  start_time: string
  end_time: string
  current_status: string
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("active")

  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    fetchTournaments()
  }, [selectedStatus])

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`/api/tournaments?status=${selectedStatus}`)
      if (response.ok) {
        const data = await response.json()
        setTournaments(data)
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error)
    } finally {
      setLoading(false)
    }
  }

  const joinTournament = async (tournamentId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to join tournaments.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = await getAccessToken()
      if (!token) {
        toast({
          title: "Login Required",
          description: "Please login to join tournaments.",
          variant: "destructive",
        })
        return
      }
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You have joined the tournament!",
          variant: "default",
          className: "bg-amber-500 text-black border-amber-600",
        })
        fetchTournaments() // Refresh tournaments
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join tournament",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-zinc-500"
      default:
        return "bg-zinc-500"
    }
  }

  const getGameTypeDisplay = (gameType: string) => {
    const gameTypes: { [key: string]: string } = {
      slots: "Slot Machine",
      crash: "Crash",
      plinko: "Plinko",
      dice: "Dice Roll",
      roulette: "Roulette",
      minesweeper: "Minesweeper",
      wheel: "Wheel of Fortune",
    }
    return gameTypes[gameType] || gameType
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading tournaments...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-500">Tournaments</h1>
        <p className="text-xl text-center mb-12 max-w-3xl mx-auto text-zinc-300">
          Compete against other players in exciting tournaments and win amazing prizes!
        </p>

        {/* Status Filter */}
        <div className="flex justify-center gap-4 mb-8">
          {["upcoming", "active", "completed"].map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              onClick={() => setSelectedStatus(status)}
              className={selectedStatus === status ? "bg-amber-500 text-black" : "border-zinc-600 text-zinc-300"}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-amber-500">{tournament.name}</CardTitle>
                  <Badge className={`${getStatusColor(tournament.current_status)} text-white`}>
                    {tournament.current_status}
                  </Badge>
                </div>
                <p className="text-zinc-300 text-sm">{tournament.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Game Type */}
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">{getGameTypeDisplay(tournament.game_type)}</span>
                </div>

                {/* Entry Fee */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">
                    Entry Fee: {tournament.entry_fee > 0 ? `${tournament.entry_fee} coins` : "Free"}
                  </span>
                </div>

                {/* Prize Pool */}
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Prize Pool: {tournament.prize_pool.toLocaleString()} coins</span>
                </div>

                {/* Participants */}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">
                    {tournament.participant_count}/{tournament.max_participants} players
                  </span>
                </div>

                {/* Timing */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Starts: {formatDate(tournament.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Ends: {formatDate(tournament.end_time)}</span>
                  </div>
                </div>

                {/* Join Button */}
                {tournament.current_status === "upcoming" && (
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
                    onClick={() => joinTournament(tournament.id)}
                    disabled={tournament.participant_count >= tournament.max_participants}
                  >
                    {tournament.participant_count >= tournament.max_participants
                      ? "Tournament Full"
                      : tournament.entry_fee > 0
                        ? `Join (${tournament.entry_fee} coins)`
                        : "Join Free"}
                  </Button>
                )}

                {tournament.current_status === "active" && (
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold" disabled>
                    In Progress
                  </Button>
                )}

                {tournament.current_status === "completed" && (
                  <Button className="w-full bg-zinc-600 text-zinc-300" disabled>
                    Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-zinc-400 mb-2">No Tournaments Found</h3>
            <p className="text-zinc-500">Check back later for new tournaments!</p>
          </div>
        )}
      </div>
    </div>
  )
}
