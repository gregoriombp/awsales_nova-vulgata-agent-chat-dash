"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { STYLE_PROPERTIES } from "@/lib/bombardier-edit/token-manifest"
import {
  findEditableTextLeaf,
  resolveEditElement,
} from "@/lib/bombardier-edit/anchor"
import type { PageEditAnchor, PageEditOp } from "@/lib/bombardier-edit/types"
import { EDIT_OVERLAY_DATA_ATTR, EDIT_Z } from "./constants"
import { StyleTokenPicker } from "./StyleTokenPicker"

// Right-docked properties panel for the selected element. Hosts the three MVP
// ops: edit text (delegated to the provider, which owns the contentEditable
// dance), retoken style, hide. Token-only by construction.

export function EditInspector({
  anchor,
  ops,
  onRequestText,
  onPickStyle,
  onClearStyle,
  onHide,
  onClose,
}: {
  anchor: PageEditAnchor
  ops: PageEditOp[]
  onRequestText: (anchor: PageEditAnchor) => void
  onPickStyle: (anchor: PageEditAnchor, prop: string, cssValue: string) => void
  onClearStyle: (anchor: PageEditAnchor, prop: string) => void
  onHide: (anchor: PageEditAnchor, mode: "hide" | "remove") => void
  onClose: () => void
}) {
  const { label, canEditText } = React.useMemo(() => {
    const el = resolveEditElement(anchor)
    if (!el) return { label: anchor.component ?? "Elemento", canEditText: false }
    const name = anchor.component ?? el.tagName.toLowerCase()
    return { label: name, canEditText: !!findEditableTextLeaf(el) }
    // selector identity is enough to re-resolve; recompute when it changes.
  }, [anchor])

  const activeStyle = React.useMemo(() => {
    const map: Record<string, string> = {}
    for (const op of ops) {
      if (op.payload.kind === "style" && op.anchor.selector === anchor.selector) {
        map[op.payload.prop] = op.payload.token
      }
    }
    return map
  }, [ops, anchor.selector])

  return (
    <aside
      {...{ [EDIT_OVERLAY_DATA_ATTR]: "inspector" }}
      className="fixed right-4 top-4 bottom-4 flex w-[300px] flex-col overflow-hidden rounded-(--radius-lg) border border-(--border-default) bg-(--bg-raised) shadow-(--shadow-lg)"
      style={{ zIndex: EDIT_Z.inspector }}
    >
      <header className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon name="edit" size={18} className="text-(--fg-secondary)" />
          <span className="truncate text-(--body-sm-size) font-medium text-(--fg-primary)">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar inspetor"
          className="flex h-7 w-7 items-center justify-center rounded-(--radius-sm) text-(--fg-tertiary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
        >
          <Icon name="close" size={18} />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        {/* Texto */}
        <section className="flex flex-col gap-2">
          <h3 className="text-(--body-xs-size) font-semibold uppercase tracking-wide text-(--fg-tertiary)">
            Conteúdo
          </h3>
          <button
            type="button"
            disabled={!canEditText}
            onClick={() => onRequestText(anchor)}
            className="flex items-center gap-2 rounded-(--radius-sm) border border-(--border-default) px-3 py-2 text-left text-(--body-sm-size) text-(--fg-primary) transition-colors hover:bg-(--bg-hover) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="text_fields" size={18} className="text-(--fg-secondary)" />
            <span>{canEditText ? "Editar texto" : "Texto não editável aqui"}</span>
          </button>
          {!canEditText && (
            <p className="text-(--body-xs-size) text-(--fg-tertiary)">
              Selecione um elemento de texto simples (sem filhos aninhados).
            </p>
          )}
        </section>

        {/* Estilo */}
        <section className="flex flex-col gap-3">
          <h3 className="text-(--body-xs-size) font-semibold uppercase tracking-wide text-(--fg-tertiary)">
            Estilo · tokens
          </h3>
          {STYLE_PROPERTIES.map((property) => (
            <StyleTokenPicker
              key={property.prop}
              property={property}
              activeValue={activeStyle[property.prop]}
              onPick={(prop, cssValue) => onPickStyle(anchor, prop, cssValue)}
              onClear={(prop) => onClearStyle(anchor, prop)}
            />
          ))}
        </section>

        {/* Visibilidade */}
        <section className="flex flex-col gap-2">
          <h3 className="text-(--body-xs-size) font-semibold uppercase tracking-wide text-(--fg-tertiary)">
            Visibilidade
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onHide(anchor, "hide")}
              className="flex flex-1 items-center justify-center gap-2 rounded-(--radius-sm) border border-(--border-default) px-3 py-2 text-(--body-sm-size) text-(--fg-primary) transition-colors hover:bg-(--bg-hover)"
            >
              <Icon name="visibility_off" size={18} className="text-(--fg-secondary)" />
              Ocultar
            </button>
            <button
              type="button"
              onClick={() => onHide(anchor, "remove")}
              className="flex flex-1 items-center justify-center gap-2 rounded-(--radius-sm) border border-(--border-default) px-3 py-2 text-(--body-sm-size) text-(--accent-danger) transition-colors hover:bg-(--bg-hover)"
            >
              <Icon name="delete" size={18} />
              Deletar
            </button>
          </div>
          <p className="text-(--body-xs-size) text-(--fg-tertiary)">
            &quot;Deletar&quot; só remove visualmente; o componente sai do código
            na materialização.
          </p>
        </section>
      </div>
    </aside>
  )
}
