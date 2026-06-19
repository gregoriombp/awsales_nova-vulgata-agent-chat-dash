// Client-side mirror of the page-edits contract. The server store
// (app/api/page-edits/_store.ts) imports node:fs, so it can't be pulled into
// client bundles — these types are the browser-safe twin, kept in sync by hand.

export type PageEditOpType = "text" | "style" | "hide"

export type PageEditStatus = "open" | "in_review" | "applied" | "discarded"

export type PageEditActor = { kind: "agent" | "user"; id: string; name: string }

export interface PageEditResolution {
  actor: PageEditActor
  at: number
  summary: string
}

/** Reuses the review-mode anchor (selector + fingerprint). `component`/`domText`
 *  are a diagnostic snapshot the materialization skill greps the source with. */
export interface PageEditAnchor {
  selector: string
  fingerprint?: { tag: string; text?: string }
  component?: string
  domText?: string
}

export type PageEditPayload =
  | { kind: "text"; text: string; prevText?: string }
  // token is always a `var(--token)` string so the override tracks dark mode.
  | { kind: "style"; prop: string; token: string; prevToken?: string }
  | { kind: "hide"; mode: "hide" | "remove" }

export interface PageEditOp {
  id: string
  schemaVersion: 1
  route: string
  anchor: PageEditAnchor
  type: PageEditOpType
  payload: PageEditPayload
  createdAt: number
  updatedAt: number
  authorName?: string
  status: PageEditStatus
  resolution?: PageEditResolution
}
