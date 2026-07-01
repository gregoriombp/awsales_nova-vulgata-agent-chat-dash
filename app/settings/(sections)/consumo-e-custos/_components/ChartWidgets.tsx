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
  YAxis,
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
import { catProviderOf, categoryPayerSplit, PROVIDERS } from "./explorer-model";
import { SegmentedToggle } from "./controls";
import { InfoTip } from "./KpiCards";
import { bucketRows, categoryMatchesConfig, othersOnTop, widgetConfigLabel, type ChartGranularity } from "./chart-utils";
import { GranularityToggle } from "./GranularityToggle";
import { LimitEventMarkers } from "../../financeiro/_components/LimitEventMarkers";
import { selectionLimitEvents } from "../../financeiro/_components/data";
import { WidgetShell, WidgetMenu, type WidgetChrome } from "./WidgetBoard";

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
  /** Início de um range CUSTOM (ex.: o ciclo na aba Por ciclos) — com ele, os
   *  rótulos seguem o range real em vez de ancorar pra trás do "hoje". */
  customFrom?: Date | null,
): string {
  if (customFrom) {
    const d = new Date(customFrom);
    d.setDate(d.getDate() + index);
    return ddmm(d);
  }
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
// Sem azul nem roxo aqui de propósito: esses dois ficam reservados pro
// significado de PAGADOR (azul = Aswork, roxo = Meta) no resto da tela, então
// usá-los pra agente confundiria as duas leituras.
const AGENT_CHART_PALETTE = [
  "var(--aw-amber-500)",
  "var(--aw-emerald-500)",
  "var(--aw-teal-500)",
  "var(--aw-pink-500)",
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
  menu,
}: WidgetChrome) {
  const { chartModel, chartIds, chartPeriod, grouping, accumulated, metaIncluded, surface, reportKind, selection, widgetConfigs } =
    useConsumo();
  const instanceCfg = widgetConfigs["consumo"];
  // Nota "bate com o Analytics" só vale na visão por DATA DE USO — nunca no
  // recorte de fatura/ciclo, onde os valores seguem a data de pagamento
  // (pedido do Greg: cmt-4571977b).
  const isUsageDateView = surface !== "cycle" && reportKind !== "invoice";
  const [viz, setViz] = React.useState<ConsumoViz>("bar");
  // Controle temporal LOCAL (cmt-60c4ab93): agrega este card por dia/semana/mês
  // sem mexer no período geral da topbar.
  const [granularity, setGranularity] = React.useState<ChartGranularity>("day");
  const [activeSeries, setActiveSeries] = React.useState<string | null>(null);

  const categories = React.useMemo(() => {
    const filtered = chartModel.categories.filter(
      (c) => chartIds.has(c.id) && categoryMatchesConfig(c.id, grouping, instanceCfg),
    );
    const totals = filtered.map((c) => {
      const idx = chartModel.categories.indexOf(c);
      return {
        id: c.id,
        total: chartModel.data.reduce((s, d) => s + (d[idx] ?? 0), 0),
      };
    });
    const colorByRank = chartColorByRank(totals, grouping);
    const totalById = new Map(totals.map((t) => [t.id, t.total]));
    // "Outros" SEMPRE no topo da pilha (regra da casa, cmt-750ce724) — a
    // ordenação vem do helper único (othersOnTop), o mesmo de todo stacked.
    return othersOnTop(
      filtered.map((c) => ({
        ...c,
        colorVar: colorByRank.get(c.id) ?? c.colorVar,
      })),
      (c) => totalById.get(c.id) ?? 0,
    );
  }, [chartModel, chartIds, grouping, instanceCfg]);
  const config = React.useMemo(() => buildConfig(categories), [categories]);
  const totalDays = chartModel.data.length;

  const chartData = React.useMemo(() => {
    const daily = chartModel.data.map((day, i) => {
      const row: Record<string, number | string> = {
        day: dayLabel(i, totalDays, chartPeriod, selection.kind === "custom" ? selection.from : null),
      };
      chartModel.categories.forEach((cat, c) => {
        row[cat.id] = day[c] ?? 0;
      });
      return row;
    });
    return bucketRows(daily, chartModel.categories.map((c) => c.id), granularity);
  }, [chartModel, chartPeriod, totalDays, selection, granularity]);

  // "Outros" é o resto agregado, ampliado só pra dominar a leitura da pilha — não
  // é um valor real. Quando ele está na pilha, o total do dia (soma das barras
  // exibidas) deixa de bater com o número honesto do topo, então não mostramos um
  // total fabricado no tooltip, e a fatia "Outros" aparece como proporção.
  const hasOthers = chartModel.othersLabels.length > 0;

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
                  {!hasOthers && (
                    <span className="body-xs font-semibold tabular-nums text-(--fg-primary)">
                      {brl(total)}
                    </span>
                  )}
                </div>
                <span className="text-3xs text-(--fg-tertiary)">
                  {hasOthers
                    ? "“Outros” aparece ampliado só pra leitura"
                    : metaIncluded
                      ? "Total · Aswork + Meta"
                      : "Só valores pagos à Aswork"}
                </span>
              </div>
            );
          }}
          formatter={(value, name) => {
            const cat = categories.find((c) => c.id === name);
            const isOthers = name === "__others__";
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
                {isOthers ? (
                  <span className="body-xs text-(--fg-tertiary)">
                    proporção ilustrativa
                  </span>
                ) : (
                  <span className="body-xs font-medium tabular-nums text-(--fg-primary)">
                    {brl(Number(value))}
                  </span>
                )}
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
      title={
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span className="truncate">Uso por dia</span>
          <InfoTip text="Este gráfico segue a data de uso — o dia em que o consumo aconteceu, não o dia da cobrança ou do pagamento." />
        </span>
      }
      icon="bar_chart"
      description={`${grouping === "service" ? "Por serviço" : "Por agente"} · acumulado ${brl(accumulated)}${widgetConfigLabel(instanceCfg) ? ` · recorte: ${widgetConfigLabel(instanceCfg)}` : ""}${isUsageDateView ? " · o mesmo valor do Analytics" : ""}`}
      dragHandle={dragHandle}
      menu={menu}
      actions={
        <span className="flex items-center gap-1.5">
          <GranularityToggle value={granularity} onChange={setGranularity} />
          <VizToggle
            value={viz}
            onChange={setViz}
            options={[
              { value: "bar", icon: "bar_chart", label: "Barras" },
              { value: "area", icon: "area_chart", label: "Área" },
              { value: "line", icon: "show_chart", label: "Linha" },
            ]}
          />
        </span>
      }
    >
      <ChartLegend categories={categories} grouping={grouping} othersLabels={chartModel.othersLabels} />
      <div className="relative">
        {/* "Limite restaurado" — mesma história e componente do Financeiro
            (cmt-fa87fa50); só na agregação por dia, onde a posição bate. */}
        {granularity === "day" && (
          <LimitEventMarkers events={selectionLimitEvents(selection)} />
        )}
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
      </div>
    </WidgetShell>
  );
}

