"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { AwCard } from "@/components/ui/AwCard"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"

export type PlaygroundEntry = {
  name: string
  filePath: string
  meta: {
    description?: string
    createdAt?: string
    sourcePrompt?: string
    approval?: string
  } | null
  sizeBytes: number
}

function fmtDate(iso?: string) {
  if (!iso) return ""
  try {
    const d = new Date(iso)
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function PlaygroundList({ entries }: { entries: PlaygroundEntry[] }) {
  const router = useRouter()
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const act = async (
    name: string,
    method: "POST" | "DELETE",
    body?: Record<string, unknown>
  ) => {
    setBusy(name)
    setError(null)
    try {
      const res = await fetch(
        `/api/bombardier/playground/${encodeURIComponent(name)}`,
        {
          method,
          headers: body
            ? { "Content-Type": "application/json" }
            : undefined,
          body: body ? JSON.stringify(body) : undefined,
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : `HTTP ${res.status}`
        )
        return
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(null)
    }
  }

  const approve = (name: string) => {
    if (
      !window.confirm(
        `Aprovar "${name}"? O arquivo vai ser movido para components/ui/ e o meta.json apagado.`
      )
    )
      return
    act(name, "POST", { action: "approve" })
  }

  const reject = (name: string) => {
    if (!window.confirm(`Descartar "${name}"? O arquivo será removido.`)) return
    act(name, "DELETE")
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--aw-red-100)] border border-[var(--aw-red-200)] text-[var(--aw-red-800)] text-sm flex items-start gap-2">
          <Icon name="error" size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {entries.map((e) => (
          <AwCard key={e.name} className="p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold">{e.name}</h3>
                  <AwPill variant="draft">
                    {e.meta?.approval ?? "Pending"}
                  </AwPill>
                </div>
                {e.meta?.description && (
                  <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                    {e.meta.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => reject(e.name)}
                  disabled={busy === e.name}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-[var(--radius-sm)] text-xs text-[var(--fg-secondary)] hover:text-[var(--aw-red-600)] hover:bg-[var(--bg-raised)] disabled:opacity-40 disabled:cursor-wait"
                >
                  <Icon name="delete" size={12} />
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={() => approve(e.name)}
                  disabled={busy === e.name}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--accent-brand)] text-[var(--fg-on-inverse)] hover:bg-[var(--accent-brand-hover)] disabled:opacity-40 disabled:cursor-wait"
                >
                  <Icon
                    name={busy === e.name ? "sync" : "check"}
                    size={12}
                    className={busy === e.name ? "animate-spin" : undefined}
                  />
                  Aprovar
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[var(--fg-tertiary)] font-mono">
              <span className="flex items-center gap-1">
                <Icon name="description" size={11} />
                {e.filePath}
              </span>
              <span>{(e.sizeBytes / 1024).toFixed(1)} KB</span>
              {e.meta?.createdAt && <span>{fmtDate(e.meta.createdAt)}</span>}
            </div>
            {e.meta?.sourcePrompt && (
              <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="text-[11px] uppercase tracking-wider text-[var(--fg-tertiary)] mb-1">
                  Prompt original
                </div>
                <p className="text-xs text-[var(--fg-secondary)] italic leading-relaxed">
                  &ldquo;{e.meta.sourcePrompt}&rdquo;
                </p>
              </div>
            )}
          </AwCard>
        ))}
      </div>
    </>
  )
}
