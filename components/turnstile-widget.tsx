"use client"

import { Turnstile } from "@/lib/nextjs-turnstile"

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
      onSuccess={onSuccess}
      onExpire={onExpire}
      onError={() => onError?.()}
      theme="dark"
      size="flexible"
      retry="auto"
      refreshExpired="auto"
      responseFieldName={false}
      className="min-h-[65px]"
    />
  )
}
