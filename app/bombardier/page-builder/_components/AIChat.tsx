"use client"

import * as React from "react"
import { AwChatBubble } from "@/components/ui/AwChatBubble"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"
import { useBuilder } from "@/lib/bombardier/store"

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
    executable?: string
  }
  skill?: { path: string; exists: boolean }
  timestamp: string
  port: number
}

type BridgeState =
  | { kind: "checking" }
  | { kind: "offline" }
  | { kind: "half"; info: BridgeHealth }
  | { kind: "ready"; info: BridgeHealth }

function useBridgeStatus() {
  const [state, setState] = React.useState<BridgeState>({ kind: "checking" })
  const [tick, setTick] = React.useState(0)
  const retry = React.useCallback(() => setTick((n) => n + 1), [])

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
  }, [tick])

  return { state, retry }
}

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

function StatusPill({ state }: { state: BridgeState }) {
  if (state.kind === "checking")
    return <AwPill variant="neutral">Verificando…</AwPill>
  if (state.kind === "offline")
    return <AwPill variant="error">Ponte offline</AwPill>
  if (state.kind === "half")
    return <AwPill variant="draft">Sem Claude</AwPill>
  return <AwPill variant="live">Claude pronto</AwPill>
}

function CommandBlock({ cmd }: { cmd: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="relative">
      <pre className="m-0 px-3 py-2 pr-9 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--fg-primary)] overflow-x-auto whitespace-pre">
        {cmd}
      </pre>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(cmd)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          } catch {
            /* noop */
          }
        }}
        aria-label={copied ? "Copiado" : "Copiar"}
        title={copied ? "Copiado" : "Copiar"}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)]"
      >
        <Icon name={copied ? "check" : "content_copy"} size={12} />
      </button>
    </div>
  )
}

function OfflineBody({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h4 className="text-sm font-semibold mb-1">Inicie a ponte local</h4>
        <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
          Roda na sua máquina, usa a sua conta Claude. Nada passa pelo servidor
          do produto.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-wider text-[var(--fg-tertiary)]">
          Primeira vez
        </span>
        <CommandBlock cmd="npm run bridge:install" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-wider text-[var(--fg-tertiary)]">
          Rodar
        </span>
        <CommandBlock cmd="npm run bridge" />
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-md)] border border-[var(--border-subtle)] text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)]"
      >
        <Icon name="refresh" size={14} />
        Tentar de novo
      </button>
    </div>
  )
}

function HalfReadyBody({ info }: { info: BridgeHealth }) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--aw-amber-100)] border border-[var(--aw-amber-200)] text-[var(--aw-amber-800)]">
        <Icon name="warning" size={14} />
        <div className="text-xs leading-relaxed">
          Ponte ok, mas Claude indisponível.
          <br />
          <span className="opacity-80">{info.claude.reason}</span>
        </div>
      </div>
      {info.claude.reason?.includes("PATH") && (
        <>
          <CommandBlock cmd="npm install -g @anthropic-ai/claude-code" />
          <CommandBlock cmd="claude login" />
        </>
      )}
    </div>
  )
}

function parseSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (event: string, data: unknown) => void
): Promise<void> {
  const decoder = new TextDecoder()
  let buffer = ""
  return (async () => {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let idx: number
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const raw = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)
        let ev = "message"
        const lines = raw.split("\n")
        const dataLines: string[] = []
        for (const line of lines) {
          if (line.startsWith("event:")) ev = line.slice(6).trim()
          else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim())
        }
        if (dataLines.length === 0) continue
        let parsed: unknown = dataLines.join("\n")
        try {
          parsed = JSON.parse(dataLines.join("\n"))
        } catch {
          /* keep as string */
        }
        onEvent(ev, parsed)
      }
    }
  })()
}

type ManifestResp = {
  builder: { palette: unknown[] }
  designSystem: {
    tokens: unknown
    componentsOutsidePalette: string[]
  }
}

