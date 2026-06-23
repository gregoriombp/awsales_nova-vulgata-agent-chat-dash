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

/* ----------------------------------------------------------------------------
 * Estado global do dashboard "Consumo e custos".
 *
 * Antes a lente (serviço/agente), o período e o filtro de itens viviam DENTRO
 * do VariableSpendingBlock e valiam só pra aquele bloco. Aqui o estado sobe pro
 * topo: a toolbar do canto superior direito controla, e TODOS os widgets
 * (cards de destaque, gráficos, tabela) leem do mesmo modelo derivado — então
 * tudo bate entre si quando o período ou o filtro muda.
 * ------------------------------------------------------------------------- */

export type PeriodSelection =
  | { kind: "preset"; id: SpendingPeriod }
  | { kind: "custom"; from: Date; to: Date };

function diffInDaysInclusive(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1);
}

export function formatRangeShort(from: Date, to: Date): string {
  const sameMonth =
    from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  const fromStr = from.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: sameMonth ? undefined : "short",
  });
  const toStr = to.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return `${fromStr} – ${toStr}`;
}

// Padrão GCP billing: o gráfico mostra no máximo as N maiores séries do período;
// o resto vira uma série agregada "Outros". A tabela continua listando todo
// mundo — o cap é só visual, pro gráfico não virar spaghetti.
const MAX_CHART_SERIES = 5;

// Mapeia cada categoria do gráfico de serviços para as linhas equivalentes da
// tabela. A linha "outros" não tem categoria correspondente e só aparece quando
// todas as categorias estão selecionadas.
const SERVICE_CAT_TO_ROW_IDS: Record<string, string[]> = {
  "disparos-mkt": ["disp-mkt"],
  "disparos-util": ["disp-util"],
  mensagens: ["msgs"],
  leads: ["leads"],
  tokens: ["tok-k", "tok-b", "tok-s"],
};

export type SeriesTotal = { cat: SpendingCategory; total: number };

export type ChartModel = {
  categories: SpendingCategory[];
  data: number[][];
  othersLabels: string[];
};

type ConsumoContextValue = {
  /* estado bruto */
  grouping: SpendingGrouping;
  setGrouping: (g: SpendingGrouping) => void;
  selection: PeriodSelection;
  setSelection: (s: PeriodSelection) => void;

  /* filtro de itens (serviços/agentes visíveis) */
  visibleIds: Set<string>;
  isAll: boolean;
  toggleFilter: (id: string) => void;
  selectAllFilter: () => void;
  filterUnit: string;
  filterLabel: string;
  filterAllLabel: string;

  /* derivados compartilhados pelos widgets */
  categories: SpendingCategory[];
  daily: number[][];
  accumulated: number;
  summary: PeriodSummary;
  periodLabel: string;
  chartPeriod: SpendingPeriod;
  customDays: number;
  allowedRowIds: Set<string>;
  chartModel: ChartModel;
  chartIds: Set<string>;
  seriesTotals: SeriesTotal[];
};

const ConsumoContext = React.createContext<ConsumoContextValue | null>(null);

