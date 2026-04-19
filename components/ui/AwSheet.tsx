"use client"

import * as React from "react"
import { Icon } from "./Icon"

export type AwSheetProps = {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  meta?: React.ReactNode
  tabs?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  dismissible?: boolean
  /** Hotkeys to navigate between items in the parent list (↑/↓). */
  onPrev?: () => void
  onNext?: () => void
}

export function AwSheet({
  open,
  onClose,
  title,
  meta,
  tabs,
  footer,
  children,
  dismissible = true,
  onPrev,
  onNext,
}: AwSheetProps) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key === "ArrowUp" && onPrev) {
        e.preventDefault()
        onPrev()
      } else if (e.key === "ArrowDown" && onNext) {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, onPrev, onNext])

  if (!open) return null

  return (
    <div
      className="aw-sheet-scrim"
      onClick={dismissible ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : "Painel lateral"}
    >
      <aside className="aw-sheet" onClick={(e) => e.stopPropagation()}>
        {(title || meta) && (
          <header className="aw-sheet__top">
            <div>
              {title && <h2 className="aw-sheet__title">{title}</h2>}
              {meta && <div className="aw-sheet__meta">{meta}</div>}
            </div>
            <button
              type="button"
              className="aw-sheet__close"
              aria-label="Fechar"
              onClick={onClose}
            >
              <Icon name="close" size={18} />
            </button>
          </header>
        )}
        {tabs && <div className="aw-sheet__tabs">{tabs}</div>}
        <div className="aw-sheet__body">{children}</div>
        {footer && <footer className="aw-sheet__foot">{footer}</footer>}
      </aside>
    </div>
  )
}

export function AwSheetTab({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "aw-sheet__tab",
        active && "aw-sheet__tab--active",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  )
}

export function AwSheetRow({
  label,
  children,
  mono,
}: {
  label: React.ReactNode
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="aw-sheet__row">
      <span className="aw-sheet__row-k">{label}</span>
      <span className={["aw-sheet__row-v", mono && "mono"].filter(Boolean).join(" ")}>
        {children}
      </span>
    </div>
  )
}
