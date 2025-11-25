"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/database"

type UserContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("casino_token")
    if (token) {
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("casino_token")
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem("casino_token")
        setUser(null)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      localStorage.removeItem("casino_token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const { token, user: userData } = await response.json()
      localStorage.setItem("casino_token", token)
      setUser(userData)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Registration failed")
      }

      const { token, user: userData } = await response.json()
      localStorage.setItem("casino_token", token)
      setUser(userData)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("casino_token")
    setUser(null)
  }

  const updateBalance = async (amount: number) => {
    if (!user) return

    try {
      const token = localStorage.getItem("casino_token")
      const response = await fetch("/api/user/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        const { balance } = await response.json()
        setUser((prev) => (prev ? { ...prev, balance } : null))
      }
    } catch (error) {
      console.error("Error updating balance:", error)
    }
  }

  const addTransaction = async (type: string, amount: number, gameType?: string, description?: string) => {
    if (!user) return

    try {
      const token = localStorage.getItem("casino_token")
      await fetch("/api/user/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, amount, gameType, description }),
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
      const token = localStorage.getItem("casino_token")
      await fetch("/api/user/game-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameType, betAmount, winAmount, multiplier, result }),
      })

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
    } catch (error) {
      console.error("Error adding game history:", error)
    }
  }

  const addXP = async (amount: number) => {
    if (!user) return

    try {
      const token = localStorage.getItem("casino_token")
      const response = await fetch("/api/user/xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        const { xp, level } = await response.json()
        setUser((prev) => (prev ? { ...prev, xp, level } : null))
      }
    } catch (error) {
      console.error("Error adding XP:", error)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
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
