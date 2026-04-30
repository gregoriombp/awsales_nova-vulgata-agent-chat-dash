"use client"

import * as React from "react"
import { useClaudeEdit } from "@/lib/claude-edit/store"
import {
  getSourceForElement,
  shortRefLabel,
} from "@/lib/claude-edit/fiber-source"

const OVERLAY_DATA_ATTR = "data-claude-edit-overlay"

function isInOverlayUI(el: Element | null): boolean {
  let cur = el
  while (cur) {
    if (cur instanceof HTMLElement && cur.hasAttribute(OVERLAY_DATA_ATTR)) {
      return true
    }
    cur = cur.parentElement
  }
  return false
}

type Rect = { top: number; left: number; width: number; height: number }

export function ElementPickerLayer() {
  const pickerActive = useClaudeEdit((s) => s.pickerActive)
  const setPickerActive = useClaudeEdit((s) => s.setPickerActive)
  const addRef = useClaudeEdit((s) => s.addRef)

  const [target, setTarget] = React.useState<HTMLElement | null>(null)
  const [rect, setRect] = React.useState<Rect | null>(null)
  const layerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!pickerActive) {
      setTarget(null)
      setRect(null)
      return
    }

    function pickAt(clientX: number, clientY: number): HTMLElement | null {
      const layer = layerRef.current
      // Hide our own layer briefly so elementFromPoint hits the page below.
      const prev = layer?.style.pointerEvents ?? ""
      if (layer) layer.style.pointerEvents = "none"
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null
      if (layer) layer.style.pointerEvents = prev
      if (!el) return null
      if (isInOverlayUI(el)) return null
      return el
    }

    function onMove(e: MouseEvent) {
      const el = pickAt(e.clientX, e.clientY)
      if (!el) {
        setTarget(null)
        setRect(null)
        return
      }
      setTarget(el)
      const r = el.getBoundingClientRect()
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      })
    }

    function onClick(e: MouseEvent) {
      e.preventDefault()
      e.stopPropagation()
      const el = pickAt(e.clientX, e.clientY)
      if (!el) return
      const ref = getSourceForElement(el)
      addRef(ref)
      setPickerActive(false)
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        setPickerActive(false)
      }
    }

    window.addEventListener("mousemove", onMove, true)
    window.addEventListener("click", onClick, true)
    window.addEventListener("keydown", onKey, true)
    return () => {
      window.removeEventListener("mousemove", onMove, true)
      window.removeEventListener("click", onClick, true)
      window.removeEventListener("keydown", onKey, true)
    }
  }, [pickerActive, addRef, setPickerActive])

  if (!pickerActive) return null

  const previewLabel = target ? shortRefLabel(getSourceForElement(target)) : null

  return (
    <div
      ref={layerRef}
      {...{ [OVERLAY_DATA_ATTR]: "" }}
      className="fixed inset-0 z-[60] cursor-crosshair"
      style={{ pointerEvents: "auto" }}
    >
      {rect && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            outline: "2px solid var(--accent-brand, #3b82f6)",
            outlineOffset: "1px",
            background: "rgba(59, 130, 246, 0.08)",
          }}
        />
      )}
      <div
        {...{ [OVERLAY_DATA_ATTR]: "" }}
        className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] text-xs font-medium shadow-lg pointer-events-none flex items-center gap-2"
      >
        <span>Selecionar elemento</span>
        {previewLabel && (
          <span className="font-mono opacity-80">· {previewLabel}</span>
        )}
        <span className="opacity-60 text-[10px]">esc para cancelar</span>
      </div>
    </div>
  )
}
