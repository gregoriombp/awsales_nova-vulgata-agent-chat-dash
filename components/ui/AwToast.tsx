"use client"

import * as React from "react"
import { Icon } from "./Icon"

export type AwToastVariant = "success" | "ai" | "error" | "warning" | "info"

type ToastAction = { label: string; onClick: () => void }

export type AwToastOptions = {
  title: React.ReactNode
  description?: React.ReactNode
  variant?: AwToastVariant
  icon?: string
  /** Auto-dismiss timeout in ms. 0 keeps the toast until manually dismissed. */
  duration?: number
  action?: ToastAction
}

type ToastEntry = AwToastOptions & {
  id: number
  leaving?: boolean
}

type ToastContextValue = {
  push: (opts: AwToastOptions) => number
  dismiss: (id: number) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

const DEFAULT_ICON: Record<AwToastVariant, string> = {
  success: "check_circle",
  ai: "auto_awesome",
  error: "error",
  warning: "warning",
  info: "info",
}

/** Max 3 visible toasts at once; extras wait in the queue. */
const MAX_VISIBLE = 3

export function AwToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([])
  const idRef = React.useRef(1)

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    )
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 160)
  }, [])

  const push = React.useCallback(
    (opts: AwToastOptions) => {
      const id = idRef.current++
      const duration =
        opts.duration === undefined
          ? opts.action
            ? 8000
            : 4000
          : opts.duration
      setToasts((prev) => [...prev, { ...opts, id }])
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss]
  )

  const value = React.useMemo(() => ({ push, dismiss }), [push, dismiss])
  const visible = toasts.slice(0, MAX_VISIBLE)

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="aw-toast-stack"
        role="region"
        aria-label="Notificações"
        aria-live="polite"
      >
        {visible.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastEntry
  onDismiss: () => void
}) {
  const variant = toast.variant ?? "success"
  const glyph = toast.icon ?? DEFAULT_ICON[variant]
  const className = [
    "aw-toast",
    `aw-toast--${variant}`,
    toast.leaving && "aw-toast--leaving",
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <div className={className} role="status">
      <span className="aw-toast__icon">
        <Icon name={glyph} size={18} />
      </span>
      <div className="aw-toast__body">
        <p className="aw-toast__title">{toast.title}</p>
        {(toast.description || toast.action) && (
          <p className="aw-toast__desc">
            {toast.description}
            {toast.description && toast.action && " · "}
            {toast.action && (
              <button
                type="button"
                className="aw-toast__action"
                onClick={() => {
                  toast.action!.onClick()
                  onDismiss()
                }}
              >
                {toast.action.label}
              </button>
            )}
          </p>
        )}
      </div>
      <button
        type="button"
        className="aw-toast__close"
        aria-label="Fechar notificação"
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) {
    throw new Error(
      "useToast must be used within <AwToastProvider>. Wrap your tree in the provider at the layout root."
    )
  }
  return ctx
}
