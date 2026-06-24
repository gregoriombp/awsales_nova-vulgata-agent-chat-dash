"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  getUsedChargedSeries,
  periodBars,
  reconScaleForCustom,
  reconScaleForPeriod,
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

// Paleta monocromática (azul → slate) do dashboard. A série de maior valor fica
// com o azul mais saturado/escuro; conforme o valor cai, a cor clareia e
// dessatura. É uma rampa LOCAL — não toca em SPENDING_CATEGORIES (que o
// Financeiro compartilha); só remapeia a cor pra leitura aqui.
const MONO_RAMP = [
  "var(--aw-blue-700)",
  "var(--aw-blue-600)",
  "var(--aw-blue-500)",
  "var(--aw-blue-400)",
  "var(--aw-blue-300)",
  "var(--aw-slate-300)",
  "var(--aw-slate-200)",
];

function monoColorByRank(
  items: { id: string; total: number }[],
): Map<string, string> {
  const ranked = [...items].sort((a, b) => b.total - a.total);
  const map = new Map<string, string>();
  ranked.forEach((it, i) => {
    map.set(it.id, MONO_RAMP[Math.min(i, MONO_RAMP.length - 1)]);
  });
  return map;
}

const CHART_ANIMATION_DURATION = 360;

function seriesOpacity(activeSeries: string | null, id: string): number {
  return activeSeries && activeSeries !== id ? 0.28 : 1;
}

/* ============================ Consumo por dia ============================ */

type ConsumoViz = "bar" | "area" | "line";

