import type { SpendingGrouping, SpendingPeriod } from "../../financeiro/_components/data";
import type { Span } from "./WidgetBoard";

/* ----------------------------------------------------------------------------
 * Taxonomia dos relatórios de "Análises detalhadas".
 *
 * Um relatório é um snapshot do explorador (lente + período + filtros + layout
 * do board). O `type` é a categoria que o usuário escolhe na página inicial e
 * que define QUAIS cards entram por padrão — o "ajuste de matemática" que o Greg
 * pediu: cada tipo já abre com os gráficos que fazem sentido pra ele.
 *
 * Este módulo é a fonte única dos tipos do snapshot (importados pelo
 * ConsumoContext) — assim a taxonomia, os presets e as sementes ficam juntos sem
 * ciclo de import.
 * ------------------------------------------------------------------------- */

/** Recorte técnico que o explorador entende: livre × uma fatura. */
export type ReportKind = "exploration" | "invoice";

/** Categoria do relatório escolhida na página inicial (vira preset do board). */
export type ReportType = "variaveis" | "faturas" | "cobrancas";

/** Período serializável (datas viram ISO pra caber no localStorage). */
export type StoredSelection =
  | { kind: "preset"; id: SpendingPeriod }
  | { kind: "custom"; from: string; to: string };

/** Snapshot completo do explorador: filtros + drill + layout do board. */
export type ExplorerSnapshot = {
  grouping: SpendingGrouping;
  selection: StoredSelection;
  payers: ProviderId[];
  search: string;
  drill: DrillNode[];
  order: string[];
  spans: Record<string, Span>;
  /** Widgets removidos desta visualização (ids do board). */
  hidden?: string[];
  /** Recorte técnico (default: exploração de custos). */
  kind?: ReportKind;
  /** Fatura recortada, quando kind === "invoice". */
  invoiceId?: string;
  /** Categoria escolhida na página inicial (define o preset do board). */
  reportType?: ReportType;
};

/** Pessoa dona do relatório (proprietário) — célula da tabela inicial. */
export type ReportOwner = { name: string; initials: string };

export type SavedReport = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  snapshot: ExplorerSnapshot;
  /** Proprietário (quem criou). Default: usuário atual. */
  owner?: ReportOwner;
  /** Organização dona do relatório. Default: organização atual. */
  org?: { name: string; brand: string };
};

/* ProviderId / DrillNode vivem no model do explorador; re-tipados aqui pra o
 * snapshot não depender em runtime do ConsumoContext (evita ciclo). */
type ProviderId = "aswork" | "meta";
type DrillNode = { label: string; categoryIds: string[] };

/* ---------- layout default do board (5 widgets arrastáveis) ---------- */

export const BOARD_DEFAULT_ORDER = [
  "consumo",
  "composicao",
  "usado-cobrado",
  "provedor",
  "detalhamento",
];

export const BOARD_DEFAULT_SPANS: Record<string, Span> = {
  consumo: 2,
  composicao: 1,
  "usado-cobrado": 1,
  provedor: 1,
  detalhamento: 2,
};

/* ---------- os 3 tipos: cópia da página inicial + preset do board ---------- */

export type ReportTypeDef = {
  type: ReportType;
  /** Recorte técnico que esse tipo usa no explorador. */
  kind: ReportKind;
  icon: string;
  title: string;
  /** Descrição curta no card e no modal. */
  desc: string;
  /** Cor de acento da prévia do card (token). */
  accentVar: string;
  /** Lente padrão ao criar. */
  grouping: SpendingGrouping;
  /** Widgets removidos por padrão neste tipo. */
  hidden: string[];
  /** Ordem inicial do board (widgets ocultos podem ficar no fim). */
  order: string[];
};

