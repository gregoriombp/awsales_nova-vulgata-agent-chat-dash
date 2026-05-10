import type {
  ReviewComment,
  ReviewCommentStatus,
  ReviewExportPayload,
  ReviewIdentity,
} from "../types"

export interface ReviewStorageFilter {
  url?: string
  status?: ReviewCommentStatus
}

export interface ReviewStorage {
  getIdentity(): Promise<ReviewIdentity | null>
  setIdentity(identity: ReviewIdentity): Promise<void>

  listComments(filter?: ReviewStorageFilter): Promise<ReviewComment[]>
  getComment(id: string): Promise<ReviewComment | null>
  saveComment(comment: ReviewComment): Promise<void>
  deleteComment(id: string): Promise<void>

  exportAll(): Promise<ReviewExportPayload>
  importMerge(
    payload: ReviewExportPayload
  ): Promise<{ added: number; skipped: number }>

  subscribe?(onChange: () => void): () => void
}
