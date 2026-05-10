import path from "node:path"
import fs from "node:fs"
import { JSONFile } from "lowdb/node"
import { Low } from "lowdb"
import type {
  ReviewComment,
  ReviewExportPayload,
  ReviewIdentity,
} from "./types.js"

interface DbShape {
  schemaVersion: 2
  comments: ReviewComment[]
  identities: ReviewIdentity[]
}

const DEFAULT_DB: DbShape = {
  schemaVersion: 2,
  comments: [],
  identities: [],
}

const DATA_DIR = path.resolve(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "comments.json")

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const adapter = new JSONFile<DbShape>(DATA_FILE)
const db = new Low<DbShape>(adapter, DEFAULT_DB)

export async function initDb(): Promise<void> {
  await db.read()
  if (!db.data) db.data = { ...DEFAULT_DB }
  if (db.data.schemaVersion !== 2) {
    db.data = { ...DEFAULT_DB, comments: [], identities: [] }
  }
  if (!Array.isArray(db.data.comments)) db.data.comments = []
  if (!Array.isArray(db.data.identities)) db.data.identities = []
  await db.write()
}

export interface ListFilter {
  url?: string
  status?: ReviewComment["status"]
}

export async function listComments(
  filter?: ListFilter
): Promise<ReviewComment[]> {
  await db.read()
  const all = db.data?.comments ?? []
  return all
    .filter((c) => {
      if (filter?.url && c.url !== filter.url) return false
      if (filter?.status && c.status !== filter.status) return false
      return true
    })
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function getComment(id: string): Promise<ReviewComment | null> {
  await db.read()
  return db.data?.comments.find((c) => c.id === id) ?? null
}

export async function upsertComment(comment: ReviewComment): Promise<void> {
  await db.read()
  if (!db.data) db.data = { ...DEFAULT_DB }
  const idx = db.data.comments.findIndex((c) => c.id === comment.id)
  if (idx === -1) {
    db.data.comments.push(comment)
  } else {
    db.data.comments[idx] = comment
  }
  await db.write()
}

export async function deleteComment(id: string): Promise<boolean> {
  await db.read()
  if (!db.data) return false
  const before = db.data.comments.length
  db.data.comments = db.data.comments.filter((c) => c.id !== id)
  const removed = db.data.comments.length !== before
  if (removed) await db.write()
  return removed
}

export async function listIdentities(): Promise<ReviewIdentity[]> {
  await db.read()
  return db.data?.identities ?? []
}

export async function upsertIdentity(identity: ReviewIdentity): Promise<void> {
  await db.read()
  if (!db.data) db.data = { ...DEFAULT_DB }
  const idx = db.data.identities.findIndex((i) => i.id === identity.id)
  if (idx === -1) {
    db.data.identities.push(identity)
  } else {
    db.data.identities[idx] = identity
  }
  await db.write()
}

export async function exportAll(): Promise<ReviewExportPayload> {
  await db.read()
  const identities = db.data?.identities ?? []
  const exportedBy = identities[0] ?? {
    id: "server",
    name: "Server",
    colorToken: "var(--fg-tertiary)",
    createdAt: 0,
  }
  return {
    schemaVersion: 2,
    exportedAt: Date.now(),
    exportedBy,
    comments: db.data?.comments ?? [],
  }
}

export async function importMerge(
  payload: ReviewExportPayload
): Promise<{ added: number; skipped: number }> {
  await db.read()
  if (!db.data) db.data = { ...DEFAULT_DB }
  const byId = new Map(db.data.comments.map((c) => [c.id, c]))
  let added = 0
  let skipped = 0
  for (const c of payload.comments) {
    if (byId.has(c.id)) {
      skipped++
      continue
    }
    db.data.comments.push(c)
    added++
  }
  await db.write()
  return { added, skipped }
}

export function getDataFilePath(): string {
  return DATA_FILE
}
