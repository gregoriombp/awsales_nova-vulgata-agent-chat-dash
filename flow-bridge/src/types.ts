/**
 * Schema for ux-flow suggestions stored by the flow-bridge.
 *
 * Lifecycle:
 *
 *   (user salva)  open ── transition: in_review ─► in_review
 *                  │                                  │
 *                  │ transition: discard              │ transition: apply  (claude aplicou + user aprovou)
 *                  │                                  │ transition: discard (user descartou em vez de aprovar)
 *                  │                                  │ transition: reject  (volta pra open)
 *                  ▼                                  ▼
 *               discarded  ◄────────────────────  applied
 *                  │                                  │
 *                  └─────────► (archive) ◄────────────┘
 */

export type FlowSuggestionStatus = "open" | "in_review" | "applied" | "discarded"

export type FlowActorKind = "agent" | "user"

export interface FlowActor {
  kind: FlowActorKind
  id: string
  name: string
}

export interface FlowResolution {
  actor: FlowActor
  at: number
  summary: string
}

export const FLOW_SCHEMA_VERSION = 1

/**
 * The ReactFlow graph payload — we don't type the inner Node/Edge shapes
 * tightly because the editor on the frontend already knows them. The bridge
 * just stores and forwards them as opaque JSON.
 */
export type FlowGraphPayload = {
  nodes: unknown[]
  edges: unknown[]
}

export interface FlowSuggestion {
  id: string
  schemaVersion: 1
  flow: string
  description: string
  createdAt: number
  updatedAt: number
  authorName?: string
  status: FlowSuggestionStatus
  resolution?: FlowResolution
  nodes: unknown[]
  edges: unknown[]
}

export interface FlowExportPayload {
  schemaVersion: 1
  exportedAt: number
  suggestions: FlowSuggestion[]
  archivedSuggestions?: FlowSuggestion[]
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/**
 * Server timezone. Same human-readable format used in review-bridge so the
 * team's eye is already trained on it.
 */
export function formatResolutionSummary(
  actor: FlowActor,
  at: number,
  kind: "applied" | "discarded" | "claimed",
): string {
  const verb =
    kind === "applied" ? "Aplicada" : kind === "discarded" ? "Descartada" : "Em revisão por"
  const d = new Date(at)
  const day = pad2(d.getDate())
  const month = pad2(d.getMonth() + 1)
  const year = d.getFullYear()
  const hours = pad2(d.getHours())
  const minutes = pad2(d.getMinutes())
  const seconds = pad2(d.getSeconds())
  if (kind === "claimed") {
    return `${verb} ${actor.name} em ${day}/${month}/${year} às ${hours}:${minutes}:${seconds}.`
  }
  return `${verb} por ${actor.name} em ${day}/${month}/${year} às ${hours}:${minutes}:${seconds}.`
}
