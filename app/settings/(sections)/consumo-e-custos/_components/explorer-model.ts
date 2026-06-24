/* ----------------------------------------------------------------------------
 * Modelo do explorador de custos (lentes Serviço e Agente).
 *
 * O drill é modelado como um ESTREITAMENTO do conjunto de categorias visíveis
 * (`visibleIds`): clicar numa linha do Detalhamento restringe as categorias do
 * gráfico/composição/KPIs àquele grupo, e empilha um nó no breadcrumb. Como os
 * widgets antigos já reagem a `visibleIds`, eles re-escopam de graça.
 *
 * "Por destino" (Aswork/Meta) é só leitura — provedor não é mais uma lente.
 * ------------------------------------------------------------------------- */

import {
  agentType,
  formatQuantity,
  scaleBreakdown,
  scaleCustomBreakdown,
  AGENT_BREAKDOWN,
  SERVICE_BREAKDOWN,
  type AgentBreakdownRow,
  type ServiceBreakdownRow,
  type SpendingGrouping,
  type SpendingPeriod,
} from "../../financeiro/_components/data";

export const DIMENSIONS: { id: SpendingGrouping; label: string; icon: string }[] = [
  { id: "service", label: "Serviço", icon: "category" },
  { id: "agent", label: "Agente", icon: "agent" },
];

/* ---------- provedores (só "Por destino", leitura) ---------- */

export type ProviderId = "aswork" | "meta";

export const PROVIDERS: Record<
  ProviderId,
  { id: ProviderId; label: string; desc: string; colorVar: string }
> = {
  aswork: { id: "aswork", label: "Aswork", desc: "Serviços da plataforma", colorVar: "var(--aw-blue-500)" },
  meta: { id: "meta", label: "Meta", desc: "Disparos de WhatsApp", colorVar: "var(--aw-purple-500)" },
};

export const PROVIDER_ORDER: ProviderId[] = ["aswork", "meta"];

// Quem fatura cada linha: disparos = Meta; resto = Aswork.
const ROW_PROVIDER: Record<string, ProviderId> = {
  "disp-mkt": "meta",
  "disp-util": "meta",
  msgs: "aswork",
  leads: "aswork",
  "tok-k": "aswork",
  "tok-b": "aswork",
  "tok-s": "aswork",
  linha: "aswork",
  outros: "aswork",
};

export function providerOf(rowId: string): ProviderId {
  return ROW_PROVIDER[rowId] ?? "aswork";
}

export function providerBreakdown(
  scopeRowIds: string[],
  byId: Map<string, ServiceBreakdownRow>,
): { id: ProviderId; total: number; share: number }[] {
  const totals = new Map<ProviderId, number>();
  for (const id of scopeRowIds) {
    const p = providerOf(id);
    totals.set(p, (totals.get(p) ?? 0) + (byId.get(id)?.total ?? 0));
  }
  const grand = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  return PROVIDER_ORDER.filter((p) => totals.has(p)).map((p) => ({
    id: p,
    total: Math.round((totals.get(p) ?? 0) * 100) / 100,
    share: ((totals.get(p) ?? 0) / grand) * 100,
  }));
}

/* ---------- linha de detalhamento → categoria do gráfico ---------- */

// Cada linha do detalhamento mapeia (ou não) para uma das 5 categorias do
// gráfico de serviço. Telefone/Outros não têm série no gráfico → categoria "".
const ROW_CATEGORY: Record<string, string> = {
  "disp-mkt": "disparos-mkt",
  "disp-util": "disparos-util",
  msgs: "mensagens",
  leads: "leads",
  "tok-k": "tokens",
  "tok-b": "tokens",
  "tok-s": "tokens",
  linha: "",
  outros: "",
};

function categoriesOf(rowIds: string[]): string[] {
  return [...new Set(rowIds.map((id) => ROW_CATEGORY[id]).filter(Boolean))];
}

/* ---------- agrupamento por serviço ---------- */

type GroupDef = {
  id: string;
  label: string;
  desc: string;
  icon: string;
  rowIds: string[];
};

const SERVICE_GROUPS: GroupDef[] = [
  { id: "meta", label: "Meta", desc: "Disparos de WhatsApp cobrados via Meta", icon: "campaign", rowIds: ["disp-mkt", "disp-util"] },
  { id: "msgs", label: "Mensagens transacionadas", desc: "Mensagens transacionadas pelos agentes", icon: "forum", rowIds: ["msgs"] },
  { id: "leads", label: "Leads ativos", desc: "Contatos que viraram lead ativo no período", icon: "person_add", rowIds: ["leads"] },
  { id: "tokens", label: "Tokens", desc: "Knowledge, Brain e Skills dos agentes", icon: "agent", rowIds: ["tok-k", "tok-b", "tok-s"] },
  { id: "tel", label: "Telefone", desc: "Linha telefônica de um parceiro da Aswork", icon: "call", rowIds: ["linha"] },
  { id: "outros", label: "Outros serviços", desc: "Serviços agregados do período", icon: "more_horiz", rowIds: ["outros"] },
];

/* ---------- linha unificada da tabela ---------- */

export type ExplorerRow = {
  id: string;
  label: string;
  sub?: string;
  icon?: string;
  avatar?: string;
  provider: ProviderId | "mixed";
  total: number;
  usd: number;
  share: number;
  /** Pode descer mais um nível (tem categorias de gráfico pra estreitar). */
  drillable: boolean;
  /** Categorias do gráfico que esta linha representa — alimenta o drill. */
  categoryIds: string[];
  /** Linhas do detalhamento que agrega. */
  rowIds: string[];
  /** Só na lente Agente — abre o modal de detalhe. */
  agentId?: string;
  /** Só na lente Agente. */
  status?: AgentBreakdownRow["status"];
};

