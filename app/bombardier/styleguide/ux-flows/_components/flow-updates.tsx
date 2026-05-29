import * as React from "react"
import { Section } from "../../_primitives"

export type FlowUpdateTag =
  | "new-page"
  | "removed-page"
  | "new-branch"
  | "flow-rework"
  | "integration"

export type FlowUpdate = {
  /** ISO date `YYYY-MM-DD`. Local timezone — never parsed as UTC. */
  date: string
  /** Optional time-of-day label shown next to the date (e.g. "16:37 BRT"). */
  time?: string
  /** One sentence in PT-BR describing the structural change. */
  summary: string
  tags: FlowUpdateTag[]
}

const TAG_STYLE: Record<
  FlowUpdateTag,
  { bg: string; fg: string; border: string; label: string }
> = {
  "new-page": {
    bg: "var(--aw-blue-100)",
    fg: "var(--aw-blue-900)",
    border: "var(--aw-blue-200)",
    label: "nova tela",
  },
  "removed-page": {
    bg: "var(--aw-red-100)",
    fg: "var(--aw-red-900)",
    border: "var(--aw-red-300)",
    label: "tela removida",
  },
  "new-branch": {
    bg: "var(--aw-amber-100)",
    fg: "var(--aw-amber-900)",
    border: "var(--aw-amber-300)",
    label: "novo branch",
  },
  "flow-rework": {
    bg: "var(--aw-amber-100)",
    fg: "var(--aw-amber-900)",
    border: "var(--aw-amber-300)",
    label: "reorganização",
  },
  "integration": {
    bg: "var(--aw-emerald-100)",
    fg: "var(--aw-emerald-900)",
    border: "var(--aw-emerald-300)",
    label: "integração",
  },
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function formatShort(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  }).replace(".", "")
}

function formatLong(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(/\./g, "")
}

function sortDesc(updates: FlowUpdate[]): FlowUpdate[] {
  return [...updates].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/**
 * Discreet badge next to the page title showing when the flow was last
 * meaningfully updated. Returns null if there are no updates.
 */
export function FlowUpdatesBadge({ updates }: { updates: FlowUpdate[] }) {
  if (!updates || updates.length === 0) return null
  const latest = sortDesc(updates)[0]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border px-2.5 py-1 text-xs font-medium"
      style={{
        background: "var(--aw-amber-100)",
        borderColor: "var(--aw-amber-300)",
        color: "var(--aw-amber-900)",
      }}
      title={latest.summary}
    >
      <span
        aria-hidden
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: "var(--aw-amber-500)" }}
      />
      Atualizado em {formatShort(latest.date)}
    </span>
  )
}

/**
 * Timeline section listing each meaningful update to the flow. Returns null
 * if there are no updates — safe to call unconditionally from a flow page.
 */
export function FlowUpdatesHistorySection({ updates }: { updates: FlowUpdate[] }) {
  if (!updates || updates.length === 0) return null
  const sorted = sortDesc(updates)
  return (
    <Section
      id="updates"
      title="Histórico de atualizações"
      lead="Mudanças estruturais no fluxo desde que esta página foi criada. Não inclui ajustes de texto ou estilo."
    >
      <ol className="m-0 p-0 list-none flex flex-col gap-3">
        {sorted.map((u, i) => (
          <li
            key={`${u.date}-${i}`}
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 flex flex-col gap-2"
          >
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="aw-eyebrow text-[var(--fg-tertiary)]">
                {formatLong(u.date)}
                {u.time ? ` · ${u.time}` : ""}
              </span>
              {u.tags.map((t) => {
                const s = TAG_STYLE[t]
                return (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                    style={{ background: s.bg, borderColor: s.border, color: s.fg }}
                  >
                    {s.label}
                  </span>
                )
              })}
            </div>
            <p className="m-0 text-sm text-[var(--fg-primary)] leading-relaxed">
              {u.summary}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
