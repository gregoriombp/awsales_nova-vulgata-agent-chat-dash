"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import type { PageEditOp } from "@/lib/bombardier-edit/types"
import { EDIT_OVERLAY_DATA_ATTR, EDIT_Z } from "./constants"

// Route-scoped list of overlay ops (open + in_review). Product pages have no
// host to put an inbox in, so the provider renders this docked panel. Greg
// removes open edits here; in_review edits (claimed by the materialization
// agent) get an approve/reject pair — same lifecycle as Review Mode.

const TYPE_ICON: Record<PageEditOp["type"], string> = {
  text: "text_fields",
  style: "palette",
  hide: "visibility_off",
}

function describe(op: PageEditOp): string {
  const p = op.payload
  if (p.kind === "text") return `“${p.text}”`
  if (p.kind === "style") {
    const token = p.token.replace(/^var\((--[^)]+)\)$/, "$1")
    return `${p.prop}: ${token}`
  }
  return p.mode === "remove" ? "Deletado" : "Oculto"
}

const STATUS_LABEL: Record<PageEditOp["status"], string> = {
  open: "aberta",
  in_review: "em revisão",
  applied: "aplicada",
  discarded: "descartada",
}

const STATUS_COLOR: Record<PageEditOp["status"], string> = {
  open: "var(--accent-warning)",
  in_review: "var(--accent-brand)",
  applied: "var(--accent-success)",
  discarded: "var(--fg-tertiary)",
}

export function EditInbox({
  ops,
  onFocus,
  onApprove,
  onReject,
  onRemove,
  onClose,
}: {
  ops: PageEditOp[]
  onFocus: (op: PageEditOp) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onRemove: (id: string) => void
  onClose: () => void
}) {
  return (
    <aside
      {...{ [EDIT_OVERLAY_DATA_ATTR]: "inbox" }}
      className="fixed left-4 top-4 bottom-4 flex w-[300px] flex-col overflow-hidden rounded-(--radius-lg) border border-(--border-default) bg-(--bg-raised) shadow-(--shadow-lg)"
      style={{ zIndex: EDIT_Z.inbox }}
    >
      <header className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-3">
        <span className="text-(--body-sm-size) font-medium text-(--fg-primary)">
          Edições desta página
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-7 w-7 items-center justify-center rounded-(--radius-sm) text-(--fg-tertiary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
        >
          <Icon name="close" size={18} />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
        {ops.length === 0 && (
          <p className="px-1 py-6 text-center text-(--body-sm-size) text-(--fg-tertiary)">
            Nenhuma edição ainda. Selecione um elemento e comece.
          </p>
        )}
        {ops.map((op) => (
          <div
            key={op.id}
            className="flex flex-col gap-2 rounded-(--radius-md) border border-(--border-subtle) bg-(--bg-canvas) p-3"
          >
            <button
              type="button"
              onClick={() => onFocus(op)}
              className="flex items-start gap-2 text-left"
            >
              <Icon
                name={TYPE_ICON[op.type]}
                size={18}
                className="mt-0.5 shrink-0 text-(--fg-secondary)"
              />
              <span className="min-w-0 flex-1 truncate text-(--body-sm-size) text-(--fg-primary)">
                {describe(op)}
              </span>
            </button>
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-1.5 text-(--body-xs-size)"
                style={{ color: STATUS_COLOR[op.status] }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: STATUS_COLOR[op.status] }}
                />
                {STATUS_LABEL[op.status]}
              </span>
              <div className="flex items-center gap-1">
                {op.status === "in_review" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onApprove(op.id)}
                      className="rounded-(--radius-sm) px-2 py-1 text-(--body-xs-size) text-(--accent-success) hover:bg-(--bg-hover)"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(op.id)}
                      className="rounded-(--radius-sm) px-2 py-1 text-(--body-xs-size) text-(--fg-secondary) hover:bg-(--bg-hover)"
                    >
                      Rejeitar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => onRemove(op.id)}
                    className="rounded-(--radius-sm) px-2 py-1 text-(--body-xs-size) text-(--fg-secondary) hover:bg-(--bg-hover)"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
