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
  catProviderOf,
  PROVIDERS,
  PROVIDER_ORDER,
  providerBreakdown,
  providerOf,
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
  payerDaily: { aswork: number; meta: number }[];
  detailRows: ExplorerRow[];
  destino: {
    id: ProviderId;
    label: string;
    total: number;
    share: number;
    colorVar: string;
    active: boolean;
  }[];
  /** Fração do total visível sobre o total cheio — escala o "Uso do período". */
  scopeFactor: number;

  /* filtro de pagador (Aswork/Meta) — independente da lente */
  payers: Set<ProviderId>;
  togglePayer: (p: ProviderId) => void;
  metaIncluded: boolean;
};

const ConsumoContext = React.createContext<ConsumoContextValue | null>(null);

export function ConsumoProvider({ children }: { children: React.ReactNode }) {
  const [grouping, setGroupingState] = React.useState<SpendingGrouping>("service");
  const [selection, setSelection] = React.useState<PeriodSelection>({ kind: "preset", id: "this-month" });
  const [drill, setDrill] = React.useState<DrillNode[]>([]);
  const [search, setSearch] = React.useState("");
  // Pagador ativo (Aswork/Meta). Ambos ligados por padrão; nunca esvazia.
  const [payers, setPayers] = React.useState<Set<ProviderId>>(
    () => new Set<ProviderId>(["aswork", "meta"]),
  );
  const togglePayer = React.useCallback((p: ProviderId) => {
    setPayers((prev) => {
      const next = new Set(prev);
      if (next.has(p)) {
        if (next.size > 1) next.delete(p);
      } else {
        next.add(p);
      }
      return next;
    });
  }, []);
  const metaIncluded = payers.has("meta");

  // Trocar de lente zera o drill (os nós são por-lente).
  const setGrouping = React.useCallback((g: SpendingGrouping) => {
    setGroupingState(g);
    setDrill([]);
  }, []);

  const customDays = selection.kind === "custom" ? diffInDaysInclusive(selection.from, selection.to) : 0;

  const categories = SPENDING_CATEGORIES[grouping];
  const allCatIds = React.useMemo(() => categories.map((c) => c.id), [categories]);

  // Linhas escaladas do detalhamento (fonte autoritativa dos totais).
  const serviceRows = React.useMemo(
    () => scaledServiceRows(selection.kind === "preset" ? selection.id : null, customDays),
    [selection, customDays],
  );
  const agentRows = React.useMemo(
    () => scaledAgentRows(selection.kind === "preset" ? selection.id : null, customDays),
    [selection, customDays],
  );
  const byId = React.useMemo(() => new Map(serviceRows.map((r) => [r.id, r])), [serviceRows]);

  // Total por pagador do detalhamento — usado pra re-escalar o gráfico, pra que
  // a divisão Aswork/Meta do gráfico bata com a do detalhamento e "Por destino".
  const payerTotals = React.useMemo(() => {
    if (grouping === "agent") {
      const total = agentRows.reduce((s, r) => s + r.total, 0);
      return { aswork: Math.round(total * 100) / 100, meta: 0 };
    }
    let aswork = 0;
    let meta = 0;
    serviceRows.forEach((r) => {
      if (providerOf(r.id) === "meta") meta += r.total;
      else aswork += r.total;
    });
    return { aswork: Math.round(aswork * 100) / 100, meta: Math.round(meta * 100) / 100 };
  }, [grouping, serviceRows, agentRows]);

  // visibleIds = (drill ? categorias do nó : todas) ∩ pagadores ativos. Como os
  // widgets leem disso, desligar "Meta" tira as séries pagas ao Meta de tudo.
  const visibleIds = React.useMemo(() => {
    const base = drill.length ? drill[drill.length - 1].categoryIds : allCatIds;
    return new Set(base.filter((catId) => payers.has(catProviderOf(catId, grouping))));
  }, [drill, allCatIds, payers, grouping]);

  // Escopo do drill ignorando o pagador — alimenta "Por destino", que sempre
  // mostra Aswork e Meta pra você ligar/desligar.
  const drillScopeRowIds = React.useMemo(() => {
    if (grouping === "agent") return [] as string[];
    const base = drill.length ? drill[drill.length - 1].categoryIds : allCatIds;
    const set = new Set<string>();
    base.forEach((catId) => (SERVICE_CAT_TO_ROW_IDS[catId] ?? []).forEach((rid) => set.add(rid)));
    if (drill.length === 0) {
      set.add("linha");
      set.add("outros");
    }
    return [...set];
  }, [grouping, drill, allCatIds]);

  const daily = React.useMemo(() => {
    const raw =
      selection.kind === "custom"
        ? getCustomDailySpending(grouping, customDays)
        : getDailySpending(grouping, selection.id);
    // Re-escala as colunas: as categorias Aswork passam a somar payerTotals.aswork
    // e as do Meta payerTotals.meta. Assim o gráfico concilia com o detalhamento
    // e "Por destino", inclusive ao desligar um pagador.
    const colSum = categories.map((_, c) => raw.reduce((s, day) => s + (day[c] ?? 0), 0));
    let asworkChart = 0;
    let metaChart = 0;
    categories.forEach((cat, c) => {
      if (catProviderOf(cat.id, grouping) === "meta") metaChart += colSum[c];
      else asworkChart += colSum[c];
    });
    const fAsw = asworkChart > 0 ? payerTotals.aswork / asworkChart : 1;
    const fMeta = metaChart > 0 ? payerTotals.meta / metaChart : 1;
    return raw.map((day) =>
      day.map((v, c) => {
        const f = catProviderOf(categories[c].id, grouping) === "meta" ? fMeta : fAsw;
        return Math.round((v ?? 0) * f * 100) / 100;
      }),
    );
  }, [grouping, selection, customDays, categories, payerTotals]);

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
    // linha/outros (Aswork) entram no nível 0 quando Aswork está incluído.
    if (drill.length === 0 && payers.has("aswork")) {
      set.add("linha");
      set.add("outros");
    }
    return set;
  }, [grouping, visibleIds, drill.length, payers]);

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

  // Gasto diário quebrado por pagador (respeita drill + filtro de pagador) —
  // alimenta o card "Gasto total no período" (linhas Aswork / Meta / total).
  const payerDaily = React.useMemo(() => {
    return daily.map((day) => {
      let aswork = 0;
      let meta = 0;
      categories.forEach((cat, c) => {
        if (!visibleIds.has(cat.id)) return;
        const v = day[c] ?? 0;
        if (catProviderOf(cat.id, grouping) === "meta") meta += v;
        else aswork += v;
      });
      return { aswork: Math.round(aswork * 100) / 100, meta: Math.round(meta * 100) / 100 };
    });
  }, [daily, categories, visibleIds, grouping]);

  /* ---- detalhamento (drill-aware) ---- */

  const detailRows = React.useMemo(() => {
    const rows = buildRows(grouping, [...allowedRowIds], drill.length, serviceRows, agentRows);
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.label.toLowerCase().includes(q) || (r.sub ?? "").toLowerCase().includes(q));
  }, [grouping, allowedRowIds, drill.length, serviceRows, agentRows, search]);

  const destino = React.useMemo(() => {
    if (grouping === "agent") {
      return [
        {
          id: "aswork" as ProviderId,
          label: PROVIDERS.aswork.label,
          total: accumulated,
          share: 100,
          colorVar: PROVIDERS.aswork.colorVar,
          active: payers.has("aswork"),
        },
      ];
    }
    // Sempre lista Aswork e Meta (na ordem fixa) pra você poder ligar/desligar,
    // mesmo que um deles esteja zerado no escopo do drill.
    const bd = new Map(providerBreakdown(drillScopeRowIds, byId).map((d) => [d.id, d]));
    return PROVIDER_ORDER.map((id) => {
      const d = bd.get(id);
      return {
        id,
        label: PROVIDERS[id].label,
        total: d?.total ?? 0,
        share: d?.share ?? 0,
        colorVar: PROVIDERS[id].colorVar,
        active: payers.has(id),
      };
    });
  }, [grouping, drillScopeRowIds, byId, accumulated, payers]);

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
    if (!payers.has("meta")) {
      chips.push({ id: "payer", label: "Pagador: só Aswork", onRemove: () => togglePayer("meta") });
    } else if (!payers.has("aswork")) {
      chips.push({ id: "payer", label: "Pagador: só Meta", onRemove: () => togglePayer("aswork") });
    }
    if (search.trim()) chips.push({ id: "search", label: `Busca: "${search.trim()}"`, onRemove: () => setSearch("") });
    return chips;
  }, [payers, search, togglePayer]);

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
    payerDaily,
    detailRows,
    destino,
    scopeFactor,
    payers,
    togglePayer,
    metaIncluded,
  };

  return <ConsumoContext.Provider value={value}>{children}</ConsumoContext.Provider>;
}

export function useConsumo(): ConsumoContextValue {
  const ctx = React.useContext(ConsumoContext);
  if (!ctx) throw new Error("useConsumo precisa estar dentro de <ConsumoProvider>");
  return ctx;
}
