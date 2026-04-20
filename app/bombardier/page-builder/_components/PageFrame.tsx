"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { useBuilder } from "@/lib/bombardier/store"
import {
  MAX_FRAME_SIZE,
  MIN_FRAME_SIZE,
  type PageFrame as PageFrameType,
} from "@/lib/bombardier/types"
import { FrameRootDropZone, renderNode } from "./NodeRenderer"

type DragMode = "move" | "resize-br" | null

export default function PageFrame({ frame }: { frame: PageFrameType }) {
  const zoom = useBuilder((s) => s.project.viewport.zoom)
  const selectedFrameId = useBuilder((s) => s.selectedFrameId)
  const selectedNodeId = useBuilder((s) => s.selectedNodeId)
  const selectFrame = useBuilder((s) => s.selectFrame)
  const selectNode = useBuilder((s) => s.selectNode)
  const updateFrame = useBuilder((s) => s.updateFrame)
  const removeFrame = useBuilder((s) => s.removeFrame)
  const duplicateFrame = useBuilder((s) => s.duplicateFrame)

  const frameActive = selectedFrameId === frame.id
  const chromeSelected = frameActive && selectedNodeId === null

  const dragRef = React.useRef<{
    mode: DragMode
    startMouse: { x: number; y: number }
    startPos: { x: number; y: number }
    startSize: { width: number; height: number }
    zoom: number
  }>({
    mode: null,
    startMouse: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
    startSize: { width: 0, height: 0 },
    zoom: 1,
  })

  const beginDrag = (mode: Exclude<DragMode, null>, e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    selectFrame(frame.id)
    dragRef.current = {
      mode,
      startMouse: { x: e.clientX, y: e.clientY },
      startPos: { ...frame.position },
      startSize: { ...frame.size },
      zoom,
    }
    const onMove = (ev: PointerEvent) => {
      const s = dragRef.current
      if (!s.mode) return
      const dx = (ev.clientX - s.startMouse.x) / s.zoom
      const dy = (ev.clientY - s.startMouse.y) / s.zoom
      if (s.mode === "move") {
        updateFrame(frame.id, {
          position: { x: s.startPos.x + dx, y: s.startPos.y + dy },
        })
      } else if (s.mode === "resize-br") {
        const width = Math.max(
          MIN_FRAME_SIZE.width,
          Math.min(MAX_FRAME_SIZE.width, s.startSize.width + dx)
        )
        const height = Math.max(
          MIN_FRAME_SIZE.height,
          Math.min(MAX_FRAME_SIZE.height, s.startSize.height + dy)
        )
        updateFrame(frame.id, { size: { width, height } })
      }
    }
    const onUp = () => {
      dragRef.current.mode = null
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  const empty = frame.rootNodes.length === 0
  const inv = 1 / Math.max(zoom, 0.05)

  return (
    <div
      style={{
        position: "absolute",
        left: frame.position.x,
        top: frame.position.y,
        width: frame.size.width,
        height: frame.size.height,
      }}
      className={frameActive ? "z-10" : "z-0"}
      onClick={(e) => {
        e.stopPropagation()
        selectFrame(frame.id)
      }}
    >
      {/* Header (counter-scaled) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: "100%",
          marginBottom: 8,
          transformOrigin: "bottom left",
          transform: `scale(${inv})`,
          pointerEvents: "auto",
        }}
        className="flex items-center gap-1 text-xs text-[var(--fg-secondary)] select-none whitespace-nowrap"
      >
        <button
          type="button"
          onPointerDown={(e) => beginDrag("move", e)}
          onClick={(e) => {
            e.stopPropagation()
            selectFrame(frame.id)
          }}
          className={[
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-xs)]",
            "cursor-grab active:cursor-grabbing",
            chromeSelected
              ? "text-[var(--accent-brand)] font-medium"
              : "hover:text-[var(--fg-primary)]",
          ].join(" ")}
          aria-label={`Mover ${frame.name}`}
        >
          <Icon name="drag_indicator" size={12} />
          <span className="font-medium">{frame.name}</span>
          <span className="text-[var(--fg-tertiary)]">
            · {Math.round(frame.size.width)} × {Math.round(frame.size.height)}
          </span>
        </button>
        {frameActive && (
          <div className="inline-flex items-center gap-0.5 ml-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                duplicateFrame(frame.id)
              }}
              className="inline-flex items-center justify-center h-6 w-6 rounded-[var(--radius-xs)] text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)]"
              aria-label="Duplicar página"
              title="Duplicar"
            >
              <Icon name="content_copy" size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm(`Excluir "${frame.name}"?`)) {
                  removeFrame(frame.id)
                }
              }}
              className="inline-flex items-center justify-center h-6 w-6 rounded-[var(--radius-xs)] text-[var(--fg-tertiary)] hover:text-[var(--aw-red-600)] hover:bg-[var(--bg-raised)]"
              aria-label="Excluir página"
              title="Excluir"
            >
              <Icon name="delete" size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Frame body */}
      <div
        className={[
          "w-full h-full bg-[var(--bg-surface)] rounded-[var(--radius-md)] overflow-hidden",
          "shadow-md",
          chromeSelected
            ? "outline outline-2 outline-[var(--accent-brand)]"
            : frameActive
            ? "outline outline-1 outline-[var(--accent-brand)]"
            : "outline outline-1 outline-[var(--border-subtle)] hover:outline-[var(--border-default)]",
        ].join(" ")}
      >
        <FrameRootDropZone frameId={frame.id} empty={empty}>
          {frame.rootNodes.map((n) =>
            renderNode(n, {
              selectedId: selectedNodeId,
              onSelectNode: selectNode,
            })
          )}
        </FrameRootDropZone>
      </div>

      {/* Resize handle (counter-scaled) — bottom-right */}
      <div
        onPointerDown={(e) => beginDrag("resize-br", e)}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          transform: `translate(50%, 50%) scale(${inv})`,
          transformOrigin: "center",
          cursor: "nwse-resize",
          pointerEvents: "auto",
        }}
        className={[
          "w-4 h-4 rounded-[var(--radius-xs)]",
          frameActive
            ? "bg-[var(--accent-brand)] ring-2 ring-[var(--bg-surface)]"
            : "bg-[var(--border-strong)] opacity-0 group-hover:opacity-100",
        ].join(" ")}
        aria-label="Redimensionar"
        title="Redimensionar"
      />
    </div>
  )
}
