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
  meta: { id: "meta", label: "Meta", desc: "Disparos cobrados via Meta", colorVar: "var(--aw-purple-500)" },
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

// Pagador (provedor) de cada categoria do gráfico — base do filtro de pagador.
// Disparos = Meta; resto = Aswork. Na lente Agente tudo é Aswork.
const CAT_PROVIDER: Record<string, ProviderId> = {
  "disparos-mkt": "meta",
  "disparos-util": "meta",
  mensagens: "aswork",
  leads: "aswork",
  tokens: "aswork",
};

export function catProviderOf(catId: string, grouping: SpendingGrouping): ProviderId {
  if (grouping === "agent") return "aswork";
  return CAT_PROVIDER[catId] ?? "aswork";
}

/* ---------- agrupamento por serviço ---------- */

type GroupDef = {
  id: string;
  label: string;
  desc: string;
  icon: string;
  rowIds: string[];
  /** Formato da quantidade agregada do grupo (soma das linhas-filha). */
  aggregateFormat: ServiceBreakdownRow["quantityFormat"];
};

const SERVICE_GROUPS: GroupDef[] = [
  { id: "meta", label: "Meta", desc: "Disparos cobrados via Meta", icon: "campaign", rowIds: ["disp-mkt", "disp-util"], aggregateFormat: "decimal" },
  { id: "msgs", label: "Mensagens transacionadas", desc: "Mensagens transacionadas pelos agentes", icon: "forum", rowIds: ["msgs"], aggregateFormat: "decimal" },
  { id: "leads", label: "Leads ativos", desc: "Contatos que viraram lead ativo no período", icon: "person_add", rowIds: ["leads"], aggregateFormat: "decimal" },
  { id: "tokens", label: "Tokens", desc: "Knowledge, Brain e Skills dos agentes", icon: "agent", rowIds: ["tok-k", "tok-b", "tok-s"], aggregateFormat: "abbrev" },
  { id: "tel", label: "Telefone", desc: "Linha telefônica de um parceiro da Aswork", icon: "call", rowIds: ["linha"], aggregateFormat: "decimal" },
  // "Outros serviços" foi removido do Detalhamento — não existe mais como linha.
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
  /** Quantidade já formatada (ex.: "2.805", "35,6M") — undefined quando n/a. */
  quantity?: string;
  /** Taxa efetiva por unidade (ex.: "R$ 0,12 / disparo", "Misto"). */
  unitPrice?: string;
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
      const members = rows
        .map((id) => byId.get(id))
        .filter((r): r is ServiceBreakdownRow => Boolean(r));
      const hasQty = members.some((r) => r.quantity >= 0);
      const qtySum = members.reduce((s, r) => (r.quantity >= 0 ? s + r.quantity : s), 0);
      return {
        id: g.id,
        label: g.label,
        sub: g.desc || quantityLabel(rows, byId),
        icon: g.icon,
        provider: providerForRows(rows),
        total,
        usd: toUsd(total),
        quantity: hasQty ? formatQuantity(qtySum, g.aggregateFormat) : undefined,
        unitPrice: rows.length === 1 ? byId.get(rows[0])?.unitPriceLabel : "Misto",
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

/* ---------- subárvore de 3 níveis do grupo Meta / WhatsApp ----------
 * Pedido do Greg: dentro de "Meta / WhatsApp", separar primeiro POR PAGADOR
 * (parte paga à Aswork × parte paga ao Meta) e só então os disparos
 * (marketing × utilidade). Cada disparo tem uma fração que fica com a Aswork
 * (taxa de plataforma) e outra repassada ao Meta — split mock por enquanto.
 *
 * Nível 1 (na tabela): grupo "Meta"
 *   Nível 2: "Pago à Aswork" | "Pago ao Meta"
 *     Nível 3: "Disparos WhatsApp marketing" | "Disparos WhatsApp utilidade"
 */

// Fração do total de cada disparo que fica com a Aswork (taxa de plataforma);
// o restante é repassado ao Meta. Mock — quando o backend trouxer o split real,
// é só substituir aqui.
const META_ASWORK_SHARE: Record<string, number> = {
  "disp-mkt": 0.35,
  "disp-util": 0.42,
};

// Fração paga à Aswork por CATEGORIA do gráfico (mesma lógica do detalhamento,
// agora chaveada pela categoria que a composição usa). Disparos têm split
// Aswork×Meta; demais categorias são 100% de um pagador só.
const CAT_ASWORK_SHARE: Record<string, number> = {
  "disparos-mkt": META_ASWORK_SHARE["disp-mkt"],
  "disparos-util": META_ASWORK_SHARE["disp-util"],
};

/**
 * Para uma categoria do gráfico, devolve a divisão do valor entre o que é pago à
 * Aswork e o que é repassado ao Meta. Categorias sem split (mensagens, leads,
 * tokens) caem 100% no próprio pagador. Mock até o backend trazer o real.
 */
export function categoryPayerSplit(
  catId: string,
  total: number,
): { aswork: number; meta: number } {
  const share = CAT_ASWORK_SHARE[catId];
  if (share === undefined) {
    // Sem split: tudo no pagador da categoria.
    return catProviderOf(catId, "service") === "meta"
      ? { aswork: 0, meta: total }
      : { aswork: total, meta: 0 };
  }
  const aswork = Math.round(total * share * 100) / 100;
  return { aswork, meta: Math.round((total - aswork) * 100) / 100 };
}

export type MetaPayerNode = {
  payer: ProviderId; // "aswork" = pago à Aswork; "meta" = pago ao Meta
  label: string;
  total: number;
  usd: number;
  share: number; // participação dentro do grupo Meta
  children: ExplorerRow[]; // disparos (marketing / utilidade) já fatiados
};

/** Constrói os 2 níveis abaixo do grupo Meta (pagador → disparo fatiado). */
export function metaPayerSubtree(
  metaRowIds: string[],
  byId: Map<string, ServiceBreakdownRow>,
): MetaPayerNode[] {
  const disparos = metaRowIds
    .map((id) => byId.get(id))
    .filter((r): r is ServiceBreakdownRow => Boolean(r));
  const grand = disparos.reduce((s, r) => s + r.total, 0) || 1;

  const makeNode = (payer: ProviderId, label: string): MetaPayerNode => {
    const children: ExplorerRow[] = disparos.map((r) => {
      const aswork = Math.round(r.total * (META_ASWORK_SHARE[r.id] ?? 0.4) * 100) / 100;
      const slice = payer === "aswork" ? aswork : Math.round((r.total - aswork) * 100) / 100;
      return {
        id: `${r.id}--${payer}`,
        label: r.label,
        sub: payer === "aswork" ? "Taxa de plataforma Aswork" : "Repassado ao Meta",
        icon: r.icon,
        provider: payer,
        total: slice,
        usd: toUsd(slice),
        share: grand > 0 ? (slice / grand) * 100 : 0,
        drillable: false,
        categoryIds: categoriesOf([r.id]),
        rowIds: [r.id],
      };
    });
    const total = Math.round(children.reduce((s, c) => s + c.total, 0) * 100) / 100;
    return {
      payer,
      label,
      total,
      usd: toUsd(total),
      share: grand > 0 ? (total / grand) * 100 : 0,
      children,
    };
  };

  return [makeNode("aswork", "Pago à Aswork"), makeNode("meta", "Pago ao Meta")];
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
      quantity: r.quantity >= 0 ? formatQuantity(r.quantity, r.quantityFormat) : undefined,
      unitPrice: r.unitPriceLabel,
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
