import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from "@/context/user-context"
import LiveChat from "@/components/live-chat"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lucky Casino - Virtual Gambling Experience",
  description: "Experience the thrill of casino games with virtual currency. No real money involved.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <UserProvider>
            <Navbar />
            {children}
            <Toaster />
            <LiveChat />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
