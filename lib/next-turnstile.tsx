"use client"

import { useCallback, useEffect, useRef } from "react"

export type TurnstileTheme = "light" | "dark" | "auto"
export type TurnstileSize = "normal" | "compact" | "flexible"
export type TurnstileRetry = "auto" | "never"
export type TurnstileRefresh = "auto" | "manual" | "never"
export type TurnstileAppearance = "always" | "execute" | "interaction-only"
export type TurnstileExecution = "render" | "execute"

export interface TurnstileProps {
  siteKey: string
  onVerify?: (token: string) => void
  onError?: (error: unknown) => void
  onExpire?: () => void
  onLoad?: () => void
  onTimeout?: () => void
  action?: string
  id?: string
  className?: string
  theme?: TurnstileTheme
  tabIndex?: number
  responseField?: boolean
  responseFieldName?: string
  size?: TurnstileSize
  retry?: TurnstileRetry
  retryInterval?: number
  refreshExpired?: TurnstileRefresh
  refreshTimeout?: TurnstileRefresh
  appearance?: TurnstileAppearance
  execution?: TurnstileExecution
  language?: string
}

export interface TurnstileValidateOptions {
  token: string
  secretKey: string
  remoteip?: string
  idempotencyKey?: string
}

export interface TurnstileValidateResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  "error-codes"?: string[]
  action?: string
  cdata?: string
}

interface TurnstileRenderOptions {
  sitekey: string
  callback?: (token: string) => void
  "error-callback"?: (error?: unknown) => void
  "expired-callback"?: () => void
  "timeout-callback"?: () => void
  theme?: TurnstileTheme
  tabindex?: number
  "response-field"?: boolean
  "response-field-name"?: string
  size?: TurnstileSize
  retry?: TurnstileRetry
  "retry-interval"?: number
  "refresh-expired"?: TurnstileRefresh
  "refresh-timeout"?: TurnstileRefresh
  appearance?: TurnstileAppearance
  execution?: TurnstileExecution
  action?: string
  language?: string
}

declare global {
  interface Window {
    onloadTurnstileCallback?: () => void
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string
      remove: (widgetId: string) => void
      reset: (widgetId: string) => void
    }
  }
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script"
const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js"

export function Turnstile({
  siteKey,
  onVerify,
  onError,
  onExpire,
  onLoad,
  onTimeout,
  action,
  id = "turnstile-widget",
  className,
  theme = "auto",
  tabIndex,
  responseField = true,
  responseFieldName = "cf-turnstile-response",
  size = "flexible",
  retry = "auto",
  retryInterval = 8000,
  refreshExpired = "auto",
  refreshTimeout = "auto",
  appearance = "always",
  execution = "render",
  language,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const cleanup = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
  }, [])

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) {
      return
    }

    cleanup()

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      "error-callback": (error?: unknown) => onError?.(error ?? new Error("Turnstile failed to render.")),
      "expired-callback": onExpire,
      "timeout-callback": onTimeout,
      theme,
      tabindex: tabIndex,
      "response-field": responseField,
      "response-field-name": responseFieldName,
      size,
      retry,
      "retry-interval": retryInterval,
      "refresh-expired": refreshExpired,
      "refresh-timeout": refreshTimeout,
      appearance,
      execution,
      action,
      language,
    })

    onLoad?.()
  }, [
    action,
    appearance,
    cleanup,
    execution,
    language,
    onError,
    onExpire,
    onLoad,
    onTimeout,
    onVerify,
    refreshExpired,
    refreshTimeout,
    responseField,
    responseFieldName,
    retry,
    retryInterval,
    siteKey,
    size,
    tabIndex,
    theme,
  ])

  useEffect(() => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null

    if (window.turnstile) {
      renderWidget()
      return cleanup
    }

    window.onloadTurnstileCallback = () => {
      renderWidget()
    }

    if (!existingScript) {
      const script = document.createElement("script")
      script.id = TURNSTILE_SCRIPT_ID
      script.src = `${TURNSTILE_SCRIPT_URL}?render=explicit&onload=onloadTurnstileCallback`
      script.async = true
      script.defer = true
      script.onerror = () => onError?.(new Error("Failed to load Cloudflare Turnstile."))
      document.head.appendChild(script)
    }

    return cleanup
  }, [cleanup, onError, renderWidget])

  return <div id={id} ref={containerRef} className={className} />
}

export async function validateTurnstileToken({
  token,
  secretKey,
  remoteip,
  idempotencyKey,
}: TurnstileValidateOptions): Promise<TurnstileValidateResponse> {
  const formData = new URLSearchParams({
    secret: secretKey,
    response: token,
  })

  if (remoteip) {
    formData.append("remoteip", remoteip)
  }

  if (idempotencyKey) {
    formData.append("idempotency_key", idempotencyKey)
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  })

  if (!response.ok) {
    throw new Error(`Turnstile verification failed with status ${response.status}.`)
  }

  return response.json()
}
