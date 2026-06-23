import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AwCard } from "./AwCard";
import { AwButton } from "./AwButton";
import { AwPill, type AwPillVariant } from "./AwPill";
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
  /** Rótulo-eyebrow no topo, ex.: "Previsão da próxima fatura · 01 Jul".
   *  Ignorado quando `title` é passado. */
  eyebrow?: string;
  /** Título proeminente no topo (substitui o eyebrow). Ex.: "Fatura atual". */
  title?: React.ReactNode;
  /** Selo de status ao lado do título (ex.: "Em aberto"). Default sem dot. */
  status?: { label: React.ReactNode; variant?: AwPillVariant; dot?: boolean };
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
   * um selo com tooltip de hover explicando a variação da cobrança.
   * Tem precedência sobre `trend`.
   */
  estimateNote?: React.ReactNode;
  /**
   * Texto do selo de estimativa. Default "Estimado". Passe `null`/"" para
   * exibir só o ícone de info (sem a palavra) — útil quando o valor estimado
   * já é claro pelo contexto e o "Estimado" textual seria ruído.
   */
  estimateLabel?: React.ReactNode;
  /** Composição do total (assinatura + variável − cupom…). Omitida → herói só
   *  com o número (a quebra pode viver fora, ex.: num card "Detalhamento"). */
  breakdown?: AwCostBreakdownItem[];
  /** Linha-legenda abaixo do número (ex.: data da cobrança + cartão). */
  footnote?: React.ReactNode;
  /** Ação principal. Renderiza link se `href`, senão botão com `onClick`. */
  cta?: { label: string; href?: string; onClick?: () => void };
  /** Medidor radial à direita (consumo vs. teto). Omitido → sem medidor. */
  gauge?: { value: number; max: number; caption?: React.ReactNode };
  /** Formatação monetária. Default: Intl pt-BR / BRL. */
  formatValue?: (n: number) => string;
  /** Variante flat — sem caixa (sem stroke, sem padding nem bg). Pra quando
   *  o card já vive numa página que controla o respiro com gap próprio. */
  bare?: boolean;
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
  title,
  status,
  monitorLabel,
  total,
  trend,
  estimateNote,
  estimateLabel = "Estimado",
  breakdown,
  footnote,
  cta,
  gauge,
  formatValue = BRL,
  bare = false,
  className,
  ...rest
}: AwInvoiceForecastCardProps) {
  const Wrapper: React.ElementType = bare ? "div" : AwCard;
  return (
    <Wrapper
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-8 gap-y-6",
        bare ? "p-0" : "p-6!",
        className,
      )}
      {...rest}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {title != null ? (
          <div className="flex flex-wrap items-center gap-2">
            <h6 className="m-0 body-lg font-medium text-(--fg-primary)">
              {title}
            </h6>
            {status != null && (
              <AwPill
                variant={status.variant ?? "neutral"}
                dot={status.dot ?? false}
              >
                {status.label}
              </AwPill>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="aw-eyebrow normal-case text-(--fg-tertiary)">
              {eyebrow}
            </span>
            {monitorLabel != null && (
              <AwPill variant="live">{monitorLabel}</AwPill>
            )}
          </div>
        )}

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
                    aria-label={estimateLabel ? undefined : "Sobre este valor"}
                    className={cn(
                      "mb-1.5 inline-flex cursor-help items-center gap-1 text-(--fg-secondary) outline-hidden focus-visible:ring-2 focus-visible:ring-(--accent-brand) focus-visible:ring-offset-2",
                      estimateLabel
                        ? "rounded-full border border-(--border-subtle) bg-(--bg-surface) px-2.5 py-1 body-xs font-medium"
                        : "rounded-full p-0.5 text-(--fg-tertiary) hover:text-(--fg-primary)",
                    )}
                  >
                    <Icon name="info" size={estimateLabel ? 13 : 16} />
                    {estimateLabel}
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

        {footnote != null && (
          <p className="m-0 flex flex-wrap items-center gap-1.5 body-sm text-(--fg-tertiary)">
            {footnote}
          </p>
        )}

        {breakdown && breakdown.length > 0 && (
          <AwCostBreakdown items={breakdown} formatValue={formatValue} />
        )}

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
    </Wrapper>
  );
}
