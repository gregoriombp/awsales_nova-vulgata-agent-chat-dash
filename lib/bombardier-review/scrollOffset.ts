import * as React from "react"
import { OVERLAY_DATA_ATTR } from "@/components/bombardier-review/constants"

// Em apps SPA o scroll real costuma estar num container interno (overflow-y
// auto/scroll), não no `window`. Pra que os pins/desenhos do review-mode
// fiquem ancorados ao conteúdo — e não ao viewport — somamos o scroll do
// `window` mais o `scrollTop`/`scrollLeft` de todos os ancestors scrollable
// do elemento de referência.

function isScrollable(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el)
  return (
    style.overflowY === "auto" ||
    style.overflowY === "scroll" ||
    style.overflowX === "auto" ||
    style.overflowX === "scroll"
  )
}

export function cumulativeScrollFromElement(
  start: Element | null,
): { x: number; y: number } {
  let x = typeof window !== "undefined" ? window.scrollX : 0
  let y = typeof window !== "undefined" ? window.scrollY : 0
  if (typeof window === "undefined") return { x, y }
  let el: Element | null = start
  while (el && el !== document.body && el !== document.documentElement) {
    if (el instanceof HTMLElement && isScrollable(el)) {
      y += el.scrollTop
      x += el.scrollLeft
    }
    el = el.parentElement
  }
  return { x, y }
}

// Pega o elemento sob o ponto, pulando elementos do próprio review overlay
// (pin, popover, toolbar) — caso contrário o "alvo" seria o SVG do canvas
// e o caminho de ancestors não passaria pelo container scrollable real.
export function elementBelowOverlayAt(
  clientX: number,
  clientY: number,
): Element | null {
  if (typeof document === "undefined") return null
  const stack = document.elementsFromPoint(clientX, clientY)
  for (const el of stack) {
    if (el.closest(`[${OVERLAY_DATA_ATTR}]`)) continue
    return el
  }
  return null
}

export function getViewportProbeScroll(): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 0, y: 0 }
  const probe = elementBelowOverlayAt(
    window.innerWidth / 2,
    window.innerHeight / 2,
  )
  return cumulativeScrollFromElement(probe)
}

export function useCumulativeScrollOffset() {
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })
  React.useEffect(() => {
    let raf: number | null = null
    const update = () => {
      raf = null
      setOffset(getViewportProbeScroll())
    }
    update()
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update)
    }
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    })
    window.addEventListener("resize", onScroll)
    return () => {
      document.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onScroll)
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [])
  return offset
}

// Re-renderiza quando o layout reflui SEM scroll nem resize de window — caso
// do Cortex/sidebars, que mudam a largura do `<main>` via flex. O
// `useCumulativeScrollOffset` só ouve scroll/resize, então pins ancorados a
// elemento não re-resolveriam. Um ResizeObserver no container principal (+ body)
// cobre esse caso.
export function useLayoutVersion(): number {
  const [version, setVersion] = React.useState(0)
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof ResizeObserver === "undefined")
      return
    let raf: number | null = null
    const bump = () => {
      if (raf !== null) return
      raf = requestAnimationFrame(() => {
        raf = null
        setVersion((n) => n + 1)
      })
    }
    const ro = new ResizeObserver(bump)
    const primary = findPrimaryScrollContainer()
    if (primary) ro.observe(primary)
    ro.observe(document.body)
    return () => {
      ro.disconnect()
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [])
  return version
}

// Encontra o container scrollable que cobre a maior área da viewport —
// usado pra programmatic scroll (navegar até um comentário).
export function findPrimaryScrollContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null
  let bestEl: HTMLElement | null = null
  let bestArea = 0
  document.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (!isScrollable(el)) return
    if (el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth)
      return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const area = rect.width * rect.height
    if (area > bestArea) {
      bestEl = el
      bestArea = area
    }
  })
  return bestEl
}
