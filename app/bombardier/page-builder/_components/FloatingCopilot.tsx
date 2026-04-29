"use client"

import * as React from "react"
import { AwChatBubble } from "@/components/ui/AwChatBubble"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"
import { useBuilder } from "@/lib/bombardier/store"
import { parseSseStream } from "@/lib/claude-edit/sse"

const BRIDGE_URL =
  process.env.NEXT_PUBLIC_BOMBARDIER_BRIDGE_URL ?? "http://localhost:9876"

type BridgeHealth = {
  ok: boolean
  version: string
  phase: string
  claude: {
    ready: boolean
    reason?: string
    version?: string
  }
  port: number
}

type BridgeState =
  | { kind: "checking" }
  | { kind: "offline" }
  | { kind: "half"; info: BridgeHealth }
  | { kind: "ready"; info: BridgeHealth }

type ToolCall = {
  id: string
  name: string
  input: unknown
  result?: string
  isError?: boolean
}

type Attachment = {
  id: string
  dataUrl: string
  mediaType: string
  base64: string
  sizeKB: number
}

type ChatMessage = {
  id: string
  role: "user" | "agent"
  text: string
  status: "streaming" | "done" | "error"
  nodes?: unknown[]
  error?: string
  applied?: boolean
  costUsd?: number
  durationMs?: number
  tools?: ToolCall[]
  attachments?: Attachment[]
}

const MAX_ATTACHMENTS = 4
const MAX_RAW_BYTES = 5 * 1024 * 1024
const SUPPORTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
])

