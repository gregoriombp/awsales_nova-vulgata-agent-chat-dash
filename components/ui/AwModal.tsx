"use client"

import * as React from "react"
import { Icon } from "./Icon"

export type AwModalSize = "md" | "cockpit"

export type AwModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  dismissible?: boolean
  size?: AwModalSize
}

export function AwModal({
  open,
  onClose,
  title,
  children,
  footer,
  dismissible = true,
  size = "md",
}: AwModalProps) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="aw-modal-scrim"
      onClick={dismissible ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`aw-modal aw-modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className="aw-modal__head">
            <h2 className="aw-modal__title">{title}</h2>
            <button
              type="button"
              className="aw-modal__close"
              aria-label="Fechar"
              onClick={onClose}
            >
              <Icon name="close" size={18} />
            </button>
          </header>
        )}
        <div className="aw-modal__body">{children}</div>
        {footer && <footer className="aw-modal__foot">{footer}</footer>}
      </div>
    </div>
  )
}
