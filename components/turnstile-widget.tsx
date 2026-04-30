"use client"

import { Turnstile } from "nextjs-turnstile"

interface TurnstileWidgetProps {
  siteKey: string
  onSuccess: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

export function TurnstileWidget({
  siteKey,
  onSuccess,
  onExpire,
  onError,
}: TurnstileWidgetProps) {
  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={(token) => {
        console.log("Turnstile token:", token)
        onSuccess(token)
      }}
      onExpire={() => {
        onExpire?.()
      }}
      onError={() => {
        onError?.()
      }}
     theme="dark"
     size="flexible"
      className="min-h-[65px]"
    />
  )
}