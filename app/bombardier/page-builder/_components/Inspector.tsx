"use client"

import * as React from "react"
import { AwInput } from "@/components/ui/AwInput"
import { Icon } from "@/components/ui/Icon"
import { paletteByType, type PropField } from "@/lib/bombardier/palette"
import { findFrameOfNode, findNode, useBuilder } from "@/lib/bombardier/store"
import { FRAME_PRESETS, type FramePreset } from "@/lib/bombardier/types"

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: PropField
  value: unknown
  onChange: (v: unknown) => void
}) {
  switch (field.kind) {
    case "text":
      return (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--fg-secondary)]">
            {field.label}
          </span>
          <AwInput
            dense
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      )
    case "textarea":
      return (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--fg-secondary)]">
            {field.label}
          </span>
          <textarea
            rows={3}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] resize-y focus:outline-none focus:border-[var(--accent-brand)]"
          />
        </label>
      )
    case "select":
      return (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--fg-secondary)]">
            {field.label}
          </span>
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
          >
            {field.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      )
    case "boolean":
      return (
        <label className="flex items-center justify-between gap-2 cursor-pointer py-1.5">
          <span className="text-xs font-medium text-[var(--fg-secondary)]">
            {field.label}
          </span>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent-brand)]"
          />
        </label>
      )
    case "color": {
      const v = (value as string) || ""
      const swatch = v && !v.startsWith("var(") ? v : "#000000"
      return (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--fg-secondary)]">
            {field.label}
          </span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={swatch}
              onChange={(e) => onChange(e.target.value)}
              className="h-9 w-10 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-transparent p-0.5 cursor-pointer shrink-0"
              aria-label={`${field.label} — seletor`}
            />
            <AwInput
              dense
              placeholder="#rrggbb ou var(--token)"
              value={v}
              onChange={(e) => onChange(e.target.value)}
            />
            {v && (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Limpar cor"
                title="Limpar"
                className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)] shrink-0"
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </div>
        </label>
      )
    }
    case "number":
      return (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--fg-secondary)]">
            {field.label}
          </span>
          <div className="relative">
            <input
              type="number"
              min={field.min}
              max={field.max}
              step={field.step ?? 1}
              value={Number(value ?? 0)}
              onChange={(e) => {
                const n = Number(e.target.value)
                if (!Number.isNaN(n)) onChange(n)
              }}
              className="w-full px-3 py-2 pr-10 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
            />
            {field.suffix && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--fg-tertiary)] pointer-events-none">
                {field.suffix}
              </span>
            )}
          </div>
        </label>
      )
  }
}

function NumberField({
  label,
  value,
  onChange,
  min,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  suffix?: string
}) {
  return (
    <label className="flex flex-col gap-1.5 flex-1">
      <span className="text-xs font-medium text-[var(--fg-secondary)]">
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          value={Math.round(value)}
          min={min}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (!Number.isNaN(v)) onChange(v)
          }}
          className="w-full px-3 py-2 pr-8 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--fg-tertiary)] pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </label>
  )
}

