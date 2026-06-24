"use client";

import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { brl } from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";

/* ----------------------------------------------------------------------------
 * 4 cards de destaque (fixos no topo) + card de insight do período.
 * Os 4 cards são period-aware: derivam do subtotal apurado pro período/filtro
 * ativo (subtotal − créditos + ajustes = total). Sem "Tributos" — fora do
 * escopo do dashboard.
 * ------------------------------------------------------------------------- */

export function HighlightCards() {
  const { summary } = useConsumo();
  // "Ajustes" é episódico — quando zera (caso comum) vira ruído. Só aparece
  // quando há estorno/correção de fato; o grid se ajusta de 4 → 3 colunas.
  const showAdjustments = summary.adjustments !== 0;
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
        showAdjustments ? "xl:grid-cols-4" : "xl:grid-cols-3"
      }`}
    >
      <HighlightCard
        label="Subtotal de uso"
        value={brl(summary.subtotal)}
        tooltip="Soma de todos os custos variáveis consumidos no período, antes de créditos e ajustes."
      />
      <HighlightCard
        label="Créditos e cupons"
        value={`− ${brl(summary.credits)}`}
        valueClassName="text-(--accent-success)"
        tooltip="Créditos e cupons aplicados no período. Incidem só sobre o que é cobrado pela Aswork — não abatem os valores aproximados do Meta."
      />
      {showAdjustments && (
        <HighlightCard
          label="Ajustes"
          value={brl(summary.adjustments)}
          tooltip="Estornos e correções do período — podem somar (+) ou abater (−) do total, conforme o caso."
        />
      )}
      <HighlightCard
        label="Total no período"
        value={brl(summary.total)}
        emphasized
        tooltip="Subtotal de uso − créditos + ajustes. É o valor que entra na sua fatura Aswork no período."
      />
    </div>
  );
}

function HighlightCard({
  label,
  value,
  tooltip,
  valueClassName,
  emphasized,
}: {
  label: string;
  value: string;
  tooltip: string;
  valueClassName?: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col gap-1.5 rounded-2xl border p-5 transition-colors duration-aw-fast " +
        (emphasized
          ? "border-(--border-default) bg-(--bg-muted)"
          : "border-(--border-subtle) bg-(--bg-raised)")
      }
    >
      <div className="flex items-center gap-1.5 body-xs font-medium text-(--fg-secondary)">
        <span>{label}</span>
        <InfoTip text={tooltip} />
      </div>
      <div
        className={
          "text-(length:--h3-size) font-semibold leading-none tracking-heading-tighter tabular-nums " +
          (valueClassName ?? "text-(--fg-primary)")
        }
      >
        {value}
      </div>
    </div>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Detalhe"
            className="inline-flex text-(--fg-tertiary) transition-colors duration-aw-fast hover:text-(--fg-primary)"
          >
            <Icon name="info" size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[260px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
