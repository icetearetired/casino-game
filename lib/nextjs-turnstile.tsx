"use client"

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
  style?: React.CSSProperties
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
    onloadTurnstileCallback?: () => void
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
const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js"

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
      window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
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

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onSuccess,
      "error-callback": onError,
      "expired-callback": onExpire,
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
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null

    if (!siteKey) {
      onError?.("missing-sitekey")
      return
    }

    if (window.turnstile) {
      renderWidget()
      return remove
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
      script.onerror = () => onError?.("script-load-failed")
      document.head.appendChild(script)
    }

    return remove
  }, [onError, remove, renderWidget, siteKey])

  return <div ref={containerRef} className={className} style={style} />
})
