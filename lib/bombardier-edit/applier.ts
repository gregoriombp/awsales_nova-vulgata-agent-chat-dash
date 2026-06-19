import type { PageEditOp } from "./types"
import { resolveEditElement } from "./anchor"
import { isAllowedStyle } from "./token-manifest"

// The overlay APPLY engine. React owns textContent/style/className and reverts
// any DOM mutation on its next render — so for every active op we (1) write the
// desired state and (2) keep a per-op MutationObserver that re-writes it the
// instant React (or anything else) clobbers it. Writes use disconnect → mutate
// → reconnect so the observer never sees its own write (no loop).
//
// This runs whether or not Edit Mode is *active* — that's what makes saved
// edits survive reload during normal viewing. It is purely client-side and is
// only ever driven from the EditModeProvider's post-hydration effects.

const DISPLAY = "display"

type Entry = {
  op: PageEditOp
  el: Element | null
  observer: MutationObserver | null
}

export class OverlayApplier {
  private entries = new Map<string, Entry>()
  // Selectors whose live re-apply is paused — e.g. while the user types into a
  // contentEditable leaf, the observer must NOT rewrite their text to the old
  // op value mid-keystroke.
  private suspended = new Set<string>()

  suspend(selector: string): void {
    this.suspended.add(selector)
    for (const entry of this.entries.values()) {
      if (entry.op.anchor.selector === selector) this.detach(entry)
    }
  }

  resume(selector: string): void {
    this.suspended.delete(selector)
    this.reapplyAll()
  }

  /** Reconcile the live op set: revert dropped ops, (re)apply the rest. */
  setOps(ops: PageEditOp[]): void {
    if (typeof document === "undefined") return
    const next = new Set(ops.map((o) => o.id))
    for (const [id, entry] of this.entries) {
      if (!next.has(id)) {
        this.revert(entry)
        this.entries.delete(id)
      }
    }
    for (const op of ops) {
      const existing = this.entries.get(op.id)
      if (existing) existing.op = op
      else this.entries.set(op.id, { op, el: null, observer: null })
    }
    this.reapplyAll()
  }

  /** Re-resolve every anchor and re-apply — call on layout/route changes. */
  reapplyAll(): void {
    if (typeof document === "undefined") return
    for (const entry of this.entries.values()) this.apply(entry)
  }

  private apply(entry: Entry): void {
    if (this.suspended.has(entry.op.anchor.selector)) {
      this.detach(entry)
      return
    }
    const el = resolveEditElement(entry.op.anchor)
    if (!el) {
      // Not rendered yet, or route changed — release and retry next pass.
      this.detach(entry)
      entry.el = null
      return
    }
    if (entry.el !== el) {
      this.detach(entry)
      entry.el = el
    }
    this.write(entry)
    if (!entry.observer) {
      entry.observer = new MutationObserver(() => {
        if (entry.el) this.write(entry)
      })
      this.observe(entry)
    }
  }

  private observe(entry: Entry): void {
    if (!entry.el || !entry.observer) return
    if (entry.op.payload.kind === "text") {
      entry.observer.observe(entry.el, {
        childList: true,
        characterData: true,
        subtree: true,
      })
    } else {
      entry.observer.observe(entry.el, {
        attributes: true,
        attributeFilter: ["style", "class"],
      })
    }
  }

  // disconnect → mutate → reconnect: our own write is never observed.
  private write(entry: Entry): void {
    const el = entry.el
    if (!el) return
    const obs = entry.observer
    if (obs) obs.disconnect()
    try {
      const { payload } = entry.op
      if (payload.kind === "text") {
        if (el.textContent !== payload.text) el.textContent = payload.text
      } else if (payload.kind === "style") {
        if (isAllowedStyle(payload.prop, payload.token)) {
          ;(el as HTMLElement).style.setProperty(payload.prop, payload.token)
        }
      } else if (payload.kind === "hide") {
        ;(el as HTMLElement).style.setProperty(DISPLAY, "none", "important")
      }
    } finally {
      if (obs) this.observe(entry)
    }
  }

  private detach(entry: Entry): void {
    if (entry.observer) {
      entry.observer.disconnect()
      entry.observer = null
    }
  }

  private revert(entry: Entry): void {
    this.detach(entry)
    const el = entry.el ?? resolveEditElement(entry.op.anchor)
    if (!el) return
    const { payload } = entry.op
    if (payload.kind === "style") {
      ;(el as HTMLElement).style.removeProperty(payload.prop)
    } else if (payload.kind === "hide") {
      ;(el as HTMLElement).style.removeProperty(DISPLAY)
    } else if (payload.kind === "text" && payload.prevText != null) {
      if (el.textContent !== payload.prevText) el.textContent = payload.prevText
    }
  }

  destroy(): void {
    for (const entry of this.entries.values()) this.revert(entry)
    this.entries.clear()
  }

  /** Element a still-active op currently targets (for the inspector outline). */
  resolved(id: string): Element | null {
    return this.entries.get(id)?.el ?? null
  }
}
