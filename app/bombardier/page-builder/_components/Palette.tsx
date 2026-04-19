"use client"

import * as React from "react"
import { useDraggable } from "@dnd-kit/core"
import { Icon } from "@/components/ui/Icon"
import { paletteGroups, type PaletteItem } from "@/lib/bombardier/palette"

function DraggableItem({ item }: { item: PaletteItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { source: "palette", type: item.type },
  })

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      className={[
        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-[var(--radius-md)]",
        "border border-[var(--border-subtle)] bg-[var(--bg-canvas)]",
        "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]",
        "hover:border-[var(--border-default)] hover:bg-[var(--bg-raised)]",
        "transition-colors cursor-grab active:cursor-grabbing text-xs text-left",
        isDragging ? "opacity-40" : "",
      ].join(" ")}
    >
      <Icon name={item.icon} size={18} />
      <span className="leading-none text-center">{item.label}</span>
    </button>
  )
}

export default function Palette() {
  return (
    <div className="p-4 border-b border-[var(--border-subtle)]">
      <h3 className="aw-eyebrow mb-3">Componentes</h3>
      <div className="flex flex-col gap-4">
        {paletteGroups.map((group) => (
          <div key={group.key}>
            <div className="text-[11px] uppercase tracking-wider text-[var(--fg-tertiary)] mb-2">
              {group.label}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => (
                <DraggableItem key={item.type} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--fg-tertiary)] leading-relaxed">
        Arraste para o canvas. Stack e Card aceitam filhos.
      </p>
    </div>
  )
}
