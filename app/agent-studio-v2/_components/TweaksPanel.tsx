"use client"

import * as React from "react"
import { Icon } from "./icons"
import { Button } from "./primitives"
import type { Tweaks } from "./types"

export function TweaksPanel({
  open,
  tweaks,
  onChange,
  onClose,
  onGoto,
}: {
  open: boolean
  tweaks: Tweaks
  onChange: (t: Tweaks) => void
  onClose: () => void
  onGoto: (dest: string) => void
}) {
  if (!open) return null
  const set = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) =>
    onChange({ ...tweaks, [k]: v })

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        width: 300,
        background: "var(--aw-white)",
        color: "var(--aw-gray-1200)",
        borderRadius: 16,
        border: "1px solid var(--aw-gray-200)",
        boxShadow: "0 20px 48px rgba(0,0,0,0.18)",
        zIndex: 90,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <strong style={{ fontSize: 15, fontWeight: 500 }}>Tweaks</strong>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "var(--aw-gray-700)",
            padding: 4,
          }}
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <Row label="Estado do home">
        <Seg
          value={tweaks.agentState}
          onChange={(v) => set("agentState", v as Tweaks["agentState"])}
          options={[
            { value: "rascunho", label: "Vazio" },
            { value: "populado", label: "Populado" },
          ]}
        />
      </Row>
      <Row label="Sidebar">
        <Seg
          value={tweaks.sidebarMode}
          onChange={(v) => set("sidebarMode", v as Tweaks["sidebarMode"])}
          options={[
            { value: "expanded", label: "Expandida" },
            { value: "collapsed", label: "Colapsada" },
          ]}
        />
      </Row>
      <Row label="Densidade">
        <Seg
          value={tweaks.density}
          onChange={(v) => set("density", v as Tweaks["density"])}
          options={[
            { value: "compact", label: "Compacta" },
            { value: "regular", label: "Regular" },
            { value: "spacious", label: "Espaçosa" },
          ]}
        />
      </Row>
      <Row label="Atalhos">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Button
            size="sm"
            variant="secondary"
            icon="auto_awesome"
            onClick={() => onGoto("wizard")}
          >
            Abrir wizard
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon="target"
            onClick={() => onGoto("builder:objetivo")}
          >
            Builder — Objetivo
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon="memory"
            onClick={() => onGoto("builder:core")}
          >
            Builder — Core
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon="extension"
            onClick={() => onGoto("builder:habilidades")}
          >
            Builder — Habilidades
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon="hub"
            onClick={() => onGoto("builder:canais")}
          >
            Builder — Canais
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon="fact_check"
            onClick={() => onGoto("builder:revisao")}
          >
            Builder — Revisão
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon="rocket_launch"
            onClick={() => onGoto("builder:publicar")}
          >
            Builder — Publicar
          </Button>
        </div>
      </Row>
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.06,
          textTransform: "uppercase",
          color: "var(--aw-gray-700)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

function Seg<V extends string>({
  value,
  onChange,
  options,
}: {
  value: V
  onChange: (v: V) => void
  options: { value: V; label: string }[]
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: 3,
        background: "var(--aw-gray-150)",
        borderRadius: 8,
      }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            flex: 1,
            padding: "6px 8px",
            border: 0,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 500,
            background: value === o.value ? "var(--aw-white)" : "transparent",
            color:
              value === o.value ? "var(--aw-gray-1200)" : "var(--aw-gray-700)",
            boxShadow:
              value === o.value ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            transition: "background 120ms ease",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
