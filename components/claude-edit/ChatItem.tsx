"use client"

import * as React from "react"
import { AwChatBubble } from "@/components/ui/AwChatBubble"
import { Icon } from "@/components/ui/Icon"
import type { ChatMessage, ToolCall } from "@/lib/claude-edit/types"
import { shortRefLabel } from "@/lib/claude-edit/fiber-source"

function ToolTimeline({ tools }: { tools: ToolCall[] }) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({})
  return (
    <div className="flex flex-col gap-1 mb-1 pl-3 border-l-2 border-[var(--border-subtle)]">
      {tools.map((t) => {
        const expanded = open[t.id]
        return (
          <div key={t.id} className="body-xs text-[var(--fg-secondary)]">
            <button
              type="button"
              onClick={() => setOpen((o) => ({ ...o, [t.id]: !o[t.id] }))}
              className="inline-flex items-center gap-1 hover:text-[var(--fg-primary)]"
            >
              <Icon
                name={t.isError ? "error" : "build"}
                size={11}
                className={t.isError ? "text-[var(--aw-red-600)]" : undefined}
              />
              <span className="mono">{t.name}</span>
              <Icon
                name={expanded ? "expand_less" : "expand_more"}
                size={11}
              />
            </button>
            {expanded && (
              <div className="mt-1 pl-4 space-y-1">
                {t.input != null && (
                  <pre className="body-xs whitespace-pre-wrap break-words mono text-[var(--fg-tertiary)] max-h-32 overflow-y-auto">
                    {typeof t.input === "string"
                      ? t.input
                      : JSON.stringify(t.input, null, 2)}
                  </pre>
                )}
                {t.result && (
                  <pre className="body-xs whitespace-pre-wrap break-words mono text-[var(--fg-tertiary)] max-h-32 overflow-y-auto">
                    {t.result.slice(0, 1500)}
                    {t.result.length > 1500 ? "\n…" : ""}
                  </pre>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function RefChips({ refs }: { refs: NonNullable<ChatMessage["refs"]> }) {
  if (refs.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mb-1.5">
      {refs.map((r) => (
        <span
          key={r.id}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-raised)] body-xs text-[var(--fg-secondary)] mono"
          title={r.fileName ?? r.tagName}
        >
          <Icon name="ads_click" size={10} />
          {shortRefLabel(r)}
        </span>
      ))}
    </div>
  )
}

export function ChatItem({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user"
  return (
    <AwChatBubble
      variant={isUser ? "user" : "agent"}
      streaming={msg.status === "streaming" && !msg.text}
    >
      {!isUser && msg.tools && msg.tools.length > 0 && (
        <ToolTimeline tools={msg.tools} />
      )}
      {msg.refs && msg.refs.length > 0 && <RefChips refs={msg.refs} />}
      {msg.text && (
        <div className="whitespace-pre-wrap break-words body-sm leading-relaxed">
          {msg.text}
        </div>
      )}
      {msg.error && (
        <div className="mt-1 body-xs text-[var(--aw-red-600)] flex items-center gap-1">
          <Icon name="error" size={11} />
          {msg.error}
        </div>
      )}
      {(msg.costUsd != null || msg.durationMs != null) && (
        <div className="mt-1 body-xs text-[var(--fg-tertiary)]">
          {msg.durationMs != null
            ? `${(msg.durationMs / 1000).toFixed(1)}s`
            : ""}
          {msg.costUsd != null
            ? ` · $${msg.costUsd.toFixed(4)}`
            : ""}
        </div>
      )}
    </AwChatBubble>
  )
}
