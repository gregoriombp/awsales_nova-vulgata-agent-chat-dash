import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AwCard } from "./AwCard";
import { AwButton } from "./AwButton";
import { AwPill } from "./AwPill";
import { Icon } from "./Icon";
import { AwTrendDelta } from "./AwTrendDelta";
import { AwRadialProgress } from "./AwRadialProgress";
import { AwCostBreakdown, type AwCostBreakdownItem } from "./AwCostBreakdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const BRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);

export type AwInvoiceForecastCardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> & {
  /** Rótulo-eyebrow no topo, ex.: "Previsão da próxima fatura · 01 Jul". */
  eyebrow: string;
  /** Texto do pill de monitoramento (ex.: "Cortex monitorando custos"). Omitido → sem pill. */
  monitorLabel?: React.ReactNode;
  /** Valor previsto total. */
  total: number;
  /** Variação ao lado do total (passada direto pro AwTrendDelta). */
  trend?: {
    value: number;
    direction?: "up" | "down" | "flat";
    tone?: "good" | "bad" | "neutral";
  };
  /**
   * Quando presente, marca o total como **estimado**: substitui o `trend` por
   * um selo "Estimado" com tooltip de hover explicando a variação da cobrança.
   * Tem precedência sobre `trend`.
   */
  estimateNote?: React.ReactNode;
  /** Composição do total (assinatura + variável − cupom…). */
  breakdown: AwCostBreakdownItem[];
  /** Ação principal. Renderiza link se `href`, senão botão com `onClick`. */
  cta?: { label: string; href?: string; onClick?: () => void };
  /** Medidor radial à direita (consumo vs. teto). Omitido → sem medidor. */
  gauge?: { value: number; max: number; caption?: React.ReactNode };
  /** Formatação monetária. Default: Intl pt-BR / BRL. */
  formatValue?: (n: number) => string;
};

/**
 * AwInvoiceForecastCard — card de "previsão da próxima fatura": valor previsto
 * com variação, composição do custo, ação e um medidor radial de quanto do teto
 * já foi consumido. Compõe os átomos do DS (AwTrendDelta, AwCostBreakdown,
 * AwRadialProgress) + AwPill/AwButton — sem acoplar a nenhum dado de feature.
 *
 * `gauge` e `trend` são opcionais. Passe `estimateNote` para marcar o total como
 * estimado (selo + tooltip) no lugar do `trend`.
 */
export function AwInvoiceForecastCard({
  eyebrow,
  monitorLabel,
  total,
  trend,
  estimateNote,
  breakdown,
  cta,
  gauge,
  formatValue = BRL,
  className,
  ...rest
}: AwInvoiceForecastCardProps) {
  return (
    <AwCard
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-8 gap-y-6 p-6!",
        className,
      )}
      {...rest}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="aw-eyebrow text-(--fg-tertiary)">{eyebrow}</span>
          {monitorLabel != null && (
            <AwPill variant="live">{monitorLabel}</AwPill>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <p className="m-0 display-md tabular-nums text-(--fg-primary)">
            <span className="mr-1 text-[0.45em] font-normal text-(--fg-tertiary)">
              R$
            </span>
            {formatValue(total).replace(/^R\$\s*/, "")}
          </p>
          {estimateNote != null ? (
            <TooltipProvider delayDuration={120}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    className="mb-1.5 inline-flex cursor-help items-center gap-1 rounded-full border border-(--border-subtle) bg-(--bg-surface) px-2.5 py-1 body-xs font-medium text-(--fg-secondary) outline-hidden focus-visible:ring-2 focus-visible:ring-(--accent-brand) focus-visible:ring-offset-2"
                  >
                    <Icon name="info" size={13} />
                    Estimado
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[280px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
                >
                  {estimateNote}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            trend && (
              <AwTrendDelta
                value={trend.value}
                direction={trend.direction}
                tone={trend.tone}
                className="mb-1.5"
              />
            )
          )}
        </div>

        <AwCostBreakdown items={breakdown} formatValue={formatValue} />

        {cta &&
          (cta.href ? (
            <AwButton asChild variant="primary" size="md" className="mt-1 w-fit">
              <Link href={cta.href}>{cta.label}</Link>
            </AwButton>
          ) : (
            <AwButton
              variant="primary"
              size="md"
              className="mt-1 w-fit"
              onClick={cta.onClick}
            >
              {cta.label}
            </AwButton>
          ))}
      </div>

      {gauge && (
        <AwRadialProgress
          value={gauge.value}
          max={gauge.max}
          caption={gauge.caption}
          className="shrink-0"
        />
      )}
    </AwCard>
  );
}
