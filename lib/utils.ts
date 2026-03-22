import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateGuestUsername() {
  return `Guest_${Math.random().toString(36).slice(2, 10)}`
}

export function generateUniqueUsername(email: string): string {
  const base = email.split("@")[0].toLowerCase().slice(0, 15)
  const random = Math.random().toString(36).slice(2, 6)
  return `${base}_${random}`
}

export function normalizeUsername(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30)
}
