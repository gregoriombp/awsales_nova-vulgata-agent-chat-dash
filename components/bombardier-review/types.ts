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

export type ReviewCommentStatus = "open" | "resolved"

export interface ReviewComment {
  id: string
  schemaVersion: 2
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
  resolvedBy?: string
  resolvedAt?: number
}

export interface ReviewExportPayload {
  schemaVersion: 2
  exportedAt: number
  exportedBy: ReviewIdentity
  comments: ReviewComment[]
}
