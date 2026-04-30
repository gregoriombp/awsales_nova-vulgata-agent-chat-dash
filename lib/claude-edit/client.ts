import * as React from "react"
import { parseSseStream } from "./sse"
import type {
  BridgeHealth,
  BridgeState,
  ChatAttachment,
  ChatMessage,
  ElementRef,
} from "./types"

export const BRIDGE_URL =
  process.env.NEXT_PUBLIC_CLAUDE_EDIT_BRIDGE_URL ?? "http://localhost:9877"

export function useBridgeStatus(): BridgeState {
  const [state, setState] = React.useState<BridgeState>({ kind: "checking" })
  React.useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 2500)
        const res = await fetch(`${BRIDGE_URL}/health`, {
          signal: controller.signal,
        })
        clearTimeout(timer)
        if (cancelled) return
        const data: BridgeHealth = await res.json()
        if (data.claude?.ready) setState({ kind: "ready", info: data })
        else setState({ kind: "half", info: data })
      } catch {
        if (cancelled) return
        setState({ kind: "offline" })
      }
    }
    check()
    const id = setInterval(check, 7000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])
  return state
}

export type ChatStreamArgs = {
  prompt: string
  history: { role: "user" | "assistant"; text: string }[]
  refs: ElementRef[]
  attachments: ChatAttachment[]
  signal?: AbortSignal
  onEvent: (event: string, data: unknown) => void
}

export async function streamChat(args: ChatStreamArgs): Promise<void> {
  const res = await fetch(`${BRIDGE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: args.signal,
    body: JSON.stringify({
      prompt: args.prompt,
      history: args.history,
      refs: args.refs,
      images: args.attachments.map((a) => ({
        mediaType: a.mediaType,
        base64: a.base64,
      })),
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`bridge_${res.status}: ${text}`)
  }
  if (!res.body) throw new Error("bridge_no_body")
  const reader = res.body.getReader()
  await parseSseStream(reader, args.onEvent)
}

export type StreamHandlers = {
  onChunk: (text: string) => void
  onAssistant: (text: string) => void
  onToolUse: (tool: { id: string; name: string; input: unknown }) => void
  onToolResult: (
    res: { tool_use_id: string; content: string; isError?: boolean }
  ) => void
  onResult: (
    res: { text: string; durationMs?: number; costUsd?: number }
  ) => void
  onError: (msg: string) => void
  onStatus: (text: string) => void
  onDone: () => void
}

export function dispatchSseEvent(
  event: string,
  data: unknown,
  h: StreamHandlers
): void {
  const d = (data ?? {}) as Record<string, unknown>
  switch (event) {
    case "chunk":
      if (typeof d.text === "string") h.onChunk(d.text)
      break
    case "assistant":
      if (typeof d.text === "string") h.onAssistant(d.text)
      break
    case "tool_use":
      h.onToolUse({
        id: String(d.id ?? ""),
        name: String(d.name ?? ""),
        input: d.input,
      })
      break
    case "tool_result":
      h.onToolResult({
        tool_use_id: String(d.tool_use_id ?? ""),
        content: typeof d.content === "string" ? d.content : "",
        isError: typeof d.isError === "boolean" ? d.isError : undefined,
      })
      break
    case "result":
      h.onResult({
        text: typeof d.text === "string" ? d.text : "",
        durationMs: typeof d.durationMs === "number" ? d.durationMs : undefined,
        costUsd: typeof d.costUsd === "number" ? d.costUsd : undefined,
      })
      break
    case "error":
      h.onError(typeof d.message === "string" ? d.message : "Erro desconhecido")
      break
    case "status":
      if (typeof d.text === "string") h.onStatus(d.text)
      break
    case "done":
      h.onDone()
      break
  }
}

export type { ChatMessage, ElementRef, ChatAttachment, BridgeState, BridgeHealth }
