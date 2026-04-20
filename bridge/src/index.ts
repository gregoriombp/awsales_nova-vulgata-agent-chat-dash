import cors from "cors"
import express from "express"
import {
  extractJsonNodes,
  getClaudeStatus,
  runGenerate,
  type GenerateRequest,
  type StreamEvent,
} from "./claude.js"
import { skillAvailable, skillPath } from "./skill.js"
import { allowedTools } from "./tools/index.js"

const PORT = Number(process.env.BOMBARDIER_BRIDGE_PORT ?? 9876)
const VERSION = "0.3.0"

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
]

const app = express()

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`Origin not allowed: ${origin}`))
    },
    credentials: true,
  })
)
app.use(express.json({ limit: "40mb" }))

app.get("/health", async (_req, res) => {
  const claude = await getClaudeStatus()
  const skill = skillAvailable()
  const ready = claude.ready && skill
  res.json({
    ok: true,
    version: VERSION,
    phase: "phase-3",
    claude: {
      ready,
      version: claude.version,
      executable: claude.executable,
      reason: !claude.ready
        ? claude.reason
        : !skill
        ? `Skill não encontrada em ${skillPath()}.`
        : undefined,
    },
    skill: { path: skillPath(), exists: skill },
    tools: allowedTools.map((t) => t.replace(/^mcp__[^_]+__/, "")),
    timestamp: new Date().toISOString(),
    port: PORT,
  })
})

function writeSse(res: express.Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

app.post("/generate", async (req, res) => {
  const status = await getClaudeStatus(true)
  if (!status.ready) {
    res.status(503).json({ error: "claude_not_ready", reason: status.reason })
    return
  }
  if (!skillAvailable()) {
    res.status(503).json({
      error: "skill_missing",
      reason: `Esperado em ${skillPath()}`,
    })
    return
  }

  const body = req.body as Partial<GenerateRequest>
  if (!body?.prompt || typeof body.prompt !== "string") {
    res.status(400).json({ error: "missing_prompt" })
    return
  }
  if (!body.manifest || typeof body.manifest !== "object") {
    res.status(400).json({ error: "missing_manifest" })
    return
  }
  if (body.images) {
    if (!Array.isArray(body.images)) {
      res.status(400).json({ error: "images_must_be_array" })
      return
    }
    if (body.images.length > 4) {
      res.status(413).json({ error: "too_many_images", max: 4 })
      return
    }
    for (const img of body.images) {
      if (
        !img ||
        typeof img !== "object" ||
        typeof img.mediaType !== "string" ||
        typeof img.base64 !== "string"
      ) {
        res.status(400).json({ error: "invalid_image_shape" })
        return
      }
      if (!/^image\/(jpeg|png|gif|webp)$/.test(img.mediaType)) {
        res.status(415).json({
          error: "unsupported_media_type",
          mediaType: img.mediaType,
        })
        return
      }
      if (img.base64.length > 8_000_000) {
        res.status(413).json({ error: "image_too_large", maxBase64Bytes: 8_000_000 })
        return
      }
    }
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8")
  res.setHeader("Cache-Control", "no-cache, no-transform")
  res.setHeader("Connection", "keep-alive")
  res.setHeader("X-Accel-Buffering", "no")
  res.flushHeaders?.()

  let aborted = false
  req.on("close", () => {
    aborted = true
  })

  let fullText = ""
  let lastAssistant = ""

  try {
    for await (const ev of runGenerate(body as GenerateRequest) as AsyncIterable<StreamEvent>) {
      if (aborted) break
      switch (ev.kind) {
        case "status":
          writeSse(res, "status", { text: ev.text })
          break
        case "chunk":
          fullText += ev.text
          writeSse(res, "chunk", { text: ev.text })
          break
        case "assistant":
          lastAssistant = ev.text
          writeSse(res, "assistant", { text: ev.text })
          break
        case "tool_use":
          writeSse(res, "tool_use", {
            id: ev.id,
            name: ev.name,
            input: ev.input,
          })
          break
        case "tool_result":
          writeSse(res, "tool_result", {
            tool_use_id: ev.tool_use_id,
            content: ev.content,
            isError: ev.isError,
          })
          break
        case "result": {
          const source = ev.text || lastAssistant || fullText
          const nodes = extractJsonNodes(source)
          writeSse(res, "result", {
            text: source,
            nodes,
            durationMs: ev.durationMs,
            costUsd: ev.costUsd,
          })
          break
        }
        case "error":
          writeSse(res, "error", { message: ev.message })
          break
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    writeSse(res, "error", { message })
  } finally {
    writeSse(res, "done", { ok: !aborted })
    res.end()
  }
})

app.listen(PORT, "127.0.0.1", async () => {
  const status = await getClaudeStatus(true)
  console.log("")
  console.log(`  🚁  Bombardier bridge v${VERSION}`)
  console.log(`      http://localhost:${PORT}  (health + generate)`)
  if (status.ready) {
    console.log(`      Claude Code:  ${status.version}`)
  } else {
    console.log(`      Claude Code:  indisponível`)
    console.log(`      ${status.reason}`)
  }
  console.log(
    `      Skill:        ${skillAvailable() ? "ok" : "faltando em " + skillPath()}`
  )
  console.log("")
})
