import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

/**
 * AwAgentStatusBadge — estado do ciclo de vida de um agente (Agent Studio,
 * listas, cabeçalhos): rascunho, treinando, pronto, pausado, erro. Sem border
 * stroke, ícone em fill, tint de fundo por token; "treinando" anima. Em erro,
 * passe `reason` — vira o tooltip nativo.
 */

export type AwAgentStatus =
  | "draft"
  | "training"
  | "ready"
  | "paused"
  | "error"

type StatusMeta = {
  label: string
  icon: string
  cls: string
  spin?: boolean
}

const STATUS_META: Record<AwAgentStatus, StatusMeta> = {
  draft: {
    label: "Rascunho",
    icon: "edit",
    cls: "bg-(--bg-muted) text-(--fg-secondary)",
  },
  training: {
    label: "Treinando",
    icon: "progress_activity",
    cls: "bg-(--aw-amber-100) text-(--aw-amber-900)",
    spin: true,
  },
  ready: {
    label: "Pronto",
    icon: "check_circle",
    cls: "bg-(--aw-emerald-100) text-(--aw-emerald-800)",
  },
  paused: {
    label: "Pausado",
    icon: "pause_circle",
    cls: "bg-(--bg-muted) text-(--fg-secondary)",
  },
  error: {
    label: "Erro",
    icon: "error",
    cls: "bg-(--aw-red-100) text-(--aw-red-800)",
  },
}

export type AwAgentStatusBadgeSize = "sm" | "md"

export type AwAgentStatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  status: AwAgentStatus
  /** Sobrescreve o rótulo padrão do status. */
  label?: React.ReactNode
  /** Motivo do erro — exibido como tooltip nativo quando status="error". */
  reason?: string
  size?: AwAgentStatusBadgeSize
}

const SIZE: Record<
  AwAgentStatusBadgeSize,
  { box: string; icon: number; text: string }
> = {
  sm: { box: "gap-1 px-2 py-0.5", icon: 13, text: "text-2xs" },
  md: { box: "gap-1.5 px-2.5 py-1", icon: 14, text: "body-xs" },
}

export function AwAgentStatusBadge({
  status,
  label,
  reason,
  size = "md",
  className,
  ...rest
}: AwAgentStatusBadgeProps) {
  const meta = STATUS_META[status]
  const s = SIZE[size]
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full font-medium",
        s.box,
        s.text,
        meta.cls,
        className,
      )}
      title={status === "error" ? reason : undefined}
      {...rest}
    >
      <Icon
        name={meta.icon}
        size={s.icon}
        fill={1}
        className={cn("shrink-0", meta.spin && "animate-spin")}
      />
      {label ?? meta.label}
    </span>
  )
}
