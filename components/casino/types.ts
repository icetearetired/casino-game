import { LucideIcon } from "lucide-react"

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  href: string
  badge?: string
}

export type ActivityItem = {
  id: string
  user: string
  action: string
  amount: string
  positive?: boolean
}

export type Category = {
  id: string
  label: string
  active?: boolean
}

export type Game = {
  id: string
  title: string
  subtitle: string
  players: string
  colorClass: string
}
