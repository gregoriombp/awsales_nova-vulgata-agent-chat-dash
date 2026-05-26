import path from "node:path"
import fs from "node:fs"
import { randomUUID } from "node:crypto"
import { JSONFile } from "lowdb/node"
import { Low } from "lowdb"
import {
  formatResolutionSummary,
  FLOW_SCHEMA_VERSION,
  type FlowActor,
  type FlowExportPayload,
  type FlowSuggestion,
  type FlowSuggestionStatus,
} from "./types.js"

interface MainDbShape {
  schemaVersion: number
  suggestions: FlowSuggestion[]
}

interface ArchiveDbShape {
  schemaVersion: number
  suggestions: FlowSuggestion[]
}

const DEFAULT_MAIN: MainDbShape = {
  schemaVersion: FLOW_SCHEMA_VERSION,
  suggestions: [],
}

const DEFAULT_ARCHIVE: ArchiveDbShape = {
  schemaVersion: FLOW_SCHEMA_VERSION,
  suggestions: [],
}

const DATA_DIR = path.resolve(process.cwd(), "data")
const MAIN_FILE = path.join(DATA_DIR, "suggestions.json")
const ARCHIVE_FILE = path.join(DATA_DIR, "suggestions.archive.json")

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const mainAdapter = new JSONFile<MainDbShape>(MAIN_FILE)
const mainDb = new Low<MainDbShape>(mainAdapter, DEFAULT_MAIN)

const archiveAdapter = new JSONFile<ArchiveDbShape>(ARCHIVE_FILE)
const archiveDb = new Low<ArchiveDbShape>(archiveAdapter, DEFAULT_ARCHIVE)

function newId(): string {
  return randomUUID().slice(0, 8)
}

export async function initDb(): Promise<void> {
  await mainDb.read()
  await archiveDb.read()
  mainDb.data ||= { ...DEFAULT_MAIN }
  archiveDb.data ||= { ...DEFAULT_ARCHIVE }

  // Sweep any stale applied/discarded that ended up in the main file
  // (e.g. someone hand-edited the JSON). Move them to archive.
  const stuck: FlowSuggestion[] = []
  mainDb.data.suggestions = mainDb.data.suggestions.filter((s) => {
    if (s.status === "applied" || s.status === "discarded") {
      stuck.push(s)
      return false
    }
    return true
  })
  if (stuck.length) {
    archiveDb.data.suggestions.push(...stuck)
  }
  mainDb.data.schemaVersion = FLOW_SCHEMA_VERSION
  archiveDb.data.schemaVersion = FLOW_SCHEMA_VERSION
  await mainDb.write()
  await archiveDb.write()
}

export function getDataFilePath(): string {
  return MAIN_FILE
}

export function getArchiveFilePath(): string {
  return ARCHIVE_FILE
}

export interface ListFilter {
  flow?: string
  status?: FlowSuggestionStatus
}

export async function listSuggestions(filter: ListFilter): Promise<FlowSuggestion[]> {
  await mainDb.read()
  let out = mainDb.data!.suggestions
  if (filter.flow) {
    out = out.filter((s) => s.flow === filter.flow)
  }
  if (filter.status) {
    out = out.filter((s) => s.status === filter.status)
  }
  return out.slice().sort((a, b) => b.createdAt - a.createdAt)
}

export interface ArchivePage {
  schemaVersion: number
  suggestions: FlowSuggestion[]
  nextBefore?: number
}

export async function listArchive(filter: {
  flow?: string
  before?: number
  limit?: number
}): Promise<ArchivePage> {
  await archiveDb.read()
  let out = archiveDb.data!.suggestions
  if (filter.flow) {
    out = out.filter((s) => s.flow === filter.flow)
  }
  out = out.slice().sort((a, b) => b.updatedAt - a.updatedAt)
  if (typeof filter.before === "number") {
    out = out.filter((s) => s.updatedAt < filter.before!)
  }
  const limit = filter.limit && filter.limit > 0 ? Math.min(filter.limit, 200) : 50
  const page = out.slice(0, limit)
  const nextBefore = page.length === limit ? page[page.length - 1].updatedAt : undefined
  return { schemaVersion: FLOW_SCHEMA_VERSION, suggestions: page, nextBefore }
}

export async function getSuggestion(
  id: string,
): Promise<{ suggestion: FlowSuggestion; location: "main" | "archive" } | null> {
  await mainDb.read()
  const main = mainDb.data!.suggestions.find((s) => s.id === id)
  if (main) return { suggestion: main, location: "main" }
  await archiveDb.read()
  const archived = archiveDb.data!.suggestions.find((s) => s.id === id)
  if (archived) return { suggestion: archived, location: "archive" }
  return null
}