export function ConsumoProvider({ children }: { children: React.ReactNode }) {
  const [grouping, setGrouping] = React.useState<SpendingGrouping>("service");
  const [selection, setSelection] = React.useState<PeriodSelection>({
    kind: "preset",
    id: "this-month",
  });
  const [filter, setFilter] = React.useState<
    Record<SpendingGrouping, Set<string>>
  >(() => ({
    service: new Set(SPENDING_CATEGORIES.service.map((c) => c.id)),
    agent: new Set(SPENDING_CATEGORIES.agent.map((c) => c.id)),
  }));

  const customDays =
    selection.kind === "custom"
      ? diffInDaysInclusive(selection.from, selection.to)
      : 0;

  const categories = SPENDING_CATEGORIES[grouping];
  const visibleIds = filter[grouping];
  const allIds = React.useMemo(() => categories.map((c) => c.id), [categories]);
  const isAll = visibleIds.size === allIds.length;

  const daily = React.useMemo(() => {
    if (selection.kind === "custom") {
      return getCustomDailySpending(grouping, customDays);
    }
    return getDailySpending(grouping, selection.id);
  }, [grouping, selection, customDays]);

  const chartPeriod: SpendingPeriod =
    selection.kind === "preset" ? selection.id : "last-30";

  const accumulated = React.useMemo(() => {
    let sum = 0;
    daily.forEach((day) => {
      categories.forEach((cat, c) => {
        if (visibleIds.has(cat.id)) sum += day[c] ?? 0;
      });
    });
    return Math.round(sum * 100) / 100;
  }, [daily, categories, visibleIds]);

  const summary = React.useMemo(
    () => getPeriodSummary(accumulated),
    [accumulated],
  );

  const periodLabel =
    selection.kind === "preset"
      ? SPENDING_PERIODS.find((p) => p.id === selection.id)?.label ?? "Período"
      : `Personalizado · ${formatRangeShort(selection.from, selection.to)}`;

  const toggleFilter = React.useCallback(
    (id: string) => {
      setFilter((f) => {
        const next = new Set(f[grouping]);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { ...f, [grouping]: next };
      });
    },
    [grouping],
  );

  const selectAllFilter = React.useCallback(() => {
    setFilter((f) => ({ ...f, [grouping]: new Set(allIds) }));
  }, [grouping, allIds]);

  const filterUnit = grouping === "service" ? "serviços" : "agentes";
  const filterAllLabel = `Todos os ${filterUnit}`;
  let filterLabel: string;
  if (isAll) {
    filterLabel = filterAllLabel;
  } else if (visibleIds.size === 0) {
    filterLabel = `Nenhum dos ${filterUnit}`;
  } else if (visibleIds.size === 1) {
    const id = Array.from(visibleIds)[0];
    filterLabel = categories.find((c) => c.id === id)?.label ?? filterAllLabel;
  } else {
    filterLabel = `${visibleIds.size} ${filterUnit}`;
  }

  const allowedRowIds = React.useMemo(() => {
    if (grouping === "agent") {
      return new Set(visibleIds);
    }
    const set = new Set<string>();
    visibleIds.forEach((catId) => {
      (SERVICE_CAT_TO_ROW_IDS[catId] ?? []).forEach((rid) => set.add(rid));
    });
    if (isAll) {
      set.add("linha");
      set.add("outros");
    }
    return set;
  }, [grouping, visibleIds, isAll]);

  // Totais por série visível no período (sem o cap top-N) — alimenta a
  // composição (rosca/barras) e mantém o total batendo com o acumulado.
  const seriesTotals = React.useMemo<SeriesTotal[]>(() => {
    return categories
      .map((cat, idx) => ({
        cat,
        total:
          Math.round(daily.reduce((s, day) => s + (day[idx] ?? 0), 0) * 100) /
          100,
      }))
      .filter((s) => visibleIds.has(s.cat.id))
      .sort((a, b) => b.total - a.total);
  }, [categories, daily, visibleIds]);

  // Top-N + "Outros" (padrão GCP) pro gráfico de consumo por dia.
  const chartModel = React.useMemo<ChartModel>(() => {
    const visible = categories
      .map((cat, idx) => ({
        cat,
        idx,
        total: daily.reduce((s, day) => s + (day[idx] ?? 0), 0),
      }))
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
    const othersCat: SpendingCategory = {
      id: "__others__",
      label: `Outros · ${rest.length}`,
      colorVar: "var(--aw-gray-200)",
    };
    return {
      categories: [...top.map((v) => v.cat), othersCat],
      data: daily.map((day) => [
        ...top.map((v) => day[v.idx] ?? 0),
        rest.reduce((s, v) => s + (day[v.idx] ?? 0), 0),
      ]),
      othersLabels: rest.map((v) => v.cat.label),
    };
  }, [daily, categories, visibleIds]);

  const chartIds = React.useMemo(
    () => new Set(chartModel.categories.map((c) => c.id)),
    [chartModel],
  );

  const value: ConsumoContextValue = {
    grouping,
    setGrouping,
    selection,
    setSelection,
    visibleIds,
    isAll,
    toggleFilter,
    selectAllFilter,
    filterUnit,
    filterLabel,
    filterAllLabel,
    categories,
    daily,
    accumulated,
    summary,
    periodLabel,
    chartPeriod,
    customDays,
    allowedRowIds,
    chartModel,
    chartIds,
    seriesTotals,
  };

  return (
    <ConsumoContext.Provider value={value}>{children}</ConsumoContext.Provider>
  );
}

export function useConsumo(): ConsumoContextValue {
  const ctx = React.useContext(ConsumoContext);
  if (!ctx) {
    throw new Error("useConsumo precisa estar dentro de <ConsumoProvider>");
  }
  return ctx;
}
