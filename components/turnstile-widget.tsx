"use client"

import { useEffect, useRef, useCallback } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          "expired-callback"?: () => void
          "error-callback"?: () => void
          theme?: "light" | "dark" | "auto"
          size?: "normal" | "compact"
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

interface TurnstileWidgetProps {
  siteKey: string
  onSuccess: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

export function TurnstileWidget({ siteKey, onSuccess, onExpire, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const renderedRef = useRef(false)

  const renderWidget = useCallback(() => {
    if (
      !containerRef.current ||
      !window.turnstile ||
      renderedRef.current
    ) {
      return
    }

    renderedRef.current = true
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onSuccess,
      "expired-callback": onExpire,
      "error-callback": onError,
      theme: "dark",
    })
  }, [onSuccess, onExpire, onError])

  useEffect(() => {
    // If turnstile is already loaded, render immediately
    if (window.turnstile) {
      renderWidget()
      return
    }

    // Otherwise wait for the script to load
    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval)
        renderWidget()
      }
    }, 100)

    return () => {
      clearInterval(interval)
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // widget may already be removed
        }
      }
      renderedRef.current = false
    }
  }, [renderWidget])

  return <div ref={containerRef} />
}

export function resetTurnstile(widgetContainerRef: React.RefObject<HTMLDivElement | null>) {
  if (widgetContainerRef.current && window.turnstile) {
    const iframe = widgetContainerRef.current.querySelector("iframe")
    if (iframe) {
      // Remove and re-render by clearing children
      widgetContainerRef.current.innerHTML = ""
    }
  }
}
