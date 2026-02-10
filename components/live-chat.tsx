"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser } from "@/context/user-context"
import { useToast } from "@/components/ui/use-toast"
import { getAccessToken } from "@/lib/supabase/client"
import { Send, MessageCircle, X, Minimize2, Maximize2 } from "lucide-react"

interface ChatMessage {
  id: string
  user_id: string
  username: string
  message: string
  message_type: string
  created_at: string
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && !isMinimized) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen, isMinimized])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/chat?channel=global&limit=50")
      if (response.ok) {
        const data = await response.json()
        setMessages(data.reverse())
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const sendMessage = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to chat", variant: "destructive" })
      return
    }

    if (!newMessage.trim()) return

    setLoading(true)
    try {
      const token = await getAccessToken()
      if (!token) {
        toast({ title: "Login Required", description: "Please login to chat", variant: "destructive" })
        return
      }
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage, channel: "global" }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-amber-500 hover:bg-amber-600 text-black shadow-lg z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div
      className={`fixed bottom-4 right-4 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 transition-all ${
        isMinimized ? "w-72 h-14" : "w-80 h-96"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-700 bg-zinc-900 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-amber-500" />
          <span className="font-semibold text-sm">Global Chat</span>
          <span className="text-xs text-zinc-400">({messages.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-64 p-3" ref={scrollRef}>
            <div className="space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-zinc-500 text-sm py-8">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-sm ${msg.message_type === "system" ? "text-amber-500 italic" : ""}`}
                  >
                    {msg.message_type === "win_announcement" ? (
                      <div className="bg-amber-500/20 border border-amber-500/50 rounded p-2 text-amber-400">
                        🎉 {msg.message}
                      </div>
                    ) : (
                      <>
                        <span
                          className={`font-semibold ${msg.user_id === user?.id ? "text-amber-500" : "text-zinc-300"}`}
                        >
                          {msg.username}:
                        </span>{" "}
                        <span className="text-zinc-400">{msg.message}</span>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-zinc-700">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={user ? "Type a message..." : "Login to chat"}
                disabled={!user || loading}
                className="bg-zinc-700 border-zinc-600 text-sm h-8"
                maxLength={200}
              />
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={!user || loading || !newMessage.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-black h-8 px-3"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
