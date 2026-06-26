// Reveal trail — how a comment dropped inside a closed overlay finds its way
// back open.
//
// The pain: you open a modal/drawer/dropdown/tab, drop a pin inside it, and
// comment. Later you click that comment to review the work — you land on the
// page, but the modal is closed, so the anchored element isn't in the DOM and
// the pin has nowhere to render. On a screen with several modals you have no
// idea which one to open.
//
// The fix is app-agnostic: while you navigate, we passively record the
// interactive elements you click (the buttons/tabs/options that open and step
// through overlays) into a small per-page ring buffer. When you save a comment
// we snapshot that buffer onto the comment as its `revealPath`. On focus we
// REPLAY the path — clicking each recorded trigger in order — stopping the
// instant the anchored element appears. No app wiring, works for any overlay,
// and degrades to today's behavior when there's no path (older comments).

import {
  captureElementRef,
  resolveAnchoredElement,
  resolveElementBySelector,
} from "./elementAnchor"
import { OVERLAY_DATA_ATTR } from "@/components/bombardier-review/constants"
import type {
  ReviewAnchor,
  ReviewRevealStep,
} from "@/components/bombardier-review/types"

interface TrailEntry extends ReviewRevealStep {
  path: string
  at: number
}

// Keep a short tail; a reveal path longer than this is almost never a real
// open-this-overlay sequence (and we cap replay anyway).
const MAX_TRAIL = 12
const MAX_STEPS = 6

// What we treat as a "reveal trigger": disclosure / navigation controls. We do
// NOT record plain content clicks — only things that change which UI is shown.
const INTERACTIVE =
  'button,[role="button"],a[href],[role="tab"],[role="radio"],[role="menuitem"],[role="option"],[role="switch"],summary,[aria-haspopup],[aria-expanded],label[for]'

// Skip clearly destructive / final actions: replaying one of these on focus
// could re-fire it. Disclosure clicks (open, next, select a tab) are safe.
const DESTRUCTIVE =
  /\b(excluir|deletar|remover|apagar|descartar|confirmar pagamento|pagar agora|delete|remove|discard|logout|sair da conta)\b/i

let trail: TrailEntry[] = []
// While we replay a path the synthetic .click()s would otherwise be recorded as
// new trail entries — pause recording so a reveal doesn't poison the buffer.
let paused = false

function labelOf(el: Element): string {
  const t = (el.getAttribute("aria-label") || el.textContent || "")
    .trim()
    .replace(/\s+/g, " ")
  return t.slice(0, 40)
}

function onClick(e: MouseEvent): void {
  if (paused) return
  const target = e.target as Element | null
  if (!target || typeof target.closest !== "function") return
  // Ignore the review overlay's own chrome (toolbar, sheet, pins, the dot).
  if (target.closest(`[${OVERLAY_DATA_ATTR}]`)) return
  if (target.closest("[data-bombardier-dot]")) return
  const el = target.closest(INTERACTIVE)
  if (!el) return
  const label = labelOf(el)
  if (DESTRUCTIVE.test(label)) return
  const ref = captureElementRef(el)
  if (!ref) return
  trail.push({
    selector: ref.selector,
    ...(ref.fingerprint ? { fingerprint: ref.fingerprint } : {}),
    ...(label ? { label } : {}),
    path: window.location.pathname,
    at: Date.now(),
  })
  if (trail.length > MAX_TRAIL) trail = trail.slice(-MAX_TRAIL)
}

/** Start recording reveal triggers globally. Returns a cleanup fn. */
export function startRevealTrail(): () => void {
  if (typeof document === "undefined") return () => {}
  document.addEventListener("click", onClick, true)
  return () => document.removeEventListener("click", onClick, true)
}

/** Drop the recorded trail (call on route change — overlays reset anyway). */
export function resetRevealTrail(): void {
  trail = []
}

/** The path the author took on `pathname` to reach the current state, capped. */
export function snapshotRevealTrail(pathname: string): ReviewRevealStep[] {
  return trail
    .filter((e) => e.path === pathname)
    .slice(-MAX_STEPS)
    .map(({ selector, fingerprint, label }) => ({
      selector,
      ...(fingerprint ? { fingerprint } : {}),
      ...(label ? { label } : {}),
    }))
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Re-open whatever overlay holds a comment's anchored element by replaying the
 * recorded reveal path. Clicks each trigger in order and polls for the anchor
 * after each — returning the moment it appears, so it clicks the MINIMUM needed
 * and never over-clicks past the target. No-op when the element is already
 * visible or there's no path. Returns true if the anchor is resolvable at the
 * end (revealed or already present).
 */
export async function revealAnchor(
  anchor: ReviewAnchor,
  revealPath?: ReviewRevealStep[],
): Promise<boolean> {
  if (typeof document === "undefined") return false
  if (resolveAnchoredElement(anchor)) return true
  if (!revealPath?.length) return false
  paused = true
  try {
    for (const step of revealPath) {
      if (resolveAnchoredElement(anchor)) return true
      const el = resolveElementBySelector(step.selector, step.fingerprint)
      if (el instanceof HTMLElement) {
        try {
          el.click()
        } catch {
          /* trigger gone or not clickable — try the next step */
        }
        // Let the overlay mount/animate, polling for the anchor as it settles.
        for (let i = 0; i < 7; i++) {
          await sleep(70)
          if (resolveAnchoredElement(anchor)) return true
        }
      }
    }
  } finally {
    paused = false
  }
  return !!resolveAnchoredElement(anchor)
}
