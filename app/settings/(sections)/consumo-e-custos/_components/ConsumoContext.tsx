"use client";

import * as React from "react";
import {
  getCustomDailySpending,
  getDailySpending,
  getPeriodSummary,
  SPENDING_CATEGORIES,
  SPENDING_PERIODS,
  type PeriodSummary,
  type ServiceBreakdownRow,
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
import { useBoardOrder, useBoardSpans, type Span } from "./WidgetBoard";
import {
  BOARD_DEFAULT_ORDER,
  BOARD_DEFAULT_SPANS,
  CURRENT_ORG,
  CURRENT_USER,
  DEFAULT_REPORTS,
  reportTypeDef,
  snapshotForType,
  type ExplorerSnapshot,
  type ReportKind,
  type ReportType,
  type SavedReport,
  type StoredSelection,
} from "./report-types";

// Re-exporta a taxonomia pra quem já importava daqui (SavedReports, etc.).
export type { ExplorerSnapshot, ReportKind, ReportType, SavedReport } from "./report-types";
export { BOARD_DEFAULT_ORDER, BOARD_DEFAULT_SPANS };

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

export type DrillNode = { label: string; categoryIds: string[]; kind?: "agent-compare" };
/** Agente comparado (X-Ray) — pra a pill de "visão filtrada" na topbar. */
export type ComparedAgent = { id: string; label: string; avatar?: string };
export type Crumb = { label: string; onClick?: () => void };
export type FilterChip = { id: string; label: string; onRemove: () => void };
export type SeriesTotal = { cat: SpendingCategory; total: number };
export type ChartModel = {
  categories: SpendingCategory[];
  data: number[][];
  othersLabels: string[];
};

// Quantas séries destacar antes de agregar o resto em "Outros". Na lente Serviço
// são poucas categorias (5). Na lente Agente o Greg quer destacar os top agentes
// (≈10) e "Outros" virar só o RESTANTE (barra menor) — limitado a 9 pra cada um
// ter matiz própria na paleta do gráfico.
const MAX_CHART_SERIES = 5;
const MAX_AGENT_CHART_SERIES = 9;

/* ---------- board (layout dos widgets) — chaves de persistência ---------- */
/* Os defaults (BOARD_DEFAULT_ORDER/SPANS) e os tipos do snapshot vivem em
 * ./report-types (importados/reexportados acima) pra a taxonomia de relatórios
 * ficar num lugar só, sem ciclo de import. */

const BOARD_ORDER_KEY = "consumo-dash-order-v3";
const BOARD_SPANS_KEY = "consumo-dash-spans-v3";

/* ---------- relatórios salvos ---------- */

// v2: o relatório ganhou proprietário (com foto) e organização (com logo). Bump
// da chave pra descartar dados antigos (sem esses campos) e re-semear no formato
// novo — a feature é recente, então é seguro.
const REPORTS_KEY = "aw:consumo-explorer:reports:v2";
// Rascunho pendente (entrou por um card, ainda não salvou). Persistido pra
// sobreviver à navegação inicial→explorador (o shell de Configurações remonta o
// provider) e a um refresh — sem isso o tipo/recorte do rascunho se perderia.
const DRAFT_KEY = "aw:consumo-explorer:draft:v2";

function serializeSelection(s: PeriodSelection): StoredSelection {
  return s.kind === "custom"
    ? { kind: "custom", from: s.from.toISOString(), to: s.to.toISOString() }
    : { kind: "preset", id: s.id };
}

function reviveSelection(s: StoredSelection): PeriodSelection {
  return s.kind === "custom"
    ? { kind: "custom", from: new Date(s.from), to: new Date(s.to) }
    : { kind: "preset", id: s.id };
}

function newReportId(): string {
  // App-side (não é workflow): Date/Math disponíveis.
  return `rpt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const SERVICE_CAT_TO_ROW_IDS: Record<string, string[]> = {
  "disparos-mkt": ["disp-mkt"],
  "disparos-util": ["disp-util"],
  mensagens: ["msgs"],
  leads: ["leads"],
  tokens: ["tok-k", "tok-b", "tok-s"],
};

// Drill em Tokens (e qualquer categoria do gráfico que agregue várias linhas do
// detalhamento) explode em UMA série por linha — Skills/Brain/Knowledge — pra o
// gráfico espelhar a tabela em vez de uma série única "Tokens". Rampa de azuis
// (tons da Aswork) como cor-base; os widgets re-tingem por ranking, então isto é
// só o fallback de cor.
const LEAF_SERIES_RAMP = [
  "var(--aw-blue-600)",
  "var(--aw-blue-500)",
  "var(--aw-blue-400)",
  "var(--aw-blue-300)",
];

function leafSeriesCategory(
  id: string,
  index: number,
  byId: Map<string, ServiceBreakdownRow>,
): SpendingCategory {
  // "Tokens · Skills" → "Skills": o breadcrumb já diz "Tokens", então a série
  // fica com o nome curto da folha (legenda mais limpa).
  const label = (byId.get(id)?.label ?? id).replace(/^Tokens\s*·\s*/i, "");
  return { id, label, colorVar: LEAF_SERIES_RAMP[index % LEAF_SERIES_RAMP.length] };
}

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
  /** X-Ray: compara N agentes reusando o drill (re-escopa o board pro conjunto). */
  compareAgents: (rows: { id: string }[]) => void;
  /** Agentes na comparação ativa (X-Ray) ou null — alimenta a pill da topbar. */
  agentComparison: ComparedAgent[] | null;
  /** Limpa a comparação de agentes (remove o nó do drill). */
  clearAgentComparison: () => void;
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
  /** Define o conjunto de pagadores de uma vez (segmentado Meta / Aswork / ambos). */
  selectPayers: (ids: ProviderId[]) => void;
  metaIncluded: boolean;

  /* layout do board (ordem + larguras dos widgets) */
  order: string[];
  setOrder: (next: string[]) => void;
  spans: Record<string, Span>;
  toggleSpan: (id: string) => void;
  setSpans: (next: Record<string, Span>) => void;
  resetBoard: () => void;
  isBoardCustomized: boolean;

  /* widgets removidos da visualização atual */
  hiddenWidgets: Set<string>;
  /** Só os widgets escondidos pelo usuário além do preset (alimenta o banner). */
  userHiddenWidgets: Set<string>;
  toggleWidgetHidden: (id: string) => void;
  restoreAllWidgets: () => void;

  /* tipo do relatório (exploração × fatura) + categoria da página inicial */
  reportKind: ReportKind;
  reportType: ReportType | null;
  invoiceId: string | null;

  /* relatórios salvos (snapshot do explorador) */
  reports: SavedReport[];
  activeReportId: string | null;
  activeReport: SavedReport | null;
  /** Rascunho aberto por um card e ainda não salvo. */
  isDraft: boolean;
  /** Há mudanças não salvas (relatório salvo OU rascunho). */
  isReportDirty: boolean;
  saveNewReport: (
    name: string,
    opts?: { type?: ReportType; kind?: ReportKind; invoiceId?: string | null; applyPreset?: boolean },
  ) => string;
  /** Abre um dashboard pré-configurado do tipo (sem salvar). Salvar é manual. */
  startReport: (type: ReportType, opts?: { invoiceId?: string | null }) => void;
  /** Descarta o rascunho pendente (ex.: sair sem salvar pelo "Voltar"). */
  clearDraft: () => void;
  updateActiveReport: () => void;
  renameReport: (id: string, name: string) => void;
  deleteReport: (id: string) => void;
  applyReport: (id: string) => void;
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
  // Define o conjunto de pagadores de uma vez (filtro segmentado Meta / Aswork /
  // Aswork e Meta na topbar). Nunca esvazia — sem pagador, volta pros dois.
  const selectPayers = React.useCallback((ids: ProviderId[]) => {
    setPayers(new Set(ids.length ? ids : (["aswork", "meta"] as ProviderId[])));
  }, []);
  const metaIncluded = payers.has("meta");

  // Widgets removidos da visualização atual (faz parte do snapshot do relatório).
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());
  // Linha de base de ocultos: o que o PRESET do tipo já esconde de propósito.
  // O banner de "removidos" só conta o que o usuário escondeu ALÉM disso, e
  // "Restaurar" volta pra essa base (não desfaz o recorte do tipo).
  const [baselineHidden, setBaselineHidden] = React.useState<Set<string>>(() => new Set());
  const toggleWidgetHidden = React.useCallback((id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const restoreAllWidgets = React.useCallback(
    () => setHidden(new Set(baselineHidden)),
    [baselineHidden],
  );

  // Tipo do relatório (exploração livre × recorte de fatura) + fatura escolhida.
  const [reportKind, setReportKind] = React.useState<ReportKind>("exploration");
  const [invoiceId, setInvoiceId] = React.useState<string | null>(null);
  // Categoria do relatório (a escolhida na página inicial) — define os presets.
  const [reportType, setReportType] = React.useState<ReportType | null>(null);

  // Trocar de lente zera o drill (os nós são por-lente).
  const setGrouping = React.useCallback((g: SpendingGrouping) => {
    setGroupingState(g);
    setDrill([]);
  }, []);

  // Layout do board (ordem + larguras) — agora mora no provider pra entrar no
  // snapshot dos relatórios. Os widgets/Toolbar consomem daqui.
  const { order, setOrder, reset: resetOrder, isCustomized: orderCustom } = useBoardOrder(
    BOARD_ORDER_KEY,
    BOARD_DEFAULT_ORDER,
  );
  const { spans, toggleSpan, setSpans, reset: resetSpans, isCustomized: spansCustom } = useBoardSpans(
    BOARD_SPANS_KEY,
    BOARD_DEFAULT_SPANS,
  );
  const isBoardCustomized = orderCustom || spansCustom;
  const resetBoard = React.useCallback(() => {
    resetOrder();
    resetSpans();
  }, [resetOrder, resetSpans]);

  /* ---- relatórios salvos ---- */
  const [reports, setReports] = React.useState<SavedReport[]>([]);
  const [activeReportId, setActiveReportId] = React.useState<string | null>(null);

  // Snapshot da linha de base de um RASCUNHO (entrou por um card, sem salvar) —
  // pra detectar mudanças não salvas. `baselineHidden` (acima) cobre o banner.
  const [draftBaseline, setDraftBaseline] = React.useState<ExplorerSnapshot | null>(null);

  const persistReports = React.useCallback((next: SavedReport[], activeId: string | null) => {
    try {
      window.localStorage.setItem(REPORTS_KEY, JSON.stringify({ reports: next, activeReportId: activeId }));
    } catch {
      /* localStorage indisponível */
    }
  }, []);

  const persistDraft = React.useCallback((snap: ExplorerSnapshot | null) => {
    try {
      if (snap) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(snap));
      else window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* localStorage indisponível */
    }
  }, []);

  // Descarta o rascunho pendente (ex.: ao sair sem salvar pelo "Voltar").
  const clearDraft = React.useCallback(() => {
    setDraftBaseline(null);
    setActiveReportId(null);
    persistDraft(null);
  }, [persistDraft]);

  const currentSnapshot = React.useCallback(
    (): ExplorerSnapshot => ({
      grouping,
      selection: serializeSelection(selection),
      payers: [...payers],
      search,
      drill,
      order,
      spans,
      hidden: [...hidden],
      kind: reportKind,
      invoiceId: invoiceId ?? undefined,
      reportType: reportType ?? undefined,
    }),
    [grouping, selection, payers, search, drill, order, spans, hidden, reportKind, invoiceId, reportType],
  );

  const applySnapshot = React.useCallback(
    (snap: ExplorerSnapshot) => {
      setGroupingState(snap.grouping);
      setSelection(reviveSelection(snap.selection));
      setPayers(new Set(snap.payers?.length ? snap.payers : (["aswork", "meta"] as ProviderId[])));
      setSearch(snap.search ?? "");
      setDrill(snap.drill ?? []);
      setOrder(snap.order ?? BOARD_DEFAULT_ORDER);
      setSpans(snap.spans ?? BOARD_DEFAULT_SPANS);
      setHidden(new Set(snap.hidden ?? []));
      setReportKind(snap.kind ?? "exploration");
      setInvoiceId(snap.invoiceId ?? null);
      setReportType(snap.reportType ?? null);
    },
    [setOrder, setSpans],
  );

  // Hidrata os relatórios e, se havia um ativo, reabre o explorador nele.
  const reportsHydrated = React.useRef(false);
  React.useEffect(() => {
    if (reportsHydrated.current) return;
    reportsHydrated.current = true;
    try {
      const raw = window.localStorage.getItem(REPORTS_KEY);
      // Primeiro acesso: semeia os relatórios-exemplo da página inicial.
      let list: SavedReport[];
      let storedActiveId: string | null = null;
      if (!raw) {
        list = DEFAULT_REPORTS;
        persistReports(DEFAULT_REPORTS, null);
      } else {
        const parsed = JSON.parse(raw) as { reports?: SavedReport[]; activeReportId?: string | null };
        list = Array.isArray(parsed.reports) ? parsed.reports : [];
        storedActiveId = parsed.activeReportId ?? null;
      }
      setReports(list);

      // Deep link `?relatorio=<id>` (nova guia / refresh) tem prioridade sobre o
      // relatório que estava ativo; cai pro ativo salvo quando não há param.
      let deepLinkId: string | null = null;
      try {
        deepLinkId = new URLSearchParams(window.location.search).get("relatorio");
      } catch {
        /* sem window.location */
      }
      const deepLinkHit = deepLinkId ? list.find((r) => r.id === deepLinkId) : undefined;
      if (deepLinkId && !deepLinkHit) {
        // Deep link apontando pra um relatório que não existe (excluído/renomeado
        // a chave) — avisa e segue pro ativo salvo (ou estado padrão).
        console.warn(`[consumo] relatório "${deepLinkId}" não encontrado — abrindo o estado padrão.`);
      }
      const target =
        deepLinkHit ??
        (storedActiveId ? list.find((r) => r.id === storedActiveId) : undefined);
      if (target) {
        setActiveReportId(target.id);
        setDraftBaseline(null);
        setBaselineHidden(new Set(target.snapshot.hidden ?? []));
        applySnapshot(target.snapshot);
        persistDraft(null); // abriu um salvo: o rascunho pendente não vale mais
      } else {
        // Sem relatório salvo a abrir: restaura o rascunho pendente, se houver
        // (sobrevive ao remount do provider na navegação e a um refresh).
        const draftRaw = window.localStorage.getItem(DRAFT_KEY);
        if (draftRaw) {
          const snap = JSON.parse(draftRaw) as ExplorerSnapshot;
          applySnapshot(snap);
          setDraftBaseline(snap);
          setBaselineHidden(new Set(snap.hidden ?? []));
        }
      }
    } catch {
      /* localStorage indisponível */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveNewReport = React.useCallback(
    (
      name: string,
      opts?: { type?: ReportType; kind?: ReportKind; invoiceId?: string | null; applyPreset?: boolean },
    ): string => {
      const now = Date.now();
      const type = opts?.type ?? reportType ?? undefined;
      const def = type ? reportTypeDef(type) : null;
      const resolvedKind = opts?.kind ?? def?.kind ?? reportKind;
      const resolvedInvoiceId = (opts?.invoiceId ?? invoiceId) ?? undefined;

      // applyPreset (vindo da página inicial): o relatório abre no PRESET do board
      // — os cards que fazem sentido pra esse tipo, o "ajuste de matemática" que o
      // Greg pediu. Sem isso (ex.: "Salvar" dentro do explorador), guarda o estado
      // atual como está, só etiquetando o tipo — sem mexer no board montado.
      const base = currentSnapshot();
      const snapshot: ExplorerSnapshot =
        opts?.applyPreset && def
          ? {
              ...base,
              grouping: def.grouping,
              order: def.order,
              hidden: [...def.hidden],
              kind: resolvedKind,
              invoiceId: resolvedKind === "invoice" ? resolvedInvoiceId : undefined,
              reportType: type,
            }
          : {
              ...base,
              kind: resolvedKind,
              invoiceId: resolvedKind === "invoice" ? resolvedInvoiceId : undefined,
              reportType: type,
            };

      const report: SavedReport = {
        id: newReportId(),
        name: name.trim() || "Relatório sem nome",
        createdAt: now,
        updatedAt: now,
        snapshot,
        owner: CURRENT_USER,
        org: CURRENT_ORG,
      };

      if (opts?.applyPreset && def) {
        // Sincroniza o estado vivo com o preset pra a próxima tela (o explorador)
        // já abrir no recorte certo.
        applySnapshot(snapshot);
      } else {
        // Só etiqueta o tipo/fatura no estado vivo, sem resetar o board montado.
        setReportKind(resolvedKind);
        setInvoiceId(resolvedKind === "invoice" ? resolvedInvoiceId ?? null : null);
        setReportType(type ?? null);
      }

      setReports((prev) => {
        const next = [...prev, report];
        persistReports(next, report.id);
        return next;
      });
      setActiveReportId(report.id);
      // Salvou: vira a nova linha de base e o rascunho pendente some.
      setDraftBaseline(null);
      setBaselineHidden(new Set(snapshot.hidden ?? []));
      persistDraft(null);
      return report.id;
    },
    [currentSnapshot, applySnapshot, persistReports, persistDraft, reportKind, invoiceId, reportType],
  );

  const updateActiveReport = React.useCallback(() => {
    if (!activeReportId) return;
    setReports((prev) => {
      const next = prev.map((r) =>
        r.id === activeReportId ? { ...r, snapshot: currentSnapshot(), updatedAt: Date.now() } : r,
      );
      persistReports(next, activeReportId);
      return next;
    });
  }, [activeReportId, currentSnapshot, persistReports]);

  const renameReport = React.useCallback(
    (id: string, name: string) => {
      setReports((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, name: name.trim() || r.name, updatedAt: Date.now() } : r));
        persistReports(next, activeReportId);
        return next;
      });
    },
    [activeReportId, persistReports],
  );

  const deleteReport = React.useCallback(
    (id: string) => {
      setReports((prev) => {
        const next = prev.filter((r) => r.id !== id);
        const nextActive = activeReportId === id ? null : activeReportId;
        persistReports(next, nextActive);
        return next;
      });
      setActiveReportId((cur) => (cur === id ? null : cur));
    },
    [activeReportId, persistReports],
  );

  const applyReport = React.useCallback(
    (id: string) => {
      setReports((prev) => {
        const r = prev.find((x) => x.id === id);
        if (r) {
          applySnapshot(r.snapshot);
          setActiveReportId(id);
          setDraftBaseline(null);
          setBaselineHidden(new Set(r.snapshot.hidden ?? []));
          persistReports(prev, id);
          persistDraft(null); // abrir um salvo descarta qualquer rascunho pendente
        }
        return prev;
      });
    },
    [applySnapshot, persistReports, persistDraft],
  );

  // Abre um dashboard pré-configurado do tipo escolhido SEM salvar — o usuário
  // explora e só vira relatório se clicar em "Salvar". Aplica o preset ao estado
  // vivo e zera o relatório ativo (não há nada salvo ainda).
  const startReport = React.useCallback(
    (type: ReportType, opts?: { invoiceId?: string | null }) => {
      const snap = snapshotForType(type, { invoiceId: opts?.invoiceId ?? undefined });
      applySnapshot(snap);
      setActiveReportId(null);
      // Rascunho: guarda o preset como linha de base pra detectar mudanças e pra
      // o banner não tratar os widgets do preset como "removidos por você".
      setDraftBaseline(snap);
      setBaselineHidden(new Set(snap.hidden ?? []));
      // Persiste o rascunho (sobrevive ao remount da navegação + refresh) e zera
      // o relatório ativo salvo, pra a hidratação não reabrir outro no lugar.
      persistDraft(snap);
      setReports((prev) => {
        persistReports(prev, null);
        return prev;
      });
    },
    [applySnapshot, persistDraft, persistReports],
  );

  const activeReport = React.useMemo(
    () => reports.find((r) => r.id === activeReportId) ?? null,
    [reports, activeReportId],
  );
  // É um rascunho (entrou por um card, ainda não salvou).
  const isDraft = activeReportId === null && draftBaseline !== null;
  // Há mudanças não salvas — tanto pra relatório salvo quanto pra rascunho
  // (compara com a linha de base correta).
  const isReportDirty = React.useMemo(() => {
    const baseline = activeReport ? activeReport.snapshot : draftBaseline;
    if (!baseline) return false;
    return JSON.stringify(currentSnapshot()) !== JSON.stringify(baseline);
  }, [activeReport, draftBaseline, currentSnapshot]);

  // Widgets escondidos PELO USUÁRIO além do preset — é o que o banner conta.
  const userHiddenWidgets = React.useMemo(
    () => new Set([...hidden].filter((id) => !baselineHidden.has(id))),
    [hidden, baselineHidden],
  );

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
    const colSum = categories.map((_, c) => raw.reduce((s, day) => s + (day[c] ?? 0), 0));

    if (grouping === "agent") {
      // Lente Agente: cada coluna é um agente. Escala CADA coluna pro total do
      // próprio agente (autoritativo, do detalhamento), não por grupo — assim a
      // composição, a curva, o headline e a comparação batem com a tabela linha
      // a linha (antes a distribuição vinha só do daily sintético e divergia).
      const totalById = new Map(agentRows.map((r) => [r.id, r.total]));
      const factor = categories.map((cat, c) =>
        colSum[c] > 0 ? (totalById.get(cat.id) ?? 0) / colSum[c] : 0,
      );
      // Sem arredondar célula a célula: cada coluna soma EXATO o total do agente
      // (colSum × factor = total), então headline/composição batem ao centavo com
      // o detalhamento. O arredondamento acontece nas agregações downstream.
      return raw.map((day) => day.map((v, c) => (v ?? 0) * factor[c]));
    }

    // Lente Serviço, COM drill: cada categoria do gráfico passa a somar EXATO o
    // seu total autoritativo do detalhamento (soma das linhas-filha). Sem isso, a
    // re-escala por pagador (abaixo) "espalha" Telefone/Outros nas categorias e o
    // total de uma categoria (ex.: Tokens) diverge da tabela — gritante ao descer
    // num escopo só. A forma diária (curva) vem do gerador; só a magnitude é
    // ancorada no detalhamento (mesma ideia da lente Agente). Assim o headline, a
    // composição e o "Uso por dia" do escopo conciliam com o Detalhamento.
    if (drill.length > 0) {
      const authTotal = (catId: string) =>
        (SERVICE_CAT_TO_ROW_IDS[catId] ?? []).reduce(
          (s, rid) => s + (byId.get(rid)?.total ?? 0),
          0,
        );
      const factor = categories.map((cat, c) =>
        colSum[c] > 0 ? authTotal(cat.id) / colSum[c] : 0,
      );
      // Sem arredondar célula a célula: cada coluna soma EXATO o total da
      // categoria, então as agregações downstream batem ao centavo com a tabela.
      return raw.map((day) => day.map((v, c) => (v ?? 0) * factor[c]));
    }

    // Lente Serviço (nível 0): re-escala por pagador — as categorias Aswork passam
    // a somar payerTotals.aswork e as do Meta payerTotals.meta. Preserva o total
    // cheio do período (inclui Telefone/Outros, que não têm série), conciliando
    // com "Por destino" inclusive ao desligar um pagador.
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
  }, [grouping, selection, customDays, categories, payerTotals, agentRows, drill.length, byId]);

  const chartPeriod: SpendingPeriod = selection.kind === "preset" ? selection.id : "last-30";

  // Total cheio do período (todas as categorias, sem recorte) — denominador do
  // scopeFactor. Vem dos totais por pagador pra ficar ESTÁVEL no drill: ao descer,
  // a daily vira autoritativa por categoria (e some Telefone/Outros, que não têm
  // série), então somar a daily encolheria o denominador e inflaria o scopeFactor.
  // No nível 0 isto é idêntico a somar a daily (payer-scaled). Vale nas 2 lentes.
  const fullAccumulated = React.useMemo(
    () => Math.round((payerTotals.aswork + payerTotals.meta) * 100) / 100,
    [payerTotals],
  );

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

  // Séries que os gráficos de categoria ("Uso por dia" / "Composição") realmente
  // renderizam: as categorias visíveis com a coluna diária de cada uma — MAS, ao
  // descer (drill) numa categoria que agrega várias linhas do detalhamento (ex.:
  // Tokens → Skills/Brain/Knowledge), ela EXPLODE em uma série por linha. Cada
  // sub-série recebe a coluna da categoria fatiada na proporção do total da linha
  // (autoritativo, da daily já ancorada no detalhamento), então o gráfico passa a
  // mostrar as três e bate ao centavo com a tabela. Fora do drill, ou numa
  // categoria 1-pra-1, segue série única (comportamento de antes).
  const chartSeries = React.useMemo<{ cat: SpendingCategory; column: number[] }[]>(() => {
    const visible = categories
      .map((cat, idx) => ({ cat, idx }))
      .filter((v) => visibleIds.has(v.cat.id));

    const out: { cat: SpendingCategory; column: number[] }[] = [];
    for (const { cat, idx } of visible) {
      const column = daily.map((day) => day[idx] ?? 0);
      const rowIds = SERVICE_CAT_TO_ROW_IDS[cat.id] ?? [];
      if (grouping === "service" && drill.length > 0 && rowIds.length > 1) {
        const totals = rowIds.map((id) => byId.get(id)?.total ?? 0);
        const sum = totals.reduce((a, b) => a + b, 0) || 1;
        rowIds.forEach((id, i) => {
          out.push({
            cat: leafSeriesCategory(id, i, byId),
            column: column.map((v) => (v * totals[i]) / sum),
          });
        });
      } else {
        out.push({ cat, column });
      }
    }
    return out;
  }, [categories, daily, visibleIds, grouping, drill.length, byId]);

  const seriesTotals = React.useMemo<SeriesTotal[]>(
    () =>
      chartSeries
        .map(({ cat, column }) => ({
          cat,
          total: Math.round(column.reduce((s, v) => s + v, 0) * 100) / 100,
        }))
        .sort((a, b) => b.total - a.total),
    [chartSeries],
  );

  const chartModel = React.useMemo<ChartModel>(() => {
    const dayCount = daily.length;
    const withTotals = chartSeries.map((s) => ({
      ...s,
      total: s.column.reduce((sum, v) => sum + v, 0),
    }));

    const maxSeries = grouping === "agent" ? MAX_AGENT_CHART_SERIES : MAX_CHART_SERIES;
    if (withTotals.length <= maxSeries + 1) {
      return {
        categories: withTotals.map((v) => v.cat),
        data: Array.from({ length: dayCount }, (_, d) => withTotals.map((v) => v.column[d] ?? 0)),
        othersLabels: [],
      };
    }
    const topIds = new Set(
      [...withTotals].sort((a, b) => b.total - a.total).slice(0, maxSeries).map((v) => v.cat.id),
    );
    // Preserva a ordem original das séries (estabilidade da pilha); só agrega o
    // restante em "Outros".
    const top = withTotals.filter((v) => topIds.has(v.cat.id));
    const rest = withTotals.filter((v) => !topIds.has(v.cat.id));
    const othersCat: SpendingCategory = { id: "__others__", label: `Outros · ${rest.length}`, colorVar: "var(--aw-gray-200)" };
    return {
      categories: [...top.map((v) => v.cat), othersCat],
      data: Array.from({ length: dayCount }, (_, d) => [
        ...top.map((v) => v.column[d] ?? 0),
        rest.reduce((s, v) => s + (v.column[d] ?? 0), 0),
      ]),
      othersLabels: rest.map((v) => v.cat.label),
    };
  }, [chartSeries, daily.length, grouping]);

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
  // X-Ray: comparar = drillar pro CONJUNTO de agentes escolhidos. Empilha um nó
  // com os ids deles; como todos os widgets leem de `visibleIds`, a curva, a
  // composição e o uso re-escopam pro grupo — voltam a fazer sentido (deixa de
  // ser 1 agente só) sem precisar de modal.
  const compareAgents = React.useCallback((rows: { id: string }[]) => {
    const ids = rows.map((r) => r.id);
    if (ids.length < 2) return;
    setDrill((prev) => [
      ...prev,
      { label: `Comparando ${ids.length} agentes`, categoryIds: ids, kind: "agent-compare" },
    ]);
  }, []);
  const resetDrill = React.useCallback(() => setDrill([]), []);
  const popTo = React.useCallback((index: number) => setDrill((prev) => prev.slice(0, index + 1)), []);

  // Visão filtrada de agentes (X-Ray): resolve o nó de comparação pros agentes
  // (nome + foto) que alimentam a pill da topbar. Limpar remove só esse nó.
  const agentComparison = React.useMemo<ComparedAgent[] | null>(() => {
    if (grouping !== "agent") return null;
    const node = drill.find((d) => d.kind === "agent-compare");
    if (!node) return null;
    const byId = new Map(agentRows.map((r) => [r.id, r]));
    const agents = node.categoryIds
      .map((id) => byId.get(id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map((r) => ({ id: r.id, label: r.label, avatar: r.avatar }));
    return agents.length ? agents : null;
  }, [grouping, drill, agentRows]);
  const clearAgentComparison = React.useCallback(
    () => setDrill((prev) => prev.filter((d) => d.kind !== "agent-compare")),
    [],
  );

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
    compareAgents,
    agentComparison,
    clearAgentComparison,
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
    selectPayers,
    metaIncluded,
    hiddenWidgets: hidden,
    userHiddenWidgets,
    toggleWidgetHidden,
    restoreAllWidgets,
    reportKind,
    reportType,
    invoiceId,
    order,
    setOrder,
    spans,
    toggleSpan,
    setSpans,
    resetBoard,
    isBoardCustomized,
    reports,
    activeReportId,
    activeReport,
    isDraft,
    isReportDirty,
    saveNewReport,
    startReport,
    clearDraft,
    updateActiveReport,
    renameReport,
    deleteReport,
    applyReport,
  };

  return <ConsumoContext.Provider value={value}>{children}</ConsumoContext.Provider>;
}

export function useConsumo(): ConsumoContextValue {
  const ctx = React.useContext(ConsumoContext);
  if (!ctx) throw new Error("useConsumo precisa estar dentro de <ConsumoProvider>");
  return ctx;
}
