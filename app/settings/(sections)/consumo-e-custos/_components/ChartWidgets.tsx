"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import { Icon } from "@/components/ui/Icon";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AwAvatar,
} from "@/components/ui/AwAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  brl,
  CHARGED_BY_DAY,
  CHARGED_TOTAL,
  USED_BY_DAY,
  USED_META_TOTAL,
  USED_WC_TOTAL,
  type SpendingCategory,
  type SpendingGrouping,
  type SpendingPeriod,
} from "../../financeiro/_components/data";
import { useConsumo, type SeriesTotal } from "./ConsumoContext";
import { SegmentedToggle } from "./controls";
import { WidgetShell } from "./WidgetBoard";

/* ----------------------------------------------------------------------------
 * Widgets de gráfico do dashboard. Cada um lê o modelo do contexto e oferece
 * visualizações alternativas (barras/área/linha; rosca/barras) — "quando
 * possível", como pediu o brief.
 * ------------------------------------------------------------------------- */

// "Hoje" do protótipo — âncora fixa pra os rótulos de data não dependerem do
// relógio (evita mismatch de hidratação).
const CHART_ANCHOR = new Date(2026, 4, 19); // 19/05/2026

function ddmm(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function dayLabel(
  index: number,
  totalDays: number,
  period: SpendingPeriod,
): string {
  if (period === "today") return ddmm(CHART_ANCHOR);
  if (period === "this-month") {
    return ddmm(
      new Date(CHART_ANCHOR.getFullYear(), CHART_ANCHOR.getMonth(), index + 1),
    );
  }
  const offset = totalDays - 1 - index;
  const daysBack = period === "last-90" ? offset * 3 : offset;
  const d = new Date(CHART_ANCHOR);
  d.setDate(d.getDate() - daysBack);
  return ddmm(d);
}

function buildConfig(categories: SpendingCategory[]): ChartConfig {
  return Object.fromEntries(
    categories.map((c) => [c.id, { label: c.label, color: c.colorVar }]),
  );
}

/* ============================ Consumo por dia ============================ */

type ConsumoViz = "bar" | "area" | "line";

export function ConsumoChartWidget({
  dragHandle,
}: {
  dragHandle?: React.ReactNode;
}) {
  const { chartModel, chartIds, chartPeriod, grouping, accumulated } =
    useConsumo();
  const [viz, setViz] = React.useState<ConsumoViz>("bar");

  const categories = React.useMemo(
    () => chartModel.categories.filter((c) => chartIds.has(c.id)),
    [chartModel, chartIds],
  );
  const config = React.useMemo(() => buildConfig(categories), [categories]);
  const totalDays = chartModel.data.length;

  const chartData = React.useMemo(
    () =>
      chartModel.data.map((day, i) => {
        const row: Record<string, number | string> = {
          day: dayLabel(i, totalDays, chartPeriod),
        };
        chartModel.categories.forEach((cat, c) => {
          row[cat.id] = day[c] ?? 0;
        });
        return row;
      }),
    [chartModel, chartPeriod, totalDays],
  );

  const tickInterval =
    totalDays <= 8 ? 0 : Math.max(0, Math.floor(totalDays / 6) - 1);

  const tooltip = (
    <ChartTooltip
      cursor={{ fill: "var(--bg-hover)" }}
      content={
        <ChartTooltipContent
          indicator="dot"
          className="min-w-[200px] bg-(--bg-raised)"
          labelFormatter={(label, items) => {
            const total = (items ?? []).reduce(
              (sum, it) => sum + (Number(it.value) || 0),
              0,
            );
            return (
              <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) pb-1.5">
                <span className="body-xs font-medium text-(--fg-primary)">
                  {label}
                </span>
                <span className="body-xs font-semibold tabular-nums text-(--fg-primary)">
                  {brl(total)}
                </span>
              </div>
            );
          }}
          formatter={(value, name) => {
            const cat = categories.find((c) => c.id === name);
            return (
              <div className="flex w-full items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: cat?.colorVar }}
                  />
                  {cat?.label ?? String(name)}
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
  );

  const axes = (
    <>
      <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
      <XAxis
        dataKey="day"
        tickLine={{ stroke: "var(--border-default)" }}
        axisLine={{ stroke: "var(--border-subtle)" }}
        tickMargin={8}
        interval={tickInterval}
        minTickGap={16}
      />
    </>
  );

  const defs = (
    <defs>
      {categories.map((cat) => (
        <linearGradient
          key={cat.id}
          id={`cgrad-${cat.id}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={`var(--color-${cat.id})`} stopOpacity={0.82} />
          <stop offset="100%" stopColor={`var(--color-${cat.id})`} stopOpacity={1} />
        </linearGradient>
      ))}
    </defs>
  );

  return (
    <WidgetShell
      title="Consumo por dia"
      icon="bar_chart"
      description={`${grouping === "service" ? "Por serviço" : "Por agente"} · acumulado ${brl(accumulated)}`}
      dragHandle={dragHandle}
      actions={
        <VizToggle
          value={viz}
          onChange={setViz}
          options={[
            { value: "bar", icon: "bar_chart", label: "Barras" },
            { value: "area", icon: "area_chart", label: "Área" },
            { value: "line", icon: "show_chart", label: "Linha" },
          ]}
        />
      }
    >
      <ChartLegend categories={categories} grouping={grouping} othersLabels={chartModel.othersLabels} />
      <ChartContainer
        config={config}
        className="mt-3 aspect-auto h-[300px] w-full"
      >
        {viz === "bar" ? (
          <BarChart data={chartData} margin={{ left: 12, right: 12, top: 8 }} barCategoryGap={totalDays <= 12 ? "24%" : "14%"}>
            {defs}
            {axes}
            {tooltip}
            {categories.map((cat, i) => (
              <Bar
                key={cat.id}
                dataKey={cat.id}
                stackId="spend"
                fill={`url(#cgrad-${cat.id})`}
                maxBarSize={36}
                radius={i === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        ) : viz === "area" ? (
          <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 8 }}>
            {defs}
            {axes}
            {tooltip}
            {categories.map((cat) => (
              <Area
                key={cat.id}
                dataKey={cat.id}
                stackId="spend"
                type="monotone"
                stroke={`var(--color-${cat.id})`}
                strokeWidth={1.5}
                fill={`url(#cgrad-${cat.id})`}
                fillOpacity={0.45}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ left: 12, right: 12, top: 8 }}>
            {axes}
            {tooltip}
            {categories.map((cat) => (
              <Line
                key={cat.id}
                dataKey={cat.id}
                type="monotone"
                stroke={`var(--color-${cat.id})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        )}
      </ChartContainer>
    </WidgetShell>
  );
}

/* ============================ Composição ============================ */

type ComposicaoViz = "donut" | "bars";

export function ComposicaoWidget({
  dragHandle,
}: {
  dragHandle?: React.ReactNode;
}) {
  const { seriesTotals, grouping, accumulated } = useConsumo();
  const [viz, setViz] = React.useState<ComposicaoViz>("donut");

  const data = React.useMemo(
    () =>
      seriesTotals.map((s) => ({
        id: s.cat.id,
        name: s.cat.label,
        value: s.total,
        fill: s.cat.colorVar,
      })),
    [seriesTotals],
  );

  const config = React.useMemo(
    () => buildConfig(seriesTotals.map((s) => s.cat)),
    [seriesTotals],
  );

  const empty = data.length === 0 || accumulated <= 0;

  return (
    <WidgetShell
      title="Composição do período"
      icon="donut_small"
      description={grouping === "service" ? "Participação por serviço / taxa" : "Participação por agente"}
      dragHandle={dragHandle}
      actions={
        <VizToggle
          value={viz}
          onChange={setViz}
          options={[
            { value: "donut", icon: "donut_small", label: "Rosca" },
            { value: "bars", icon: "bar_chart", label: "Barras" },
          ]}
        />
      }
    >
      {empty ? (
        <EmptyChart />
      ) : viz === "donut" ? (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ChartContainer
            config={config}
            className="aspect-square h-[200px] w-[200px] shrink-0"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="bg-(--bg-raised)"
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="body-xs text-(--fg-secondary)">{String(name)}</span>
                        <span className="body-xs font-medium tabular-nums text-(--fg-primary)">
                          {brl(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={86}
                paddingAngle={1.5}
                strokeWidth={0}
                isAnimationActive={false}
              >
                {data.map((d) => (
                  <Cell key={d.id} fill={d.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ShareList totals={seriesTotals} total={accumulated} grouping={grouping} />
        </div>
      ) : (
        <ShareBars totals={seriesTotals} total={accumulated} grouping={grouping} />
      )}
    </WidgetShell>
  );
}

function ShareList({
  totals,
  total,
  grouping,
}: {
  totals: SeriesTotal[];
  total: number;
  grouping: SpendingGrouping;
}) {
  return (
    <ul className="m-0 flex min-w-0 flex-1 list-none flex-col gap-2 p-0">
      {totals.slice(0, 6).map((s) => {
        const pct = total > 0 ? (s.total / total) * 100 : 0;
        return (
          <li
            key={s.cat.id}
            className="flex items-center justify-between gap-3 body-xs"
          >
            <span className="inline-flex min-w-0 items-center gap-2 text-(--fg-secondary)">
              {grouping === "agent" && s.cat.avatar ? (
                <AwAvatar size="sm" src={s.cat.avatar} alt={s.cat.label} />
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: s.cat.colorVar }}
                />
              )}
              <span className="truncate">{s.cat.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-(--fg-tertiary)">
              {pct.toFixed(0)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ShareBars({
  totals,
  total,
  grouping,
}: {
  totals: SeriesTotal[];
  total: number;
  grouping: SpendingGrouping;
}) {
  const max = totals.reduce((m, s) => Math.max(m, s.total), 0) || 1;
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {totals.map((s) => {
        const pct = total > 0 ? (s.total / total) * 100 : 0;
        return (
          <li key={s.cat.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3 body-xs">
              <span className="inline-flex min-w-0 items-center gap-2 text-(--fg-secondary)">
                {grouping === "agent" && s.cat.avatar ? (
                  <AwAvatar size="sm" src={s.cat.avatar} alt={s.cat.label} />
                ) : (
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: s.cat.colorVar }}
                  />
                )}
                <span className="truncate">{s.cat.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-(--fg-secondary)">
                {brl(s.total)}{" "}
                <span className="text-(--fg-tertiary)">· {pct.toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-(--bg-muted)">
              <div
                className="h-full rounded-full"
                style={{ width: `${(s.total / max) * 100}%`, background: s.cat.colorVar }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ============================ Usado × cobrado ============================ */

type ReconViz = "bar" | "line";

export function UsadoCobradoWidget({
  dragHandle,
}: {
  dragHandle?: React.ReactNode;
}) {
  const [viz, setViz] = React.useState<ReconViz>("bar");

  const data = React.useMemo(
    () =>
      USED_BY_DAY.map((d, i) => ({
        day: d.label,
        wc: d.wc,
        meta: d.meta,
        used: Math.round((d.wc + d.meta) * 100) / 100,
        charged: CHARGED_BY_DAY[i]?.value ?? 0,
      })),
    [],
  );

  const config: ChartConfig = {
    wc: { label: "Taxas Aswork", color: "var(--aw-blue-500)" },
    meta: { label: "Meta · aprox.", color: "var(--aw-purple-400)" },
    used: { label: "Usado", color: "var(--aw-blue-500)" },
    charged: { label: "Atribuído ao provedor", color: "var(--aw-amber-500)" },
  };

  return (
    <WidgetShell
      title="Usado × cobrado"
      icon="sync_alt"
      description={`Usado ${brl(USED_WC_TOTAL + USED_META_TOTAL)} · cobrado ${brl(CHARGED_TOTAL)}`}
      dragHandle={dragHandle}
      actions={
        <VizToggle
          value={viz}
          onChange={setViz}
          options={[
            { value: "bar", icon: "bar_chart", label: "Barras" },
            { value: "line", icon: "show_chart", label: "Linhas" },
          ]}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-1">
        <LegendDot color="var(--aw-blue-500)" label="Taxas Aswork" />
        <LegendDot color="var(--aw-purple-400)" label="Meta · aprox." />
        <LegendDot color="var(--aw-amber-500)" label="Atribuído ao provedor" />
      </div>
      <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
        {viz === "bar" ? (
          <ComposedChart data={data} margin={{ left: 12, right: 12, top: 8 }} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
            <XAxis
              dataKey="day"
              tickLine={{ stroke: "var(--border-default)" }}
              axisLine={{ stroke: "var(--border-subtle)" }}
              tickMargin={8}
              minTickGap={16}
            />
            <ChartTooltip
              cursor={{ fill: "var(--bg-hover)" }}
              content={<ChartTooltipContent className="min-w-[200px] bg-(--bg-raised)" />}
            />
            <Bar dataKey="wc" stackId="u" fill="var(--aw-blue-500)" maxBarSize={30} isAnimationActive={false} />
            <Bar dataKey="meta" stackId="u" fill="var(--aw-purple-400)" maxBarSize={30} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Line
              dataKey="charged"
              type="monotone"
              stroke="var(--aw-amber-500)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        ) : (
          <LineChart data={data} margin={{ left: 12, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
            <XAxis
              dataKey="day"
              tickLine={{ stroke: "var(--border-default)" }}
              axisLine={{ stroke: "var(--border-subtle)" }}
              tickMargin={8}
              minTickGap={16}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border-default)" }}
              content={<ChartTooltipContent className="min-w-[200px] bg-(--bg-raised)" />}
            />
            <Line dataKey="used" type="monotone" stroke="var(--aw-blue-500)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            <Line dataKey="charged" type="monotone" stroke="var(--aw-amber-500)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          </LineChart>
        )}
      </ChartContainer>
    </WidgetShell>
  );
}

/* ---------- compartilhados ---------- */

function VizToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; icon: string; label: string }[];
}) {
  return (
    <SegmentedToggle
      ariaLabel="Tipo de gráfico"
      value={value}
      onChange={onChange}
      options={options}
    />
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 body-xs text-(--fg-secondary)">
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function ChartLegend({
  categories,
  grouping,
  othersLabels,
}: {
  categories: SpendingCategory[];
  grouping: SpendingGrouping;
  othersLabels: string[];
}) {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {categories.map((c) => {
        const isOthers = c.id === "__others__" && othersLabels.length > 0;
        const item = (
          <span className="inline-flex items-center gap-2 body-xs text-(--fg-secondary)">
            {grouping === "agent" && c.avatar ? (
              <AwAvatar size="sm" src={c.avatar} alt={c.label} />
            ) : (
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: c.colorVar }}
              />
            )}
            {c.label}
            {isOthers && <Icon name="info" size={13} className="text-(--fg-tertiary)" />}
          </span>
        );
        if (!isOthers) return <React.Fragment key={c.id}>{item}</React.Fragment>;
        return (
          <TooltipProvider key={c.id} delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>{item}</TooltipTrigger>
              <TooltipContent side="top" className="border-(--border-subtle) bg-(--bg-raised)">
                <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                  {othersLabels.map((label) => (
                    <li key={label} className="body-xs text-(--fg-primary)">
                      {label}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center">
      <Icon name="filter_alt_off" size={22} className="text-(--fg-tertiary)" />
      <p className="m-0 body-sm text-(--fg-tertiary)">
        Nenhum item no filtro selecionado.
      </p>
    </div>
  );
}
