"use client"

import * as React from "react"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"
import { useClaudeEdit } from "@/lib/claude-edit/store"
import {
  BRIDGE_URL,
  dispatchSseEvent,
  streamChat,
  useBridgeStatus,
} from "@/lib/claude-edit/client"
import type {
  BridgeState,
  ChatAttachment,
  ChatMessage,
  ToolCall,
} from "@/lib/claude-edit/types"
import { shortRefLabel } from "@/lib/claude-edit/fiber-source"
import { useGlobalHotkey } from "@/lib/hooks/useGlobalHotkey"
import { ChatItem } from "./ChatItem"

const OVERLAY_DATA_ATTR = "data-claude-edit-overlay"

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
  if (state.kind === "half") return <AwPill variant="draft">Sem Claude</AwPill>
  return <AwPill variant="live">Claude pronto</AwPill>
}

function OfflineHint({ reason }: { reason?: string }) {
  return (
    <div className="body-xs text-[var(--fg-tertiary)] leading-relaxed">
      {reason ? (
        <>{reason}</>
      ) : (
        <>
          Ponte de edição offline. Rode{" "}
          <code className="mono px-1 rounded bg-[var(--bg-raised)]">
            npm run edit-bridge:dev
          </code>{" "}
          em outro terminal.
        </>
      )}
    </div>
  )
}

async function readFileAsAttachment(
  file: File
): Promise<ChatAttachment | { error: string }> {
  if (!SUPPORTED_TYPES.has(file.type)) {
    return { error: `Tipo não suportado: ${file.type || file.name}` }
  }
  if (file.size > MAX_RAW_BYTES) {
    return { error: `Imagem maior que ${MAX_RAW_BYTES / 1024 / 1024}MB.` }
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
  const base64 = dataUrl.split(",")[1] ?? ""
  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dataUrl,
    mediaType: file.type,
    base64,
    sizeKB: Math.round(file.size / 1024),
  }
}

