import cors from "cors"
import express from "express"
import {
  deleteComment,
  exportAll,
  getComment,
  getDataFilePath,
  importMerge,
  initDb,
  listComments,
  upsertComment,
  upsertIdentity,
} from "./store.js"
import { requireToken, tokenConfigured } from "./auth.js"
import {
  attachSubscriber,
  broadcast,
  broadcastHeartbeat,
  subscriberCount,
} from "./sse.js"
import type { ReviewComment, ReviewIdentity } from "./types.js"

const PORT = Number(process.env.BOMBARDIER_REVIEW_PORT ?? 9878)
const HOST = process.env.BOMBARDIER_REVIEW_HOST ?? "0.0.0.0"
const VERSION = "0.1.0"
const HEARTBEAT_INTERVAL_MS = 15_000

await initDb()

const app = express()

const lanOriginRegex =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (lanOriginRegex.test(origin)) return cb(null, true)
      cb(new Error(`Origin not allowed: ${origin}`))
    },
    credentials: false,
    exposedHeaders: ["Content-Type"],
  })
)
app.use(express.json({ limit: "8mb" }))

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    version: VERSION,
    service: "bombardier-review-bridge",
    tokenRequired: tokenConfigured(),
    subscribers: subscriberCount(),
    dataFile: getDataFilePath(),
    timestamp: new Date().toISOString(),
    port: PORT,
  })
})

app.get("/comments", requireToken, async (req, res) => {
  const url =
    typeof req.query.url === "string" ? req.query.url : undefined
  const status =
    req.query.status === "open" || req.query.status === "resolved"
      ? req.query.status
      : undefined
  const comments = await listComments({ url, status })
  res.json({ comments })
})

app.get("/comments/:id", requireToken, async (req, res) => {
  const comment = await getComment(String(req.params.id))
  if (!comment) {
    res.status(404).json({ error: "not_found" })
    return
  }
  res.json({ comment })
})

function isValidComment(value: unknown): value is ReviewComment {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === "string" &&
    v.schemaVersion === 2 &&
    typeof v.authorId === "string" &&
    typeof v.text === "string" &&
    typeof v.url === "string" &&
    !!v.anchor &&
    typeof v.anchor === "object"
  )
}

app.put("/comments/:id", requireToken, async (req, res) => {
  const body = req.body as unknown
  if (!isValidComment(body)) {
    res.status(400).json({ error: "invalid_comment" })
    return
  }
  if (body.id !== String(req.params.id)) {
    res.status(400).json({ error: "id_mismatch" })
    return
  }
  await upsertComment(body)
  broadcast({ kind: "comment.upserted", comment: body })
  res.json({ ok: true })
})

app.delete("/comments/:id", requireToken, async (req, res) => {
  const removed = await deleteComment(String(req.params.id))
  if (!removed) {
    res.status(404).json({ error: "not_found" })
    return
  }
  broadcast({ kind: "comment.deleted", id: String(req.params.id) })
  res.json({ ok: true })
})

app.put("/identity/:id", requireToken, async (req, res) => {
  const body = req.body as unknown
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as ReviewIdentity).id !== "string" ||
    typeof (body as ReviewIdentity).name !== "string" ||
    typeof (body as ReviewIdentity).colorToken !== "string"
  ) {
    res.status(400).json({ error: "invalid_identity" })
    return
  }
  const identity = body as ReviewIdentity
  if (identity.id !== String(req.params.id)) {
    res.status(400).json({ error: "id_mismatch" })
    return
  }
  await upsertIdentity(identity)
  res.json({ ok: true })
})

app.get("/export", requireToken, async (_req, res) => {
  const payload = await exportAll()
  res.json(payload)
})

app.post("/import", requireToken, async (req, res) => {
  const body = req.body as unknown
  if (
    !body ||
    typeof body !== "object" ||
    (body as { schemaVersion?: number }).schemaVersion !== 2 ||
    !Array.isArray((body as { comments?: unknown[] }).comments)
  ) {
    res.status(400).json({ error: "invalid_payload" })
    return
  }
  const payload = body as Parameters<typeof importMerge>[0]
  const validComments = payload.comments.filter(isValidComment)
  const result = await importMerge({ ...payload, comments: validComments })
  for (const c of validComments) {
    broadcast({ kind: "comment.upserted", comment: c })
  }
  res.json(result)
})

app.get("/events", requireToken, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8")
  res.setHeader("Cache-Control", "no-cache, no-transform")
  res.setHeader("Connection", "keep-alive")
  res.setHeader("X-Accel-Buffering", "no")
  res.flushHeaders?.()

  const detach = attachSubscriber(res)
  req.on("close", detach)
})

setInterval(broadcastHeartbeat, HEARTBEAT_INTERVAL_MS).unref()

app.listen(PORT, HOST, () => {
  const tokenMsg = tokenConfigured()
    ? "✓ Token configurado"
    : "✗ Token NÃO configurado — bridge não vai aceitar requests"
  console.log(
    [
      `bombardier-review-bridge ${VERSION}`,
      `→ ouvindo em http://${HOST}:${PORT}`,
      `→ data file: ${getDataFilePath()}`,
      `→ ${tokenMsg}`,
    ].join("\n")
  )
})
