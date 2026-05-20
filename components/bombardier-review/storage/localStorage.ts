"use client"

import { SCHEMA_VERSION, STORAGE_KEYS } from "../constants"
import type {
  ReviewComment,
  ReviewExportPayload,
  ReviewIdentity,
} from "../types"
import type { ReviewStorage, ReviewStorageFilter } from "./types"
import { safeParseComments } from "./utils"

function readAllRaw(): ReviewComment[] {
  if (typeof window === "undefined") return []
  return safeParseComments(window.localStorage.getItem(STORAGE_KEYS.comments))
}

function writeAllRaw(comments: ReviewComment[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(
    STORAGE_KEYS.comments,
    JSON.stringify(comments)
  )
  window.localStorage.setItem(
    STORAGE_KEYS.schemaVersion,
    String(SCHEMA_VERSION)
  )
}

function applyFilter(
  comments: ReviewComment[],
  filter?: ReviewStorageFilter
): ReviewComment[] {
  if (!filter) return comments
  return comments.filter((c) => {
    if (filter.url !== undefined && c.url !== filter.url) return false
    if (filter.status !== undefined && c.status !== filter.status) return false
    return true
  })
}

export class LocalStorageReview implements ReviewStorage {
  async getIdentity(): Promise<ReviewIdentity | null> {
    if (typeof window === "undefined") return null
    const raw = window.localStorage.getItem(STORAGE_KEYS.identity)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as ReviewIdentity
      if (
        parsed &&
        typeof parsed.id === "string" &&
        typeof parsed.name === "string" &&
        typeof parsed.colorToken === "string"
      ) {
        return parsed
      }
      return null
    } catch {
      return null
    }
  }

  async setIdentity(identity: ReviewIdentity): Promise<void> {
    if (typeof window === "undefined") return
    window.localStorage.setItem(
      STORAGE_KEYS.identity,
      JSON.stringify(identity)
    )
  }

  async listComments(filter?: ReviewStorageFilter): Promise<ReviewComment[]> {
    return applyFilter(readAllRaw(), filter).sort(
      (a, b) => b.createdAt - a.createdAt
    )
  }

  async getComment(id: string): Promise<ReviewComment | null> {
    return readAllRaw().find((c) => c.id === id) ?? null
  }

  async saveComment(comment: ReviewComment): Promise<void> {
    const all = readAllRaw()
    const idx = all.findIndex((c) => c.id === comment.id)
    if (idx === -1) {
      all.push(comment)
    } else {
      all[idx] = comment
    }
    writeAllRaw(all)
  }

  async deleteComment(id: string): Promise<void> {
    const all = readAllRaw().filter((c) => c.id !== id)
    writeAllRaw(all)
  }

  async exportAll(): Promise<ReviewExportPayload> {
    const identity = await this.getIdentity()
    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: Date.now(),
      exportedBy: identity ?? {
        id: "anonymous",
        name: "Anônimo",
        colorToken: "var(--fg-tertiary)",
        createdAt: 0,
      },
      comments: readAllRaw(),
    }
  }

  async importMerge(
    payload: ReviewExportPayload
  ): Promise<{ added: number; skipped: number }> {
    const all = readAllRaw()
    const byId = new Map(all.map((c) => [c.id, c]))
    let added = 0
    let skipped = 0
    for (const comment of payload.comments) {
      if (byId.has(comment.id)) {
        skipped++
        continue
      }
      all.push(comment)
      added++
    }
    writeAllRaw(all)
    return { added, skipped }
  }

  subscribe(onChange: () => void): () => void {
    if (typeof window === "undefined") return () => {}
    const handler = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEYS.comments ||
        e.key === STORAGE_KEYS.identity ||
        e.key === null
      ) {
        onChange()
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }
}
