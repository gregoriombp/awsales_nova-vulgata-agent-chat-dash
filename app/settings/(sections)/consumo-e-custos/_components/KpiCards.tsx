"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ADJUSTMENT_ITEMS, brl } from "../../financeiro/_components/data";
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
        tooltip="Soma do uso variável Aswork no período — sem plano fixo e sem Meta."
      />
      <HighlightCard
        label="Créditos e cupons"
        value={`− ${brl(summary.credits)}`}
        valueClassName="text-(--accent-success)"
        tooltip="Créditos e cupons abatem somente valores cobrados pela Aswork — nunca o valor do Meta, que é cobrado direto no seu cartão pela plataforma do Meta."
      />
      <HighlightCard
        label="Ajustes"
        value={signedBrl(summary.adjustments)}
        tooltip="Estornos e correções reconhecidos no período — somam (+) ou abatem (−) do total. Costuma vir zerado."
        footer={
          summary.adjustments !== 0 ? <AdjustmentsDetail /> : undefined
        }
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
  footer,
}: {
  label: string;
  value: string;
  tooltip: string;
  valueClassName?: string;
  emphasized?: boolean;
  footer?: React.ReactNode;
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
      <div className="flex items-center justify-between gap-3">
        <div
          className={
            "text-(length:--h3-size) font-semibold leading-none tracking-heading-tighter tabular-nums " +
            (valueClassName ?? "text-(--fg-primary)")
          }
        >
          {value}
        </div>
        {/* "Saiba mais" (Ajustes) fica à direita, centrado com o número. */}
        {footer}
      </div>
    </div>
  );
}

function signedBrl(value: number): string {
  const sign = value < 0 ? "−" : "+";
  return `${sign} ${brl(Math.abs(value))}`;
}

/* Botão discreto "Saiba mais" no card Ajustes — abre um popover com o motivo de
 * cada estorno/correção e o total. Só aparece quando há ajuste no período. */
function AdjustmentsDetail() {
  const total = ADJUSTMENT_ITEMS.reduce((s, i) => s + i.value, 0);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex w-fit shrink-0 items-center gap-1 body-xs font-medium text-(--fg-tertiary) transition-colors duration-aw-fast hover:text-(--fg-primary)"
        >
          Saiba mais
          <Icon name="chevron_right" size={14} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-80 border border-(--border-subtle) bg-(--bg-raised) p-0 shadow-lg"
      >
        <div className="border-b border-(--border-subtle) px-4 py-3">
          <p className="m-0 body-sm font-semibold text-(--fg-primary)">
            Ajustes do período
          </p>
          <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
            Estornos e correções que somam (+) ou abatem (−) do total.
          </p>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3 p-4">
          {ADJUSTMENT_ITEMS.map((item) => (
            <li key={item.id} className="flex flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="body-sm font-medium text-(--fg-primary)">
                  {item.label}
                </span>
                <span
                  className={
                    "shrink-0 body-sm font-medium tabular-nums " +
                    (item.value < 0
                      ? "text-(--accent-success)"
                      : "text-(--fg-primary)")
                  }
                >
                  {signedBrl(item.value)}
                </span>
              </div>
              <span className="body-xs text-(--fg-tertiary)">{item.detail}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-3 border-t border-(--border-subtle) px-4 py-3">
          <span className="body-sm font-medium text-(--fg-secondary)">
            Total de ajustes
          </span>
          <span className="body-sm font-semibold tabular-nums text-(--fg-primary)">
            {signedBrl(total)}
          </span>
        </div>
      </PopoverContent>
    </Popover>
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
