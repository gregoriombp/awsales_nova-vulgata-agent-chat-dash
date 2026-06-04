import * as React from "react"
import { AwCard } from "@/components/ui/AwCard"
import { Icon } from "@/components/ui/Icon"
import type {
  RoadmapItem,
  RoadmapStatus,
  RoadmapPriority,
  RoadmapCategory,
} from "../_data"

type Swatch = { bg: string; fg: string; border: string; label: string }

const STATUS_STYLE: Record<RoadmapStatus, Swatch & { icon: string }> = {
  idea: {
    bg: "var(--bg-surface)",
    fg: "var(--fg-secondary)",
    border: "var(--border-subtle)",
    label: "ideia",
    icon: "lightbulb",
  },
  todo: {
    bg: "var(--aw-blue-100)",
    fg: "var(--aw-blue-900)",
    border: "var(--aw-blue-200)",
    label: "a fazer",
    icon: "radio_button_unchecked",
  },
  "in-progress": {
    bg: "var(--aw-amber-100)",
    fg: "var(--aw-amber-900)",
    border: "var(--aw-amber-300)",
    label: "em progresso",
    icon: "pending",
  },
  done: {
    bg: "var(--aw-emerald-100)",
    fg: "var(--aw-emerald-900)",
    border: "var(--aw-emerald-300)",
    label: "concluído",
    icon: "task_alt",
  },
  dropped: {
    bg: "var(--bg-surface)",
    fg: "var(--fg-tertiary)",
    border: "var(--border-subtle)",
    label: "descartado",
    icon: "cancel",
  },
}

const PRIORITY_STYLE: Record<RoadmapPriority, Swatch> = {
  high: {
    bg: "var(--aw-red-100)",
    fg: "var(--aw-red-900)",
    border: "var(--aw-red-300)",
    label: "alta",
  },
  medium: {
    bg: "var(--aw-amber-100)",
    fg: "var(--aw-amber-900)",
    border: "var(--aw-amber-300)",
    label: "média",
  },
  low: {
    bg: "var(--aw-slate-100)",
    fg: "var(--aw-slate-900)",
    border: "var(--aw-slate-300)",
    label: "baixa",
  },
}

const CATEGORY_LABEL: Record<RoadmapCategory, string> = {
  styleguide: "styleguide",
  icons: "ícones",
  skills: "skills",
  "tone-of-voice": "tom de voz",
  infra: "infra",
  docs: "docs",
}

// Datas — mesma convenção local de ux-flows/_components/flow-updates.tsx
// (duplicado de propósito pra manter o módulo independente).
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function formatLong(iso: string): string {
  return parseLocalDate(iso)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/\./g, "")
}

function Pill({ swatch }: { swatch: Swatch }) {
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-md)] border px-2.5 py-1 text-xs font-medium"
      style={{ background: swatch.bg, borderColor: swatch.border, color: swatch.fg }}
    >
      {swatch.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: RoadmapStatus }) {
  return <Pill swatch={STATUS_STYLE[status]} />
}

export function PriorityBadge({ priority }: { priority: RoadmapPriority }) {
  return <Pill swatch={PRIORITY_STYLE[priority]} />
}

export function RoadmapItemCard({ item }: { item: RoadmapItem }) {
  const status = STATUS_STYLE[item.status]
  const muted = item.status === "dropped" || item.status === "done"
  return (
    <AwCard
      className="p-6 flex flex-col gap-3 bg-[var(--bg-raised)]"
      style={{ borderRadius: "var(--radius-2xl)" }}
    >
      <div className="flex items-baseline gap-3 flex-wrap">
        <Icon
          name={status.icon}
          size={20}
          className="self-center text-[var(--fg-secondary)]"
        />
        <h3
          className="m-0 text-base font-semibold text-[var(--fg-primary)]"
          style={muted ? { textDecoration: "line-through", opacity: 0.7 } : undefined}
        >
          {item.title}
        </h3>
        <StatusBadge status={item.status} />
        <PriorityBadge priority={item.priority} />
        <span className="aw-eyebrow text-[var(--fg-tertiary)]">
          {CATEGORY_LABEL[item.category]}
        </span>
        <span className="ml-auto aw-eyebrow text-[var(--fg-tertiary)]">
          {formatLong(item.createdAt)}
        </span>
      </div>

      <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
        {item.description}
      </p>

      {item.note ? (
        <p className="m-0 text-sm text-[var(--fg-tertiary)] leading-relaxed">
          {item.note}
        </p>
      ) : null}
    </AwCard>
  )
}
