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
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AwAvatar,
} from "@/components/ui/AwAvatar";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwLogo } from "@/components/ui/AwLogo";
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
import { catProviderOf } from "./explorer-model";
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

// Paleta por pagador: tons de AZUL pras categorias pagas à Aswork e tons de
// ROXO pras pagas ao Meta — escalados por valor, pra dar contraste dentro de
// cada grupo e entre azul×roxo. Rampa LOCAL (não toca em SPENDING_CATEGORIES,
// que o Financeiro compartilha); só remapeia a cor pra leitura aqui.
const BLUE_RAMP = [
  "var(--aw-blue-700)",
  "var(--aw-blue-600)",
  "var(--aw-blue-500)",
  "var(--aw-blue-400)",
  "var(--aw-blue-300)",
];
const PURPLE_RAMP = [
  "var(--aw-purple-600)",
  "var(--aw-purple-500)",
  "var(--aw-purple-400)",
  "var(--aw-purple-300)",
];

function payerColorByRank(
  items: { id: string; total: number }[],
  grouping: SpendingGrouping,
): Map<string, string> {
  const groups: Record<"aswork" | "meta", { id: string; total: number }[]> = {
    aswork: [],
    meta: [],
  };
  items.forEach((it) => groups[catProviderOf(it.id, grouping)].push(it));
  const map = new Map<string, string>();
  groups.aswork
    .sort((a, b) => b.total - a.total)
    .forEach((it, i) => map.set(it.id, BLUE_RAMP[Math.min(i, BLUE_RAMP.length - 1)]));
  groups.meta
    .sort((a, b) => b.total - a.total)
    .forEach((it, i) => map.set(it.id, PURPLE_RAMP[Math.min(i, PURPLE_RAMP.length - 1)]));
  return map;
}

// Lente Agente: cada agente é uma série própria, então precisa de MATIZ distinta
// — o ramp por pagador deixaria tudo azul (todo agente fatura à Aswork), e a
// comparação ficaria ilegível. Atribui por ranking (maior gasto = 1ª cor) pra
// garantir contraste entre os líderes; cicla se passar de 9. "Outros" fica de
// fora (cai no colorVar neutro).
const AGENT_CHART_PALETTE = [
  "var(--aw-blue-500)",
  "var(--aw-amber-500)",
  "var(--aw-emerald-500)",
  "var(--aw-purple-500)",
  "var(--aw-pink-500)",
  "var(--aw-teal-500)",
  "var(--aw-red-500)",
  "var(--aw-lime-500)",
  "var(--aw-slate-500)",
];

function chartColorByRank(
  items: { id: string; total: number }[],
  grouping: SpendingGrouping,
): Map<string, string> {
  if (grouping !== "agent") return payerColorByRank(items, grouping);
  const map = new Map<string, string>();
  [...items]
    .filter((it) => it.id !== "__others__")
    .sort((a, b) => b.total - a.total)
    .forEach((it, i) => map.set(it.id, AGENT_CHART_PALETTE[i % AGENT_CHART_PALETTE.length]));
  return map;
}

const CHART_ANIMATION_DURATION = 360;
const MONEY_TOOLTIP_CLASS = "min-w-52 bg-(--bg-raised)";
const MONEY_TOOLTIP_LABELS: Record<string, string> = {
  wc: "Custo Aswork",
  meta: "Custo Meta (aprox.)",
  charged: "Atribuído ao provedor",
  total: "Total",
  aswork: "Aswork",
};

function seriesOpacity(activeSeries: string | null, id: string): number {
  return activeSeries && activeSeries !== id ? 0.28 : 1;
}

