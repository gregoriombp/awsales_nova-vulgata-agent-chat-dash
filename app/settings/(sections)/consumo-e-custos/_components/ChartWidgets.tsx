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
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  brl,
  CHARGED_TOTAL,
  PERIOD_DIFF,
  PERIOD_DIFF_REASON,
  reconScaleForCustom,
  reconScaleForPeriod,
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
          <BarChart data={chartData} margin={{ left: 12, right: 12, top: 8 }} barCategoryGap={totalDays <= 12 ? "24%" : "14%"}>
            {axes}
            {tooltip}
            {categories.map((cat, i) => (
              <Bar
                key={cat.id}
                dataKey={cat.id}
                stackId="spend"
                fill={`var(--color-${cat.id})`}
                opacity={seriesOpacity(activeSeries, cat.id)}
                maxBarSize={36}
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

/* ========================= Usado × na fatura ========================= */
//
// Card enxuto e direto: o que a Aswork MEDIU (usado) × o que ENTROU na fatura
// via Stripe — dois números grandes, em R$, lado a lado. A diferença é só
// timing do Stripe (resíduo do ciclo anterior entra; cauda deste sai). Sem
// gráfico, sem toggle, sem linha sem unidade. O Meta é nota de rodapé (cobrado
// direto pela Meta, fora desta fatura). Period-aware pelo controle de tempo.

const round2 = (n: number) => Math.round(n * 100) / 100;

export function UsadoCobradoWidget({
  dragHandle,
  resizeButton,
}: {
  dragHandle?: React.ReactNode;
  resizeButton?: React.ReactNode;
}) {
  const { selection, customDays } = useConsumo();

  const scale =
    selection.kind === "custom"
      ? reconScaleForCustom(customDays)
      : reconScaleForPeriod(selection.id);
  const isThisMonth =
    selection.kind === "preset" && selection.id === "this-month";

  const used = round2(USED_WC_TOTAL * scale);
  const invoice = round2(CHARGED_TOTAL * scale);
  const meta = round2(USED_META_TOTAL * scale);
  const gap = round2(PERIOD_DIFF * scale);
  const gapStr = `${gap >= 0 ? "+" : "−"}${brl(Math.abs(gap))}`;

  return (
    <WidgetShell
      title="Usado × na fatura"
      icon="compare_arrows"
      description="Aswork, neste período"
      dragHandle={dragHandle}
      resizeButton={resizeButton}
    >
      {/* dois números grandes, em R$, com a seta no meio */}
      <div className="flex items-end gap-x-5 pt-1">
        <div className="flex flex-col gap-1.5">
          <span className="body-xs text-(--fg-tertiary)">Você usou</span>
          <span className="text-(length:--h2-size) font-semibold leading-none tracking-heading-tighter tabular-nums text-(--aw-blue-500)">
            {brl(used)}
          </span>
        </div>
        <Icon
          name="arrow_forward"
          size={20}
          className="mb-1.5 shrink-0 text-(--fg-tertiary)"
        />
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
            Entrou na fatura
            <AwBrandLogo brand="stripe" markOnly size={14} />
          </span>
          <span className="text-(length:--h2-size) font-semibold leading-none tracking-heading-tighter tabular-nums text-(--aw-amber-600)">
            {brl(invoice)}
          </span>
        </div>
      </div>

      {/* a diferença e o porquê — só texto, sem caixa */}
      <p className="m-0 mt-5 body-sm text-(--fg-secondary)">
        <span className="font-semibold tabular-nums text-(--aw-amber-600)">
          {gapStr}
        </span>{" "}
        <span className="text-(--fg-tertiary)">
          · diferença de timing do Stripe
        </span>
      </p>
      <p className="m-0 mt-2 body-sm text-(--fg-secondary)">
        A fatura fechou um pouco acima do uso porque o Stripe lança em ciclos,
        como na fatura do cartão. Nada se perde e nada é cobrado duas vezes.
      </p>
      {isThisMonth && (
        <p className="m-0 mt-1 body-xs text-(--fg-tertiary)">
          {PERIOD_DIFF_REASON}
        </p>
      )}

      {/* rodapé Meta — divisória, sem caixa aninhada */}
      <div className="mt-5 flex items-center gap-2 border-t border-(--border-subtle) pt-3 body-xs text-(--fg-tertiary)">
        <AwBrandLogo brand="meta" markOnly size={12} className="shrink-0" />
        <span>
          O Meta cobra {brl(meta)} direto no seu cartão e não entra nesta fatura.
        </span>
      </div>
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
