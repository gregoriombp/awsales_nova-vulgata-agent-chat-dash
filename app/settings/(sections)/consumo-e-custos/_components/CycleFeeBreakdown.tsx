"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { brl } from "../../financeiro/_components/data";
import { InfoTip } from "./KpiCards";
import {
  cycleVariableTotal,
  FEES,
  type BillingCycle,
} from "./cycles-data";

/* ----------------------------------------------------------------------------
 * Fixo × variável por fee — a segmentação da fatura do ciclo (pedido do Greg,
 * cmt-4185be9f): primeiro a proporção plano × uso variável, depois o variável
 * quebrado por taxa, na mesma língua visual da Visão geral (mesmas cores das
 * categorias de serviço). Flat: barra de proporção + linhas, sem card aninhado.
 * ------------------------------------------------------------------------- */

export function CycleFeeBreakdown({ cycle }: { cycle: BillingCycle }) {
  const variable = cycleVariableTotal(cycle);
  const total = cycle.fixed + variable;
  const fixedPct = total > 0 ? (cycle.fixed / total) * 100 : 0;

  const fees = FEES.map((fee) => ({
    ...fee,
    value: cycle.variableByFee[fee.id] ?? 0,
  }))
    .filter((f) => f.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <section aria-label="Fixo × variável por fee" className="flex flex-col gap-4">
      <header>
        <h4 className="m-0 inline-flex items-center gap-1.5 text-(--fg-primary)">
          Fixo × variável, por fee
          <InfoTip text="Como a cobrança do ciclo se divide: a parte fixa do plano e o uso variável faturado pela Aswork, quebrado por taxa. O que a Meta cobra direto fica fora." />
        </h4>
        <p className="m-0 mt-1 body-xs text-(--fg-tertiary)">
          A mesma leitura da Visão geral, no recorte da fatura deste ciclo.
        </p>
      </header>

      {/* Proporção plano × variável */}
      <div className="flex flex-col gap-2">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-(--bg-muted)">
          <span
            className="h-full bg-(--fg-primary)"
            style={{ width: `${fixedPct}%` }}
            aria-hidden="true"
          />
          <span
            className="h-full bg-(--aw-blue-400)"
            style={{ width: `${100 - fixedPct}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
            <span className="inline-block h-2 w-2 rounded-full bg-(--fg-primary)" aria-hidden="true" />
            Plano (fixo) · <strong className="font-medium tabular-nums">{brl(cycle.fixed)}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
            <span className="inline-block h-2 w-2 rounded-full bg-(--aw-blue-400)" aria-hidden="true" />
            Uso variável · <strong className="font-medium tabular-nums">{brl(variable)}</strong>
            {cycle.open && <span className="text-(--fg-tertiary)">(parcial)</span>}
          </span>
        </div>
      </div>

      {/* Variável por fee */}
      <div className="flex flex-col gap-2.5">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-(--bg-muted)">
          {fees.map((f) => (
            <span
              key={f.id}
              className="h-full"
              style={{
                width: `${variable > 0 ? (f.value / variable) * 100 : 0}%`,
                background: f.colorVar,
              }}
              title={`${f.label} · ${brl(f.value)}`}
              aria-hidden="true"
            />
          ))}
        </div>
        <ul className="m-0 flex list-none flex-col p-0">
          {fees.map((f, i) => {
            const share = variable > 0 ? Math.round((f.value / variable) * 100) : 0;
            return (
              <li
                key={f.id}
                className={
                  "flex items-center gap-3 py-2.5" +
                  (i > 0 ? " border-t border-(--border-subtle)" : "")
                }
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `color-mix(in srgb, ${f.colorVar} 14%, transparent)` }}
                >
                  <Icon name={f.icon} size={16} style={{ color: f.colorVar }} />
                </span>
                <span className="min-w-0 flex-1 truncate body-sm text-(--fg-primary)">
                  {f.label}
                </span>
                <span className="shrink-0 body-xs tabular-nums text-(--fg-tertiary)">
                  {share}%
                </span>
                <span className="w-28 shrink-0 text-right body-sm font-medium tabular-nums text-(--fg-primary)">
                  {brl(f.value)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
