import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateGuestUsername() {
  return `Guest_${Math.random().toString(36).slice(2, 10)}`
}