function ReadyBody({ info }: { info: BridgeHealth }) {
  const project = useBuilder((s) => s.project)
  const selectedFrameId = useBuilder((s) => s.selectedFrameId)
  const applyGeneratedNodes = useBuilder((s) => s.applyGeneratedNodes)

  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [manifest, setManifest] = React.useState<ManifestResp | null>(null)
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [attachError, setAttachError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const readFileAsAttachment = (file: File): Promise<Attachment> =>
    new Promise((resolve, reject) => {
      if (!SUPPORTED_TYPES.has(file.type)) {
        reject(
          new Error(
            `Tipo "${file.type}" não suportado. Use PNG, JPG, GIF ou WEBP.`
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
    const arr = Array.from(files)
    for (const f of arr) {
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

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void ingestFiles(e.target.files)
    }
    e.target.value = ""
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

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/bombardier/components/manifest")
        const data = (await res.json()) as ManifestResp
        if (!cancelled) setManifest(data)
      } catch {
        /* manifest will be retried on send */
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

  const send = async () => {
    const prompt = input.trim()
    if ((!prompt && attachments.length === 0) || sending) return

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
          currentTree: activeFrame?.rootNodes ?? [],
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
            if (event === "assistant") {
              return msg
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
            if (event === "tool_use") {
              const d = data as { id: string; name: string; input: unknown }
              const tools = [
                ...(msg.tools ?? []),
                { id: d.id, name: d.name, input: d.input },
              ]
              return { ...msg, tools }
            }
            if (event === "tool_result") {
              const d = data as {
                tool_use_id: string
                content: string
                isError?: boolean
              }
              const tools = (msg.tools ?? []).map((t) =>
                t.id === d.tool_use_id
                  ? { ...t, result: d.content, isError: d.isError }
                  : t
              )
              return { ...msg, tools }
            }
            if (event === "error") {
              const message =
                data && typeof data === "object" && "message" in data
                  ? String((data as { message: string }).message)
                  : "erro"
              return { ...msg, status: "error", error: message }
            }
            if (event === "done") {
              return msg.status === "streaming"
                ? { ...msg, status: "done" }
                : msg
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] text-[11px] text-[var(--fg-tertiary)] flex items-center justify-between">
        <span>
          Claude{" "}
          <span className="font-mono">{info.claude.version ?? "?"}</span>
        </span>
        <span>
          Frame:{" "}
          <strong className="text-[var(--fg-secondary)]">
            {activeFrame?.name ?? "—"}
          </strong>
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
      >
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-[var(--fg-tertiary)] text-center max-w-[240px] mx-auto leading-relaxed">
            Descreva o que você quer construir. A IA vai usar os componentes do
            design system e aplicar no frame ativo.
          </div>
        )}
        {messages.map((m) => (
          <ChatItem key={m.id} msg={m} onApply={() => apply(m.id)} />
        ))}
      </div>

      <form
        className="border-t border-[var(--border-subtle)] flex flex-col"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        onPaste={onPaste}
      >
        {attachments.length > 0 && (
          <div className="px-3 pt-3 flex gap-2 flex-wrap">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="relative group w-16 h-16 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)]"
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
          <div className="px-3 pt-2 text-[11px] text-[var(--aw-red-600)] flex items-center gap-1">
            <Icon name="error" size={11} />
            {attachError}
          </div>
        )}
        <div className="p-3 flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            multiple
            hidden
            onChange={onPickFile}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={
              sending ||
              !activeFrame ||
              attachments.length >= MAX_ATTACHMENTS
            }
            aria-label="Anexar imagem"
            title={
              attachments.length >= MAX_ATTACHMENTS
                ? `Máximo ${MAX_ATTACHMENTS} imagens`
                : "Anexar imagem (ou cole com Ctrl+V)"
            }
            className="inline-flex items-center justify-center h-9 w-9 rounded-[var(--radius-md)] border border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)] disabled:opacity-40"
          >
            <Icon name="image" size={16} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={
              activeFrame
                ? "Descreva a página… (cole uma imagem com Ctrl+V)"
                : "Crie uma página antes para usar a IA."
            }
            rows={2}
            disabled={sending || !activeFrame}
            className="flex-1 min-h-[40px] max-h-[140px] px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] resize-none focus:outline-none focus:border-[var(--accent-brand)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={
              sending ||
              (!input.trim() && attachments.length === 0) ||
              !activeFrame
            }
            aria-label="Enviar"
            className="inline-flex items-center justify-center h-9 w-9 rounded-[var(--radius-md)] bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] disabled:opacity-40 hover:opacity-90"
          >
            <Icon
              name={sending ? "hourglass_empty" : "send"}
              size={16}
              className={sending ? "animate-spin" : undefined}
            />
          </button>
        </div>
      </form>
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
      <AwChatBubble variant="user">
        <span className="whitespace-pre-wrap">{msg.text}</span>
      </AwChatBubble>
    )
  }
  const summary = msg.text
    ? msg.text.replace(/```json[\s\S]*?```/g, "").trim()
    : ""
  const toolShortName = (n: string) =>
    n.replace(/^mcp__[^_]+__/, "").replace(/_/g, " ")
  return (
    <div className="flex flex-col gap-1.5">
      {msg.tools && msg.tools.length > 0 && (
        <div className="flex flex-col gap-1 mb-0.5 pl-3 border-l-2 border-[var(--border-subtle)]">
          {msg.tools.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-1.5 text-[11px] text-[var(--fg-tertiary)]"
            >
              <Icon
                name={
                  t.isError
                    ? "error"
                    : t.result
                    ? "check_circle"
                    : "sync"
                }
                size={11}
                className={
                  !t.result && !t.isError ? "animate-spin" : undefined
                }
              />
              <div className="flex-1 min-w-0">
                <span className="font-mono">{toolShortName(t.name)}</span>
                {typeof t.input === "object" &&
                  t.input !== null &&
                  "description" in t.input && (
                    <span className="text-[var(--fg-tertiary)] opacity-70">
                      {" "}
                      · {String((t.input as Record<string, unknown>).description).slice(0, 60)}
                    </span>
                  )}
                {typeof t.input === "object" &&
                  t.input !== null &&
                  "query" in t.input && (
                    <span className="text-[var(--fg-tertiary)] opacity-70">
                      {" "}
                      · &quot;{String((t.input as Record<string, unknown>).query).slice(0, 40)}&quot;
                    </span>
                  )}
                {typeof t.input === "object" &&
                  t.input !== null &&
                  "name" in t.input && (
                    <span className="text-[var(--fg-tertiary)] opacity-70">
                      {" "}
                      · {String((t.input as Record<string, unknown>).name)}
                    </span>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
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
      {msg.status === "done" && Array.isArray(msg.nodes) && msg.nodes.length > 0 && (
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
          <Icon
            name={msg.applied ? "check" : "auto_awesome"}
            size={12}
          />
          {msg.applied
            ? "Aplicado"
            : `Aplicar ${msg.nodes.length} no canvas`}
        </button>
      )}
      {msg.status === "done" &&
        Array.isArray(msg.nodes) === false &&
        msg.text && (
          <span className="text-[11px] text-[var(--fg-tertiary)] px-1">
            (sem JSON válido na resposta)
          </span>
        )}
      {msg.status === "done" && (msg.costUsd !== undefined || msg.durationMs !== undefined) && (
        <span className="text-[11px] text-[var(--fg-tertiary)] px-1 font-mono">
          {msg.durationMs !== undefined && `${(msg.durationMs / 1000).toFixed(1)}s`}
          {msg.durationMs !== undefined && msg.costUsd !== undefined && " · "}
          {msg.costUsd !== undefined && `$${msg.costUsd.toFixed(4)}`}
        </span>
      )}
    </div>
  )
}

export default function AIChat() {
  const { state, retry } = useBridgeStatus()

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="aw-eyebrow">AI Copilot</h3>
          <StatusPill state={state} />
        </div>
        <p className="text-xs text-[var(--fg-tertiary)] leading-relaxed">
          Descreva o que quer construir. A IA usa os componentes do DS via ponte
          local — sua conta Claude, seu consumo.
        </p>
      </div>

      {state.kind === "checking" && (
        <div className="flex-1 flex items-center justify-center text-xs text-[var(--fg-tertiary)]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--fg-tertiary)] animate-pulse" />
            Procurando ponte em localhost:9876…
          </span>
        </div>
      )}
      {state.kind === "offline" && (
        <div className="flex-1 overflow-y-auto">
          <OfflineBody onRetry={retry} />
        </div>
      )}
      {state.kind === "half" && (
        <div className="flex-1 overflow-y-auto">
          <HalfReadyBody info={state.info} />
        </div>
      )}
      {state.kind === "ready" && <ReadyBody info={state.info} />}
    </div>
  )
}
