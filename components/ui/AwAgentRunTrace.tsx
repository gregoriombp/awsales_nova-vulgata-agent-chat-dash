import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

/**
 * AwAgentRunTrace — linha do tempo de alto nível de uma execução de agente:
 * checkpoints, chamadas de tool, decisões e handoffs num único trilho vertical.
 * Onde o `AwThinkingSteps` mostra o raciocínio passo a passo, este mostra o
 * ARCO da run — e cada passo pode embutir um `AwToolCallCard` via `children`.
 * Apresentacional (sem estado); ícones Material Symbols, cores por token.
 */

export type AwRunStepKind =
  | "checkpoint"
  | "tool"
  | "decision"
  | "handoff"
  | "message"
  | "end"

export type AwRunStepStatus = "done" | "active" | "error" | "pending"

const KIND_ICON: Record<AwRunStepKind, string> = {
  checkpoint: "flag",
  tool: "bolt",
  decision: "alt_route",
  handoff: "support_agent",
  message: "chat_bubble",
  end: "check_circle",
}

const STATUS_NODE: Record<AwRunStepStatus, string> = {
  done: "bg-(--aw-emerald-100) text-(--aw-emerald-800)",
  active: "bg-(--aw-blue-100) text-(--aw-blue-800)",
  error: "bg-(--aw-red-100) text-(--aw-red-800)",
  pending: "bg-(--bg-muted) text-(--fg-tertiary)",
}

export type AwAgentRunStep = {
  kind: AwRunStepKind
  title: string
  detail?: string
  /** Estado do passo. Default: "done". */
  status?: AwRunStepStatus
  /** Latência do passo, em ms. */
  durationMs?: number
  /** Conteúdo aninhado — ex.: um `<AwToolCallCard/>` num passo do tipo "tool". */
  children?: React.ReactNode
}

export type AwAgentRunTraceProps = {
  steps: AwAgentRunStep[]
  className?: string
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s`
}

export function AwAgentRunTrace({ steps, className }: AwAgentRunTraceProps) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {steps.map((step, i) => {
        const status = step.status ?? "done"
        const last = i === steps.length - 1
        return (
          <li key={i} className="flex gap-3">
            {/* trilho: nó + linha que cresce até o próximo passo */}
            <div className="flex w-7 flex-col items-center">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full",
                  STATUS_NODE[status],
                )}
              >
                <Icon
                  name={
                    status === "active"
                      ? "progress_activity"
                      : KIND_ICON[step.kind]
                  }
                  size={16}
                  className={status === "active" ? "animate-spin" : undefined}
                />
              </span>
              {!last && (
                <span
                  aria-hidden="true"
                  className="mt-1 w-px flex-1 bg-(--border-default)"
                />
              )}
            </div>

            {/* conteúdo */}
            <div className={cn("min-w-0 flex-1 pt-0.5", !last && "pb-5")}>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-(--fg-primary)">
                  {step.title}
                </span>
                {step.durationMs != null && (
                  <span className="text-2xs text-(--fg-tertiary)">
                    {fmtDuration(step.durationMs)}
                  </span>
                )}
              </div>
              {step.detail && (
                <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                  {step.detail}
                </p>
              )}
              {step.children && <div className="mt-2">{step.children}</div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
