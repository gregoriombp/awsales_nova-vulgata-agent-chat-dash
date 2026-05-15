"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { useCommentsForUrl, useCurrentUrl } from "@/lib/bombardier-review/hooks"
import { OVERLAY_DATA_ATTR } from "./constants"
import type { ReviewMode } from "./types"

type ModeButtonProps = {
  mode: ReviewMode
  icon: string
  label: string
  shortcut?: string
}

function ModeButton({ mode, icon, label, shortcut }: ModeButtonProps) {
  const current = useReviewStore((s) => s.mode)
  const setMode = useReviewStore((s) => s.setMode)
  const active = current === mode
  return (
    <button
      type="button"
      onClick={() => setMode(mode)}
      aria-label={label}
      aria-pressed={active}
      title={shortcut ? `${label} · ${shortcut}` : label}
      className={[
        "h-8 w-8 inline-flex items-center justify-center rounded-full transition-colors",
        active
          ? "bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)]"
          : "text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]",
      ].join(" ")}
    >
      <Icon name={icon} size={16} />
    </button>
  )
}

export function ReviewToolbar() {
  const active = useReviewStore((s) => s.active)
  const identity = useReviewStore((s) => s.identity)
  const sheetOpen = useReviewStore((s) => s.sheetOpen)
  const toggleSheet = useReviewStore((s) => s.toggleSheet)
  const toggleActive = useReviewStore((s) => s.toggleActive)
  const setExportOpen = useReviewStore((s) => s.setExportOpen)

  const url = useCurrentUrl()
  const pageComments = useCommentsForUrl(url)
  const openCount = pageComments.filter((c) => c.status === "open").length

  if (!active) {
    return (
      <div
        {...{ [OVERLAY_DATA_ATTR]: "" }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <button
          type="button"
          onClick={toggleActive}
          aria-label="Abrir Review Mode (⌘⇧Y)"
          title="Review Mode · ⌘⇧Y"
          className="pointer-events-auto inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] shadow-lg hover:opacity-90 body-xs font-medium"
        >
          <Icon name="rate_review" size={14} />
          Review
        </button>
      </div>
    )
  }

  return (
    <div
      {...{ [OVERLAY_DATA_ATTR]: "" }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="pointer-events-auto rounded-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] shadow-lg px-1.5 py-1.5 flex items-center gap-1">
        {identity && (
          <span
            className="h-7 w-7 rounded-full flex items-center justify-center body-xs font-semibold text-[var(--fg-on-inverse)] mr-0.5"
            style={{ background: identity.colorToken }}
            title={`Revisor: ${identity.name}`}
          >
            {identity.name.charAt(0).toUpperCase()}
          </span>
        )}

        <span className="h-5 w-px bg-[var(--border-subtle)]" />

        <ModeButton
          mode="cursor"
          icon="arrow_selector_tool"
          label="Cursor"
        />
        <ModeButton
          mode="draw"
          icon="draw"
          label="Marcação livre"
          shortcut="⌘⇧K"
        />
        <ModeButton mode="pin" icon="location_on" label="Pino" />

        <span className="h-5 w-px bg-[var(--border-subtle)]" />

        <button
          type="button"
          onClick={toggleSheet}
          aria-label="Comentários desta tela"
          aria-pressed={sheetOpen}
          title="Comentários desta tela"
          className={[
            "h-8 inline-flex items-center gap-1 px-2 rounded-full transition-colors",
            sheetOpen
              ? "bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)]"
              : "text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]",
          ].join(" ")}
        >
          <Icon name="forum" size={16} />
          {openCount > 0 && (
            <span className="body-xs font-semibold tabular-nums">
              {openCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setExportOpen(true)}
          aria-label="Exportar comentários"
          title="Exportar JSON"
          className="h-8 w-8 inline-flex items-center justify-center rounded-full text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]"
        >
          <Icon name="ios_share" size={16} />
        </button>

        <span className="h-5 w-px bg-[var(--border-subtle)]" />

        <button
          type="button"
          onClick={toggleActive}
          aria-label="Fechar Review Mode"
          title="Fechar (⌘⇧Y)"
          className="h-8 w-8 inline-flex items-center justify-center rounded-full text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  )
}
