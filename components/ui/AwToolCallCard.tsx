"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { cn } from "@/lib/utils"

/**
 * AwToolCallCard — mostra uma chamada de tool/integração feita por um agente:
 * nome da tool, status da execução e os painéis de entrada/saída colapsáveis.
 * É o bloco que responde "o que o agente fez?" dentro do chat ou de um
 * `AwAgentRunTrace`. Compõe `Icon` + `AwPill` + `AwBrandLogo`; superfície e
 * cores saem de tokens (nada hardcoded).
 */

export type AwToolCallStatus = "pending" | "running" | "success" | "error"

type StatusMeta = { label: string; pill: AwPillVariant }

const STATUS_META: Record<AwToolCallStatus, StatusMeta> = {
  pending: { label: "Na fila", pill: "neutral" },
  running: { label: "Executando", pill: "ai" },
  success: { label: "Concluído", pill: "live" },
  error: { label: "Erro", pill: "error" },
}

export type AwToolCallCardProps = {
  /** Nome da tool/função chamada (ex.: "@aop.Reembolso", "buscar_cliente"). */
  tool: string
  /** Ícone Material Symbols. Ignorado quando `brand` é passado. */
  icon?: string
  /** Id de brand (AwBrandLogo) quando a tool é uma integração (ex.: "pipedrive"). */
  brand?: string
  status: AwToolCallStatus
  /** Latência da execução, em ms. */
  durationMs?: number
  /** Entrada da tool — string vira bloco de código; qualquer nó é renderizado cru. */
  input?: React.ReactNode
  /** Saída da tool — string vira bloco de código; qualquer nó é renderizado cru. */
  output?: React.ReactNode
  /** Mensagem de erro, exibida quando `status="error"`. */
  error?: string
  /** Começa expandido. Default: aberto quando há erro, senão fechado. */
  defaultOpen?: boolean
  className?: string
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s`
}

function CodePanel({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const isText = typeof children === "string" || typeof children === "number"
  return (
    <div className="flex flex-col gap-1">
      <span className="text-3xs font-medium uppercase tracking-wide text-(--fg-tertiary)">
        {label}
      </span>
      {isText ? (
        <pre className="m-0 overflow-x-auto rounded-md bg-(--bg-muted) px-3 py-2 font-mono text-xs leading-relaxed text-(--fg-secondary)">
          {children}
        </pre>
      ) : (
        <div className="text-sm text-(--fg-secondary)">{children}</div>
      )}
    </div>
  )
}

export function AwToolCallCard({
  tool,
  icon = "bolt",
  brand,
  status,
  durationMs,
  input,
  output,
  error,
  defaultOpen,
  className,
}: AwToolCallCardProps) {
  const meta = STATUS_META[status]
  const hasBody =
    input != null || output != null || (status === "error" && !!error)
  const [open, setOpen] = React.useState(defaultOpen ?? status === "error")

  const header = (
    <>
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-(--bg-muted)">
        {brand ? (
          <AwBrandLogo
            brand={brand}
            size="sm"
            bare
            style={{ width: 20, height: 20, borderRadius: 5 }}
          />
        ) : (
          <Icon name={icon} size={18} className="text-(--fg-secondary)" />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-sm font-medium text-(--fg-primary)">
        {tool}
      </span>
      {durationMs != null && (
        <span className="shrink-0 text-2xs text-(--fg-tertiary)">
          {fmtDuration(durationMs)}
        </span>
      )}
      <AwPill variant={meta.pill} className="shrink-0">
        {meta.label}
      </AwPill>
      {hasBody && (
        <Icon
          name="expand_more"
          size={18}
          className={cn(
            "shrink-0 text-(--fg-tertiary) transition-transform duration-aw-fast",
            open && "rotate-180",
          )}
        />
      )}
    </>
  )

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-(--bg-surface)",
        status === "error" ? "border-(--accent-danger)" : "border-(--border-subtle)",
        className,
      )}
    >
      {hasBody ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-(--bg-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-brand)"
        >
          {header}
        </button>
      ) : (
        <div className="flex w-full items-center gap-2.5 px-3 py-2.5">
          {header}
        </div>
      )}

      {hasBody && open && (
        <div className="flex flex-col gap-3 border-t border-(--border-subtle) px-3 py-3">
          {input != null && <CodePanel label="Entrada">{input}</CodePanel>}
          {output != null && <CodePanel label="Saída">{output}</CodePanel>}
          {status === "error" && error && (
            <div className="flex items-start gap-2 rounded-md bg-(--aw-red-100) px-3 py-2 text-xs text-(--aw-red-800)">
              <Icon name="error" size={15} className="mt-px shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
