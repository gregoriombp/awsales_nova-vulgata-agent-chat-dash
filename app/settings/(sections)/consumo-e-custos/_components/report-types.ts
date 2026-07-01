import type { SpendingGrouping, SpendingPeriod } from "../../financeiro/_components/data";
import type { SpendChannel } from "./channels-model";
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

/** Recorte por INSTÂNCIA de widget ao adicionar um gráfico (Notion): tipo de
 *  USO estreita as categorias de serviço; tipo de COBRANÇA estreita o pagador.
 *  Só vale na lente Serviço — na lente Agente o recorte é ignorado. */
export type WidgetInstanceConfig = {
  uso?: "all" | "disparos" | "mensagens" | "leads" | "tokens";
  cobranca?: "all" | "aswork" | "meta";
};

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
  /** Canais ativos no filtro (ausente = todos). */
  channels?: SpendChannel[];
  /** Filtro rápido de disparos (ausente = todos). */
  disparos?: "all" | "mkt" | "util" | "none";
  /** Recorte por instância de widget (ex.: consumo → só Disparos·Aswork). */
  widgetConfigs?: Record<string, WidgetInstanceConfig>;
  /** Recorte técnico (default: exploração de custos). */
  kind?: ReportKind;
  /** Fatura recortada, quando kind === "invoice". */
  invoiceId?: string;
  /** Categoria escolhida na página inicial (define o preset do board). */
  reportType?: ReportType;
};

/** Pessoa dona do relatório (proprietário) — célula da tabela inicial. */
export type ReportOwner = { name: string; initials: string; avatar?: string };

/** Organização dona do relatório (nome + logo real). */
export type ReportOrg = { name: string; logo: string };

export type SavedReport = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  snapshot: ExplorerSnapshot;
  /** Proprietário (quem criou). Default: usuário atual. */
  owner?: ReportOwner;
  /** Organização dona do relatório. Default: organização atual. */
  org?: ReportOrg;
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
  "canal",
  "tipo-agente",
  "compromisso",
  "detalhamento",
];

export const BOARD_DEFAULT_SPANS: Record<string, Span> = {
  consumo: 2,
  composicao: 1,
  "usado-cobrado": 1,
  provedor: 1,
  canal: 1,
  "tipo-agente": 1,
  compromisso: 1,
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
  /** Widgets removidos por padrão neste tipo (podem ser READICIONADOS). */
  hidden: string[];
  /** Widgets que este tipo NÃO oferece — fora do board E do "Adicionar
   *  gráfico" (cmt-b0869104 + cmt-44007d84: incompatíveis com o modelo do
   *  relatório, não só escondidos). */
  excluded?: string[];
  /** Ordem inicial do board (widgets ocultos podem ficar no fim). */
  order: string[];
};

export const REPORT_TYPES: ReportTypeDef[] = [
  {
    type: "variaveis",
    kind: "exploration",
    icon: "data_usage",
    title: "Uso variável",
    desc: "Veja quanto cada serviço e agente consumiu no período.",
    accentVar: "var(--aw-blue-500)",
    grouping: "service",
    // "Uso do período" (usado-cobrado) duplicava a leitura do uso e o "Valor
    // atribuído ao provedor" é assunto de cobrança — os dois são INCOMPATÍVEIS
    // com o modelo "Uso de variáveis" (cmt-b0869104 + cmt-44007d84): fora do
    // board e do "Adicionar gráfico" deste tipo, não apenas ocultos.
    hidden: ["canal", "tipo-agente"],
    excluded: ["usado-cobrado", "provedor"],
    order: ["consumo", "composicao", "compromisso", "detalhamento", "canal", "tipo-agente"],
  },
  {
    type: "faturas",
    kind: "invoice",
    icon: "receipt_long",
    title: "Detalhamento de faturas",
    desc: "Abra uma fatura e veja, item a item, o que entrou naquele ciclo de cobrança.",
    accentVar: "var(--aw-emerald-500)",
    grouping: "service",
    hidden: ["canal", "tipo-agente", "compromisso"],
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
    hidden: ["consumo", "composicao", "detalhamento", "compromisso"],
    order: ["provedor", "usado-cobrado", "canal", "tipo-agente", "consumo", "composicao", "compromisso", "detalhamento"],
  },
];

export function reportTypeDef(type: ReportType): ReportTypeDef {
  return REPORT_TYPES.find((t) => t.type === type) ?? REPORT_TYPES[0];
}

/** Valida um valor de URL (`?tipo=`) contra a taxonomia conhecida. */
export function isReportType(v: string | null | undefined): v is ReportType {
  return v != null && REPORT_TYPES.some((t) => t.type === v);
}

/* ---------- identidade atual (mock, alinhado ao Perfil/Organização) ---------- */

export const CURRENT_USER: ReportOwner = {
  name: "Gregório Pinheiro",
  initials: "GP",
  avatar: "/assets/users/greg.jpg",
};
export const CURRENT_ORG: ReportOrg = {
  name: "Fyntra Tecnologia",
  logo: "/assets/icon_artificial_concord_organization.png",
};

const USER_JOSE: ReportOwner = { name: "José Júnior", initials: "JJ", avatar: "/assets/users/jose.jpg" };
const USER_GABRIEL: ReportOwner = { name: "Gabriel Lima", initials: "GL", avatar: "/assets/users/gabriel_lima.jpg" };

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
    owner: USER_JOSE,
    org: CURRENT_ORG,
    snapshot: snapshotForType("cobrancas"),
  },
  {
    id: "rpt-seed-variaveis-agentes",
    name: "Cobranças por agente",
    createdAt: day(2026, 5, 14),
    updatedAt: day(2026, 6, 25),
    owner: USER_GABRIEL,
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
