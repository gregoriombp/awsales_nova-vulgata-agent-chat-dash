"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
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
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="aw-modal-scrim" />
        {/* Radix Portal renders Overlay and Content as siblings; the original
         * .aw-modal-scrim relied on flex centering of its child .aw-modal.
         * This wrapper recreates that centering layer without touching globals.css. */}
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-6 pointer-events-none">
          <DialogPrimitive.Content
            className={cn(
              "aw-modal pointer-events-auto",
              `aw-modal--${size}`
            )}
            onPointerDownOutside={(e) => {
              if (!dismissible) e.preventDefault()
            }}
            onInteractOutside={(e) => {
              if (!dismissible) e.preventDefault()
            }}
          >
            {title ? (
              <header className="aw-modal__head">
                <DialogPrimitive.Title className="aw-modal__title">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  className="aw-modal__close"
                  aria-label="Fechar"
                >
                  <Icon name="close" size={18} />
                </DialogPrimitive.Close>
              </header>
            ) : (
              <DialogPrimitive.Title className="sr-only">
                Modal
              </DialogPrimitive.Title>
            )}
            <div className="aw-modal__body">{children}</div>
            {footer && <footer className="aw-modal__foot">{footer}</footer>}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