export const REPORT_TYPES: ReportTypeDef[] = [
  {
    type: "variaveis",
    kind: "exploration",
    icon: "data_usage",
    title: "Uso de variáveis",
    desc: "Acompanhe disparos, mensagens, leads e tokens de IA — tudo que varia com o uso, no período que você escolher.",
    accentVar: "var(--aw-blue-500)",
    grouping: "service",
    // Tira a cobrança do provedor de pagamento: não é desse relatório.
    hidden: ["provedor"],
    order: ["consumo", "composicao", "usado-cobrado", "detalhamento", "provedor"],
  },
  {
    type: "faturas",
    kind: "invoice",
    icon: "receipt_long",
    title: "Detalhamento de faturas",
    desc: "Abra uma fatura e veja, item a item, o que entrou naquele ciclo de cobrança.",
    accentVar: "var(--aw-emerald-500)",
    grouping: "service",
    hidden: [],
    order: BOARD_DEFAULT_ORDER,
  },
  {
    type: "cobrancas",
    kind: "exploration",
    icon: "payments",
    title: "Cobranças e pagamentos",
    desc: "Veja para onde o dinheiro foi: o que a Aswork e a Meta cobraram e o que entrou na sua fatura.",
    accentVar: "var(--aw-amber-500)",
    grouping: "service",
    // Foco em "quem pegou meu dinheiro": começa pelo card laranja (provedor de
    // pagamento) + Usado × cobrado. Sem os gráficos de consumo/variáveis nem a
    // tabela de detalhamento — isso é assunto do "Uso de variáveis".
    hidden: ["consumo", "composicao", "detalhamento"],
    order: ["provedor", "usado-cobrado", "consumo", "composicao", "detalhamento"],
  },
];

export function reportTypeDef(type: ReportType): ReportTypeDef {
  return REPORT_TYPES.find((t) => t.type === type) ?? REPORT_TYPES[0];
}

/* ---------- identidade atual (mock, alinhado ao Perfil/Organização) ---------- */

export const CURRENT_USER: ReportOwner = { name: "Gregório Pinheiro", initials: "GP" };
export const CURRENT_ORG = { name: "Fyntra", brand: "fyntra" };

/* ---------- snapshot a partir de um tipo (preset do board) ---------- */

export function snapshotForType(
  type: ReportType,
  opts?: { invoiceId?: string | null; period?: SpendingPeriod },
): ExplorerSnapshot {
  const def = reportTypeDef(type);
  return {
    grouping: def.grouping,
    selection: { kind: "preset", id: opts?.period ?? "this-month" },
    payers: ["aswork", "meta"],
    search: "",
    drill: [],
    order: def.order,
    spans: { ...BOARD_DEFAULT_SPANS },
    hidden: [...def.hidden],
    kind: def.kind,
    invoiceId: type === "faturas" ? opts?.invoiceId ?? undefined : undefined,
    reportType: type,
  };
}

/* ---------- relatórios-semente (exemplos da página inicial) ---------- */

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d).getTime();

export const DEFAULT_REPORTS: SavedReport[] = [
  {
    id: "rpt-seed-variaveis-dez",
    name: "Custos variáveis de dezembro",
    createdAt: day(2025, 12, 2),
    updatedAt: day(2026, 6, 25),
    owner: CURRENT_USER,
    org: CURRENT_ORG,
    snapshot: snapshotForType("variaveis", { period: "last-90" }),
  },
  {
    id: "rpt-seed-cobrancas-bolso",
    name: "Pra onde foi meu dinheiro",
    createdAt: day(2026, 6, 10),
    updatedAt: day(2026, 6, 25),
    owner: { name: "José Júnior", initials: "JJ" },
    org: CURRENT_ORG,
    snapshot: snapshotForType("cobrancas"),
  },
  {
    id: "rpt-seed-variaveis-agentes",
    name: "Cobranças por agente",
    createdAt: day(2026, 5, 14),
    updatedAt: day(2026, 6, 25),
    owner: { name: "Paulo Guilherme", initials: "PG" },
    org: CURRENT_ORG,
    snapshot: { ...snapshotForType("variaveis"), grouping: "agent" },
  },
  {
    id: "rpt-seed-fatura-abril",
    name: "Detalhamento da fatura de abril",
    createdAt: day(2026, 6, 1),
    updatedAt: day(2026, 6, 25),
    owner: CURRENT_USER,
    org: CURRENT_ORG,
    snapshot: snapshotForType("faturas", { invoiceId: "INV-2026-04-1234" }),
  },
];
