"use client";

import * as React from "react";
import {
  getCustomDailySpending,
  getDailySpending,
  getPeriodSummary,
  SPENDING_CATEGORIES,
  SPENDING_PERIODS,
  type PeriodSummary,
  type SpendingCategory,
  type SpendingGrouping,
  type SpendingPeriod,
} from "../../financeiro/_components/data";
import {
  buildRows,
  type ExplorerRow,
  PROVIDERS,
  providerBreakdown,
  type ProviderId,
  previousTotal,
  scaledAgentRows,
  scaledServiceRows,
  trendPct,
} from "./explorer-model";

/* ----------------------------------------------------------------------------
 * Estado do explorador "Explorar custos".
 *
 * Lente Serviço/Agente + período + drill + busca. O DRILL é um estreitamento de
 * `visibleIds` (categorias visíveis): todos os widgets antigos já leem disso, então
 * gráfico, composição, KPIs, Uso do período e Detalhamento re-escopam juntos.
 * Mantém os campos que ExportCsvMenu e PeriodPicker consomem.
 * ------------------------------------------------------------------------- */

export type PeriodSelection =
  | { kind: "preset"; id: SpendingPeriod }
  | { kind: "custom"; from: Date; to: Date };

export type DrillNode = { label: string; categoryIds: string[] };
export type Crumb = { label: string; onClick?: () => void };
export type FilterChip = { id: string; label: string; onRemove: () => void };
export type SeriesTotal = { cat: SpendingCategory; total: number };
export type ChartModel = {
  categories: SpendingCategory[];
  data: number[][];
  othersLabels: string[];
};

const MAX_CHART_SERIES = 5;

const SERVICE_CAT_TO_ROW_IDS: Record<string, string[]> = {
  "disparos-mkt": ["disp-mkt"],
  "disparos-util": ["disp-util"],
  mensagens: ["msgs"],
  leads: ["leads"],
  tokens: ["tok-k", "tok-b", "tok-s"],
};

function diffInDaysInclusive(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1);
}

