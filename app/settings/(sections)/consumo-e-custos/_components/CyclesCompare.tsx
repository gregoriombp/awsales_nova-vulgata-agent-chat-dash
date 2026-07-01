"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { brl } from "../../financeiro/_components/data";
import { othersOnTop } from "./chart-utils";
import { InfoTip } from "./KpiCards";
import {
  BILLING_CYCLES,
  cycleVariableTotal,
  FEES,
  type BillingCycle,
} from "./cycles-data";

/* ----------------------------------------------------------------------------
 * Comparar meses — a visualização a nível de mês do Notion: uma coluna por
 * ciclo, empilhada por fee (+ o plano fixo como base escura), pra comparar
 * meses lado a lado. Chips ligam/desligam cada mês; clicar numa coluna troca
 * o ciclo aberto na aba.
 * ------------------------------------------------------------------------- */

export function CyclesCompare({
  current,
  onSelectCycle,
}: {
  current: BillingCycle;
  onSelectCycle?: (id: string) => void;
}) {
  const [enabled, setEnabled] = React.useState<Set<string>>(
    () => new Set(BILLING_CYCLES.map((c) => c.id)),
  );
  const toggle = (id: string) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // nunca esvazia
      } else {
        next.add(id);
      }
      return next;
    });

  const cycles = BILLING_CYCLES.filter((c) => enabled.has(c.id));

  // Séries da pilha: plano fixo na BASE (escuro) + fees por tamanho; "Outros"
  // SEMPRE no topo (regra da casa — othersOnTop).
  const series = React.useMemo(() => {
    const feeTotals = FEES.map((fee) => ({
      ...fee,
      total: cycles.reduce((s, c) => s + (c.variableByFee[fee.id] ?? 0), 0),
    })).filter((f) => f.total > 0);
    const ordered = othersOnTop(feeTotals, (f) => f.total);
    return [
      { id: "fixed", label: "Plano (fixo)", colorVar: "var(--fg-primary)" },
      ...ordered.map((f) => ({ id: f.id, label: f.label, colorVar: f.colorVar })),
    ];
  }, [cycles]);

  const data = React.useMemo(
    () =>
      cycles.map((c) => {
        const row: Record<string, number | string | boolean> = {
          id: c.id,
          month: c.refMonth,
          open: Boolean(c.open),
          fixed: c.fixed,
          total: c.fixed + cycleVariableTotal(c),
        };
        FEES.forEach((fee) => {
          row[fee.id] = c.variableByFee[fee.id] ?? 0;
        });
        return row;
      }),
    [cycles],
  );

  const config: ChartConfig = Object.fromEntries(
    series.map((s) => [s.id, { label: s.label, color: s.colorVar }]),
  );

  return (
    <section aria-label="Comparar meses" className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h4 className="m-0 inline-flex items-center gap-1.5 text-(--fg-primary)">
            Comparar meses
            <InfoTip text="Total cobrado por ciclo — o plano fixo na base e o uso variável por fee. Escolha os meses nos chips; clique numa coluna pra abrir aquele ciclo." />
          </h4>
          <p className="m-0 mt-1 body-xs text-(--fg-tertiary)">
            Uma coluna por ciclo, na mesma escala — pra ver a tendência de um mês pro outro.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {BILLING_CYCLES.map((c) => {
            const active = enabled.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(c.id)}
                className={cn(
                  "inline-flex h-8 items-center rounded-full border px-3 body-xs font-medium transition-colors duration-aw-fast",
                  active
                    ? "border-(--border-default) bg-(--bg-raised) text-(--fg-primary)"
                    : "border-(--border-subtle) bg-(--bg-muted) text-(--fg-tertiary) hover:text-(--fg-secondary)",
                  c.id === current.id && active && "ring-1 ring-(--border-strong)",
                )}
              >
                {c.refMonth}
              </button>
            );
          })}
        </div>
      </header>

      <ChartContainer config={config} className="aspect-auto h-80 w-full">
        <BarChart
          data={data}
          margin={{ left: 12, right: 12, top: 8 }}
          barCategoryGap="28%"
          onClick={(state) => {
            const id = (state?.activePayload?.[0]?.payload as { id?: string })?.id;
            if (id && onSelectCycle) onSelectCycle(id);
          }}
        >
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
          <XAxis
            dataKey="month"
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
                className="min-w-56 bg-(--bg-raised)"
                labelFormatter={(label, items) => {
                  const p = items?.[0]?.payload as { total?: number; open?: boolean } | undefined;
                  return (
                    <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) pb-1.5">
                      <span className="body-xs font-medium text-(--fg-primary)">
                        {label}
                        {p?.open ? " · em andamento" : ""}
                      </span>
                      <span className="body-xs font-semibold tabular-nums text-(--fg-primary)">
                        {brl(Number(p?.total ?? 0))}
                      </span>
                    </div>
                  );
                }}
                formatter={(value, name) => {
                  const s = series.find((x) => x.id === name);
                  if (!s || !Number(value)) return null;
                  return (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
                        <span
                          aria-hidden="true"
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: s.colorVar }}
                        />
                        {s.label}
                      </span>
                      <span className="body-xs font-medium tabular-nums text-(--fg-primary)">
                        {brl(Number(value))}
                      </span>
                    </div>
                  );
                }}
              />
            }
          />
          {series.map((s, i) => (
            <Bar
              key={s.id}
              dataKey={s.id}
              stackId="cycle"
              fill={s.colorVar}
              radius={i === series.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              isAnimationActive={false}
              className={onSelectCycle ? "cursor-pointer" : undefined}
            />
          ))}
        </BarChart>
      </ChartContainer>

      {/* Legenda compacta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {series.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: s.colorVar }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </section>
  );
}
