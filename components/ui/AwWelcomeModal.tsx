"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Icon } from "./Icon"

/**
 * AwWelcomeModal — celebratory welcome dialog used at the end of the
 * primeiro-acesso flow (and other one-shot "you're in" moments).
 *
 * Anatomy:
 *   [hero image] (bleeds to top edges, rounded with the modal)
 *   [eyebrow?]
 *   [title]
 *   [description?]
 *   [actions ...]   ← tile rows (icon + label + helper + chevron)
 *   [footnote?]
 *
 * Wraps the shadcn `Dialog` primitive (Radix). Tokens come from the project
 * foundation — never hardcoded colors or sizes.
 */

export type AwWelcomeModalAction = {
  id: string
  label: string
  description?: React.ReactNode
  /** Material Symbol icon name shown on the leading slot. */
  icon?: string
  /** Highlights the action as the recommended path. Default false. */
  primary?: boolean
  /** Soft-disable: still visible, marked as "em breve". */
  comingSoon?: boolean
  onClick: () => void
}

export type AwWelcomeModalProps = {
  open: boolean
  onClose: () => void
  /** Hero image source. Required — the modal is image-led. */
  imageSrc: string
  imageAlt?: string
  /** Small uppercase label above the title (optional). */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions: AwWelcomeModalAction[]
  /** Auxiliary line below the actions (e.g. "Você pode revisitar...") */
  footnote?: React.ReactNode
  /** Allow scrim-click / esc dismiss. Default true. */
  dismissible?: boolean
}

export function AwWelcomeModal({
  open,
  onClose,
  imageSrc,
  imageAlt = "",
  eyebrow,
  title,
  description,
  actions,
  footnote,
  dismissible = true,
}: AwWelcomeModalProps) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="aw-modal-scrim" />
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
          <DialogPrimitive.Content
            data-slot="welcome-modal"
            className={cn(
              "pointer-events-auto w-full max-w-[480px]",
              "flex flex-col overflow-hidden",
              "rounded-[var(--radius-xl)] bg-[var(--bg-raised)]",
              "shadow-[var(--shadow-overlay)]",
              "animate-[aw-modal-in_180ms_var(--ease-out)]",
            )}
            onPointerDownOutside={(e) => {
              if (!dismissible) e.preventDefault()
            }}
            onInteractOutside={(e) => {
              if (!dismissible) e.preventDefault()
            }}
          >
            <div className="relative">
              {/* Hero image — bleeds to top corners */}
              <div className="relative h-[200px] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[var(--bg-raised)]" />
              </div>

              {dismissible ? (
                <DialogPrimitive.Close
                  className={cn(
                    "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center",
                    "rounded-full bg-[var(--bg-raised)]/85 text-[var(--fg-primary)]",
                    "backdrop-blur-sm transition-colors duration-aw-fast",
                    "hover:bg-[var(--bg-raised)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brand)] focus-visible:ring-offset-2",
                  )}
                  aria-label="Fechar"
                >
                  <Icon name="close" size={16} />
                </DialogPrimitive.Close>
              ) : null}
            </div>

            <div className="flex flex-col gap-5 px-7 pb-7 pt-1">
              <div className="flex flex-col gap-2">
                {eyebrow ? (
                  <span className="aw-eyebrow text-[var(--fg-tertiary)]">
                    {eyebrow}
                  </span>
                ) : null}
                <DialogPrimitive.Title asChild>
                  <h4 className="m-0 text-balance text-[var(--fg-primary)]">
                    {title}
                  </h4>
                </DialogPrimitive.Title>
                {description ? (
                  <DialogPrimitive.Description asChild>
                    <p className="m-0 body-sm text-pretty text-[var(--fg-secondary)]">
                      {description}
                    </p>
                  </DialogPrimitive.Description>
                ) : (
                  <DialogPrimitive.Description className="sr-only">
                    Modal de boas-vindas
                  </DialogPrimitive.Description>
                )}
              </div>

              {actions.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {actions.map((action) => (
                    <li key={action.id}>
                      <ActionTile action={action} />
                    </li>
                  ))}
                </ul>
              ) : null}

              {footnote ? (
                <p className="m-0 body-xs text-center text-[var(--fg-tertiary)]">
                  {footnote}
                </p>
              ) : null}
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function ActionTile({ action }: { action: AwWelcomeModalAction }) {
  const { label, description, icon, primary, comingSoon, onClick } = action
  return (
    <button
      type="button"
      onClick={onClick}
      data-primary={primary || undefined}
      data-coming-soon={comingSoon || undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-3.5 py-3 text-left",
        "border border-[var(--border-subtle)] bg-[var(--bg-raised)]",
        "transition-all duration-aw-fast",
        "hover:border-[var(--border)] hover:bg-[var(--bg-surface)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brand)] focus-visible:ring-offset-2",
        // Primary tone — solid surface, inverted text
        "data-[primary=true]:border-[var(--fg-primary)] data-[primary=true]:bg-[var(--fg-primary)]",
        "data-[primary=true]:text-[var(--bg-raised)]",
        "data-[primary=true]:hover:bg-[var(--fg-primary)] data-[primary=true]:hover:opacity-90",
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            "bg-[var(--bg-surface)] text-[var(--fg-primary)]",
            "group-data-[primary=true]:bg-[var(--bg-raised)]/15 group-data-[primary=true]:text-[var(--bg-raised)]",
          )}
        >
          <Icon name={icon} size={18} />
        </span>
      ) : null}

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2">
          <span className="body-sm font-medium text-[var(--fg-primary)] group-data-[primary=true]:text-[var(--bg-raised)]">
            {label}
          </span>
          {comingSoon ? (
            <span
              className={cn(
                "aw-eyebrow inline-flex items-center rounded-full px-1.5 py-px",
                "bg-[var(--bg-surface)] text-[var(--fg-tertiary)]",
                "group-data-[primary=true]:bg-[var(--bg-raised)]/15 group-data-[primary=true]:text-[var(--bg-raised)]/80",
              )}
            >
              em breve
            </span>
          ) : null}
        </span>
        {description ? (
          <span className="body-xs text-[var(--fg-secondary)] group-data-[primary=true]:text-[var(--bg-raised)]/80">
            {description}
          </span>
        ) : null}
      </span>

      <Icon
        name="chevron_right"
        size={18}
        className={cn(
          "shrink-0 text-[var(--fg-tertiary)] transition-transform duration-aw-fast",
          "group-hover:translate-x-0.5",
          "group-data-[primary=true]:text-[var(--bg-raised)]",
        )}
      />
    </button>
  )
}
