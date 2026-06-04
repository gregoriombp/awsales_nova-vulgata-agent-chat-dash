export type ReviewMode = "cursor" | "draw" | "pin"

export interface ReviewIdentity {
  id: string
  name: string
  colorToken: string
  createdAt: number
}

export interface ReviewPoint {
  x: number
  y: number
}

export interface ReviewDrawPath {
  points: ReviewPoint[]
  strokeColorToken: string
  strokeWidth: number
}

/**
 * Element-relative anchor for a pin. Beyond the absolute `position` (doc
 * coords), a pin can remember the element it was dropped on — a resolvable
 * `selector` plus the fractional offset (0..1) of the click inside that
 * element's box. On render the element is re-resolved so the pin follows
 * horizontal reflow (a side panel opening shrinks `<main>` and shifts content).
 * Optional and additive — comments without it fall back to `position`.
 */
export interface ReviewElementAnchor {
  selector: string
  fx: number
  fy: number
}

export type ReviewAnchor =
  | { kind: "pin"; position: ReviewPoint; el?: ReviewElementAnchor }
  | { kind: "draw"; path: ReviewDrawPath; centroid: ReviewPoint }

export type ReviewCommentStatus = "open" | "in_review" | "resolved"

export type ReviewActorKind = "agent" | "user"

export interface ReviewActor {
  kind: ReviewActorKind
  id: string
  name: string
}

export interface ReviewResolution {
  actor: ReviewActor
  at: number
  summary: string
  approvedAt?: number
  approvedBy?: { id: string; name: string }
}

export interface ReviewReply {
  id: string
  authorKind: ReviewActorKind
  authorId: string
  authorName: string
  authorColorToken: string
  text: string
  createdAt: number
}

/**
 * Where a comment was authored. Defaults to a normal page pin/draw ("page").
 * "ux-flow" comments are dropped on a styleguide UX-flow diagram node — they
 * carry a `flowRef` and are rendered by the flow editor (not the review
 * canvas, whose document-coord pins would drift on the zoom/pan canvas).
 */
export type ReviewCommentOrigin = "page" | "ux-flow"

export interface ReviewFlowRef {
  /** Flow slug, e.g. "primeiro-acesso". */
  flow: string
  /** Anchored node id in the diagram, when the comment targets a specific node. */
  nodeId?: string
  /** Human label of the anchored node (title), for display in the review inbox. */
  nodeLabel?: string
  /** Position in flow-canvas coordinates where the marker sits. */
  position?: ReviewPoint
}

export interface ReviewComment {
  id: string
  schemaVersion: 3
  authorId: string
  authorName: string
  authorColorToken: string
  createdAt: number
  updatedAt: number
  url: string
  viewportWidth: number
  viewportHeight: number
  scrollY: number
  documentHeight: number
  anchor: ReviewAnchor
  text: string
  images?: string[]
  status: ReviewCommentStatus
  resolution?: ReviewResolution
  replies?: ReviewReply[]
  /** Defaults to "page" when absent. */
  origin?: ReviewCommentOrigin
  /** Present when origin === "ux-flow". */
  flowRef?: ReviewFlowRef
}

export interface ReviewExportPayload {
  schemaVersion: 3
  exportedAt: number
  exportedBy: ReviewIdentity
  comments: ReviewComment[]
  archivedComments?: ReviewComment[]
}
