"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { brl } from "../../financeiro/_components/data";
import type { StatementRow } from "./CycleStatement";

/* ----------------------------------------------------------------------------
 * Cascata (waterfall) do extrato — a opção VISUAL do saldo remanescente que o
 * Notion pediu: cada barra "flutua" a partir do saldo acumulado; cobranças
 * sobem, créditos/pagamentos descem, e as pontas (saldo anterior / saldo
 * final) ancoram no zero.
 *
 * Paleta com significado (sem azul/roxo, que são Aswork/Meta): saldos em
 * cinza, cobranças em slate escuro, reduções em verde.
 * ------------------------------------------------------------------------- */

const COLOR_BY_KIND: Record<StatementRow["kind"], string> = {
  balance: "var(--aw-gray-300)",
  charge: "var(--aw-slate-500)",
  reduction: "var(--aw-emerald-500)",
};

const SHORT_LABEL: Record<string, string> = {
  "carry-in": "Saldo anterior",
  fixed: "Plano",
  variable: "Uso variável",
  credits: "Créditos",
  adjustments: "Ajustes",
  payments: "Pagamentos",
  "carry-out": "Saldo final",
};

export function CycleWaterfall({ rows }: { rows: StatementRow[] }) {
  const data = React.useMemo(() => {
    // Loop explícito (sem closure mutando `running` dentro de .map — a regra
    // do React Compiler não deixa): cada barra flutua a partir do acumulado.
    const out: {
      id: string;
      name: string;
      fullLabel: string;
      base: number;
      delta: number;
      signed: number;
      kind: StatementRow["kind"];
      color: string;
    }[] = [];
    let running = 0;
    for (const row of rows) {
      const isBalance = row.kind === "balance";
      const from = isBalance ? 0 : running;
      const to = isBalance ? row.signed : running + row.signed;
      running = isBalance ? row.signed : to;
      out.push({
        id: row.id,
        name: SHORT_LABEL[row.id] ?? row.label,
        fullLabel: row.label,
        base: Math.min(from, to),
        // Delta 0 ainda desenha um fiapo visível (senão a linha "some").
        delta: Math.max(Math.abs(to - from), 0.01),
        signed: row.signed,
        kind: row.kind,
        // "color" (não "fill"): um campo `fill` no dado sobrescreveria o
        // fill="transparent" da barra-base no Recharts e pintaria a base.
        color: COLOR_BY_KIND[row.kind],
      });
    }
    return out;
  }, [rows]);

  const config: ChartConfig = { delta: { label: "Valor" } };

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <BarChart data={data} margin={{ left: 12, right: 12, top: 8 }} barCategoryGap="24%">
        <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
        <XAxis
          dataKey="name"
          tickLine={{ stroke: "var(--border-default)" }}
          axisLine={{ stroke: "var(--border-subtle)" }}
          tickMargin={8}
          interval={0}
          tick={{ fontSize: 11 }}
          height={30}
        />
        <ChartTooltip
          cursor={{ fill: "var(--bg-hover)" }}
          content={
            <ChartTooltipContent
              indicator="dot"
              className="min-w-52 bg-(--bg-raised)"
              labelFormatter={(_, items) => {
                const p = items?.[0]?.payload as (typeof data)[number] | undefined;
                return (
                  <span className="body-xs font-medium text-(--fg-primary)">
                    {p?.fullLabel ?? ""}
                  </span>
                );
              }}
              formatter={(_, __, item) => {
                const p = item?.payload as (typeof data)[number] | undefined;
                if (!p) return null;
                const text =
                  p.kind === "balance"
                    ? brl(p.signed)
                    : `${p.signed < 0 ? "−" : "+"} ${brl(Math.abs(p.signed))}`;
                return (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: p.color }}
                      />
                      {p.kind === "balance"
                        ? "Saldo"
                        : p.kind === "charge"
                          ? "Cobrança"
                          : "Redução"}
                    </span>
                    <span className="body-xs font-medium tabular-nums text-(--fg-primary)">
                      {text}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        {/* Base invisível: empurra a barra até o saldo acumulado. */}
        <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="delta" stackId="wf" radius={[6, 6, 6, 6]} isAnimationActive={false}>
          {data.map((d) => (
            <Cell key={d.id} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