/* ============================ Composição ============================ */

type ComposicaoViz = "donut" | "bars";

export function ComposicaoWidget({
  dragHandle,
  menu,
}: WidgetChrome) {
  const { seriesTotals, grouping, accumulated, widgetConfigs } = useConsumo();
  const instanceCfg = widgetConfigs["composicao"];
  const scopedTotals = React.useMemo(
    () => seriesTotals.filter((s) => categoryMatchesConfig(s.cat.id, grouping, instanceCfg)),
    [seriesTotals, grouping, instanceCfg],
  );
  const [viz, setViz] = React.useState<ComposicaoViz>("donut");
  const [activeSlice, setActiveSlice] = React.useState<string | null>(null);

  // Mesma rampa monocromática do "Consumo por dia": maior fatia = azul mais
  // escuro, clareando conforme a participação cai.
  const colored = React.useMemo(() => {
    const colorByRank = chartColorByRank(
      scopedTotals.map((s) => ({ id: s.cat.id, total: s.total })),
      grouping,
    );
    return scopedTotals.map((s) => ({
      ...s,
      cat: { ...s.cat, colorVar: colorByRank.get(s.cat.id) ?? s.cat.colorVar },
    }));
  }, [scopedTotals, grouping]);

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

  // Anel interno do donut: dentro de cada fatia de disparo (marketing/utilidade),
  // o valor se divide entre o que é pago à Aswork e o que é repassado ao Meta.
  // Espelhamos a MESMA ordem/ângulo das fatias externas, mas pintando a parte
  // Aswork (azul) e a parte Meta (roxo) — só na lente Serviço, e só quando há
  // alguma fatia com split. Assim a divisão fica visível DENTRO da fatia.
  const splitData = React.useMemo(() => {
    if (grouping !== "service") return [];
    const rows = colored.flatMap((s) => {
      const split = categoryPayerSplit(s.cat.id, s.total);
      const hasSplit = split.aswork > 0 && split.meta > 0;
      if (!hasSplit) {
        // Sem divisão: mantém a fatia inteira na cor do próprio pagador da fatia.
        return [{ id: `${s.cat.id}-solo`, name: s.cat.label, value: s.total, fill: s.cat.colorVar }];
      }
      return [
        {
          id: `${s.cat.id}-aswork`,
          name: `${s.cat.label} · Aswork`,
          value: split.aswork,
          fill: PROVIDERS.aswork.colorVar,
        },
        {
          id: `${s.cat.id}-meta`,
          name: `${s.cat.label} · Meta`,
          value: split.meta,
          fill: PROVIDERS.meta.colorVar,
        },
      ];
    });
    const anyReal = colored.some((s) => {
      const sp = categoryPayerSplit(s.cat.id, s.total);
      return sp.aswork > 0 && sp.meta > 0;
    });
    return anyReal ? rows : [];
  }, [colored, grouping]);

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
      menu={menu}
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
          <div className="flex shrink-0 flex-col items-center gap-2.5">
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
              {/* Anel interno: divisão pagador (Aswork × Meta) dentro de cada
                  fatia de disparo. Tracinho discreto pra não competir com o anel
                  externo, que continua sendo a leitura principal por serviço. */}
              {splitData.length > 0 && (
                <Pie
                  data={splitData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={55}
                  paddingAngle={0.5}
                  strokeWidth={0}
                  isAnimationActive
                  animationDuration={CHART_ANIMATION_DURATION}
                >
                  {splitData.map((d) => (
                    <Cell key={d.id} fill={d.fill} fillOpacity={0.85} />
                  ))}
                </Pie>
              )}
            </PieChart>
          </ChartContainer>
          {/* Legenda do anel INTERNO: divisão pagador (Aswork × Meta) dentro de
              cada fatia. Só quando há split — espelha a legenda da visão em barras. */}
          {splitData.length > 0 && (
            <div className="flex items-center gap-4 body-xs text-(--fg-tertiary)">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: PROVIDERS.aswork.colorVar }}
                />
                Aswork
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: PROVIDERS.meta.colorVar }}
                />
                Meta
              </span>
            </div>
          )}
          </div>
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
                  <AgentSwatch avatar={s.cat.avatar} label={s.cat.label} color={s.cat.colorVar} />
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
  // Mesma leitura do anel interno do donut: disparos são compartilhados entre
  // Aswork (taxa de plataforma) e Meta (repasse), então a barra também mostra
  // a divisão. Só na lente Serviço e quando há de fato split.
  const anySplit =
    grouping === "service" &&
    totals.some((s) => {
      const sp = categoryPayerSplit(s.cat.id, s.total);
      return sp.aswork > 0 && sp.meta > 0;
    });
  return (
    <div className="flex flex-col gap-3">
      {anySplit && (
        <div className="flex items-center gap-4 body-xs text-(--fg-tertiary)">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: PROVIDERS.aswork.colorVar }}
            />
            Aswork
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: PROVIDERS.meta.colorVar }}
            />
            Meta
          </span>
        </div>
      )}
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {totals.map((s) => {
          const pct = total > 0 ? (s.total / total) * 100 : 0;
          const split =
            grouping === "service"
              ? categoryPayerSplit(s.cat.id, s.total)
              : { aswork: 0, meta: 0 };
          const hasSplit = split.aswork > 0 && split.meta > 0;
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
                  <AgentSwatch avatar={s.cat.avatar} label={s.cat.label} color={s.cat.colorVar} />
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
                  className="flex h-full overflow-hidden rounded-full"
                  style={{ width: `${(s.total / max) * 100}%` }}
                  title={
                    hasSplit
                      ? `Aswork ${brl(split.aswork)} · Meta ${brl(split.meta)}`
                      : undefined
                  }
                >
                  {hasSplit ? (
                    <>
                      <span
                        className="h-full"
                        style={{
                          width: `${(split.aswork / s.total) * 100}%`,
                          background: PROVIDERS.aswork.colorVar,
                        }}
                      />
                      <span
                        className="h-full"
                        style={{
                          width: `${(split.meta / s.total) * 100}%`,
                          background: PROVIDERS.meta.colorVar,
                        }}
                      />
                    </>
                  ) : (
                    <span
                      className="h-full w-full"
                      style={{ background: s.cat.colorVar }}
                    />
                  )}
                </div>
              </div>
              <span className="shrink-0 tabular-nums text-(--fg-secondary)">
                {brl(s.total)}{" "}
                <span className="text-(--fg-tertiary)">· {pct.toFixed(0)}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ===================== Uso do período × provedor ===================== */

/** Série usado×cobrado, escalada pro período + drill (scopeFactor). Respeita o
 *  filtro de pagador: com Meta desligado, a parte do Meta zera. */
function useUsadoSeries(granularity: ChartGranularity = "day") {
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
  const data = React.useMemo(() => {
    const daily = series.map((d, i) => ({
      day: dayLabel(i, bars, chartPeriod, selection.kind === "custom" ? selection.from : null),
      wc: d.wc,
      meta: metaIncluded ? d.meta : 0,
      charged: d.charged,
    }));
    return bucketRows(daily, ["wc", "meta", "charged"], granularity);
  }, [series, bars, chartPeriod, metaIncluded, selection, granularity]);
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
  menu,
}: WidgetChrome) {
  const [granularity, setGranularity] = React.useState<ChartGranularity>("day");
  const { data, wcTotal, metaTotal, metaIncluded } = useUsadoSeries(granularity);
  const [activeSeries, setActiveSeries] = React.useState<string | null>(null);

  // Aswork sólido (azul) + Meta roxo tracejado (só aqui é tracejado, e é aprox.).
  const usoConfig: ChartConfig = {
    wc: { label: "Custo Aswork", color: "var(--aw-blue-500)" },
    meta: { label: "Custo Meta", color: "var(--aw-purple-500)" },
  };

  return (
    <WidgetShell
      title="Custo Aswork × Meta por dia"
      icon="sync_alt"
      description={
        metaIncluded
          ? `Custo Aswork ${brl(wcTotal)} · Meta aprox. ${brl(metaTotal)}`
          : `Custo Aswork ${brl(wcTotal)}`
      }
      dragHandle={dragHandle}
      menu={menu}
      actions={<GranularityToggle value={granularity} onChange={setGranularity} />}
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
        <BarChart
          data={data}
          margin={{ left: 12, right: 12, top: 8 }}
          barCategoryGap="28%"
          barGap={2}
        >
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
          <XAxis
            dataKey="day"
            tickLine={{ stroke: "var(--border-default)" }}
            axisLine={{ stroke: "var(--border-subtle)" }}
            tickMargin={8}
            interval={Math.max(0, Math.ceil(data.length / 8) - 1)}
            height={34}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tickCount={4}
            tickMargin={6}
            tickFormatter={(v: number) => `R$ ${Math.round(v)}`}
            className="body-xs"
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
          {/* Aswork + Meta empilham na MESMA barra (vertical), não lado a lado
              (pedido do Greg): é um custo único do dia repartido entre os dois.
              Aswork na base, Meta por cima; só o topo da pilha é arredondado. */}
          <Bar
            dataKey="wc"
            stackId="uso"
            fill="var(--aw-blue-500)"
            opacity={seriesOpacity(activeSeries, "wc")}
            maxBarSize={36}
            radius={metaIncluded ? [0, 0, 0, 0] : [3, 3, 0, 0]}
            isAnimationActive
            animationDuration={CHART_ANIMATION_DURATION}
            onMouseEnter={() => setActiveSeries("wc")}
            onMouseLeave={() => setActiveSeries(null)}
          />
          {metaIncluded && (
            <Bar
              dataKey="meta"
              stackId="uso"
              fill="var(--aw-purple-500)"
              opacity={seriesOpacity(activeSeries, "meta")}
              maxBarSize={36}
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
        A faixa roxa (Meta) é aproximada e cobrada direto pela plataforma do Meta no seu cartão — não pela Aswork.
      </p>
    </WidgetShell>
  );
}

/* ============== Valor atribuído ao provedor (card próprio) ============== */

export function ProvedorWidget({
  dragHandle,
  menu,
}: WidgetChrome) {
  const { data, chargedTotal } = useUsadoSeries();
  const provedorConfig: ChartConfig = {
    charged: { label: "Atribuído ao provedor", color: "var(--aw-amber-400)" },
  };

  return (
    <WidgetShell
      title="Valor atribuído ao provedor"
      icon="account_balance"
      description={`Entrou na fatura no período · ${brl(chargedTotal)}`}
      dragHandle={dragHandle}
      menu={menu}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-1">
        <LegendDot color="var(--aw-amber-400)" label="Atribuído ao provedor" />
      </div>
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
        por atraso entre o custo cair no nosso sistema e ser contabilizado no
        provedor.
      </p>
    </WidgetShell>
  );
}

/* =============== Gasto total no período (card fixo) =============== */

type GastoLineKey = "total" | "aswork" | "meta";

export function GastoTotalCard({ onHide }: { onHide?: () => void } = {}) {
  const { payerDaily, chartPeriod, metaIncluded, accumulated, selection } = useConsumo();
  const [granularity, setGranularity] = React.useState<ChartGranularity>("day");
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
    const daily = payerDaily.map((d, i) => ({
      day: dayLabel(i, payerDaily.length, chartPeriod, selection.kind === "custom" ? selection.from : null),
      aswork: d.aswork,
      meta: d.meta,
      total: Math.round((d.aswork + d.meta) * 100) / 100,
    }));
    const base = bucketRows(daily, ["aswork", "meta", "total"], granularity);
    if (!activeSeries) return base;
    const key = activeSeries as "total" | "aswork" | "meta";
    return base.map((d) => ({ ...d, __overlay: d[key] }));
  }, [payerDaily, chartPeriod, selection, granularity, activeSeries]);

  const config: ChartConfig = {
    total: { label: "Total", color: "var(--fg-primary)" },
    aswork: { label: "Aswork", color: "var(--aw-blue-500)" },
    meta: { label: "Meta", color: "var(--aw-purple-500)" },
  };

  const fadeFill = (key: string) =>
    activeSeries && activeSeries !== key ? 0.18 : 1;
  const enter = (key: string) => () => setActiveSeries(key);
  const leave = () => setActiveSeries(null);

  return (
    <WidgetShell
      title="Evolução do uso"
      icon="show_chart"
      description={`Acumulado · ${brl(accumulated)}`}
      menu={
        onHide ? (
          <WidgetMenu widgetLabel="Evolução do uso" onRemove={onHide} />
        ) : undefined
      }
      actions={
        <>
        <GranularityToggle value={granularity} onChange={setGranularity} />
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
              label: metaIncluded ? "Meta" : "Meta · ative no filtro de destino",
              checked: showMeta,
              disabled: !metaIncluded,
              closeOnSelect: false,
              onSelect: () => toggleLine("meta"),
            },
          ]}
        />
        </>
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
              <stop offset="5%" stopColor="var(--aw-purple-500)" stopOpacity={0.2} />
              <stop offset="92%" stopColor="var(--aw-purple-500)" stopOpacity={0} />
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
              stroke="var(--aw-purple-500)"
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

// Avatar do agente com uma "bolotinha" de cor no canto inferior-direito (estilo
// indicador de online/offline), representando a cor da série dele no gráfico —
// sem isso, a legenda de agente perde a ligação entre o rosto e a cor da barra.
function AgentSwatch({
  avatar,
  label,
  color,
}: {
  avatar: string;
  label: string;
  color: string;
}) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <AwAvatar size="sm" src={avatar} alt={label} />
      <span
        aria-hidden="true"
        className="absolute -bottom-0.5 -right-0.5 block h-2 w-2 rounded-full ring-2 ring-(--bg-raised)"
        style={{ background: color }}
      />
    </span>
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
              <AgentSwatch avatar={c.avatar} label={c.label} color={c.colorVar} />
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
