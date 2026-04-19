import { exec } from "node:child_process"
import { promisify } from "node:util"
import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk"
import { setManifest } from "./manifest-cache.js"
import { buildSystemPrompt, type SkillContext } from "./skill.js"
import { allowedTools, createToolServer, SERVER_NAME } from "./tools/index.js"

const pexec = promisify(exec)

export type ClaudeStatus = {
  ready: boolean
  version?: string
  reason?: string
  executable?: string
}

let cachedStatus: ClaudeStatus | null = null
let cacheAt = 0
const CACHE_MS = 30_000

export async function getClaudeStatus(force = false): Promise<ClaudeStatus> {
  if (!force && cachedStatus && Date.now() - cacheAt < CACHE_MS) {
    return cachedStatus
  }
  try {
    const { stdout } = await pexec("claude --version", { timeout: 3000 })
    const version = stdout.trim()
    const whichOut = await pexec("which claude", { timeout: 1500 }).catch(
      () => ({ stdout: "" })
    )
    cachedStatus = {
      ready: true,
      version,
      executable: whichOut.stdout.trim() || undefined,
    }
  } catch (err) {
    cachedStatus = {
      ready: false,
      reason:
        "Claude Code CLI não encontrado no PATH. Execute `npm install -g @anthropic-ai/claude-code` e depois `claude login`.",
    }
  }
  cacheAt = Date.now()
  return cachedStatus
}

export type GenerateRequest = {
  prompt: string
  manifest: {
    palette: unknown
    tokens: unknown
    awOutsidePalette: unknown
  }
  currentTree?: unknown
}

export type StreamEvent =
  | { kind: "status"; text: string }
  | { kind: "chunk"; text: string }
  | { kind: "assistant"; text: string }
  | {
      kind: "tool_use"
      name: string
      input: unknown
      id: string
    }
  | {
      kind: "tool_result"
      tool_use_id: string
      content: string
      isError?: boolean
    }
  | { kind: "result"; text: string; durationMs?: number; costUsd?: number }
  | { kind: "error"; message: string }

export async function* runGenerate(
  req: GenerateRequest
): AsyncGenerator<StreamEvent> {
  const ctx: SkillContext = {
    palette: req.manifest.palette,
    tokens: req.manifest.tokens,
    awOutsidePalette: req.manifest.awOutsidePalette,
    currentTree: req.currentTree ?? [],
  }
  const systemPrompt = buildSystemPrompt(ctx)

  if (req.manifest && typeof req.manifest === "object") {
    setManifest({
      builder: { palette: (req.manifest.palette ?? []) as never },
      designSystem: {
        componentsInPalette: [],
        componentsOutsidePalette:
          (req.manifest.awOutsidePalette as string[] | undefined) ?? [],
        tokens: req.manifest.tokens ?? {},
      },
    })
  }

  yield { kind: "status", text: "Iniciando Claude Code…" }

  const abortController = new AbortController()
  const model = process.env.BOMBARDIER_CLAUDE_MODEL ?? "claude-sonnet-4-6"

  const toolServer = createToolServer()

  let resultText = ""
  try {
    const q = query({
      prompt: req.prompt,
      options: {
        systemPrompt,
        model,
        mcpServers: { [SERVER_NAME]: toolServer },
        tools: allowedTools,
        maxTurns: 6,
        includePartialMessages: true,
        permissionMode: "bypassPermissions",
        abortController,
      },
    })

    for await (const msg of q as AsyncIterable<SDKMessage>) {
      switch (msg.type) {
        case "stream_event": {
          const ev = msg.event as {
            type?: string
            delta?: { type?: string; text?: string }
          }
          if (
            ev.type === "content_block_delta" &&
            ev.delta?.type === "text_delta" &&
            typeof ev.delta.text === "string"
          ) {
            yield { kind: "chunk", text: ev.delta.text }
          }
          break
        }
        case "assistant": {
          const content = msg.message?.content
          if (Array.isArray(content)) {
            for (const block of content) {
              if (!block || typeof block !== "object" || !("type" in block))
                continue
              if (
                block.type === "text" &&
                "text" in block &&
                typeof block.text === "string"
              ) {
                yield { kind: "assistant", text: block.text }
              } else if (
                block.type === "tool_use" &&
                "name" in block &&
                "input" in block &&
                "id" in block
              ) {
                yield {
                  kind: "tool_use",
                  name: String(block.name),
                  input: block.input,
                  id: String(block.id),
                }
              }
            }
          }
          break
        }
        case "user": {
          const content = msg.message?.content
          if (Array.isArray(content)) {
            for (const block of content) {
              if (!block || typeof block !== "object" || !("type" in block))
                continue
              if (
                block.type === "tool_result" &&
                "tool_use_id" in block &&
                "content" in block
              ) {
                const raw = block.content
                let text = ""
                if (typeof raw === "string") text = raw
                else if (Array.isArray(raw)) {
                  for (const c of raw) {
                    if (
                      c &&
                      typeof c === "object" &&
                      "type" in c &&
                      c.type === "text" &&
                      "text" in c
                    ) {
                      text += String(c.text)
                    }
                  }
                }
                yield {
                  kind: "tool_result",
                  tool_use_id: String(block.tool_use_id),
                  content: text,
                  isError:
                    "is_error" in block
                      ? Boolean(block.is_error)
                      : undefined,
                }
              }
            }
          }
          break
        }
        case "result": {
          if (msg.subtype === "success") {
            resultText = msg.result
            yield {
              kind: "result",
              text: msg.result,
              durationMs: msg.duration_ms,
              costUsd: msg.total_cost_usd,
            }
          } else {
            yield {
              kind: "error",
              message: `Claude retornou erro (${msg.subtype}).`,
            }
          }
          break
        }
        default:
          break
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    yield { kind: "error", message }
  }

  if (!resultText) {
    // no-op; caller already got events
  }
}

export function extractJsonNodes(text: string): unknown[] | null {
  const matches = [...text.matchAll(/```json\s*\n([\s\S]*?)\n```/g)]
  if (matches.length === 0) {
    const loose = text.match(/\[\s*\{[\s\S]*\}\s*\]/)
    if (!loose) return null
    try {
      const parsed = JSON.parse(loose[0])
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  const last = matches[matches.length - 1][1]
  try {
    const parsed = JSON.parse(last)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}
