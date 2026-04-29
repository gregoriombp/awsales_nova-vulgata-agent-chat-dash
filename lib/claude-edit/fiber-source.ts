import type { ElementRef } from "./types"

type DebugSource = {
  fileName: string
  lineNumber: number
  columnNumber?: number
}

type FiberLike = {
  type?: unknown
  return?: FiberLike | null
  _debugSource?: DebugSource
  _debugOwner?: FiberLike | null
} | null

function findFiber(el: HTMLElement): FiberLike {
  for (const key of Object.keys(el)) {
    if (key.startsWith("__reactFiber$")) {
      return (el as unknown as Record<string, FiberLike>)[key] ?? null
    }
  }
  return null
}

function getSource(fiber: FiberLike): DebugSource | null {
  let cur = fiber
  let hops = 0
  while (cur && hops < 50) {
    if (cur._debugSource) return cur._debugSource
    cur = cur.return ?? null
    hops += 1
  }
  return null
}

function getComponentName(fiber: FiberLike): string | null {
  let cur = fiber
  let hops = 0
  while (cur && hops < 50) {
    const t = cur.type
    if (typeof t === "function") {
      const fn = t as { displayName?: string; name?: string }
      const name = fn.displayName || fn.name
      if (name && name !== "_c" && name.length > 1) return name
    } else if (t && typeof t === "object") {
      const obj = t as { displayName?: string; render?: { name?: string } }
      if (obj.displayName) return obj.displayName
      if (obj.render?.name) return obj.render.name
    }
    cur = cur.return ?? null
    hops += 1
  }
  return null
}

function trimText(s: string | null | undefined, max = 120): string | undefined {
  if (!s) return undefined
  const cleaned = s.replace(/\s+/g, " ").trim()
  if (!cleaned) return undefined
  return cleaned.length > max ? cleaned.slice(0, max) + "…" : cleaned
}

let idCounter = 0

export function getSourceForElement(el: HTMLElement): ElementRef {
  const fiber = findFiber(el)
  const src = fiber ? getSource(fiber) : null
  const compName = fiber ? getComponentName(fiber) : null

  idCounter += 1
  return {
    id: `ref-${Date.now()}-${idCounter}`,
    fileName: src?.fileName,
    lineNumber: src?.lineNumber,
    columnNumber: src?.columnNumber,
    componentName: compName ?? undefined,
    tagName: el.tagName.toLowerCase(),
    classNames: el.className && typeof el.className === "string"
      ? trimText(el.className, 200)
      : undefined,
    textContent: trimText(el.textContent),
    outerHtmlPreview: trimText(el.outerHTML, 400),
    url: typeof window !== "undefined" ? window.location.pathname : undefined,
  }
}

export function shortRefLabel(ref: ElementRef): string {
  const file = ref.fileName ? ref.fileName.split("/").pop() : null
  const loc = file
    ? `${file}${ref.lineNumber ? `:${ref.lineNumber}` : ""}`
    : ref.componentName ?? ref.tagName
  return ref.componentName && file ? `${ref.componentName} · ${loc}` : loc
}