export function ClaudeEditOverlay() {
  const open = useClaudeEdit((s) => s.open)
  const setOpen = useClaudeEdit((s) => s.setOpen)
  const toggleOpen = useClaudeEdit((s) => s.toggleOpen)

  const pickerActive = useClaudeEdit((s) => s.pickerActive)
  const togglePicker = useClaudeEdit((s) => s.togglePicker)

  const messages = useClaudeEdit((s) => s.messages)
  const appendMessage = useClaudeEdit((s) => s.appendMessage)
  const updateMessage = useClaudeEdit((s) => s.updateMessage)
  const clearHistory = useClaudeEdit((s) => s.clearHistory)

  const composerText = useClaudeEdit((s) => s.composerText)
  const setComposerText = useClaudeEdit((s) => s.setComposerText)
  const clearComposer = useClaudeEdit((s) => s.clearComposer)

  const pendingRefs = useClaudeEdit((s) => s.pendingRefs)
  const removeRef = useClaudeEdit((s) => s.removeRef)

  const pendingAttachments = useClaudeEdit((s) => s.pendingAttachments)
  const addAttachment = useClaudeEdit((s) => s.addAttachment)
  const removeAttachment = useClaudeEdit((s) => s.removeAttachment)

  const state = useBridgeStatus()
  const ready = state.kind === "ready"
  const hasMessages = messages.length > 0

  const [expanded, setExpanded] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [attachError, setAttachError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)

  useGlobalHotkey({ key: "l", meta: true, shift: true }, () => toggleOpen())

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, expanded])

  const ingestFiles = React.useCallback(
    async (files: FileList | File[]) => {
      setAttachError(null)
      const arr = Array.from(files)
      const slots = MAX_ATTACHMENTS - pendingAttachments.length
      if (slots <= 0) {
        setAttachError(`Máximo ${MAX_ATTACHMENTS} imagens.`)
        return
      }
      for (const file of arr.slice(0, slots)) {
        const r = await readFileAsAttachment(file)
        if ("error" in r) {
          setAttachError(r.error)
          continue
        }
        addAttachment(r)
      }
    },
    [pendingAttachments.length, addAttachment]
  )

  const onPaste = React.useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const files: File[] = []
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const f = item.getAsFile()
          if (f) files.push(f)
        }
      }
      if (files.length > 0) {
        e.preventDefault()
        void ingestFiles(files)
      }
    },
    [ingestFiles]
  )

  const send = React.useCallback(async () => {
    if (!ready || sending) return
    const text = composerText.trim()
    const refsSnap = pendingRefs
    const attachmentsSnap = pendingAttachments
    if (!text && attachmentsSnap.length === 0 && refsSnap.length === 0) return

    const userId = `u-${Date.now()}`
    const agentId = `a-${Date.now() + 1}`
    appendMessage({
      id: userId,
      role: "user",
      text,
      status: "done",
      refs: refsSnap.length ? refsSnap : undefined,
      attachments: attachmentsSnap.length ? attachmentsSnap : undefined,
    })
    appendMessage({
      id: agentId,
      role: "agent",
      text: "",
      status: "streaming",
      tools: [],
    })
    setExpanded(true)

    const history = messages
      .filter((m) => m.role === "user" || m.role === "agent")
      .map((m) => ({
        role: (m.role === "agent" ? "assistant" : "user") as
          | "user"
          | "assistant",
        text: m.text,
      }))
      .filter((h) => h.text.length > 0)

    clearComposer()
    setSending(true)

    const controller = new AbortController()
    abortRef.current = controller

    let streamBuf = ""
    const tools: ToolCall[] = []

    try {
      await streamChat({
        prompt: text || "(usuário enviou apenas referências)",
        history,
        refs: refsSnap,
        attachments: attachmentsSnap,
        signal: controller.signal,
        onEvent: (event, data) => {
          dispatchSseEvent(event, data, {
            onChunk: (t) => {
              streamBuf += t
              updateMessage(agentId, { text: streamBuf })
            },
            onAssistant: (t) => {
              streamBuf = t
              updateMessage(agentId, { text: streamBuf })
            },
            onToolUse: (tu) => {
              tools.push({
                id: tu.id,
                name: tu.name,
                input: tu.input,
              })
              updateMessage(agentId, { tools: [...tools] })
            },
            onToolResult: (tr) => {
              const idx = tools.findIndex((t) => t.id === tr.tool_use_id)
              if (idx >= 0) {
                tools[idx] = {
                  ...tools[idx],
                  result: tr.content,
                  isError: tr.isError,
                }
                updateMessage(agentId, { tools: [...tools] })
              }
            },
            onResult: (r) => {
              updateMessage(agentId, {
                text: r.text || streamBuf,
                durationMs: r.durationMs,
                costUsd: r.costUsd,
                status: "done",
              })
            },
            onError: (msg) => {
              updateMessage(agentId, { status: "error", error: msg })
            },
            onStatus: () => {},
            onDone: () => {
              updateMessage(agentId, { status: "done" })
            },
          })
        },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      updateMessage(agentId, { status: "error", error: msg })
    } finally {
      setSending(false)
      abortRef.current = null
    }
  }, [
    ready,
    sending,
    composerText,
    pendingRefs,
    pendingAttachments,
    messages,
    appendMessage,
    updateMessage,
    clearComposer,
  ])

  if (!open) {
    return (
      <div
        {...{ [OVERLAY_DATA_ATTR]: "" }}
        className="fixed bottom-4 right-4 z-50 pointer-events-none"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir Claude Code (Cmd+Shift+L)"
          title="Claude Code · ⌘⇧L"
          className="pointer-events-auto inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] shadow-lg hover:opacity-90 body-xs font-medium"
        >
          <Icon name="auto_awesome" size={14} />
          Claude
          {hasMessages && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[var(--accent-brand,#3b82f6)] body-xs">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div
      {...{ [OVERLAY_DATA_ATTR]: "" }}
      className="fixed inset-x-0 bottom-4 z-50 flex justify-center pointer-events-none px-4"
    >
      <div
        className="w-full max-w-[640px] flex flex-col gap-2 pointer-events-auto"
        onPaste={onPaste}
      >
        {expanded && hasMessages && (
          <div className="rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg flex flex-col max-h-[55vh] overflow-hidden">
            <div className="h-10 shrink-0 px-3 flex items-center justify-between border-b border-[var(--border-subtle)] body-xs">
              <div className="flex items-center gap-2">
                <Icon name="auto_awesome" size={14} />
                <span className="font-medium">Claude Code</span>
                <StatusPill state={state} />
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => clearHistory()}
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
                <ChatItem key={m.id} msg={m} />
              ))}
            </div>
          </div>
        )}

        <form
          className="rounded-[var(--radius-2xl)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg flex flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
        >
          {state.kind !== "ready" && (
            <div className="p-3 border-b border-[var(--border-subtle)]">
              {state.kind === "offline" ? (
                <OfflineHint />
              ) : state.kind === "half" ? (
                <OfflineHint reason={state.info.claude.reason} />
              ) : (
                <div className="body-xs text-[var(--fg-tertiary)] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--fg-tertiary)] animate-pulse" />
                  Procurando ponte em {BRIDGE_URL}…
                </div>
              )}
            </div>
          )}
          {pendingRefs.length > 0 && (
            <div className="px-3 pt-3 flex gap-1 flex-wrap">
              {pendingRefs.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--bg-raised)] body-xs mono text-[var(--fg-secondary)]"
                  title={r.fileName ?? r.tagName}
                >
                  <Icon name="ads_click" size={11} />
                  {shortRefLabel(r)}
                  <button
                    type="button"
                    onClick={() => removeRef(r.id)}
                    aria-label="Remover referência"
                    className="ml-0.5 opacity-70 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {pendingAttachments.length > 0 && (
            <div className="px-3 pt-3 flex gap-2 flex-wrap">
              {pendingAttachments.map((a) => (
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
                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] inline-flex items-center justify-center body-xs opacity-80 hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {attachError && (
            <div className="px-3 pt-1 body-xs text-[var(--aw-red-600)] flex items-center gap-1">
              <Icon name="error" size={11} />
              {attachError}
            </div>
          )}
          <div className="px-2.5 py-2 flex items-end gap-1">
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
              onClick={togglePicker}
              aria-label="Selecionar elemento na página"
              title="Selecionar elemento (clica num componente da UI)"
              className={[
                "inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-[var(--bg-raised)]",
                pickerActive
                  ? "text-[var(--accent-brand,#3b82f6)] bg-[var(--bg-raised)]"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]",
              ].join(" ")}
            >
              <Icon name="ads_click" size={16} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={
                !ready ||
                sending ||
                pendingAttachments.length >= MAX_ATTACHMENTS
              }
              aria-label="Anexar imagem"
              title={
                pendingAttachments.length >= MAX_ATTACHMENTS
                  ? `Máximo ${MAX_ATTACHMENTS} imagens`
                  : "Anexar imagem (ou cole com Ctrl+V)"
              }
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)] disabled:opacity-40"
            >
              <Icon name="image" size={16} />
            </button>
            <textarea
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onFocus={() => hasMessages && setExpanded(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              placeholder={
                !ready
                  ? "Aguardando Claude…"
                  : pendingRefs.length > 0
                  ? "O que fazer com esses elementos?"
                  : "Pergunte, edite ou clique no alvo pra selecionar um elemento…"
              }
              rows={1}
              disabled={!ready || sending}
              className="flex-1 min-h-[36px] max-h-[160px] py-2 px-1 bg-transparent body-sm text-[var(--fg-primary)] resize-none focus:outline-none disabled:opacity-50 placeholder:text-[var(--fg-tertiary)]"
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
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              title="Fechar (⌘⇧L)"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-raised)]"
            >
              <Icon name="close" size={16} />
            </button>
            <button
              type="submit"
              disabled={
                !ready ||
                sending ||
                (!composerText.trim() &&
                  pendingAttachments.length === 0 &&
                  pendingRefs.length === 0)
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
