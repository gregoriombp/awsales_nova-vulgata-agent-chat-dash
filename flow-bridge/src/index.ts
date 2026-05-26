import cors from "cors"
import express from "express"
import {
  archiveWith,
  createSuggestion,
  deleteSuggestion,
  exportAll,
  getArchiveFilePath,
  getDataFilePath,
  getSuggestion,
  initDb,
  listArchive,
  listSuggestions,
  rejectInReview,
  reopenFromArchive,
  transitionToInReview,
} from "./store.js"
import { requireToken, tokenConfigured } from "./auth.js"
import {
  FLOW_SCHEMA_VERSION,
  type FlowActor,
  type FlowSuggestionStatus,
} from "./types.js"

const PORT = Number(process.env.BOMBARDIER_FLOW_PORT ?? 9879)
const HOST = process.env.BOMBARDIER_FLOW_HOST ?? "0.0.0.0"
const VERSION = "0.1.0"

await initDb()

const app = express()

const lanOriginRegex =
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[a-z0-9-]+\.local)(:\d+)?$/

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (lanOriginRegex.test(origin)) return cb(null, true)
      cb(new Error(`Origin not allowed: ${origin}`))
    },
    credentials: false,
    exposedHeaders: ["Content-Type"],
  }),
)
app.use(express.json({ limit: "8mb" }))

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    version: VERSION,
    service: "bombardier-flow-bridge",
    tokenRequired: tokenConfigured(),
    dataFile: getDataFilePath(),
    archiveFile: getArchiveFilePath(),
    schemaVersion: FLOW_SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    port: PORT,
  })
})

function parseStatus(value: unknown): FlowSuggestionStatus | undefined {
  if (value === "open" || value === "in_review" || value === "applied" || value === "discarded") {
    return value
  }
  return undefined
}

function isValidActor(value: unknown): value is FlowActor {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    (v.kind === "agent" || v.kind === "user") &&
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    v.name.length > 0
  )
}

function isSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]+$/i.test(value) && value.length <= 64
}

app.get("/suggestions", requireToken, async (req, res) => {
  const flow = typeof req.query.flow === "string" ? req.query.flow : undefined
  if (flow !== undefined && !isSlug(flow)) {
    res.status(400).json({ error: "invalid_flow" })
    return
  }
  const status = parseStatus(req.query.status)
  const suggestions = await listSuggestions({ flow, status })
  res.json({ suggestions })
})

app.get("/suggestions/archive", requireToken, async (req, res) => {
  const flow = typeof req.query.flow === "string" ? req.query.flow : undefined
  if (flow !== undefined && !isSlug(flow)) {
    res.status(400).json({ error: "invalid_flow" })
    return
  }
  const beforeRaw = typeof req.query.before === "string" ? Number(req.query.before) : undefined
  const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined
  const before = Number.isFinite(beforeRaw) ? Number(beforeRaw) : undefined
  const limit = Number.isFinite(limitRaw) ? Number(limitRaw) : undefined
  const page = await listArchive({ flow, before, limit })
  res.json(page)
})

app.get("/suggestions/:id", requireToken, async (req, res) => {
  const id = String(req.params.id)
  const result = await getSuggestion(id)
  if (!result) {
    res.status(404).json({ error: "not_found" })
    return
  }
  res.json({ suggestion: result.suggestion, location: result.location })
})

app.post("/suggestions", requireToken, async (req, res) => {
  const body = req.body as Record<string, unknown> | null
  if (!body) {
    res.status(400).json({ error: "invalid_payload" })
    return
  }
  const { flow, description, nodes, edges, authorName } = body
  if (!isSlug(flow)) {
    res.status(400).json({ error: "invalid_flow" })
    return
  }
  if (typeof description !== "string" || !description.trim()) {
    res.status(400).json({ error: "description_required" })
    return
  }
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    res.status(400).json({ error: "nodes_edges_must_be_arrays" })
    return
  }
  const suggestion = await createSuggestion({
    flow,
    description: description.trim().slice(0, 500),
    nodes,
    edges,
    authorName: typeof authorName === "string" ? authorName.trim().slice(0, 80) : undefined,
  })
  res.json({ suggestion })
})

app.put("/suggestions/:id", requireToken, async (req, res) => {
  const id = String(req.params.id)
  const body = req.body as Record<string, unknown> | null
  if (!body) {
    res.status(400).json({ error: "invalid_payload" })
    return
  }
  const transition = body.transition
  if (typeof transition !== "string") {
    res.status(400).json({ error: "transition_required" })
    return
  }
  const actor = body.actor
  if (transition === "in_review") {
    if (!isValidActor(actor)) {
      res.status(400).json({ error: "invalid_actor" })
      return
    }
    const result = await transitionToInReview(id, actor)
    if (!result) {
      res.status(404).json({ error: "not_found" })
      return
    }
    res.json({ ok: true, suggestion: result.suggestion, location: result.location })
    return
  }
  if (transition === "reject") {
    const result = await rejectInReview(id)
    if (!result) {
      res.status(404).json({ error: "not_found" })
      return
    }
    res.json({ ok: true, suggestion: result.suggestion, location: result.location })
    return
  }
  if (transition === "apply" || transition === "discard") {
    if (!isValidActor(actor)) {
      res.status(400).json({ error: "invalid_actor" })
      return
    }
    const final = transition === "apply" ? "applied" : "discarded"
    const result = await archiveWith(id, actor, final)
    if (!result) {
      res.status(404).json({ error: "not_found" })
      return
    }
    res.json({ ok: true, suggestion: result.suggestion, location: result.location })
    return
  }
  if (transition === "reopen_from_archive") {
    const result = await reopenFromArchive(id)
    if (!result) {
      res.status(404).json({ error: "not_found" })
      return
    }
    res.json({ ok: true, suggestion: result.suggestion, location: result.location })
    return
  }
  res.status(400).json({ error: "unknown_transition" })
})

app.delete("/suggestions/:id", requireToken, async (req, res) => {
  const removed = await deleteSuggestion(String(req.params.id))
  if (!removed) {
    res.status(404).json({ error: "not_found" })
    return
  }
  res.json({ ok: true })
})

app.get("/export", requireToken, async (_req, res) => {
  const payload = await exportAll()
  res.json(payload)
})

app.listen(PORT, HOST, () => {
  const tokenMsg = tokenConfigured()
    ? "✓ Token configurado"
    : "✗ Token NÃO configurado — bridge não vai aceitar requests"
  console.log(
    [
      `bombardier-flow-bridge ${VERSION}`,
      `→ ouvindo em http://${HOST}:${PORT}`,
      `→ data file: ${getDataFilePath()}`,
      `→ archive file: ${getArchiveFilePath()}`,
      `→ schema: v${FLOW_SCHEMA_VERSION}`,
      `→ ${tokenMsg}`,
    ].join("\n"),
  )
})
