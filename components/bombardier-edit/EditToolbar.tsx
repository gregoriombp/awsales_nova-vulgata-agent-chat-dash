"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { EDIT_OVERLAY_DATA_ATTR, EDIT_Z } from "./constants"

// Bottom-center pill — the persistent chrome of Edit Mode. Mirrors the place of
// the review toolbar (the two never show together).

export function EditToolbar({
  opsCount,
  inboxOpen,
  onToggleInbox,
  onExit,
}: {
  opsCount: number
  inboxOpen: boolean
  onToggleInbox: () => void
  onExit: () => void
}) {
  return (
    <div
      {...{ [EDIT_OVERLAY_DATA_ATTR]: "toolbar" }}
      className="fixed bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-(--radius-full) border border-(--border-default) bg-(--bg-raised) px-2 py-1.5 shadow-(--shadow-lg)"
      style={{ zIndex: EDIT_Z.toolbar }}
    >
      <span className="flex items-center gap-1.5 px-2 text-(--body-sm-size) font-medium text-(--fg-primary)">
        <Icon name="edit" size={16} className="text-(--accent-brand)" />
        Edição
      </span>
      <span className="text-(--body-xs-size) text-(--fg-tertiary)">
        salvo automático
      </span>
      <span className="mx-1 h-5 w-px bg-(--border-subtle)" aria-hidden />
      <button
        type="button"
        onClick={onToggleInbox}
        aria-pressed={inboxOpen}
        className="flex items-center gap-1.5 rounded-(--radius-full) px-2.5 py-1.5 text-(--body-sm-size) text-(--fg-secondary) transition-colors hover:bg-(--bg-hover) aria-pressed:bg-(--bg-selected) aria-pressed:text-(--fg-primary)"
      >
        <Icon name="inbox" size={18} />
        {opsCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-(--radius-full) bg-(--accent-brand) px-1 text-(--body-xs-size) text-(--fg-on-inverse)">
            {opsCount}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onExit}
        className="flex items-center gap-1.5 rounded-(--radius-full) px-2.5 py-1.5 text-(--body-sm-size) text-(--fg-secondary) transition-colors hover:bg-(--bg-hover)"
      >
        <Icon name="close" size={18} />
        Sair
      </button>
    </div>
  )
}
