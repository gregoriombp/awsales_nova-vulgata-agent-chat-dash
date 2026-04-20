"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { useBuilder } from "@/lib/bombardier/store"
import { FRAME_PRESETS, MAX_ZOOM, MIN_ZOOM, type FramePreset } from "@/lib/bombardier/types"
import PageFrame from "./PageFrame"

const PRESET_ORDER: FramePreset[] = ["desktop", "tablet", "mobile", "square"]

function AddPageMenu() {
  const [open, setOpen] = React.useState(false)
  const addFrame = useBuilder((s) => s.addFrame)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)] bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] text-sm font-medium shadow-sm hover:opacity-90"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon name="add" size={16} />
        Nova página
        <Icon name="expand_more" size={14} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1.5 min-w-[200px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] shadow-lg overflow-hidden"
        >
          {PRESET_ORDER.map((key) => {
            const p = FRAME_PRESETS[key]
            return (
              <button
                key={key}
                type="button"
                role="menuitem"
                onClick={() => {
                  addFrame(key)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-[var(--fg-primary)] hover:bg-[var(--bg-raised)]"
              >
                <Icon name={p.icon} size={16} />
                <span className="flex-1">{p.label}</span>
                <span className="text-xs text-[var(--fg-tertiary)] font-mono">
                  {p.width}×{p.height}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ZoomControls({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const zoom = useBuilder((s) => s.project.viewport.zoom)
  const zoomAt = useBuilder((s) => s.zoomAt)
  const resetViewport = useBuilder((s) => s.resetViewport)

  const zoomFromCenter = (multiplier: number) => {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    zoomAt({ x: r.width / 2, y: r.height / 2 }, multiplier)
  }

  return (
    <div className="flex items-center gap-0 h-9 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => zoomFromCenter(1 / 1.2)}
        disabled={zoom <= MIN_ZOOM + 0.001}
        className="h-9 w-9 inline-flex items-center justify-center text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)] disabled:opacity-30"
        aria-label="Diminuir zoom"
      >
        <Icon name="remove" size={14} />
      </button>
      <span className="w-14 text-center text-xs font-mono text-[var(--fg-secondary)]">
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        onClick={() => zoomFromCenter(1.2)}
        disabled={zoom >= MAX_ZOOM - 0.001}
        className="h-9 w-9 inline-flex items-center justify-center text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)] disabled:opacity-30"
        aria-label="Aumentar zoom"
      >
        <Icon name="add" size={14} />
      </button>
      <div className="h-5 w-px bg-[var(--border-subtle)]" />
      <button
        type="button"
        onClick={resetViewport}
        className="h-9 px-2 inline-flex items-center justify-center gap-1 text-xs text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)]"
        aria-label="Resetar viewport"
      >
        <Icon name="center_focus_strong" size={14} />
        Fit
      </button>
    </div>
  )
}

export default function Canvas() {
  const viewport = useBuilder((s) => s.project.viewport)
  const pages = useBuilder((s) => s.project.pages)
  const clearSelection = useBuilder((s) => s.clearSelection)
  const panBy = useBuilder((s) => s.panBy)
  const zoomAt = useBuilder((s) => s.zoomAt)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const spaceHeldRef = React.useRef(false)
  const [cursorMode, setCursorMode] = React.useState<"default" | "grab" | "grabbing">("default")
  const draggedRef = React.useRef(false)

  // Non-passive wheel handler for pan/zoom
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        const cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        const multiplier = Math.exp(-e.deltaY * 0.0025)
        zoomAt(cursor, multiplier)
      } else {
        panBy(-e.deltaX, -e.deltaY)
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [zoomAt, panBy])

  // Spacebar tracking
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
        e.preventDefault()
        spaceHeldRef.current = true
        setCursorMode("grab")
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceHeldRef.current = false
        setCursorMode("default")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    const isMiddle = e.button === 1
    const isSpacePan = spaceHeldRef.current && e.button === 0
    if (!isMiddle && !isSpacePan) return
    e.preventDefault()
    draggedRef.current = false
    setCursorMode("grabbing")
    let lastX = e.clientX
    let lastY = e.clientY
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - lastX
      const dy = ev.clientY - lastY
      if (dx !== 0 || dy !== 0) draggedRef.current = true
      panBy(dx, dy)
      lastX = ev.clientX
      lastY = ev.clientY
    }
    const onUp = () => {
      setCursorMode(spaceHeldRef.current ? "grab" : "default")
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  const onBgClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false
      return
    }
    clearSelection()
  }

  const gridSize = 24 * viewport.zoom
  const cursor =
    cursorMode === "grabbing"
      ? "grabbing"
      : cursorMode === "grab"
      ? "grab"
      : "default"

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[var(--bg-canvas)]"
      style={{
        cursor,
        backgroundImage:
          "radial-gradient(circle, var(--border-default) 1px, transparent 1.5px)",
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
      onPointerDown={onPointerDown}
      onClick={onBgClick}
    >
      {/* World */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
          width: 0,
          height: 0,
        }}
      >
        {pages.map((frame) => (
          <PageFrame key={frame.id} frame={frame} />
        ))}
      </div>

      {/* Toolbar — top-left (add page) */}
      <div className="absolute top-4 left-4 flex gap-2 z-20 pointer-events-auto">
        <AddPageMenu />
      </div>

      {/* Toolbar — bottom-right (zoom) */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <ZoomControls containerRef={containerRef} />
      </div>

      {/* Tip — bottom-left */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none text-[11px] text-[var(--fg-tertiary)] bg-[var(--bg-surface)]/80 backdrop-blur px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)]">
        Space + drag para navegar · Ctrl + scroll para zoom
      </div>

      {/* Empty state */}
      {pages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-sm text-[var(--fg-tertiary)] max-w-[280px]">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-dashed border-[var(--border-default)] mb-3">
              <Icon name="dashboard" size={22} />
            </div>
            <p className="leading-relaxed">
              Nenhuma página ainda. Clique em <strong>Nova página</strong> pra
              criar o primeiro frame.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
