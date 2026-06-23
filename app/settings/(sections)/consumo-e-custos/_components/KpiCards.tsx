"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  brl,
  PERIOD_DIFF,
  PERIOD_DIFF_REASON,
} from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";

/* ----------------------------------------------------------------------------
 * 4 cards de destaque (fixos no topo) + card de insight do período.
 * Os 4 cards são period-aware: derivam do subtotal apurado pro período/filtro
 * ativo (subtotal − créditos + ajustes = total). Sem "Tributos" — fora do
 * escopo do dashboard.
 * ------------------------------------------------------------------------- */

export function HighlightCards() {
  const { summary } = useConsumo();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <HighlightCard
        label="Subtotal de uso"
        value={brl(summary.subtotal)}
        tooltip="Soma de tudo que foi consumido no período, antes de créditos e ajustes."
      />
      <HighlightCard
        label="Descontos e créditos"
        value={`− ${brl(summary.credits)}`}
        valueClassName="text-(--accent-success)"
        tooltip="Vouchers e cupons aplicados no período. Incidem só sobre o que é cobrado pela Aswork — não abatem os valores aproximados do Meta."
      />
      <HighlightCard
        label="Ajustes"
        value={brl(summary.adjustments)}
        tooltip="Estornos e correções de lançamentos reconhecidos no período."
      />
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

/* ---------- card de insight (laranja) ---------- */

export function InsightCard({ dragHandle }: { dragHandle?: React.ReactNode }) {
  const positive = PERIOD_DIFF >= 0;
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-(--aw-amber-200) bg-(--aw-amber-100) p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {dragHandle}
          <span className="flex items-center gap-2">
            <Icon
              name="lightbulb"
              size={16}
              className="text-(--accent-warning)"
            />
            <h6 className="m-0 text-(--aw-amber-800)">Leitura do período</h6>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="m-0 body-md text-(--aw-amber-900)">
          Diferença do período:{" "}
          <strong className="font-semibold tabular-nums">
            {positive ? "+" : "−"}
            {brl(Math.abs(PERIOD_DIFF))}
          </strong>{" "}
          <span className="text-(--aw-amber-700)">
            (cobrado {positive ? ">" : "<"} usado)
          </span>
        </p>
        <p className="m-0 body-sm leading-relaxed text-(--aw-amber-800)">
          <span className="font-medium">Motivo dominante:</span>{" "}
          {PERIOD_DIFF_REASON} Os valores do Meta não entram nesta conta — são
          cobrados direto pela plataforma do Meta.
        </p>
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
