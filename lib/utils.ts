import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeUsername(username: string) {
  return username.trim().replace(/\s+/g, "_")
}

export function generateUniqueUsername(baseUsername: string) {
  const normalizedBase = normalizeUsername(baseUsername) || "Player"
  return `${normalizedBase}_${Math.random().toString(36).slice(2, 8)}`
}

export function generateGuestUsername() {
  return generateUniqueUsername("Guest")
}
