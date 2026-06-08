import { elementBelowOverlayAt } from "@/lib/bombardier-review/scrollOffset"
import type {
  ReviewDrawAnchor,
  ReviewElementAnchor,
  ReviewPoint,
} from "@/components/bombardier-review/types"

// Pins guardam uma posição absoluta (doc coords), mas quando um painel lateral
// abre/fecha (Cortex, sidebars) o `<main>` muda de largura e o conteúdo reflui
// horizontalmente — aí o pin preso a um x fixo "desgruda" do elemento.
//
// Pra resolver isso, além da coord absoluta, ancoramos o pin ao ELEMENTO sob
// ele: um seletor resolvível + a fração (fx, fy) de onde o clique caiu dentro
// da bounding box. No render, re-resolvemos o elemento e posicionamos o pin
// sobre ele de novo — então o pin acompanha o reflow. Se o seletor não resolver
// (página mudou, elemento sumiu), caímos de volta na coord absoluta.

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

// Caminho `body > tag:nth-of-type(n) > …` estável entre toggles de layout (o
// DOM é o mesmo; só a largura muda). Usa nth-of-type (não ids) porque ids do
// Radix carregam `:` e quebram o querySelector.
function cssPath(start: Element): string | null {
  if (typeof document === "undefined") return null
  const parts: string[] = []
  let node: Element | null = start
  while (
    node &&
    node.nodeType === 1 &&
    node !== document.body &&
    node !== document.documentElement
  ) {
    const parent: Element | null = node.parentElement
    if (!parent) break
    const tag = node.tagName.toLowerCase()
    const sameTag = Array.from(parent.children).filter(
      (c) => c.tagName === node!.tagName,
    )
    const idx = sameTag.indexOf(node) + 1
    parts.unshift(`${tag}:nth-of-type(${idx})`)
    node = parent
  }
  if (parts.length === 0) return null
  return `body > ${parts.join(" > ")}`
}

/** Captura a âncora-de-elemento sob um ponto de viewport, ou null. */
export function captureElementAnchor(
  clientX: number,
  clientY: number,
): ReviewElementAnchor | null {
  const el = elementBelowOverlayAt(clientX, clientY)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  const selector = cssPath(el)
  if (!selector) return null
  return {
    selector,
    fx: clamp01((clientX - rect.left) / rect.width),
    fy: clamp01((clientY - rect.top) / rect.height),
  }
}

/** Re-resolve a âncora pro ponto de viewport atual, ou null se não achar. */
export function resolveElementPoint(
  anchor: ReviewElementAnchor,
): ReviewPoint | null {
  if (typeof document === "undefined") return null
  let el: Element | null = null
  try {
    el = document.querySelector(anchor.selector)
  } catch {
    return null
  }
  if (!el) return null
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  return {
    x: rect.left + anchor.fx * rect.width,
    y: rect.top + anchor.fy * rect.height,
  }
}

/**
 * Captura a âncora-de-elemento de uma marcação livre. Recebe os pontos JÁ em
 * coords de viewport, escolhe o elemento sob o centroide como referência e
 * guarda, pra cada ponto, sua fração (fx, fy) dentro do box desse elemento.
 * Frações NÃO são clampeadas: o traço pode (e costuma) extrapolar o box.
 */
export function captureDrawAnchor(
  viewportPoints: ReviewPoint[],
): ReviewDrawAnchor | null {
  if (viewportPoints.length === 0) return null
  let cx = 0
  let cy = 0
  for (const p of viewportPoints) {
    cx += p.x
    cy += p.y
  }
  cx /= viewportPoints.length
  cy /= viewportPoints.length
  const el = elementBelowOverlayAt(cx, cy)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  const selector = cssPath(el)
  if (!selector) return null
  return {
    selector,
    points: viewportPoints.map((p) => ({
      fx: (p.x - rect.left) / rect.width,
      fy: (p.y - rect.top) / rect.height,
    })),
  }
}

/** Re-resolve a marcação livre pros pontos de viewport atuais, ou null. */
export function resolveDrawPoints(
  anchor: ReviewDrawAnchor,
): ReviewPoint[] | null {
  if (typeof document === "undefined") return null
  let el: Element | null = null
  try {
    el = document.querySelector(anchor.selector)
  } catch {
    return null
  }
  if (!el) return null
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  return anchor.points.map((p) => ({
    x: rect.left + p.fx * rect.width,
    y: rect.top + p.fy * rect.height,
  }))
}
