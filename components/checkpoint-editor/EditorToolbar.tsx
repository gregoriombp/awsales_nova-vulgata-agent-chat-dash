"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { Icon } from "@/components/ui/Icon"
import type { PlateCheckpointEditorHandle } from "./PlateCheckpointEditor"

type ToolbarButtonProps = {
  icon: string
  label: string
  onClick: () => void
  active?: boolean
}

function ToolbarButton({ icon, label, onClick, active }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={
        "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors " +
        (active
          ? "bg-bg-muted text-fg-primary"
          : "text-fg-secondary hover:bg-bg-muted hover:text-fg-primary")
      }
    >
      <Icon name={icon} size={16} />
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border-subtle" />
}

export type EditorToolbarProps = {
  editorRef: React.RefObject<PlateCheckpointEditorHandle | null>
  onSave: () => void
  saving?: boolean
}

export function EditorToolbar({ editorRef, onSave, saving }: EditorToolbarProps) {
  const run = (fn: (handle: PlateCheckpointEditorHandle) => void) => () => {
    const handle = editorRef.current
    if (handle) fn(handle)
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border-subtle bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <ToolbarButton
        icon="format_bold"
        label="Negrito"
        onClick={run((h) => h.toggleMark("bold"))}
      />
      <ToolbarButton
        icon="format_italic"
        label="Itálico"
        onClick={run((h) => h.toggleMark("italic"))}
      />
      <Divider />
      <ToolbarButton
        icon="format_h1"
        label="Título 1"
        onClick={run((h) => h.setBlock("h1"))}
      />
      <ToolbarButton
        icon="format_h2"
        label="Título 2"
        onClick={run((h) => h.setBlock("h2"))}
      />
      <ToolbarButton
        icon="format_h3"
        label="Título 3"
        onClick={run((h) => h.setBlock("h3"))}
      />
      <Divider />
      <ToolbarButton
        icon="format_align_left"
        label="Alinhar à esquerda"
        onClick={run((h) => h.insertText(""))}
      />
      <ToolbarButton
        icon="format_align_center"
        label="Centralizar"
        onClick={run((h) => h.insertText(""))}
      />
      <ToolbarButton
        icon="format_align_right"
        label="Alinhar à direita"
        onClick={run((h) => h.insertText(""))}
      />
      <Divider />
      <ToolbarButton
        icon="link"
        label="Link"
        onClick={run((h) => h.insertText(""))}
      />
      <ToolbarButton
        icon="format_list_bulleted"
        label="Lista"
        onClick={run((h) => h.toggleList("ul"))}
      />
      <ToolbarButton
        icon="format_list_numbered"
        label="Lista numerada"
        onClick={run((h) => h.toggleList("ol"))}
      />
      <Divider />
      <ToolbarButton
        icon="code"
        label="Código"
        onClick={run((h) => h.toggleMark("code"))}
      />
      <ToolbarButton
        icon="alternate_email"
        label="Mencionar habilidade"
        onClick={run((h) => h.insertText("@"))}
      />
      <ToolbarButton
        icon="data_object"
        label="Inserir variável"
        onClick={run((h) => h.insertText("{{"))}
      />
      <div className="flex flex-1 items-center justify-end gap-1">
        <ToolbarButton
          icon="undo"
          label="Desfazer"
          onClick={() => document.execCommand("undo")}
        />
        <ToolbarButton
          icon="redo"
          label="Refazer"
          onClick={() => document.execCommand("redo")}
        />
        <AwButton
          variant="primary"
          size="sm"
          onClick={onSave}
          loading={saving}
          className="!ml-2"
        >
          Salvar
        </AwButton>
      </div>
    </div>
  )
}