export function formatRangeShort(from: Date, to: Date): string {
  const sameMonth =
    from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  const fromStr = from.toLocaleDateString("pt-BR", { day: "2-digit", month: sameMonth ? undefined : "short" });
  const toStr = to.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${fromStr} – ${toStr}`;
}

type ConsumoContextValue = {
  grouping: SpendingGrouping;
  setGrouping: (g: SpendingGrouping) => void;
  selection: PeriodSelection;
  setSelection: (s: PeriodSelection) => void;
  periodLabel: string;
  currencyLabel: string;

  drill: DrillNode[];
  drillInto: (row: ExplorerRow) => void;
  resetDrill: () => void;
  popTo: (index: number) => void;
  crumbs: Crumb[];

  search: string;
  setSearch: (q: string) => void;
  filterChips: FilterChip[];

  /* derivados compartilhados pelos widgets */
  categories: SpendingCategory[];
  accumulated: number;
  summary: PeriodSummary;
  previous: number;
  trend: number;
  chartPeriod: SpendingPeriod;
  customDays: number;
  allowedRowIds: Set<string>;
  visibleIds: Set<string>;
  chartModel: ChartModel;
  chartIds: Set<string>;
  seriesTotals: SeriesTotal[];
  detailRows: ExplorerRow[];
  destino: { id: ProviderId; label: string; total: number; share: number; colorVar: string }[];
  /** Fração do total visível sobre o total cheio — escala o "Uso do período". */
  scopeFactor: number;
};

const ConsumoContext = React.createContext<ConsumoContextValue | null>(null);

export function ConsumoProvider({ children }: { children: React.ReactNode }) {
  const [grouping, setGroupingState] = React.useState<SpendingGrouping>("service");
  const [selection, setSelection] = React.useState<PeriodSelection>({ kind: "preset", id: "this-month" });
  const [drill, setDrill] = React.useState<DrillNode[]>([]);
  const [search, setSearch] = React.useState("");

  // Trocar de lente zera o drill (os nós são por-lente).
  const setGrouping = React.useCallback((g: SpendingGrouping) => {
    setGroupingState(g);
    setDrill([]);
  }, []);

  const customDays = selection.kind === "custom" ? diffInDaysInclusive(selection.from, selection.to) : 0;

  const categories = SPENDING_CATEGORIES[grouping];
  const allCatIds = React.useMemo(() => categories.map((c) => c.id), [categories]);

  // visibleIds vem do drill: nível 0 = tudo; drilado = categorias do último nó.
  const visibleIds = React.useMemo(
    () => (drill.length ? new Set(drill[drill.length - 1].categoryIds) : new Set(allCatIds)),
    [drill, allCatIds],
  );
  const isAll = visibleIds.size === allCatIds.length;

  const daily = React.useMemo(() => {
    if (selection.kind === "custom") return getCustomDailySpending(grouping, customDays);
    return getDailySpending(grouping, selection.id);
  }, [grouping, selection, customDays]);

  const chartPeriod: SpendingPeriod = selection.kind === "preset" ? selection.id : "last-30";

  const fullAccumulated = React.useMemo(() => {
    let sum = 0;
    daily.forEach((day) => day.forEach((v) => (sum += v ?? 0)));
    return Math.round(sum * 100) / 100;
  }, [daily]);

  const accumulated = React.useMemo(() => {
    let sum = 0;
    daily.forEach((day) => {
      categories.forEach((cat, c) => {
        if (visibleIds.has(cat.id)) sum += day[c] ?? 0;
      });
    });
    return Math.round(sum * 100) / 100;
  }, [daily, categories, visibleIds]);

  const summary = React.useMemo(() => getPeriodSummary(accumulated), [accumulated]);
  const scopeFactor = fullAccumulated > 0 ? accumulated / fullAccumulated : 1;

  const periodLabel =
    selection.kind === "preset"
      ? SPENDING_PERIODS.find((p) => p.id === selection.id)?.label ?? "Período"
      : `Personalizado · ${formatRangeShort(selection.from, selection.to)}`;
  const currencyLabel = "BRL";

  const allowedRowIds = React.useMemo(() => {
    if (grouping === "agent") return new Set(visibleIds);
    const set = new Set<string>();
    visibleIds.forEach((catId) => (SERVICE_CAT_TO_ROW_IDS[catId] ?? []).forEach((rid) => set.add(rid)));
    if (isAll) {
      set.add("linha");
      set.add("outros");
    }
    return set;
  }, [grouping, visibleIds, isAll]);

  const seriesTotals = React.useMemo<SeriesTotal[]>(
    () =>
      categories
        .map((cat, idx) => ({
          cat,
          total: Math.round(daily.reduce((s, day) => s + (day[idx] ?? 0), 0) * 100) / 100,
        }))
        .filter((s) => visibleIds.has(s.cat.id))
        .sort((a, b) => b.total - a.total),
    [categories, daily, visibleIds],
  );

  const chartModel = React.useMemo<ChartModel>(() => {
    const visible = categories
      .map((cat, idx) => ({ cat, idx, total: daily.reduce((s, day) => s + (day[idx] ?? 0), 0) }))
      .filter((v) => visibleIds.has(v.cat.id));

    if (visible.length <= MAX_CHART_SERIES + 1) {
      return {
        categories: visible.map((v) => v.cat),
        data: daily.map((day) => visible.map((v) => day[v.idx] ?? 0)),
        othersLabels: [],
      };
    }
    const ranked = [...visible].sort((a, b) => b.total - a.total);
    const top = ranked.slice(0, MAX_CHART_SERIES);
    top.sort((a, b) => a.idx - b.idx);
    const rest = ranked.slice(MAX_CHART_SERIES);
    const othersCat: SpendingCategory = { id: "__others__", label: `Outros · ${rest.length}`, colorVar: "var(--aw-gray-200)" };
    return {
      categories: [...top.map((v) => v.cat), othersCat],
      data: daily.map((day) => [...top.map((v) => day[v.idx] ?? 0), rest.reduce((s, v) => s + (day[v.idx] ?? 0), 0)]),
      othersLabels: rest.map((v) => v.cat.label),
    };
  }, [daily, categories, visibleIds]);

  const chartIds = React.useMemo(() => new Set(chartModel.categories.map((c) => c.id)), [chartModel]);

  /* ---- detalhamento (drill-aware) ---- */

  const serviceRows = React.useMemo(
    () => scaledServiceRows(selection.kind === "preset" ? selection.id : null, customDays),
    [selection, customDays],
  );
  const agentRows = React.useMemo(
    () => scaledAgentRows(selection.kind === "preset" ? selection.id : null, customDays),
    [selection, customDays],
  );
  const byId = React.useMemo(() => new Map(serviceRows.map((r) => [r.id, r])), [serviceRows]);

  const detailRows = React.useMemo(() => {
    const rows = buildRows(grouping, [...allowedRowIds], drill.length, serviceRows, agentRows);
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.label.toLowerCase().includes(q) || (r.sub ?? "").toLowerCase().includes(q));
  }, [grouping, allowedRowIds, drill.length, serviceRows, agentRows, search]);

  const destino = React.useMemo(() => {
    if (grouping === "agent") {
      return [{ id: "aswork" as ProviderId, label: PROVIDERS.aswork.label, total: accumulated, share: 100, colorVar: PROVIDERS.aswork.colorVar }];
    }
    return providerBreakdown([...allowedRowIds], byId).map((d) => ({
      id: d.id,
      label: PROVIDERS[d.id].label,
      total: d.total,
      share: d.share,
      colorVar: PROVIDERS[d.id].colorVar,
    }));
  }, [grouping, allowedRowIds, byId, accumulated]);

  /* ---- período anterior + tendência ---- */

  const scopeKey = drill.length === 0 ? "all" : `${grouping}:${drill.map((d) => d.label).join(">")}`;
  const previous = React.useMemo(() => previousTotal(accumulated, scopeKey), [accumulated, scopeKey]);
  const trend = trendPct(accumulated, previous);

  /* ---- drill / breadcrumb ---- */

  const drillInto = React.useCallback((row: ExplorerRow) => {
    if (!row.drillable || row.categoryIds.length === 0) return;
    setDrill((prev) => [...prev, { label: row.label, categoryIds: row.categoryIds }]);
  }, []);
  const resetDrill = React.useCallback(() => setDrill([]), []);
  const popTo = React.useCallback((index: number) => setDrill((prev) => prev.slice(0, index + 1)), []);

  const crumbs = React.useMemo<Crumb[]>(() => {
    const root: Crumb = { label: "Todos os custos", onClick: drill.length ? resetDrill : undefined };
    const rest = drill.map((n, i) => ({ label: n.label, onClick: i < drill.length - 1 ? () => popTo(i) : undefined }));
    return [root, ...rest];
  }, [drill, resetDrill, popTo]);

  const filterChips = React.useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];
    if (search.trim()) chips.push({ id: "search", label: `Busca: "${search.trim()}"`, onRemove: () => setSearch("") });
    return chips;
  }, [search]);

  const value: ConsumoContextValue = {
    grouping,
    setGrouping,
    selection,
    setSelection,
    periodLabel,
    currencyLabel,
    drill,
    drillInto,
    resetDrill,
    popTo,
    crumbs,
    search,
    setSearch,
    filterChips,
    categories,
    accumulated,
    summary,
    previous,
    trend,
    chartPeriod,
    customDays,
    allowedRowIds,
    visibleIds,
    chartModel,
    chartIds,
    seriesTotals,
    detailRows,
    destino,
    scopeFactor,
  };

  return <ConsumoContext.Provider value={value}>{children}</ConsumoContext.Provider>;
}

export function useConsumo(): ConsumoContextValue {
  const ctx = React.useContext(ConsumoContext);
  if (!ctx) throw new Error("useConsumo precisa estar dentro de <ConsumoProvider>");
  return ctx;
}
