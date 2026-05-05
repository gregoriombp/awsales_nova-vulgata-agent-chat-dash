"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Icon } from "./Icon"

export type AwSheetSize = "default" | "wide"

export type AwSheetProps = {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  meta?: React.ReactNode
  tabs?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  dismissible?: boolean
  /** "default" (520px) for detail views, "wide" (1080px) for two-pane editors. */
  size?: AwSheetSize
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
  size = "default",
  onPrev,
  onNext,
}: AwSheetProps) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && onPrev) {
        e.preventDefault()
        onPrev()
      } else if (e.key === "ArrowDown" && onNext) {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onPrev, onNext])

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="aw-sheet-scrim" />
        {/* Radix Portal renders Overlay and Content as siblings; the original
         * .aw-sheet-scrim used flex justify-end to dock its child .aw-sheet
         * to the right edge. This wrapper recreates that dock without
         * touching globals.css. */}
        <div className="fixed inset-0 z-[1001] flex justify-end pointer-events-none">
          <DialogPrimitive.Content
            aria-label={typeof title === "string" ? title : "Painel lateral"}
            className={cn(
              "aw-sheet pointer-events-auto",
              `aw-sheet--${size}`
            )}
            onPointerDownOutside={(e) => {
              if (!dismissible) e.preventDefault()
            }}
            onInteractOutside={(e) => {
              if (!dismissible) e.preventDefault()
            }}
          >
            {(title || meta) && (
              <header className="aw-sheet__top">
                <div>
                  {title &&
                    (typeof title === "string" ? (
                      <DialogPrimitive.Title className="aw-sheet__title">
                        {title}
                      </DialogPrimitive.Title>
                    ) : (
                      <DialogPrimitive.Title asChild>
                        <h2 className="aw-sheet__title">{title}</h2>
                      </DialogPrimitive.Title>
                    ))}
                  {meta && <div className="aw-sheet__meta">{meta}</div>}
                </div>
                <DialogPrimitive.Close
                  className="aw-sheet__close"
                  aria-label="Fechar"
                >
                  <Icon name="close" size={18} />
                </DialogPrimitive.Close>
              </header>
            )}
            {!title && !meta && (
              <DialogPrimitive.Title className="sr-only">
                Painel lateral
              </DialogPrimitive.Title>
            )}
            {tabs && <div className="aw-sheet__tabs">{tabs}</div>}
            <div className="aw-sheet__body">{children}</div>
            {footer && <footer className="aw-sheet__foot">{footer}</footer>}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
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
      className={cn(
        "aw-sheet__tab",
        active && "aw-sheet__tab--active"
      )}
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
      <span className={cn("aw-sheet__row-v", mono && "mono")}>
        {children}
      </span>
    </div>
  )
}
