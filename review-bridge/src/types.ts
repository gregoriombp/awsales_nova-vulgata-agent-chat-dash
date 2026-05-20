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

export type ReviewAnchor =
  | { kind: "pin"; position: ReviewPoint }
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

export const REVIEW_SCHEMA_VERSION = 3

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
}

export interface ReviewExportPayload {
  schemaVersion: 3
  exportedAt: number
  exportedBy: ReviewIdentity
  comments: ReviewComment[]
  archivedComments?: ReviewComment[]
}

export type BridgeEvent =
  | { kind: "comment.upserted"; comment: ReviewComment }
  | { kind: "comment.deleted"; id: string }
  | { kind: "comment.archived"; comment: ReviewComment }
  | { kind: "comment.unarchived"; comment: ReviewComment }
  | { kind: "reply.added"; commentId: string; reply: ReviewReply }
  | { kind: "hello"; serverStartedAt: number }

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/**
 * Server timezone. The summary string is meant to be human-readable inside
 * the team — DD/MM/YYYY, hour-of-day from server clock. Documented in README.
 */
export function formatResolutionSummary(actor: ReviewActor, at: number): string {
  const d = new Date(at)
  const day = pad2(d.getDate())
  const month = pad2(d.getMonth() + 1)
  const year = d.getFullYear()
  const hours = pad2(d.getHours())
  const minutes = pad2(d.getMinutes())
  const seconds = pad2(d.getSeconds())
  return `Resolvido por ${actor.name} em ${day}/${month}/${year} às ${hours}:${minutes}:${seconds}.`
}