function moneyTooltipFormatter(value: unknown, name: unknown) {
  const label = MONEY_TOOLTIP_LABELS[String(name)] ?? String(name);
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="body-xs text-(--fg-secondary)">{label}</span>
      <span className="body-xs font-medium tabular-nums text-(--fg-primary)">
        {brl(Number(value))}
      </span>
    </div>
  );
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
  const { chartModel, chartIds, chartPeriod, grouping, accumulated, metaIncluded } =
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
    const colorByRank = chartColorByRank(totals, grouping);
    const totalById = new Map(totals.map((t) => [t.id, t.total]));
    return filtered
      .map((c) => ({
        ...c,
        colorVar: colorByRank.get(c.id) ?? c.colorVar,
      }))
      .sort((a, b) => (totalById.get(b.id) ?? 0) - (totalById.get(a.id) ?? 0));
  }, [chartModel, chartIds, grouping]);
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
          className={MONEY_TOOLTIP_CLASS}
          labelFormatter={(label, items) => {
            const total = (items ?? []).reduce(
              (sum, it) => sum + (Number(it.value) || 0),
              0,
            );
            return (
              <div className="flex flex-col gap-0.5 border-b border-(--border-subtle) pb-1.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="body-xs font-medium text-(--fg-primary)">
                    {label}
                  </span>
                  <span className="body-xs font-semibold tabular-nums text-(--fg-primary)">
                    {brl(total)}
                  </span>
                </div>
                <span className="text-3xs text-(--fg-tertiary)">
                  {metaIncluded ? "Total · Aswork + Meta" : "Só valores pagos à Aswork"}
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
        className="mt-3 aspect-auto h-80 w-full animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
      >
        {viz === "bar" ? (
          <BarChart data={chartData} margin={{ left: 12, right: 12, top: 8 }} barCategoryGap="10%">
            {axes}
            {tooltip}
            {categories.map((cat, i) => (
              <Bar
                key={cat.id}
                dataKey={cat.id}
                stackId="spend"
                fill={`var(--color-${cat.id})`}
                opacity={seriesOpacity(activeSeries, cat.id)}
                maxBarSize={72}
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
    const colorByRank = chartColorByRank(
      seriesTotals.map((s) => ({ id: s.cat.id, total: s.total })),
      grouping,
    );
    return seriesTotals.map((s) => ({
      ...s,
      cat: { ...s.cat, colorVar: colorByRank.get(s.cat.id) ?? s.cat.colorVar },
    }));
  }, [seriesTotals, grouping]);

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
          <ShareList
            totals={colored}
            total={accumulated}
            grouping={grouping}
            activeId={activeSlice}
            onActive={setActiveSlice}
          />
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
  activeId,
  onActive,
}: {
  totals: SeriesTotal[];
  total: number;
  grouping: SpendingGrouping;
  activeId: string | null;
  onActive: (id: string | null) => void;
}) {
  const top = totals.slice(0, 6);
  // Barra comparativa entre itens — escala pela maior fatia (quem consumiu
  // mais enche a barra), não pelo total; assim a diferença entre agentes fica
  // legível mesmo quando o líder não chega perto de 100% do período.
  const max = top.reduce((m, s) => Math.max(m, s.total), 0) || 1;
  return (
    <ul className="m-0 flex min-w-0 flex-1 list-none flex-col gap-2.5 p-0">
      {top.map((s) => {
        const pct = total > 0 ? (s.total / total) * 100 : 0;
        return (
          <li
            key={s.cat.id}
            onMouseEnter={() => onActive(s.cat.id)}
            onMouseLeave={() => onActive(null)}
            className="flex flex-col gap-1 transition-opacity duration-aw-fast"
            style={{ opacity: seriesOpacity(activeId, s.cat.id) }}
          >
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
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--bg-muted)">
              <div
                className="h-full rounded-full transition-[width] duration-aw-base ease-aw-out"
                style={{ width: `${Math.max(2, (s.total / max) * 100)}%`, background: s.cat.colorVar }}
              />
            </div>
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

/** Série usado×cobrado, escalada pro período + drill (scopeFactor). Respeita o
 *  filtro de pagador: com Meta desligado, a parte do Meta zera. */
function useUsadoSeries() {
  const { selection, chartPeriod, customDays, scopeFactor, metaIncluded } = useConsumo();
  const bars =
    selection.kind === "custom"
      ? Math.max(1, Math.min(customDays, 90))
      : periodBars(selection.id);
  const scale =
    (selection.kind === "custom"
      ? reconScaleForCustom(customDays)
      : reconScaleForPeriod(selection.id)) * scopeFactor;

  const series = React.useMemo(() => getUsedChargedSeries(bars, scale), [bars, scale]);
  const data = React.useMemo(
    () =>
      series.map((d, i) => ({
        day: dayLabel(i, bars, chartPeriod),
        wc: d.wc,
        meta: metaIncluded ? d.meta : 0,
        charged: d.charged,
      })),
    [series, bars, chartPeriod, metaIncluded],
  );
  return {
    data,
    metaIncluded,
    wcTotal: series.reduce((s, d) => s + d.wc, 0),
    metaTotal: metaIncluded ? series.reduce((s, d) => s + d.meta, 0) : 0,
    chargedTotal: series.reduce((s, d) => s + d.charged, 0),
  };
}

export function UsadoCobradoWidget({
  dragHandle,
  resizeButton,
}: {
  dragHandle?: React.ReactNode;
  resizeButton?: React.ReactNode;
}) {
  const { data, wcTotal, metaTotal, metaIncluded } = useUsadoSeries();
  const [activeSeries, setActiveSeries] = React.useState<string | null>(null);

  // Aswork sólido (azul) + Meta roxo tracejado (só aqui é tracejado, e é aprox.).
  const usoConfig: ChartConfig = {
    wc: { label: "Custo Aswork", color: "var(--aw-blue-500)" },
    meta: { label: "Custo Meta", color: "var(--aw-purple-400)" },
  };

  return (
    <WidgetShell
      title="Uso do período"
      icon="sync_alt"
      description={
        metaIncluded
          ? `Custo Aswork ${brl(wcTotal)} · Meta aprox. ${brl(metaTotal)}`
          : `Custo Aswork ${brl(wcTotal)}`
      }
      dragHandle={dragHandle}
      resizeButton={resizeButton}
      contentClassName="flex min-h-0 flex-col"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-1">
        <LegendDot color="var(--aw-blue-500)" label="Custo Aswork" />
        {metaIncluded && (
          <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
            <AwBrandLogo brand="meta" size={14} markOnly />
            Custo Meta (aprox.)
          </span>
        )}
      </div>
      <ChartContainer
        config={usoConfig}
        className="min-h-48 flex-1 aspect-auto w-full animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
      >
        <BarChart data={data} margin={{ left: 12, right: 12, top: 8 }} barCategoryGap="10%">
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
            content={
              <ChartTooltipContent
                className={MONEY_TOOLTIP_CLASS}
                formatter={moneyTooltipFormatter}
              />
            }
          />
          <Bar
            dataKey="wc"
            stackId="u"
            fill="var(--aw-blue-500)"
            opacity={seriesOpacity(activeSeries, "wc")}
            maxBarSize={72}
            isAnimationActive
            animationDuration={CHART_ANIMATION_DURATION}
            onMouseEnter={() => setActiveSeries("wc")}
            onMouseLeave={() => setActiveSeries(null)}
          />
          {metaIncluded && (
            <Bar
              dataKey="meta"
              stackId="u"
              fill="var(--aw-purple-400)"
              fillOpacity={0.25}
              stroke="var(--aw-purple-400)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              opacity={seriesOpacity(activeSeries, "meta")}
              maxBarSize={72}
              radius={[3, 3, 0, 0]}
              isAnimationActive
              animationDuration={CHART_ANIMATION_DURATION}
              onMouseEnter={() => setActiveSeries("meta")}
              onMouseLeave={() => setActiveSeries(null)}
            />
          )}
        </BarChart>
      </ChartContainer>
      <p className="m-0 mt-2 body-xs text-(--fg-tertiary)">
      A faixa tracejada (Meta) é aproximada e cobrada direto pela plataforma do Meta no seu cartão — não pela Aswork.


      </p>
    </WidgetShell>
  );
}

/* ============== Valor atribuído ao provedor (card próprio) ============== */

export function ProvedorWidget({
  dragHandle,
  resizeButton,
}: {
  dragHandle?: React.ReactNode;
  resizeButton?: React.ReactNode;
}) {
  const { data, chargedTotal } = useUsadoSeries();
  const provedorConfig: ChartConfig = {
    charged: { label: "Atribuído ao provedor", color: "var(--aw-amber-400)" },
  };

  return (
    <WidgetShell
      title="Valor atribuído ao provedor de pagamento"
      icon="account_balance"
      description={`Entrou na fatura no período · ${brl(chargedTotal)}`}
      dragHandle={dragHandle}
      resizeButton={resizeButton}
    >
      <ChartContainer
        config={provedorConfig}
        className="aspect-auto h-[220px] w-full animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
      >
        <BarChart data={data} margin={{ left: 12, right: 12, top: 8 }} barCategoryGap="10%">
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
            content={
              <ChartTooltipContent
                className={MONEY_TOOLTIP_CLASS}
                formatter={moneyTooltipFormatter}
              />
            }
          />
          <Bar
            dataKey="charged"
            fill="var(--aw-amber-400)"
            maxBarSize={72}
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

/* =============== Gasto total no período (card fixo) =============== */

type GastoLineKey = "total" | "aswork" | "meta";

export function GastoTotalCard() {
  const { payerDaily, chartPeriod, metaIncluded, accumulated } = useConsumo();
  // Linha em foco no hover. As demais somem suavemente; a focada ganha um
  // "fio condutor": um segmento claro (grayscale + alpha) que percorre a curva
  // em loop e CLAREIA a própria cor da série por baixo (mix-blend overlay) —
  // azul fica azul vibrante, roxo fica roxo vibrante, sem cor fixa.
  const [activeSeries, setActiveSeries] = React.useState<string | null>(null);

  // Filtro de visualização LOCAL do gráfico (independe da sidebar): liga/desliga
  // Total, Aswork e Meta só aqui. Sempre sobra ≥1 linha.
  const [lines, setLines] = React.useState<Record<GastoLineKey, boolean>>({
    total: true,
    aswork: true,
    meta: true,
  });
  const showMeta = metaIncluded && lines.meta;
  const toggleLine = (key: GastoLineKey) =>
    setLines((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Não deixa esvaziar: conta as visíveis levando em conta o pagador.
      const visible = [next.total, next.aswork, metaIncluded && next.meta].filter(
        Boolean,
      ).length;
      return visible === 0 ? prev : next;
    });
  const allLinesOn = lines.total && lines.aswork && (!metaIncluded || lines.meta);

  // Inclui uma coluna `__overlay` que espelha a série em foco — assim a Area
  // do overlay tem dataKey próprio (sem colidir com a key da Area base no
  // React, que o Recharts deriva do dataKey).
  const data = React.useMemo(() => {
    const base = payerDaily.map((d, i) => ({
      day: dayLabel(i, payerDaily.length, chartPeriod),
      aswork: d.aswork,
      meta: d.meta,
      total: Math.round((d.aswork + d.meta) * 100) / 100,
    }));
    if (!activeSeries) return base;
    const key = activeSeries as "total" | "aswork" | "meta";
    return base.map((d) => ({ ...d, __overlay: d[key] }));
  }, [payerDaily, chartPeriod, activeSeries]);

  const config: ChartConfig = {
    total: { label: "Total", color: "var(--fg-primary)" },
    aswork: { label: "Aswork", color: "var(--aw-blue-500)" },
    meta: { label: "Meta", color: "var(--aw-purple-400)" },
  };

  const fadeFill = (key: string) =>
    activeSeries && activeSeries !== key ? 0.18 : 1;
  const enter = (key: string) => () => setActiveSeries(key);
  const leave = () => setActiveSeries(null);

  return (
    <WidgetShell
      title="Gasto total no período"
      icon="show_chart"
      description={`Gasto no período · ${brl(accumulated)}`}
      actions={
        <AwDropdownMenu
          align="end"
          aria-label="Linhas visíveis no gráfico"
          trigger={
            <button
              type="button"
              aria-label="Filtrar linhas do gráfico"
              className={cn(
                "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-aw-fast hover:bg-(--bg-hover)",
                allLinesOn
                  ? "text-(--fg-tertiary) hover:text-(--fg-primary)"
                  : "text-(--accent-brand)",
              )}
            >
              <Icon name="tune" size={18} />
              {!allLinesOn && (
                <span
                  aria-hidden="true"
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-(--accent-brand)"
                />
              )}
            </button>
          }
          items={[
            { id: "head", isLabel: true, label: "Mostrar no gráfico" },
            {
              id: "total",
              label: "Total",
              checked: lines.total,
              closeOnSelect: false,
              onSelect: () => toggleLine("total"),
            },
            {
              id: "aswork",
              label: "Aswork",
              checked: lines.aswork,
              closeOnSelect: false,
              onSelect: () => toggleLine("aswork"),
            },
            {
              id: "meta",
              label: metaIncluded ? "Meta" : "Meta · desligado na lateral",
              checked: showMeta,
              disabled: !metaIncluded,
              closeOnSelect: false,
              onSelect: () => toggleLine("meta"),
            },
          ]}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-1">
        {lines.total && <LegendDot color="var(--fg-primary)" label="Total" />}
        {lines.aswork && (
          <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
            <AwLogo variant="mark" height={13} className="text-(--aw-blue-500)" />
            Aswork
          </span>
        )}
        {showMeta && (
          <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
            <AwBrandLogo brand="meta" size={14} markOnly />
            Meta
          </span>
        )}
      </div>
      <ChartContainer
        config={config}
        className="aw-gasto-total-chart mt-2 aspect-auto h-72 w-full animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
      >
        <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
          {/* Degradê suave por linha (cor → transparente no rodapé), pra dar
              corpo às séries sem encher de tinta. Total bem sutil (é só o
              envelope); Aswork/Meta com a cor da série. */}
          <defs>
            <linearGradient id="fillGastoTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--fg-primary)" stopOpacity={0.1} />
              <stop offset="92%" stopColor="var(--fg-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillGastoAswork" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--aw-blue-500)" stopOpacity={0.24} />
              <stop offset="92%" stopColor="var(--aw-blue-500)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillGastoMeta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--aw-purple-400)" stopOpacity={0.2} />
              <stop offset="92%" stopColor="var(--aw-purple-400)" stopOpacity={0} />
            </linearGradient>
            {/* "Fio condutor" do hover: uma janela neutra e transparente nas
                pontas passa sobre a linha. A cor continua vindo da série base;
                o overlay só clareia a própria linha via mix-blend-mode. */}
            <linearGradient
              id="strokeGastoComet"
              x1="-0.72"
              y1="0"
              x2="0.28"
              y2="0"
              spreadMethod="pad"
            >
              <stop offset="0%" stopColor="var(--aw-white)" stopOpacity={0} />
              <stop offset="36%" stopColor="var(--aw-white)" stopOpacity={0} />
              <stop offset="47%" stopColor="var(--aw-white)" stopOpacity={0.18} />
              <stop offset="52%" stopColor="var(--aw-white)" stopOpacity={0.42} />
              <stop offset="57%" stopColor="var(--aw-white)" stopOpacity={0.18} />
              <stop offset="68%" stopColor="var(--aw-white)" stopOpacity={0} />
              <stop offset="100%" stopColor="var(--aw-white)" stopOpacity={0} />
              <animate
                attributeName="x1"
                values="-0.72;1"
                dur="6.8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="0.28;2"
                dur="6.8s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={{ stroke: "var(--border-subtle)" }}
            tickMargin={8}
            minTickGap={24}
            interval="preserveStartEnd"
            tick={{ fontSize: 11, fill: "var(--fg-tertiary)" }}
            height={28}
          />
          {/* Sem eixo Y de valores: os números já vivem no header ("Gasto no
              período · R$ X") e no tooltip. Tirá-lo estende a curva na
              horizontal e dá mais respiro ao gráfico. */}
          <ChartTooltip
            cursor={{ stroke: "var(--border-default)", strokeDasharray: "3 3" }}
            content={
              <ChartTooltipContent
                className={MONEY_TOOLTIP_CLASS}
                formatter={moneyTooltipFormatter}
              />
            }
          />
          {/* Total primeiro (fica atrás), depois Aswork/Meta pintam por cima. */}
          {lines.total && (
            <Area
              dataKey="total"
              type="monotone"
              stroke="var(--fg-primary)"
              strokeWidth={2.5}
              strokeOpacity={seriesOpacity(activeSeries, "total")}
              fill="url(#fillGastoTotal)"
              fillOpacity={fadeFill("total")}
              dot={false}
              activeDot={{ r: 4, onMouseEnter: enter("total"), onMouseLeave: leave }}
              isAnimationActive
              animationDuration={CHART_ANIMATION_DURATION}
              onMouseEnter={enter("total")}
              onMouseLeave={leave}
            />
          )}
          {lines.aswork && (
            <Area
              dataKey="aswork"
              type="monotone"
              stroke="var(--aw-blue-500)"
              strokeWidth={1.75}
              strokeOpacity={seriesOpacity(activeSeries, "aswork")}
              fill="url(#fillGastoAswork)"
              fillOpacity={fadeFill("aswork")}
              dot={false}
              activeDot={{ r: 4, onMouseEnter: enter("aswork"), onMouseLeave: leave }}
              isAnimationActive
              animationDuration={CHART_ANIMATION_DURATION}
              onMouseEnter={enter("aswork")}
              onMouseLeave={leave}
            />
          )}
          {showMeta && (
            <Area
              dataKey="meta"
              type="monotone"
              stroke="var(--aw-purple-400)"
              strokeWidth={1.75}
              strokeOpacity={seriesOpacity(activeSeries, "meta")}
              fill="url(#fillGastoMeta)"
              fillOpacity={fadeFill("meta")}
              dot={false}
              activeDot={{ r: 4, onMouseEnter: enter("meta"), onMouseLeave: leave }}
              isAnimationActive
              animationDuration={CHART_ANIMATION_DURATION}
              onMouseEnter={enter("meta")}
              onMouseLeave={leave}
            />
          )}
          {/* Overlay da linha em foco: a série base não muda de cor; esta Area
              renderiza a mesma curva por cima com um gradiente móvel, discreto
              e transparente nas pontas. */}
          {activeSeries && (
            <Area
              key={`overlay-${activeSeries}`}
              dataKey="__overlay"
              type="monotone"
              stroke="url(#strokeGastoComet)"
              strokeWidth={activeSeries === "total" ? 5 : 4}
              fill="none"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              legendType="none"
              tooltipType="none"
              className="aw-gasto-total-overlay pointer-events-none"
            />
          )}
        </AreaChart>
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
