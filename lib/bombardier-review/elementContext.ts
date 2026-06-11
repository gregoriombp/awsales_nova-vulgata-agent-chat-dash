import type { ReviewAnchor } from "@/components/bombardier-review/types"

// Contexto enxuto do elemento sob o comentário — alimenta a sugestão de prompt
// (/api/review/suggest) e o rótulo do ponteiro mágico. Só texto/atributos, nunca
// o DOM inteiro.
export interface ReviewElementContext {
  tag: string
  role?: string
  label?: string
  text?: string
  selector?: string
}

function snippet(el: Element, max: number): string {
  return (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, max)
}

/** Descreve um elemento do DOM (tag + papel + rótulo acessível + texto). */
export function describeElement(el: Element): ReviewElementContext {
  const tag = el.tagName.toLowerCase()
  const role = el.getAttribute("role") || undefined
  const label =
    el.getAttribute("aria-label") ||
    el.getAttribute("title") ||
    el.getAttribute("placeholder") ||
    undefined
  const text = snippet(el, 80) || undefined
  return { tag, role, label, text }
}

/** Resolve o elemento ancorado num comentário e o descreve, ou null. */
export function describeAnchorElement(
  anchor: ReviewAnchor | null,
): ReviewElementContext | null {
  if (typeof document === "undefined" || !anchor) return null
  const selector = anchor.el?.selector
  if (!selector) return null
  let el: Element | null = null
  try {
    el = document.querySelector(selector)
  } catch {
    el = null
  }
  if (!el) return null
  return { ...describeElement(el), selector }
}

/** Rótulo curto pro chip do ponteiro mágico (ex.: `button · Salvar`). */
export function shortLabelFor(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const aria = el.getAttribute("aria-label") || el.getAttribute("title")
  if (aria) return `${tag} · ${aria.slice(0, 28)}`
  const role = el.getAttribute("role")
  if (role) return `${tag} · ${role}`
  const text = snippet(el, 24)
  if (text) return `${tag} · "${text}"`
  return tag
}
