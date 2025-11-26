"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type User = {
  id: string
  email: string
  username: string
  balance: number
  level: number
  xp: number
  total_wagered: number
  total_won: number
  total_winnings: number
  games_played: number
  is_admin: boolean
  role: string
  referral_code: string
  has_infinite_funds: boolean
  is_tester: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

type UserContextType = {
  user: User | null
  authUser: SupabaseUser | null
  balance: number
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateBalance: (amount: number) => Promise<void>
  refreshUser: () => Promise<void>
  addTransaction: (type: string, amount: number, gameType?: string, description?: string) => Promise<void>
  addGameHistory: (
    gameType: string,
    betAmount: number,
    winAmount: number,
    multiplier?: number,
    result?: any,
  ) => Promise<void>
  addXP: (amount: number) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const balance = user?.balance ?? 0

  useEffect(() => {
    const supabase = createClient()

    // Check for existing session
    supabase.auth.getUser().then(({ data: { user: authUserData } }) => {
      setAuthUser(authUserData)
      if (authUserData) {
        fetchUserProfile(authUserData.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        // If profile doesn't exist yet, wait a moment and retry (trigger may still be running)
        if (error.code === "PGRST116") {
          setTimeout(() => fetchUserProfile(userId), 1000)
          return
        }
      } else {
        setUser(data)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    if (authUser) {
      await fetchUserProfile(authUser.id)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            username: username,
          },
        },
      })

      if (error) throw error
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setAuthUser(null)
  }

  const updateBalance = async (amount: number) => {
    if (!user) return

    try {
      const supabase = createClient()
      const newBalance = user.balance + amount

      const { error } = await supabase
        .from("users")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      if (!error) {
        setUser((prev) => (prev ? { ...prev, balance: newBalance } : null))
      }
    } catch (error) {
      console.error("Error updating balance:", error)
    }
  }

  const addTransaction = async (type: string, amount: number, gameType?: string, description?: string) => {
    if (!user) return

    try {
      const supabase = createClient()
      await supabase.from("transactions").insert({
        user_id: user.id,
        type,
        amount,
        game_type: gameType,
        description,
      })
    } catch (error) {
      console.error("Error adding transaction:", error)
    }
  }

  const addGameHistory = async (
    gameType: string,
    betAmount: number,
    winAmount: number,
    multiplier?: number,
    result?: any,
  ) => {
    if (!user) return

    try {
      const supabase = createClient()

      // Add to game history
      await supabase.from("game_history").insert({
        user_id: user.id,
        game_type: gameType,
        bet_amount: betAmount,
        win_amount: winAmount,
        multiplier: multiplier || 0,
        result: result || {},
      })

      // Update user stats
      const { error } = await supabase
        .from("users")
        .update({
          games_played: user.games_played + 1,
          total_wagered: user.total_wagered + betAmount,
          total_won: user.total_won + winAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (!error) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                games_played: prev.games_played + 1,
                total_wagered: prev.total_wagered + betAmount,
                total_won: prev.total_won + winAmount,
              }
            : null,
        )
      }
    } catch (error) {
      console.error("Error adding game history:", error)
    }
  }

  const addXP = async (amount: number) => {
    if (!user) return

    try {
      const supabase = createClient()
      const newXP = user.xp + amount
      const xpPerLevel = 1000
      const newLevel = Math.floor(newXP / xpPerLevel) + 1

      const { error } = await supabase
        .from("users")
        .update({
          xp: newXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (!error) {
        setUser((prev) => (prev ? { ...prev, xp: newXP, level: newLevel } : null))
      }
    } catch (error) {
      console.error("Error adding XP:", error)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        authUser,
        balance,
        isLoading,
        login,
        register,
        logout,
        updateBalance,
        refreshUser,
        addTransaction,
        addGameHistory,
        addXP,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