function useBridgeStatus() {
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

type ManifestResp = {
  builder: { palette: unknown[] }
  designSystem: {
    tokens: unknown
    componentsOutsidePalette: string[]
  }
}

function StatusPill({ state }: { state: BridgeState }) {
  if (state.kind === "checking")
    return <AwPill variant="neutral">Verificando…</AwPill>
  if (state.kind === "offline")
    return <AwPill variant="error">Ponte offline</AwPill>
  if (state.kind === "half")
    return <AwPill variant="draft">Sem Claude</AwPill>
  return <AwPill variant="live">Claude pronto</AwPill>
}

function ToolTimeline({ tools }: { tools: ToolCall[] }) {
  const short = (n: string) =>
    n.replace(/^mcp__[^_]+__/, "").replace(/_/g, " ")
  return (
    <div className="flex flex-col gap-1 mb-0.5 pl-3 border-l-2 border-[var(--border-subtle)]">
      {tools.map((t) => {
        const input =
          t.input && typeof t.input === "object"
            ? (t.input as Record<string, unknown>)
            : {}
        const hint =
          typeof input.description === "string"
            ? String(input.description).slice(0, 60)
            : typeof input.query === "string"
            ? `"${String(input.query).slice(0, 40)}"`
            : typeof input.name === "string"
            ? String(input.name)
            : ""
        return (
          <div
            key={t.id}
            className="flex items-start gap-1.5 text-[11px] text-[var(--fg-tertiary)]"
          >
            <Icon
              name={
                t.isError ? "error" : t.result ? "check_circle" : "sync"
              }
              size={11}
              className={
                !t.result && !t.isError ? "animate-spin" : undefined
              }
            />
            <div className="flex-1 min-w-0">
              <span className="font-mono">{short(t.name)}</span>
              {hint && (
                <span className="text-[var(--fg-tertiary)] opacity-70">
                  {" "}
                  · {hint}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ChatItem({
  msg,
  onApply,
}: {
  msg: ChatMessage
  onApply: () => void
}) {
  if (msg.role === "user") {
    return (
      <div className="flex flex-col gap-1 items-end">
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {msg.attachments.map((a) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={a.id}
                src={a.dataUrl}
                alt=""
                className="h-14 w-14 object-cover rounded-[var(--radius-sm)] border border-[var(--border-subtle)]"
              />
            ))}
          </div>
        )}
        <AwChatBubble variant="user">
          <span className="whitespace-pre-wrap">{msg.text}</span>
        </AwChatBubble>
      </div>
    )
  }
  const summary = msg.text
    ? msg.text.replace(/```json[\s\S]*?```/g, "").trim()
    : ""
  return (
    <div className="flex flex-col gap-1.5">
      {msg.tools && msg.tools.length > 0 && <ToolTimeline tools={msg.tools} />}
      <AwChatBubble variant="agent" streaming={msg.status === "streaming"}>
        {msg.status === "error" ? (
          <span className="text-[var(--aw-red-600)] text-xs">
            {msg.error || "Erro desconhecido"}
          </span>
        ) : (
          <span className="whitespace-pre-wrap text-sm">
            {summary || (msg.status === "streaming" ? "…" : "(vazio)")}
          </span>
        )}
      </AwChatBubble>
      {msg.status === "done" &&
        Array.isArray(msg.nodes) &&
        msg.nodes.length > 0 && (
          <button
            type="button"
            onClick={onApply}
            disabled={msg.applied}
            className={[
              "self-start inline-flex items-center gap-1.5 px-3 h-8 rounded-[var(--radius-sm)] text-xs font-medium transition-colors",
              msg.applied
                ? "bg-[var(--bg-muted)] text-[var(--fg-tertiary)] cursor-default"
                : "bg-[var(--accent-brand)] text-[var(--fg-on-inverse)] hover:bg-[var(--accent-brand-hover)]",
            ].join(" ")}
          >
            <Icon name={msg.applied ? "check" : "auto_awesome"} size={12} />
            {msg.applied
              ? "Aplicado"
              : `Aplicar ${msg.nodes.length} no canvas`}
          </button>
        )}
      {msg.status === "done" &&
        (msg.costUsd !== undefined || msg.durationMs !== undefined) && (
          <span className="text-[11px] text-[var(--fg-tertiary)] px-1 font-mono">
            {msg.durationMs !== undefined &&
              `${(msg.durationMs / 1000).toFixed(1)}s`}
            {msg.durationMs !== undefined &&
              msg.costUsd !== undefined &&
              " · "}
            {msg.costUsd !== undefined && `$${msg.costUsd.toFixed(4)}`}
          </span>
        )}
    </div>
  )
}

function OfflineHint({ reason }: { reason?: string }) {
  return (
    <div className="p-3 rounded-[var(--radius-md)] bg-[var(--aw-amber-100)] border border-[var(--aw-amber-200)] text-[var(--aw-amber-800)] text-xs flex items-start gap-2">
      <Icon name="warning" size={14} />
      <div className="flex-1">
        <div className="font-medium mb-1">
          Claude indisponível. Inicie a ponte local:
        </div>
        <code className="block bg-[var(--bg-canvas)] px-2 py-1 rounded mb-1 text-[var(--fg-primary)] font-mono">
          npm run bridge
        </code>
        {reason && <div className="opacity-80 mt-1">{reason}</div>}
      </div>
    </div>
  )
}

export default function FloatingCopilot() {
  const state = useBridgeStatus()
  const project = useBuilder((s) => s.project)
  const selectedFrameId = useBuilder((s) => s.selectedFrameId)
  const applyGeneratedNodes = useBuilder((s) => s.applyGeneratedNodes)

  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)
  const [manifest, setManifest] = React.useState<ManifestResp | null>(null)
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [attachError, setAttachError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/bombardier/components/manifest")
        const data = (await res.json()) as ManifestResp
        if (!cancelled) setManifest(data)
      } catch {
        /* retried on send */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const activeFrameId = selectedFrameId ?? project.pages[0]?.id ?? null
  const activeFrame = project.pages.find((f) => f.id === activeFrameId)

  const readFileAsAttachment = (file: File): Promise<Attachment> =>
    new Promise((resolve, reject) => {
      if (!SUPPORTED_TYPES.has(file.type)) {
        reject(
          new Error(
            `Tipo "${file.type}" não suportado. PNG, JPG, GIF ou WEBP.`
          )
        )
        return
      }
      if (file.size > MAX_RAW_BYTES) {
        reject(new Error("Imagem acima de 5MB."))
        return
      }
      const reader = new FileReader()
      reader.onerror = () => reject(new Error("Falha ao ler arquivo."))
      reader.onload = () => {
        const dataUrl = String(reader.result || "")
        const base64 = dataUrl.split(",")[1] ?? ""
        resolve({
          id: `at_${Math.random().toString(36).slice(2, 10)}`,
          dataUrl,
          mediaType: file.type,
          base64,
          sizeKB: Math.round(file.size / 1024),
        })
      }
      reader.readAsDataURL(file)
    })

  const ingestFiles = async (files: FileList | File[]) => {
    setAttachError(null)
    for (const f of Array.from(files)) {
      if (attachments.length >= MAX_ATTACHMENTS) {
        setAttachError(`Máximo ${MAX_ATTACHMENTS} imagens por mensagem.`)
        break
      }
      try {
        const att = await readFileAsAttachment(f)
        setAttachments((prev) =>
          prev.length >= MAX_ATTACHMENTS ? prev : [...prev, att]
        )
      } catch (err) {
        setAttachError(err instanceof Error ? err.message : String(err))
        break
      }
    }
  }

  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    const files: File[] = []
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const f = item.getAsFile()
        if (f) files.push(f)
      }
    }
    if (files.length > 0) {
      e.preventDefault()
      void ingestFiles(files)
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
    setAttachError(null)
  }

  const send = async () => {
    const prompt = input.trim()
    if ((!prompt && attachments.length === 0) || sending) return
    if (state.kind !== "ready") return
    if (!activeFrame) return

    setExpanded(true)

    let currentManifest = manifest
    if (!currentManifest) {
      try {
        const res = await fetch("/api/bombardier/components/manifest")
        currentManifest = (await res.json()) as ManifestResp
        setManifest(currentManifest)
      } catch {
        /* continue */
      }
    }

    const sentAttachments = attachments
    setSending(true)
    setInput("")
    setAttachments([])
    setAttachError(null)
    const userId = `u_${Date.now()}`
    const agentId = `a_${Date.now()}`
    setMessages((m) => [
      ...m,
      {
        id: userId,
        role: "user",
        text: prompt || "(somente imagem)",
        status: "done",
        attachments: sentAttachments,
      },
      { id: agentId, role: "agent", text: "", status: "streaming" },
    ])

    try {
      const res = await fetch(`${BRIDGE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || "Use a(s) imagem(ns) anexada(s) como referência.",
          images:
            sentAttachments.length > 0
              ? sentAttachments.map((a) => ({
                  mediaType: a.mediaType,
                  base64: a.base64,
                }))
              : undefined,
          manifest: {
            palette: currentManifest?.builder?.palette ?? [],
            tokens: currentManifest?.designSystem?.tokens ?? {},
            awOutsidePalette:
              currentManifest?.designSystem?.componentsOutsidePalette ?? [],
          },
          currentTree: activeFrame.rootNodes,
        }),
      })
      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "erro desconhecido")
        setMessages((m) =>
          m.map((msg) =>
            msg.id === agentId
              ? { ...msg, status: "error", error: errText }
              : msg
          )
        )
        return
      }
      const reader = res.body.getReader()
      await parseSseStream(reader, (event, data) => {
        setMessages((m) =>
          m.map((msg) => {
            if (msg.id !== agentId) return msg
            if (event === "chunk") {
              const t =
                data && typeof data === "object" && "text" in data
                  ? String((data as { text: string }).text)
                  : ""
              return { ...msg, text: msg.text + t }
            }
            if (event === "tool_use") {
              const d = data as { id: string; name: string; input: unknown }
              return {
                ...msg,
                tools: [
                  ...(msg.tools ?? []),
                  { id: d.id, name: d.name, input: d.input },
                ],
              }
            }
            if (event === "tool_result") {
              const d = data as {
                tool_use_id: string
                content: string
                isError?: boolean
              }
              return {
                ...msg,
                tools: (msg.tools ?? []).map((t) =>
                  t.id === d.tool_use_id
                    ? { ...t, result: d.content, isError: d.isError }
                    : t
                ),
              }
            }
            if (event === "result") {
              const d = data as {
                text?: string
                nodes?: unknown[] | null
                durationMs?: number
                costUsd?: number
              }
              return {
                ...msg,
                text: d.text ?? msg.text,
                nodes: d.nodes ?? undefined,
                status: "done",
                durationMs: d.durationMs,
                costUsd: d.costUsd,
              }
            }
            if (event === "error") {
              const message =
                data && typeof data === "object" && "message" in data
                  ? String((data as { message: string }).message)
                  : "erro"
              return { ...msg, status: "error", error: message }
            }
            return msg
          })
        )
      })
    } catch (err) {
      const errText = err instanceof Error ? err.message : String(err)
      setMessages((m) =>
        m.map((msg) =>
          msg.id === agentId ? { ...msg, status: "error", error: errText } : msg
        )
      )
    } finally {
      setSending(false)
    }
  }

  const apply = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId)
    if (!msg?.nodes || !activeFrameId) return
    const count = applyGeneratedNodes(activeFrameId, msg.nodes)
    setMessages((ms) =>
      ms.map((m) => (m.id === messageId ? { ...m, applied: true } : m))
    )
    if (count === 0) {
      window.alert("Nenhum node válido pra aplicar.")
    }
  }

  const ready = state.kind === "ready"
  const hasMessages = messages.length > 0

  return (
    <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center pointer-events-none">
      <div className="w-full max-w-[760px] mx-6 flex flex-col gap-2 pointer-events-auto">
        {expanded && hasMessages && (
          <div className="rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg flex flex-col max-h-[55vh] overflow-hidden">
            <div className="h-10 shrink-0 px-3 flex items-center justify-between border-b border-[var(--border-subtle)] text-xs">
              <div className="flex items-center gap-2">
                <Icon name="auto_awesome" size={14} />
                <span className="font-medium">AI Copilot</span>
                <StatusPill state={state} />
                {activeFrame && (
                  <span className="text-[var(--fg-tertiary)]">
                    · {activeFrame.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  title="Limpar conversa"
                  aria-label="Limpar conversa"
                  className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)]"
                >
                  <Icon name="delete_sweep" size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  title="Recolher"
                  aria-label="Recolher"
                  className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)]"
                >
                  <Icon name="expand_more" size={14} />
                </button>
              </div>
            </div>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
            >
              {messages.map((m) => (
                <ChatItem key={m.id} msg={m} onApply={() => apply(m.id)} />
              ))}
            </div>
          </div>
        )}

        <form
          className="rounded-[var(--radius-2xl)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg flex flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          onPaste={onPaste}
        >
          {state.kind !== "ready" && (
            <div className="p-3 border-b border-[var(--border-subtle)]">
              {state.kind === "offline" ? (
                <OfflineHint />
              ) : state.kind === "half" ? (
                <OfflineHint reason={state.info.claude.reason} />
              ) : (
                <div className="text-xs text-[var(--fg-tertiary)] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--fg-tertiary)] animate-pulse" />
                  Procurando ponte em localhost:9876…
                </div>
              )}
            </div>
          )}
          {attachments.length > 0 && (
            <div className="px-3 pt-3 flex gap-2 flex-wrap">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="relative group w-14 h-14 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)]"
                  title={`${a.mediaType} · ${a.sizeKB}KB`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.dataUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttachment(a.id)}
                    aria-label="Remover"
                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] inline-flex items-center justify-center text-[10px] opacity-80 hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {attachError && (
            <div className="px-3 pt-1 text-[11px] text-[var(--aw-red-600)] flex items-center gap-1">
              <Icon name="error" size={11} />
              {attachError}
            </div>
          )}
          <div className="px-2.5 py-2 flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  void ingestFiles(e.target.files)
                }
                e.target.value = ""
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={
                !ready || sending || attachments.length >= MAX_ATTACHMENTS
              }
              aria-label="Anexar imagem"
              title={
                attachments.length >= MAX_ATTACHMENTS
                  ? `Máximo ${MAX_ATTACHMENTS} imagens`
                  : "Anexar imagem (ou cole com Ctrl+V)"
              }
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)] disabled:opacity-40"
            >
              <Icon name="image" size={16} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => hasMessages && setExpanded(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={
                !ready
                  ? "Aguardando Claude…"
                  : !activeFrame
                  ? "Crie uma página antes."
                  : "Descreva o que quer construir… (cole uma imagem com Ctrl+V)"
              }
              rows={1}
              disabled={!ready || sending || !activeFrame}
              className="flex-1 min-h-[36px] max-h-[160px] py-2 bg-transparent text-sm text-[var(--fg-primary)] resize-none focus:outline-none disabled:opacity-50 placeholder:text-[var(--fg-tertiary)]"
            />
            {hasMessages && !expanded && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                aria-label="Expandir histórico"
                title="Ver histórico"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)]"
              >
                <Icon name="expand_less" size={16} />
              </button>
            )}
            <button
              type="submit"
              disabled={
                !ready ||
                sending ||
                (!input.trim() && attachments.length === 0) ||
                !activeFrame
              }
              aria-label="Enviar"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] disabled:opacity-40 hover:opacity-90"
            >
              <Icon
                name={sending ? "hourglass_empty" : "arrow_upward"}
                size={16}
                className={sending ? "animate-spin" : undefined}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
