"use client"

import { Turnstile } from "@/lib/next-turnstile"

interface TurnstileWidgetProps {
  siteKey: string
  onSuccess: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

export function TurnstileWidget({ siteKey, onSuccess, onExpire, onError }: TurnstileWidgetProps) {
  return (
    <Turnstile
      siteKey={siteKey}
      onVerify={onSuccess}
      onExpire={onExpire}
      onError={() => onError?.()}
      theme="dark"
      size="flexible"
      retry="auto"
      refreshExpired="auto"
      responseField={false}
      className="min-h-[65px]"
    />
  )
}
