"use client";

import { AwTrendDelta } from "@/components/ui/AwTrendDelta";
import { brl } from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";

/**
 * Headline de gasto do período — valor acumulado + tendência vs. período
 * anterior. Extraído do ExplorerMain pra ser compartilhado com o dashboard
 * fixo da Visão geral (mesma fonte: o ConsumoContext mais próximo).
 */
export function SpendHeadline() {
  const { accumulated, trend, periodLabel, reportType } = useConsumo();
  // O frame do título muda por tipo: cobranças é dinheiro que saiu, não consumo.
  const headline =
    reportType === "cobrancas"
      ? "Cobrado no período"
      : reportType === "faturas"
        ? "Total nesta fatura"
        : "Uso no período";
  return (
    <header className="mt-4 flex flex-col gap-1.5">
      <span className="body-sm text-(--fg-secondary)">{headline}</span>
      <div className="flex items-baseline gap-3">
        <span className="display-sm font-semibold tabular-nums tracking-heading-tighter text-(--fg-primary)">
          {brl(accumulated)}
        </span>
        <AwTrendDelta value={trend} tone="neutral" />
      </div>
      <span className="body-xs text-(--fg-tertiary)">
        {periodLabel} · comparado ao período anterior
      </span>
    </header>
  );
}