export interface CreateInput {
  flow: string
  description: string
  authorName?: string
  nodes: unknown[]
  edges: unknown[]
}

export async function createSuggestion(input: CreateInput): Promise<FlowSuggestion> {
  await mainDb.read()
  const now = Date.now()
  const suggestion: FlowSuggestion = {
    id: newId(),
    schemaVersion: FLOW_SCHEMA_VERSION,
    flow: input.flow,
    description: input.description,
    createdAt: now,
    updatedAt: now,
    authorName: input.authorName,
    status: "open",
    nodes: input.nodes,
    edges: input.edges,
  }
  mainDb.data!.suggestions.push(suggestion)
  await mainDb.write()
  return suggestion
}

export async function transitionToInReview(
  id: string,
  actor: FlowActor,
): Promise<{ suggestion: FlowSuggestion; location: "main" } | null> {
  await mainDb.read()
  const s = mainDb.data!.suggestions.find((x) => x.id === id)
  if (!s) return null
  if (s.status !== "open") return { suggestion: s, location: "main" }
  s.status = "in_review"
  s.updatedAt = Date.now()
  s.resolution = {
    actor,
    at: s.updatedAt,
    summary: formatResolutionSummary(actor, s.updatedAt, "claimed"),
  }
  await mainDb.write()
  return { suggestion: s, location: "main" }
}

export async function rejectInReview(
  id: string,
): Promise<{ suggestion: FlowSuggestion; location: "main" } | null> {
  await mainDb.read()
  const s = mainDb.data!.suggestions.find((x) => x.id === id)
  if (!s) return null
  if (s.status !== "in_review") return { suggestion: s, location: "main" }
  s.status = "open"
  s.updatedAt = Date.now()
  delete s.resolution
  await mainDb.write()
  return { suggestion: s, location: "main" }
}

export async function archiveWith(
  id: string,
  actor: FlowActor,
  finalStatus: "applied" | "discarded",
): Promise<{ suggestion: FlowSuggestion; location: "archive" } | null> {
  await mainDb.read()
  await archiveDb.read()
  const idx = mainDb.data!.suggestions.findIndex((s) => s.id === id)
  if (idx === -1) return null
  const s = mainDb.data!.suggestions[idx]
  s.status = finalStatus
  s.updatedAt = Date.now()
  s.resolution = {
    actor,
    at: s.updatedAt,
    summary: formatResolutionSummary(actor, s.updatedAt, finalStatus),
  }
  mainDb.data!.suggestions.splice(idx, 1)
  archiveDb.data!.suggestions.push(s)
  await mainDb.write()
  await archiveDb.write()
  return { suggestion: s, location: "archive" }
}

export async function reopenFromArchive(
  id: string,
): Promise<{ suggestion: FlowSuggestion; location: "main" } | null> {
  await archiveDb.read()
  await mainDb.read()
  const idx = archiveDb.data!.suggestions.findIndex((s) => s.id === id)
  if (idx === -1) return null
  const s = archiveDb.data!.suggestions[idx]
  s.status = "open"
  s.updatedAt = Date.now()
  delete s.resolution
  archiveDb.data!.suggestions.splice(idx, 1)
  mainDb.data!.suggestions.push(s)
  await archiveDb.write()
  await mainDb.write()
  return { suggestion: s, location: "main" }
}

export async function deleteSuggestion(id: string): Promise<boolean> {
  await mainDb.read()
  await archiveDb.read()
  const mainIdx = mainDb.data!.suggestions.findIndex((s) => s.id === id)
  if (mainIdx !== -1) {
    mainDb.data!.suggestions.splice(mainIdx, 1)
    await mainDb.write()
    return true
  }
  const archIdx = archiveDb.data!.suggestions.findIndex((s) => s.id === id)
  if (archIdx !== -1) {
    archiveDb.data!.suggestions.splice(archIdx, 1)
    await archiveDb.write()
    return true
  }
  return false
}

export async function exportAll(): Promise<FlowExportPayload> {
  await mainDb.read()
  await archiveDb.read()
  return {
    schemaVersion: FLOW_SCHEMA_VERSION,
    exportedAt: Date.now(),
    suggestions: mainDb.data!.suggestions.slice(),
    archivedSuggestions: archiveDb.data!.suggestions.slice(),
  }
}
