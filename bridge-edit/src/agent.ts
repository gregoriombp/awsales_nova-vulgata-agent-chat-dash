import { exec } from "node:child_process"
import { promisify } from "node:util"
import {
  query,
  type SDKMessage,
  type SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk"
import { buildSystemPrompt, type ElementRef } from "./system.js"

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
  } catch {
    cachedStatus = {
      ready: false,
      reason:
        "Claude Code CLI não encontrado no PATH. Execute `npm install -g @anthropic-ai/claude-code` e depois `claude login`.",
    }
  }
  cacheAt = Date.now()
  return cachedStatus
}

export type ChatImage = {
  mediaType: string
  base64: string
}

export type ChatTurn = {
  role: "user" | "assistant"
  text: string
}

export type ChatRequest = {
  prompt: string
  history?: ChatTurn[]
  refs?: ElementRef[]
  images?: ChatImage[]
  cwd: string
}

export type StreamEvent =
  | { kind: "status"; text: string }
  | { kind: "chunk"; text: string }
  | { kind: "assistant"; text: string }
  | { kind: "tool_use"; id: string; name: string; input: unknown }
  | {
      kind: "tool_result"
      tool_use_id: string
      content: string
      isError?: boolean
    }
  | { kind: "result"; text: string; durationMs?: number; costUsd?: number }
  | { kind: "error"; message: string }

const ALLOWED_TOOLS = ["Read", "Edit", "Write", "Glob", "Grep", "Bash"]

async function* multimodalPrompt(
  text: string,
  history: ChatTurn[],
  images: ChatImage[]
): AsyncGenerator<SDKUserMessage> {
  for (const turn of history) {
    if (turn.role !== "user") continue
    yield {
      type: "user",
      parent_tool_use_id: null,
      message: {
        role: "user",
        content: [{ type: "text", text: turn.text }],
      },
    }
  }

  yield {
    type: "user",
    parent_tool_use_id: null,
    message: {
      role: "user",
      content: [
        { type: "text", text },
        ...images.map((img) => ({
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: img.mediaType as
              | "image/jpeg"
              | "image/png"
              | "image/gif"
              | "image/webp",
            data: img.base64,
          },
        })),
      ],
    },
  }
}

export async function* runChat(
  req: ChatRequest
): AsyncGenerator<StreamEvent> {
  yield { kind: "status", text: "Iniciando Claude Code…" }

  const systemPrompt = buildSystemPrompt(req.refs ?? [], req.cwd)
  const abortController = new AbortController()
  const model = process.env.CLAUDE_EDIT_MODEL ?? "claude-sonnet-4-6"

  const promptArg: AsyncIterable<SDKUserMessage> = multimodalPrompt(
    req.prompt,
    req.history ?? [],
    req.images ?? []
  )

  let resultText = ""
  try {
    const q = query({
      prompt: promptArg,
      options: {
        systemPrompt,
        model,
        cwd: req.cwd,
        allowedTools: ALLOWED_TOOLS,
        maxTurns: Number(process.env.CLAUDE_EDIT_MAX_TURNS ?? 40),
        settingSources: ["project"],
        includePartialMessages: true,
        permissionMode: "bypassPermissions",
        abortController,
      } as never,
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
                    "is_error" in block ? Boolean(block.is_error) : undefined,
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

  void resultText
}
