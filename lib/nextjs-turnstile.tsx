"use client"

import type { CSSProperties } from "react"
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react"

export type TurnstileTheme = "light" | "dark" | "auto"
export type TurnstileSize = "normal" | "compact" | "flexible"
export type TurnstileRetry = "auto" | "never"
export type TurnstileRefresh = "auto" | "manual" | "never"
export type TurnstileAppearance = "always" | "execute" | "interaction-only"
export type TurnstileExecution = "render" | "execute"

export interface TurnstileRef {
  reset: () => void
  remove: () => void
  getResponse: () => string | null
  execute: () => void
  isReady: () => boolean
  getWidgetId: () => string | null
}

export interface TurnstileProps {
  siteKey?: string
  theme?: TurnstileTheme
  size?: TurnstileSize
  appearance?: TurnstileAppearance
  execution?: TurnstileExecution
  refreshExpired?: TurnstileRefresh
  refreshTimeout?: TurnstileRefresh
  retry?: TurnstileRetry
  retryInterval?: number
  responseFieldName?: string | false
  action?: string
  cData?: string
  tabIndex?: number
  language?: string
  className?: string
  style?: CSSProperties
  feedbackEnabled?: boolean
  onSuccess?: (token: string) => void
  onError?: (code?: string) => void
  onExpire?: () => void
  onTimeout?: () => void
  onLoad?: () => void
  onBeforeInteractive?: () => void
  onAfterInteractive?: () => void
  onUnsupported?: () => void
}

interface TurnstileRenderOptions {
  sitekey: string
  callback?: (token: string) => void
  "error-callback"?: (code?: string) => void
  "expired-callback"?: () => void
  "timeout-callback"?: () => void
  "before-interactive-callback"?: () => void
  "after-interactive-callback"?: () => void
  "unsupported-callback"?: () => void
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
  cData?: string
  language?: string
  feedbackEnabled?: boolean
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string
      remove: (widgetId: string) => void
      reset: (widgetId: string) => void
      getResponse: (widgetId: string) => string
      execute: (widgetId: string) => void
    }
  }
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script"
const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
const TOKEN_TTL_MS = 5 * 60 * 1000
const tokenIssuedAt = new Map<string, number>()
let scriptLoadPromise: Promise<void> | null = null

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

export function isTurnstileLoaded(): boolean {
  return isBrowser() && typeof window.turnstile !== "undefined"
}

export function loadTurnstileScript(): Promise<void> {
  if (!isBrowser()) {
    return Promise.resolve()
  }

  if (isTurnstileLoaded()) {
    return Promise.resolve()
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise
  }

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null

    const handleLoad = () => {
      scriptLoadPromise = null
      resolve()
    }

    const handleError = () => {
      scriptLoadPromise = null
      reject(new Error("Failed to load Cloudflare Turnstile."))
    }

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true })
      existingScript.addEventListener("error", handleError, { once: true })
      return
    }

    const script = document.createElement("script")
    script.id = TURNSTILE_SCRIPT_ID
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.addEventListener("load", handleLoad, { once: true })
    script.addEventListener("error", handleError, { once: true })
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export function renderTurnstile(container: HTMLElement, options: TurnstileRenderOptions): string {
  if (!isTurnstileLoaded() || !window.turnstile) {
    throw new Error("Cloudflare Turnstile is not loaded.")
  }

  return window.turnstile.render(container, options)
}

export function resetTurnstile(widgetRef?: TurnstileRef | null): void {
  widgetRef?.reset()
}

export function removeTurnstile(widgetRef?: TurnstileRef | null): void {
  const widgetId = widgetRef?.getWidgetId()
  if (widgetId) {
    tokenIssuedAt.delete(widgetId)
  }
  widgetRef?.remove()
}

export function getTurnstileResponse(widgetRef?: TurnstileRef | null): string | null {
  return widgetRef?.getResponse() ?? null
}

export function executeTurnstile(widgetRef?: TurnstileRef | null): void {
  widgetRef?.execute()
}

export function isTokenExpired(widgetRef?: TurnstileRef | null): boolean {
  const widgetId = widgetRef?.getWidgetId()
  if (!widgetId) {
    return true
  }

  const issuedAt = tokenIssuedAt.get(widgetId)
  if (!issuedAt) {
    return true
  }

  return Date.now() - issuedAt > TOKEN_TTL_MS
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(function Turnstile(
  {
    siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    theme = "auto",
    size = "flexible",
    appearance = "always",
    execution = "render",
    refreshExpired = "auto",
    refreshTimeout = "auto",
    retry = "auto",
    retryInterval = 8000,
    responseFieldName = "cf-turnstile-response",
    action,
    cData,
    tabIndex = 0,
    language = "auto",
    className,
    style,
    feedbackEnabled = true,
    onSuccess,
    onError,
    onExpire,
    onTimeout,
    onLoad,
    onBeforeInteractive,
    onAfterInteractive,
    onUnsupported,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const remove = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      tokenIssuedAt.delete(widgetIdRef.current)
      window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      tokenIssuedAt.delete(widgetIdRef.current)
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [])

  const execute = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.execute(widgetIdRef.current)
    }
  }, [])

  const getResponse = useCallback(() => {
    if (!widgetIdRef.current || !window.turnstile) {
      return null
    }

    return window.turnstile.getResponse(widgetIdRef.current) || null
  }, [])

  const isReady = useCallback(() => widgetIdRef.current !== null, [])
  const getWidgetId = useCallback(() => widgetIdRef.current, [])

  useImperativeHandle(
    ref,
    () => ({
      reset,
      remove,
      getResponse,
      execute,
      isReady,
      getWidgetId,
    }),
    [execute, getResponse, getWidgetId, isReady, remove, reset]
  )

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) {
      return
    }

    remove()

    widgetIdRef.current = renderTurnstile(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => {
        if (widgetIdRef.current) {
          tokenIssuedAt.set(widgetIdRef.current, Date.now())
        }
        onSuccess?.(token)
      },
      "error-callback": onError,
      "expired-callback": () => {
        if (widgetIdRef.current) {
          tokenIssuedAt.delete(widgetIdRef.current)
        }
        onExpire?.()
      },
      "timeout-callback": onTimeout,
      "before-interactive-callback": onBeforeInteractive,
      "after-interactive-callback": onAfterInteractive,
      "unsupported-callback": onUnsupported,
      theme,
      tabindex: tabIndex,
      "response-field": responseFieldName !== false,
      "response-field-name": responseFieldName === false ? undefined : responseFieldName,
      size,
      retry,
      "retry-interval": retryInterval,
      "refresh-expired": refreshExpired,
      "refresh-timeout": refreshTimeout,
      appearance,
      execution,
      action,
      cData,
      language,
      feedbackEnabled,
    })

    onLoad?.()
  }, [
    action,
    appearance,
    cData,
    execution,
    feedbackEnabled,
    language,
    onAfterInteractive,
    onBeforeInteractive,
    onError,
    onExpire,
    onLoad,
    onSuccess,
    onTimeout,
    onUnsupported,
    refreshExpired,
    refreshTimeout,
    remove,
    responseFieldName,
    retry,
    retryInterval,
    siteKey,
    size,
    tabIndex,
    theme,
  ])

  useEffect(() => {
    if (!siteKey) {
      onError?.("missing-sitekey")
      return
    }

    if (isTurnstileLoaded()) {
      renderWidget()
      return remove
    }

    loadTurnstileScript()
      .then(renderWidget)
      .catch(() => onError?.("script-load-failed"))

    return remove
  }, [onError, remove, renderWidget, siteKey])

  return <div ref={containerRef} className={className} style={style} />
})
