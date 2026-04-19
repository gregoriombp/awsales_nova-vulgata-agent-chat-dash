"use client"

import * as React from "react"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"

export default function AIChat() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="aw-eyebrow">AI Copilot</h3>
          <AwPill variant="ai">Claude · em breve</AwPill>
        </div>
        <p className="text-xs text-[var(--fg-tertiary)] leading-relaxed">
          Descreva uma página ou cole uma imagem — a IA vai gerar usando os
          componentes do design system.
        </p>
      </div>

      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center text-xs text-[var(--fg-tertiary)] max-w-[220px] flex flex-col items-center gap-3">
          <span
            className="inline-flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
            style={{ width: 48, height: 48 }}
          >
            <Icon name="auto_awesome" size={22} />
          </span>
          <p className="leading-relaxed">
            Integração com Claude chega na <strong>Fase 4</strong>. Por
            enquanto, use a paleta à direita.
          </p>
        </div>
      </div>

      <form
        className="p-3 border-t border-[var(--border-subtle)] flex gap-2"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-sm text-[var(--fg-tertiary)]">
          <Icon name="auto_awesome" size={14} />
          <span className="opacity-60">Prompt…</span>
        </div>
        <button
          type="submit"
          disabled
          aria-label="Enviar"
          className="inline-flex items-center justify-center h-9 w-9 rounded-[var(--radius-md)] bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] opacity-40 cursor-not-allowed"
        >
          <Icon name="send" size={16} />
        </button>
      </form>
    </div>
  )
}
