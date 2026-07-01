"use client";

import { AwPill } from "@/components/ui/AwPill";
import { AwTrendDelta } from "@/components/ui/AwTrendDelta";
import { Icon } from "@/components/ui/Icon";
import {
  brl,
  INVOICE_HISTORY,
  invoiceStatusLabel,
} from "../../financeiro/_components/data";
import { statusVariant } from "../../financeiro/_components/InvoiceDetailsSheet";
import { BILLING_CYCLES } from "./cycles-data";
import { useConsumo } from "./ConsumoContext";

/**
 * Headline de gasto do período — valor acumulado + tendência vs. período
 * anterior. Extraído do ExplorerMain pra ser compartilhado com o dashboard
 * fixo da Visão geral (mesma fonte: o ConsumoContext mais próximo).
 *
 * No relatório de FATURAS, o cabeçalho deixa claro o recorte (cmt-f70a5094):
 * status da fatura filtrada + início e fim do ciclo dela, com hora.
 */
export function SpendHeadline() {
  const { accumulated, trend, periodLabel, reportType, invoiceId } = useConsumo();
  // O frame do título muda por tipo: cobranças é dinheiro que saiu, não consumo.
  const headline =
    reportType === "cobrancas"
      ? "Cobrado no período"
      : reportType === "faturas"
        ? "Total nesta fatura"
        : "Uso no período";

  const invoice =
    reportType === "faturas" && invoiceId
      ? INVOICE_HISTORY.find((i) => i.id === invoiceId)
      : undefined;
  const cycle = invoice
    ? BILLING_CYCLES.find((c) => c.refMonth === invoice.refMonth)
    : undefined;

  return (
    <header className="mt-4 flex flex-col gap-1.5">
      <span className="body-sm text-(--fg-secondary)">{headline}</span>
      <div className="flex items-baseline gap-3">
        <span className="display-sm font-semibold tabular-nums tracking-heading-tighter text-(--fg-primary)">
          {brl(accumulated)}
        </span>
        <AwTrendDelta value={trend} tone="neutral" />
      </div>
      {invoice ? (
        <span className="inline-flex flex-wrap items-center gap-2 body-xs text-(--fg-tertiary)">
          <AwPill variant={statusVariant(invoice.status)}>
            {invoiceStatusLabel(invoice.status)}
          </AwPill>
          <span className="font-medium text-(--fg-secondary)">
            {invoice.refMonth} · {invoice.description}
          </span>
          {cycle && (
            <span className="inline-flex items-center gap-1">
              <Icon name="schedule" size={14} />
              {cycle.startsAt} <Icon name="arrow_right_alt" size={14} /> {cycle.endsAt}
            </span>
          )}
          <span>· vence em {invoice.dueAt}</span>
        </span>
      ) : (
        <span className="body-xs text-(--fg-tertiary)">
          {periodLabel} · comparado ao período anterior
        </span>
      )}
    </header>
  );
}
