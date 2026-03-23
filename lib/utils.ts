import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function generateRandomSlug(length: number) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")
  }

  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
}

export function generateGuestUsername() {
  return `Guest_${generateRandomSlug(12)}`
}

export function generateUniqueUsername(email: string): string {
  const base = email.split("@")[0].toLowerCase().slice(0, 15)
  const random = generateRandomSlug(6)
  return `${base}_${random}`
}

export function normalizeUsername(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30)
}
