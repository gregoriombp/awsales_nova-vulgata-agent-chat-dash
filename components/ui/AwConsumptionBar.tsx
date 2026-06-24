import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const DEFAULT_FORMAT = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)

/** Quebra do consumo bruto por dimensão (ex.: pagador, categoria). Os valores
 *  somam o `gross` e viram segmentos coloridos sobrepostos ao trecho líquido
 *  da barra, em baixa opacidade — leitura "quanto disso é o quê" sem virar
 *  uma barra nova. */
export type AwConsumptionSplit = {
  label: string
  value: number
  colorVar: string
}

export type AwConsumptionBarProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Consumo bruto do ciclo, antes de qualquer abatimento. */
  gross: number
  /** Créditos (vouchers/cupons) que abatem o consumo. Não aumentam o limite. */
  credits?: number
  /** Limite do ciclo — referência da agulha e da cobrança. */
  limit: number
  /** Quebra opcional do bruto (deve somar ≈ `gross`). */
  splits?: AwConsumptionSplit[]
  /** Rótulo acessível do trilho. */
  ariaLabel?: string
  /** Formatação dos valores. Default: Intl pt-BR BRL. */
  formatValue?: (value: number) => string
}

/**
 * AwConsumptionBar — barra de consumo de um ciclo com limite fixo.
 * Créditos abatem o consumo bruto; o trecho líquido é o que será cobrado.
 * Uma agulha marca o limite quando ele cai dentro da barra.
 */
export function AwConsumptionBar({
  gross,
  credits = 0,
  limit,
  splits,
  ariaLabel = "Consumo do ciclo",
  formatValue = DEFAULT_FORMAT,
  className,
  ...rest
}: AwConsumptionBarProps) {
  const net = Math.max(gross - credits, 0)
  const scaleMax = Math.max(limit, gross)
  const netPct = scaleMax > 0 ? (net / scaleMax) * 100 : 0
  const grossPct = scaleMax > 0 ? (gross / scaleMax) * 100 : 0
  const limitPct = scaleMax > 0 ? (limit / scaleMax) * 100 : 0
  const overLimit = net > limit
  // Camada de splits cobre o trecho BRUTO (antes de créditos), proporcional a
  // cada item; só renderiza com pelo menos 2 itens válidos.
  const splitTotal = splits?.reduce((s, x) => s + Math.max(0, x.value), 0) ?? 0
  const showSplits = !!splits && splits.length >= 2 && splitTotal > 0

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn("relative h-2.5 w-full", className)}
            aria-label={ariaLabel}
            {...rest}
          >
            <div className="absolute inset-0 rounded-full bg-(--bg-muted)" />

            {/* consumo bruto — a faixa entre líquido e bruto é o abatido */}
            <div
              className={cn(
                "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out",
                grossPct >= 100 ? "rounded-full" : "rounded-l-full",
              )}
              style={{
                width: `${Math.min(grossPct, 100)}%`,
                background: overLimit
                  ? "color-mix(in srgb, var(--aw-red-600) 35%, transparent)"
                  : "color-mix(in srgb, var(--fg-primary) 22%, transparent)",
              }}
            />

            {/* valor líquido a cobrar — tinta (ink) dentro do limite, vermelho ao estourar */}
            <div
              className={cn(
                "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out",
                netPct >= 100 ? "rounded-full" : "rounded-l-full",
                overLimit ? "bg-(--aw-red-600)" : "bg-(--fg-primary)",
              )}
              style={{ width: `${Math.min(netPct, 100)}%` }}
            />

            {/* Splits sobrepostos: cada segmento ocupa sua fatia do trecho
                BRUTO em baixa opacidade — você lê a divisão sem perder o
                trilho preto por baixo. */}
            {showSplits && (
              <div
                className={cn(
                  "absolute inset-y-0 left-0 flex overflow-hidden transition-[width] duration-500 ease-out",
                  grossPct >= 100 ? "rounded-full" : "rounded-l-full",
                )}
                style={{ width: `${Math.min(grossPct, 100)}%` }}
                aria-hidden="true"
              >
                {splits!.map((s, i) => (
                  <span
                    key={`${s.label}-${i}`}
                    className="h-full"
                    style={{
                      width: `${(Math.max(0, s.value) / splitTotal) * 100}%`,
                      background: s.colorVar,
                      opacity: 0.55,
                    }}
                  />
                ))}
              </div>
            )}

            {limitPct > 0 && limitPct < 100 && (
              <ConsumptionNeedle
                leftPct={limitPct}
                color="var(--fg-primary)"
                label={`Limite do ciclo · ${formatValue(limit)}`}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="border-(--border-subtle) bg-(--bg-raised) text-(--fg-primary)"
        >
          <div className="flex flex-col gap-1.5 py-0.5 text-xs">
            <div className="flex items-center justify-between gap-6">
              <span className="text-(--fg-secondary)">Consumo bruto</span>
              <span className="tabular-nums">{formatValue(gross)}</span>
            </div>
            {showSplits && (
              <div className="flex flex-col gap-1 border-t border-(--border-subtle) pt-1.5">
                {splits!.map((s, i) => {
                  const pct = (Math.max(0, s.value) / splitTotal) * 100
                  return (
                    <div
                      key={`${s.label}-${i}`}
                      className="flex items-center justify-between gap-6"
                    >
                      <span className="inline-flex items-center gap-1.5 text-(--fg-secondary)">
                        <span
                          aria-hidden="true"
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: s.colorVar }}
                        />
                        {s.label}
                        <span className="text-(--fg-tertiary) tabular-nums">
                          {pct.toFixed(0)}%
                        </span>
                      </span>
                      <span className="tabular-nums">{formatValue(s.value)}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {credits > 0 && (
              <div className="flex items-center justify-between gap-6">
                <span className="text-(--fg-secondary)">
                  Abatido por créditos
                </span>
                <span className="tabular-nums text-(--accent-success)">
                  −{formatValue(credits)}
                </span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between gap-6 border-t border-(--border-subtle) pt-1.5 font-medium">
              <span>A cobrar</span>
              <span className="tabular-nums">{formatValue(net)}</span>
            </div>
            <div className="flex items-center justify-between gap-6 text-(--fg-secondary)">
              <span>Limite do ciclo</span>
              <span className="tabular-nums">{formatValue(limit)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ConsumptionNeedle({
  leftPct,
  color,
  label,
  dashed,
}: {
  leftPct: number
  color: string
  label: string
  dashed?: boolean
}) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className="pointer-events-auto absolute -top-1 bottom-[-4px] z-1"
      style={{ left: `${leftPct}%` }}
    >
      <span
        className="absolute left-1/2 top-0 -translate-x-1/2 h-full"
        style={{
          width: 1.5,
          background: dashed
            ? `repeating-linear-gradient(to bottom, ${color} 0 3px, transparent 3px 5px)`
            : color,
        }}
      />
    </span>
  )
}