export function ConsumoChartWidget({
  dragHandle,
  resizeButton,
}: {
  dragHandle?: React.ReactNode;
  resizeButton?: React.ReactNode;
}) {
  const { chartModel, chartIds, chartPeriod, grouping, accumulated } =
    useConsumo();
  const [viz, setViz] = React.useState<ConsumoViz>("bar");
  const [activeSeries, setActiveSeries] = React.useState<string | null>(null);

  const categories = React.useMemo(() => {
    const filtered = chartModel.categories.filter((c) => chartIds.has(c.id));
    const totals = filtered.map((c) => {
      const idx = chartModel.categories.indexOf(c);
      return {
        id: c.id,
        total: chartModel.data.reduce((s, d) => s + (d[idx] ?? 0), 0),
      };
    });
    const colorByRank = monoColorByRank(totals);
    return filtered.map((c) => ({
      ...c,
      colorVar: colorByRank.get(c.id) ?? c.colorVar,
    }));
  }, [chartModel, chartIds]);
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

  // Eixos compartilhados pelas 3 vizualizações. Recharts só reconhece
  // CartesianGrid/XAxis como filhos DIRETOS do chart e percorre arrays de
  // children — mas NÃO entra em Fragments. Um fragment aqui fazia o eixo (e os
  // rótulos de data) sumir silenciosamente; por isso usamos um array com keys.
  const axes = [
    <CartesianGrid key="grid" vertical={false} stroke="var(--border-subtle)" />,
    <XAxis
      key="x"
      dataKey="day"
      tickLine={{ stroke: "var(--border-default)" }}
      axisLine={{ stroke: "var(--border-subtle)" }}
      tickMargin={8}
      interval={totalDays > 31 ? "preserveStartEnd" : 0}
      minTickGap={4}
      tick={{ fontSize: 11 }}
      height={34}
    />,
  ];

  return (
    <WidgetShell
      title="Consumo por dia"
      icon="bar_chart"
      description={`${grouping === "service" ? "Por serviço" : "Por agente"} · acumulado ${brl(accumulated)}`}
      dragHandle={dragHandle}
      resizeButton={resizeButton}
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
        key={viz}
        config={config}
        className="mt-3 aspect-auto h-[300px] w-full animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
      >
        {viz === "bar" ? (
          <BarChart data={chartData} margin={{ left: 12, right: 12, top: 8 }} barCategoryGap={totalDays <= 12 ? "28%" : "16%"}>
            {axes}
            {tooltip}
            {categories.map((cat, i) => (
              <Bar
                key={cat.id}
                dataKey={cat.id}
                stackId="spend"
                fill={`var(--color-${cat.id})`}
                opacity={seriesOpacity(activeSeries, cat.id)}
                maxBarSize={56}
                radius={i === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                isAnimationActive
                animationDuration={CHART_ANIMATION_DURATION}
                onMouseEnter={() => setActiveSeries(cat.id)}
                onMouseLeave={() => setActiveSeries(null)}
              />
            ))}
          </BarChart>
        ) : viz === "area" ? (
          <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 8 }}>
            {axes}
            {tooltip}
            {categories.map((cat) => (
              <Area
                key={cat.id}
                dataKey={cat.id}
                stackId="spend"
                type="monotone"
                stroke={`var(--color-${cat.id})`}
                strokeOpacity={seriesOpacity(activeSeries, cat.id)}
                strokeWidth={1.5}
                fill={`var(--color-${cat.id})`}
                fillOpacity={activeSeries && activeSeries !== cat.id ? 0.14 : 0.42}
                isAnimationActive
                animationDuration={CHART_ANIMATION_DURATION}
                onMouseEnter={() => setActiveSeries(cat.id)}
                onMouseLeave={() => setActiveSeries(null)}
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
                strokeOpacity={seriesOpacity(activeSeries, cat.id)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive
                animationDuration={CHART_ANIMATION_DURATION}
                onMouseEnter={() => setActiveSeries(cat.id)}
                onMouseLeave={() => setActiveSeries(null)}
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
  resizeButton,
}: {
  dragHandle?: React.ReactNode;
  resizeButton?: React.ReactNode;
}) {
  const { seriesTotals, grouping, accumulated } = useConsumo();
  const [viz, setViz] = React.useState<ComposicaoViz>("donut");
  const [activeSlice, setActiveSlice] = React.useState<string | null>(null);

  // Mesma rampa monocromática do "Consumo por dia": maior fatia = azul mais
  // escuro, clareando conforme a participação cai.
  const colored = React.useMemo(() => {
    const colorByRank = monoColorByRank(
      seriesTotals.map((s) => ({ id: s.cat.id, total: s.total })),
    );
    return seriesTotals.map((s) => ({
      ...s,
      cat: { ...s.cat, colorVar: colorByRank.get(s.cat.id) ?? s.cat.colorVar },
    }));
  }, [seriesTotals]);

  const data = React.useMemo(
    () =>
      colored.map((s) => ({
        id: s.cat.id,
        name: s.cat.label,
        value: s.total,
        fill: s.cat.colorVar,
      })),
    [colored],
  );

  const config = React.useMemo(
    () => buildConfig(colored.map((s) => s.cat)),
    [colored],
  );

  const empty = data.length === 0 || accumulated <= 0;

  return (
    <WidgetShell
      title="Composição do período"
      icon="donut_small"
      description={grouping === "service" ? "Participação por serviço / taxa" : "Participação por agente"}
      dragHandle={dragHandle}
      resizeButton={resizeButton}
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
            key={viz}
            config={config}
            className="aspect-square h-[200px] w-[200px] shrink-0 animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
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
                isAnimationActive
                animationDuration={CHART_ANIMATION_DURATION}
              >
                {data.map((d) => (
                  <Cell
                    key={d.id}
                    fill={d.fill}
                    opacity={seriesOpacity(activeSlice, d.id)}
                    onMouseEnter={() => setActiveSlice(d.id)}
                    onMouseLeave={() => setActiveSlice(null)}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ShareList totals={colored} total={accumulated} grouping={grouping} />
        </div>
      ) : (
        <ShareBars totals={colored} total={accumulated} grouping={grouping} />
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
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const max = totals.reduce((m, s) => Math.max(m, s.total), 0) || 1;
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {totals.map((s) => {
        const pct = total > 0 ? (s.total / total) * 100 : 0;
        return (
          <li
            key={s.cat.id}
            onMouseEnter={() => setActiveId(s.cat.id)}
            onMouseLeave={() => setActiveId(null)}
            className="flex items-center gap-3 body-xs transition-opacity duration-aw-fast"
            style={{ opacity: seriesOpacity(activeId, s.cat.id) }}
          >
            <span className="inline-flex w-28 shrink-0 items-center gap-2 text-(--fg-secondary)">
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
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-(--bg-muted)">
              <div
                className="h-full rounded-full"
                style={{ width: `${(s.total / max) * 100}%`, background: s.cat.colorVar }}
              />
            </div>
            <span className="shrink-0 tabular-nums text-(--fg-secondary)">
              {brl(s.total)}{" "}
              <span className="text-(--fg-tertiary)">· {pct.toFixed(0)}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ===================== Uso do período × provedor ===================== */

export function UsadoCobradoWidget({
  dragHandle,
  resizeButton,
}: {
  dragHandle?: React.ReactNode;
  resizeButton?: React.ReactNode;
}) {
  const { selection, chartPeriod, customDays, scopeFactor } = useConsumo();
  const [activeSeries, setActiveSeries] = React.useState<string | null>(null);

  // Acompanha o controle de tempo global: nº de buckets + fator de escala saem
  // do período (ou range custom) ativo, espelhando os outros widgets. O
  // scopeFactor estreita o widget junto com o drill (fração visível do total).
  const bars =
    selection.kind === "custom"
      ? Math.max(1, Math.min(customDays, 90))
      : periodBars(selection.id);
  const scale =
    (selection.kind === "custom"
      ? reconScaleForCustom(customDays)
      : reconScaleForPeriod(selection.id)) * scopeFactor;

  const series = React.useMemo(
    () => getUsedChargedSeries(bars, scale),
    [bars, scale],
  );

  const data = React.useMemo(
    () =>
      series.map((d, i) => ({
        day: dayLabel(i, bars, chartPeriod),
        wc: d.wc,
        meta: d.meta,
        charged: d.charged,
      })),
    [series, bars, chartPeriod],
  );

  const wcTotal = React.useMemo(
    () => series.reduce((s, d) => s + d.wc, 0),
    [series],
  );
  const metaTotal = React.useMemo(
    () => series.reduce((s, d) => s + d.meta, 0),
    [series],
  );
  const chargedTotal = React.useMemo(
    () => series.reduce((s, d) => s + d.charged, 0),
    [series],
  );

  const usoConfig: ChartConfig = {
    wc: { label: "Custo Aswork", color: "var(--aw-blue-500)" },
    meta: { label: "Custo Meta", color: "var(--aw-purple-400)" },
  };
  const provedorConfig: ChartConfig = {
    charged: { label: "Atribuído ao provedor", color: "var(--aw-slate-400)" },
  };

  return (
    <WidgetShell
      title="Uso do período"
      icon="sync_alt"
      description={`Custo Aswork ${brl(wcTotal)} · Meta aprox. ${brl(metaTotal)}`}
      dragHandle={dragHandle}
      resizeButton={resizeButton}
    >
      {/* Uso: Aswork sólido + Meta tracejado (menos evidência, é aproximado) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-1">
        <LegendDot color="var(--aw-blue-500)" label="Custo Aswork" />
        <LegendDot color="var(--aw-purple-400)" label="Custo Meta (aprox.)" />
      </div>
      <ChartContainer
        config={usoConfig}
        className="aspect-auto h-[200px] w-full animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
      >
        <BarChart data={data} margin={{ left: 12, right: 12, top: 8 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
          <XAxis
            dataKey="day"
            tickLine={{ stroke: "var(--border-default)" }}
            axisLine={{ stroke: "var(--border-subtle)" }}
            tickMargin={8}
            minTickGap={8}
            height={34}
          />
          <ChartTooltip
            cursor={{ fill: "var(--bg-hover)" }}
            content={<ChartTooltipContent className="min-w-[200px] bg-(--bg-raised)" />}
          />
          <Bar
            dataKey="wc"
            stackId="u"
            fill="var(--aw-blue-500)"
            opacity={seriesOpacity(activeSeries, "wc")}
            maxBarSize={30}
            isAnimationActive
            animationDuration={CHART_ANIMATION_DURATION}
            onMouseEnter={() => setActiveSeries("wc")}
            onMouseLeave={() => setActiveSeries(null)}
          />
          <Bar
            dataKey="meta"
            stackId="u"
            fill="var(--aw-purple-400)"
            fillOpacity={0.2}
            stroke="var(--aw-purple-400)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={seriesOpacity(activeSeries, "meta")}
            maxBarSize={30}
            radius={[3, 3, 0, 0]}
            isAnimationActive
            animationDuration={CHART_ANIMATION_DURATION}
            onMouseEnter={() => setActiveSeries("meta")}
            onMouseLeave={() => setActiveSeries(null)}
          />
        </BarChart>
      </ChartContainer>

      {/* Valor atribuído ao provedor de pagamento — com disclaimer do delay */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-(--border-subtle) pt-4">
        <h6 className="m-0 body-sm font-medium text-(--fg-secondary)">
          Valor atribuído ao provedor
        </h6>
        <span className="body-xs tabular-nums text-(--fg-tertiary)">
          {brl(chargedTotal)}
        </span>
      </div>
      <ChartContainer
        config={provedorConfig}
        className="aspect-auto h-[160px] w-full"
      >
        <BarChart data={data} margin={{ left: 12, right: 12, top: 8 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
          <XAxis
            dataKey="day"
            tickLine={{ stroke: "var(--border-default)" }}
            axisLine={{ stroke: "var(--border-subtle)" }}
            tickMargin={8}
            minTickGap={8}
            height={34}
          />
          <ChartTooltip
            cursor={{ fill: "var(--bg-hover)" }}
            content={<ChartTooltipContent className="min-w-[200px] bg-(--bg-raised)" />}
          />
          <Bar
            dataKey="charged"
            fill="var(--aw-slate-400)"
            maxBarSize={30}
            radius={[3, 3, 0, 0]}
            isAnimationActive
            animationDuration={CHART_ANIMATION_DURATION}
          />
        </BarChart>
      </ChartContainer>
      <p className="m-0 mt-2 body-xs text-(--fg-tertiary)">
        O que o provedor de pagamento atribuiu no período. Pode diferir do uso
        por delay entre o custo cair no nosso sistema e ser contabilizado no
        provedor.
      </p>
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