function providerForRows(rowIds: string[]): ProviderId | "mixed" {
  const set = new Set(rowIds.map(providerOf));
  return set.size === 1 ? [...set][0] : "mixed";
}

function quantityLabel(rowIds: string[], byId: Map<string, ServiceBreakdownRow>): string | undefined {
  if (rowIds.length !== 1) return undefined;
  const r = byId.get(rowIds[0]);
  if (!r || r.quantity < 0) return undefined;
  return formatQuantity(r.quantity, r.quantityFormat);
}

export function scaledServiceRows(period: SpendingPeriod | null, customDays: number): ServiceBreakdownRow[] {
  return period
    ? (scaleBreakdown(SERVICE_BREAKDOWN, period) as ServiceBreakdownRow[])
    : (scaleCustomBreakdown(SERVICE_BREAKDOWN, customDays) as ServiceBreakdownRow[]);
}

export function scaledAgentRows(period: SpendingPeriod | null, customDays: number): AgentBreakdownRow[] {
  return period
    ? (scaleBreakdown(AGENT_BREAKDOWN, period) as AgentBreakdownRow[])
    : (scaleCustomBreakdown(AGENT_BREAKDOWN, customDays) as AgentBreakdownRow[]);
}

export function sumRows(rowIds: string[], byId: Map<string, ServiceBreakdownRow>): number {
  return Math.round(rowIds.reduce((s, id) => s + (byId.get(id)?.total ?? 0), 0) * 100) / 100;
}

const FX = 4.92;
const toUsd = (brlValue: number) => Math.round((brlValue / FX) * 100) / 100;

/**
 * Linhas da tabela de Detalhamento para a lente + escopo + profundidade.
 * Serviço: nível 0 agrupa; níveis seguintes mostram as folhas. Agente: lista
 * plana dos agentes no escopo.
 */
export function buildRows(
  grouping: SpendingGrouping,
  scopeIds: string[],
  depth: number,
  serviceRows: ServiceBreakdownRow[],
  agentRows: AgentBreakdownRow[],
): ExplorerRow[] {
  const byId = new Map(serviceRows.map((r) => [r.id, r]));

  if (grouping === "agent") {
    const scope = new Set(scopeIds);
    const rows = agentRows.filter((r) => scope.has(r.id));
    const grand = rows.reduce((s, r) => s + r.total, 0) || 1;
    return [...rows]
      .sort((a, b) => b.total - a.total)
      .map((r) => ({
        id: r.id,
        label: r.label,
        sub: agentType(r.id),
        avatar: r.avatar,
        provider: "aswork" as const,
        total: r.total,
        usd: toUsd(r.total),
        share: (r.total / grand) * 100,
        drillable: rows.length > 1,
        categoryIds: [r.id],
        rowIds: [],
        agentId: r.id,
        status: r.status,
      }));
  }

  const scope = new Set(scopeIds);
  const inScope = (ids: string[]) => ids.filter((id) => scope.has(id));

  // Já desceu num grupo → folhas do escopo.
  if (depth > 0) {
    return leafRows(scopeIds, byId);
  }

  const built = SERVICE_GROUPS.map((g) => {
    const rows = inScope(g.rowIds);
    return { g, rows, total: sumRows(rows, byId) };
  }).filter((x) => x.rows.length > 0);

  const grand = built.reduce((s, x) => s + x.total, 0) || 1;

  return built
    .map(({ g, rows, total }) => {
      const cats = categoriesOf(rows);
      return {
        id: g.id,
        label: g.label,
        sub: g.desc || quantityLabel(rows, byId),
        icon: g.icon,
        provider: providerForRows(rows),
        total,
        usd: toUsd(total),
        share: (total / grand) * 100,
        // Estreitar só faz sentido se há categoria de gráfico (Telefone/Outros
        // não têm série, então não descem).
        drillable: cats.length > 0,
        categoryIds: cats,
        rowIds: rows,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function leafRows(
  scopeRowIds: string[],
  byId: Map<string, ServiceBreakdownRow>,
): ExplorerRow[] {
  const grand = sumRows(scopeRowIds, byId) || 1;
  return scopeRowIds
    .map((id) => byId.get(id))
    .filter((r): r is ServiceBreakdownRow => Boolean(r))
    .map((r) => ({
      id: r.id,
      label: r.label,
      sub: r.quantity >= 0 ? formatQuantity(r.quantity, r.quantityFormat) : r.category,
      icon: r.icon,
      provider: providerOf(r.id),
      total: r.total,
      usd: toUsd(r.total),
      share: (r.total / grand) * 100,
      drillable: false,
      categoryIds: categoriesOf([r.id]),
      rowIds: [r.id],
    }))
    .sort((a, b) => b.total - a.total);
}

/* ---------- período anterior + tendência (hero) ---------- */

function hashKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100000;
  return h;
}

export function previousTotal(currentTotal: number, scopeKey: string): number {
  const factor = scopeKey === "all" ? 0.892 : 0.82 + ((hashKey(scopeKey) % 1000) / 1000) * 0.14;
  return Math.round(currentTotal * factor * 100) / 100;
}

export function trendPct(current: number, previous: number): number {
  if (previous <= 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