function FrameInspector({ frameId }: { frameId: string }) {
  const frame = useBuilder((s) =>
    s.project.pages.find((f) => f.id === frameId)
  )
  const updateFrame = useBuilder((s) => s.updateFrame)
  const removeFrame = useBuilder((s) => s.removeFrame)
  const duplicateFrame = useBuilder((s) => s.duplicateFrame)

  if (!frame) return null

  const matchedPreset = (Object.keys(FRAME_PRESETS) as FramePreset[]).find(
    (k) =>
      FRAME_PRESETS[k].width === frame.size.width &&
      FRAME_PRESETS[k].height === frame.size.height
  )

  return (
    <div className="p-4 flex-1 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="aw-eyebrow">Página</h3>
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={() => duplicateFrame(frameId)}
            aria-label="Duplicar"
            title="Duplicar página"
            className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)]"
          >
            <Icon name="content_copy" size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Excluir "${frame.name}"?`)) {
                removeFrame(frameId)
              }
            }}
            aria-label="Excluir"
            title="Excluir página"
            className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-secondary)] hover:text-[var(--aw-red-600)] hover:bg-[var(--bg-raised)]"
          >
            <Icon name="delete" size={14} />
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[var(--fg-secondary)]">
          Nome
        </span>
        <AwInput
          dense
          value={frame.name}
          onChange={(e) => updateFrame(frameId, { name: e.target.value })}
        />
      </label>

      <div>
        <div className="text-xs font-medium text-[var(--fg-secondary)] mb-1.5">
          Preset
        </div>
        <div className="grid grid-cols-4 gap-1">
          {(Object.keys(FRAME_PRESETS) as FramePreset[]).map((key) => {
            const p = FRAME_PRESETS[key]
            const active = matchedPreset === key
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  updateFrame(frameId, {
                    size: { width: p.width, height: p.height },
                  })
                }
                className={[
                  "flex flex-col items-center gap-1 py-2 rounded-[var(--radius-sm)] border text-[11px]",
                  active
                    ? "border-[var(--accent-brand)] bg-[var(--bg-raised)] text-[var(--fg-primary)]"
                    : "border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:border-[var(--border-default)]",
                ].join(" ")}
                title={`${p.label} · ${p.width}×${p.height}`}
              >
                <Icon name={p.icon} size={14} />
                <span>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <NumberField
          label="Largura"
          value={frame.size.width}
          onChange={(v) =>
            updateFrame(frameId, {
              size: { ...frame.size, width: Math.max(240, v) },
            })
          }
          suffix="px"
        />
        <NumberField
          label="Altura"
          value={frame.size.height}
          onChange={(v) =>
            updateFrame(frameId, {
              size: { ...frame.size, height: Math.max(240, v) },
            })
          }
          suffix="px"
        />
      </div>

      <div className="flex gap-2">
        <NumberField
          label="X"
          value={frame.position.x}
          onChange={(v) =>
            updateFrame(frameId, {
              position: { ...frame.position, x: v },
            })
          }
        />
        <NumberField
          label="Y"
          value={frame.position.y}
          onChange={(v) =>
            updateFrame(frameId, {
              position: { ...frame.position, y: v },
            })
          }
        />
      </div>

      <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--fg-tertiary)] font-mono">
        id: {frame.id}
      </div>
    </div>
  )
}

function NodeInspector({ nodeId }: { nodeId: string }) {
  const project = useBuilder((s) => s.project)
  const updateProps = useBuilder((s) => s.updateProps)
  const removeNode = useBuilder((s) => s.removeNode)

  const frame = findFrameOfNode(project, nodeId)
  const node = frame ? findNode(frame.rootNodes, nodeId) : null
  if (!node || !frame) return null

  const item = paletteByType[node.type]

  return (
    <div className="p-4 flex-1 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="aw-eyebrow">{item?.label ?? node.type}</h3>
          <span className="text-[11px] text-[var(--fg-tertiary)]">
            em {frame.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeNode(node.id)}
          aria-label="Remover componente"
          title="Remover"
          className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-secondary)] hover:text-[var(--aw-red-600)] hover:bg-[var(--bg-raised)] transition-colors"
        >
          <Icon name="delete" size={14} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {item &&
          Object.entries(item.propSchema).map(([name, field]) => (
            <FieldEditor
              key={name}
              field={field}
              value={node.props[name]}
              onChange={(v) => updateProps(node.id, { [name]: v })}
            />
          ))}
      </div>
      <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--fg-tertiary)] font-mono">
        id: {node.id}
      </div>
    </div>
  )
}

export default function Inspector() {
  const selectedNodeId = useBuilder((s) => s.selectedNodeId)
  const selectedFrameId = useBuilder((s) => s.selectedFrameId)

  if (selectedNodeId) return <NodeInspector nodeId={selectedNodeId} />
  if (selectedFrameId) return <FrameInspector frameId={selectedFrameId} />

  return (
    <div className="p-4 flex-1 flex flex-col gap-3">
      <h3 className="aw-eyebrow">Inspector</h3>
      <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-canvas)] border border-dashed border-[var(--border-subtle)] text-xs text-[var(--fg-tertiary)] leading-relaxed flex items-start gap-2">
        <Icon name="touch_app" size={14} />
        <span>
          Selecione um frame ou componente no canvas para editar propriedades.
        </span>
      </div>
    </div>
  )
}
