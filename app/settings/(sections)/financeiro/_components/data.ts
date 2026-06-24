// Fixtures pra Settings → Financeiro. Substituir por dados reais quando o
// backend expor endpoints. Valores em BRL; datas em formato pt-BR.

import type { AwPillVariant } from "@/components/ui/AwPill";

export const CURRENT_PLAN = {
  name: "Plano Enterprise",
  status: "Ativo" as const,
  monthly: 2497.98,
  nextChargeAt: "28/05/2026",
  /** Desde quando a organização está neste plano (pt-BR). */
  since: "28/05/2025",
  /** Ciclo de cobrança — exibido no detalhe do plano. */
  billingCycle: "Mensal",
  /** O que está incluso no plano — mostrado no modal de detalhes. */
  highlights: [
    "Agentes de IA ilimitados",
    "Limite de consumo variável de R$ 1.500 por ciclo",
    "Disparos, mensagens e leads com tarifas Enterprise",
    "Suporte prioritário e gerente de contas dedicado",
    "Trilha de auditoria e SSO para a organização",
  ],
};

export const CURRENT_INVOICE = {
  id: "INV-2026-05-0042",
  status: "Em aberto" as const,
  dueAt: "28/05/2026",
  total: 3389.61,
  paymentMethod: {
    brand: "Visa" as const,
    last4: "3012",
  },
};

export const BILLING_PROFILE = {
  legalName: "Aswork Tecnologia Ltda.",
  taxId: "47.382.519/0001-04",
  stateRegistration: "Isento",
  /** Quem recebe as faturas por e-mail. Único campo editável pelo cliente. */
  billingRecipients: [
    "financeiro@awsales.com.br",
    "greg@awsales.io",
    "controladoria@awsales.com.br",
    "ana.azevedo@awsales.com.br",
    "bruno.costa@awsales.com.br",
    "fiscal@awsales.com.br",
    "contabilidade@awsales.com.br",
  ],
  address: {
    line1: "Av. Brigadeiro Faria Lima, 3477",
    line2: "12º andar · Itaim Bibi",
    city: "São Paulo",
    state: "SP",
    zip: "04538-133",
    country: "Brasil",
  },
};

export const OVERVIEW_KPIS = {
  partialChargeAt: 5229.5,
  accumulated: 891.63,
  accumulatedPct: 17, // % até a próxima cobrança parcial
  monthSavings: 132.4, // economia com créditos / cupons
};

// Limite mensal de gastos variáveis por usuário/organização.
// Quando atingido, o montante acumulado é cobrado automaticamente.
export const VARIABLE_SPENDING_LIMIT = 1500;

// Composição do desconto estimado da próxima fatura (cupom + voucher). A soma
// DEVE bater com OVERVIEW_KPIS.monthSavings — é a quebra do mesmo valor, só
// detalhada por origem do crédito.
export type ForecastDiscount = {
  id: string;
  /** Origem do crédito — distingue cupom de voucher na linha. */
  kind: "Cupom" | "Voucher";
  /** Código/nome exibido (ex.: "BF2025", "Crédito Q2"). */
  label: string;
  /** Valor abatido NESTA fatura (a fatia do crédito usada no ciclo). */
  value: number;
  /** Valor total concedido quando o crédito entrou. */
  grantedValue: number;
  /** Quanto já foi consumido no total (inclui o `value` deste ciclo). */
  consumed: number;
  /** Data em que o crédito foi concedido (pt-BR). */
  grantedAt: string;
  /** Validade do crédito (pt-BR). */
  expiresAt: string;
  /** Linha curta explicando a origem/condição do crédito. */
  note: string;
};

export const FORECAST_DISCOUNTS: ForecastDiscount[] = [
  {
    id: "fd-bf2025",
    kind: "Cupom",
    label: "BF2025",
    value: 90.0,
    grantedValue: 150.0,
    consumed: 90.0,
    grantedAt: "20/11/2025",
    expiresAt: "30/06/2026",
    note: "Cupom de Black Friday aplicado ao consumo variável do ciclo.",
  },
  {
    id: "fd-q2",
    kind: "Voucher",
    label: "Crédito Q2",
    value: 42.4,
    grantedValue: 100.0,
    consumed: 42.4,
    grantedAt: "01/04/2026",
    expiresAt: "30/09/2026",
    note: "Crédito promocional do trimestre, abatido automaticamente nas faturas.",
  },
];

// Gastos variáveis — agrupados por dia (1..31) e por categoria.
// 4 categorias por agrupamento; cada valor é em BRL.
export type SpendingGrouping = "service" | "agent";

export type SpendingCategory = {
  id: string;
  label: string;
  /** Token CSS var aplicado em background/fill — sem cor hardcoded. */
  colorVar: string;
  /** Avatar do agente (apenas para agrupamento por agente). */
  avatar?: string;
};

export const SPENDING_CATEGORIES: Record<SpendingGrouping, SpendingCategory[]> = {
  service: [
    { id: "disparos-mkt", label: "Disparos · marketing", colorVar: "var(--aw-blue-500)" },
    { id: "disparos-util", label: "Disparos · utilidade", colorVar: "var(--aw-teal-500)" },
    { id: "mensagens", label: "Mensagens transacionadas", colorVar: "var(--aw-amber-500)" },
    { id: "leads", label: "Leads ativos", colorVar: "var(--aw-emerald-500)" },
    { id: "tokens", label: "Tokens", colorVar: "var(--aw-purple-500)" },
  ],
  agent: [
    {
      id: "aria",
      label: "Aria",
      colorVar: "var(--aw-blue-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_01-1.png",
    },
    {
      id: "atlas",
      label: "Atlas",
      colorVar: "var(--aw-emerald-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_05-1.png",
    },
    {
      id: "nova",
      label: "Nova",
      colorVar: "var(--aw-amber-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_08-1.png",
    },
    {
      id: "stella",
      label: "Stella",
      colorVar: "var(--aw-purple-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_11-1.png",
    },
    {
      id: "iris",
      label: "Íris",
      colorVar: "var(--aw-teal-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_02-1.png",
    },
    {
      id: "theo",
      label: "Theo",
      colorVar: "var(--aw-pink-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_03-1.png",
    },
    {
      id: "luma",
      label: "Luma",
      colorVar: "var(--aw-red-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_04-1.png",
    },
    {
      id: "kai",
      label: "Kai",
      colorVar: "var(--aw-lime-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_06-1.png",
    },
    {
      id: "vega",
      label: "Vega",
      colorVar: "var(--aw-slate-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_07-1.png",
    },
    {
      id: "milo",
      label: "Milo",
      colorVar: "var(--aw-blue-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_09-1.png",
    },
    {
      id: "sol",
      label: "Sol",
      colorVar: "var(--aw-amber-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_10-1.png",
    },
    {
      id: "bria",
      label: "Bria",
      colorVar: "var(--aw-emerald-500)",
      avatar: "/assets/agent_imgs/orbs/orb_model-a_12-1.png",
    },
  ],
};

// Período de exibição dos gastos variáveis. Cada um tem uma duração própria
// (em barras visuais) e um total alvo. O gerador determinístico produz daily
// values que são re-escalados pra somar exatamente o total alvo — assim o
// gráfico e a tabela de breakdown sempre batem.
export type SpendingPeriod =
  | "today"
  | "yesterday"
  | "last-7"
  | "this-month"
  | "last-30"
  | "last-90";

export const SPENDING_PERIODS: { id: SpendingPeriod; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "yesterday", label: "Ontem" },
  { id: "last-7", label: "Últimos 7 dias" },
  { id: "this-month", label: "Este mês" },
  { id: "last-30", label: "Últimos 30 dias" },
  { id: "last-90", label: "Últimos 90 dias" },
];

const PERIOD_BARS: Record<SpendingPeriod, number> = {
  today: 1,
  yesterday: 1,
  "last-7": 7,
  "this-month": 15, // até hoje (15/05)
  "last-30": 30,
  "last-90": 30, // 30 buckets representando ~3 dias cada
};

// Total alvo de cada período. `this-month` casa com o baseline da tabela.
const PERIOD_TOTAL: Record<SpendingPeriod, number> = {
  today: 62.4, // ~uma fatia diária do baseline mensal
  yesterday: 58.9,
  "last-7": 412.5,
  "this-month": 891.63,
  "last-30": 1850,
  "last-90": 5400,
};

// Pseudoaleatório determinístico — fixture parecer real sem ser ruído.
// `cats` = quantas categorias (séries) cada dia carrega.
function genDaily(seed: number, n: number, cats: number): number[][] {
  const out: number[][] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    const v: number[] = [];
    for (let c = 0; c < cats; c++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      v.push(Math.round((r * 14 + 2) * 100) / 100);
    }
    out.push(v);
  }
  return out;
}

export function getDailySpending(
  grouping: SpendingGrouping,
  period: SpendingPeriod,
): number[][] {
  const seed = grouping === "service" ? 7 : 13;
  const raw = genDaily(
    seed,
    PERIOD_BARS[period],
    SPENDING_CATEGORIES[grouping].length,
  );
  const rawTotal = raw.reduce(
    (s, day) => s + day.reduce((s2, v) => s2 + v, 0),
    0,
  );
  if (rawTotal === 0) return raw;
  const factor = PERIOD_TOTAL[period] / rawTotal;
  return raw.map((day) =>
    day.map((v) => Math.round(v * factor * 100) / 100),
  );
}

export function scaleBreakdown<
  T extends { total: number; quantity?: number },
>(rows: T[], period: SpendingPeriod): T[] {
  const baseline = rows.reduce((s, r) => s + r.total, 0);
  if (baseline === 0) return rows;
  const ratio = PERIOD_TOTAL[period] / baseline;
  if (Math.abs(ratio - 1) < 0.001) return rows;
  return rows.map((r) => {
    const scaled: T = {
      ...r,
      total: Math.round(r.total * ratio * 100) / 100,
    };
    if (typeof r.quantity === "number" && r.quantity >= 0) {
      scaled.quantity = r.quantity * ratio;
    }
    return scaled;
  });
}

/** Total alvo do período — usado pelo bloco quando precisa do total esperado
 *  sem ter que somar o array de daily. */
export function periodTotal(period: SpendingPeriod): number {
  return PERIOD_TOTAL[period];
}

export function periodBars(period: SpendingPeriod): number {
  return PERIOD_BARS[period];
}

/** Gera daily values para um período custom — buckets = nº de dias entre as
 *  datas, total proporcional ao baseline mensal. */
export function getCustomDailySpending(
  grouping: SpendingGrouping,
  dayCount: number,
): number[][] {
  const bars = Math.max(1, Math.min(dayCount, 90));
  const seed = grouping === "service" ? 7 : 13;
  const raw = genDaily(seed, bars, SPENDING_CATEGORIES[grouping].length);
  const target = customPeriodTotal(bars);
  const rawTotal = raw.reduce(
    (s, day) => s + day.reduce((s2, v) => s2 + v, 0),
    0,
  );
  if (rawTotal === 0) return raw;
  const factor = target / rawTotal;
  return raw.map((day) =>
    day.map((v) => Math.round(v * factor * 100) / 100),
  );
}

/** Total esperado para um custom range — escala linear a partir do baseline
 *  mensal (891.63 em 30 dias). */
export function customPeriodTotal(dayCount: number): number {
  return Math.round((PERIOD_TOTAL["last-30"] / 30) * dayCount * 100) / 100;
}

export function scaleCustomBreakdown<
  T extends { total: number; quantity?: number },
>(rows: T[], dayCount: number): T[] {
  const baseline = rows.reduce((s, r) => s + r.total, 0);
  const target = customPeriodTotal(dayCount);
  if (baseline === 0) return rows;
  const ratio = target / baseline;
  if (Math.abs(ratio - 1) < 0.001) return rows;
  return rows.map((r) => {
    const scaled: T = {
      ...r,
      total: Math.round(r.total * ratio * 100) / 100,
    };
    if (typeof r.quantity === "number" && r.quantity >= 0) {
      scaled.quantity = r.quantity * ratio;
    }
    return scaled;
  });
}

/** Câmbio operacional usado pra converter BRL → USD no detalhamento. */
export const OPERATIONAL_FX = 4.92;

export function usd(brlValue: number): number {
  return Math.round((brlValue / OPERATIONAL_FX) * 100) / 100;
}

/** Rótulo em dólar (ex.: "US$ 1.234,56" no padrão en-US: "US$ 1,234.56"). */
export function fmtUsdLabel(brlValue: number): string {
  return `US$ ${usd(brlValue).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export type ServiceCategory =
  | "Meta / WhatsApp"
  | "IA / Tokens"
  | "Leads"
  | "Operacional";

export type ServiceBreakdownRow = {
  id: string;
  label: string;
  icon: string;
  /** Categoria da taxa — agrupa o detalhamento por origem do custo. */
  category: ServiceCategory;
  /** Quantidade base no período "Este mês". -1 sinaliza linha agregada sem unidade. */
  quantity: number;
  /** Como apresentar a quantidade — "decimal" (1.245), "abbrev" (2,1M / 780K) ou "lump" (—). */
  quantityFormat: "decimal" | "abbrev" | "lump";
  /** Taxa efetiva por unidade. */
  unitPriceLabel: string;
  total: number;
  /** Valor em dólar (câmbio operacional) — coluna USD do detalhamento. */
  usd: number;
};

// Tokens não têm mais quebra input/output — só Knowledge / Brain / Skill
// (decisão da group review 19/06). Disparos separam marketing de utilidade.
// "Leads ativos" (era "convertidos"). Serviços vêm desta lista — nada hardcoded
// nas telas, pra novos agrupamentos entrarem só aqui.
export const SERVICE_BREAKDOWN: ServiceBreakdownRow[] = [
  { id: "disp-mkt", label: "Disparos WhatsApp marketing", icon: "campaign", category: "Meta / WhatsApp", quantity: 1245, quantityFormat: "decimal", unitPriceLabel: "R$ 0,12 / disparo", total: 149.4, usd: 30.37 },
  { id: "disp-util", label: "Disparos WhatsApp utilidade", icon: "campaign", category: "Meta / WhatsApp", quantity: 1560, quantityFormat: "decimal", unitPriceLabel: "R$ 0,08 / disparo", total: 124.8, usd: 25.37 },
  { id: "msgs", label: "Mensagens transacionadas", icon: "forum", category: "Meta / WhatsApp", quantity: 6205, quantityFormat: "decimal", unitPriceLabel: "R$ 0,03 / mensagem", total: 186.16, usd: 37.84 },
  { id: "leads", label: "Leads ativos", icon: "person_add", category: "Leads", quantity: 48, quantityFormat: "decimal", unitPriceLabel: "R$ 2,00 / lead", total: 96.0, usd: 19.51 },
  { id: "tok-k", label: "Tokens · Knowledge", icon: "memory", category: "IA / Tokens", quantity: 12_100_000, quantityFormat: "abbrev", unitPriceLabel: "R$ 0,002 / 1K", total: 24.2, usd: 4.92 },
  { id: "tok-b", label: "Tokens · Brain", icon: "neurology", category: "IA / Tokens", quantity: 13_400_000, quantityFormat: "abbrev", unitPriceLabel: "R$ 0,005 / 1K", total: 67.0, usd: 13.62 },
  { id: "tok-s", label: "Tokens · Skills", icon: "extension", category: "IA / Tokens", quantity: 10_078_000, quantityFormat: "abbrev", unitPriceLabel: "R$ 0,009 / 1K", total: 90.7, usd: 18.43 },
  { id: "linha", label: "Linha telefônica", icon: "call", category: "Operacional", quantity: 1, quantityFormat: "decimal", unitPriceLabel: "R$ 39,00 / mês", total: 39.0, usd: 7.93 },
  { id: "outros", label: "Outros serviços agregados", icon: "more_horiz", category: "Operacional", quantity: -1, quantityFormat: "lump", unitPriceLabel: "—", total: 114.37, usd: 23.25 },
];

export function formatQuantity(
  n: number,
  format: ServiceBreakdownRow["quantityFormat"],
): string {
  if (format === "lump" || n < 0) return "—";
  if (format === "abbrev") {
    if (n >= 1_000_000) {
      return (
        (n / 1_000_000).toLocaleString("pt-BR", {
          minimumFractionDigits: n < 10_000_000 ? 1 : 0,
          maximumFractionDigits: 1,
        }) + "M"
      );
    }
    if (n >= 1_000) {
      return Math.round(n / 1_000).toLocaleString("pt-BR") + "K";
    }
    return Math.round(n).toLocaleString("pt-BR");
  }
  return Math.round(n).toLocaleString("pt-BR");
}

export type AgentBreakdownRow = {
  id: string;
  label: string;
  avatar: string;
  role: string;
  status: "Ativo" | "Pausado" | "Treinando";
  total: number;
  /** Consumo do ciclo em % (0–100) — alimenta a barra de progresso na tabela. */
  consumption: number;
};

export const AGENT_BREAKDOWN: AgentBreakdownRow[] = [
  {
    id: "aria",
    label: "Aria",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_01-1.png",
    role: "SDR · Aquisição",
    status: "Ativo",
    total: 156.32,
    consumption: 92,
  },
  {
    id: "atlas",
    label: "Atlas",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_05-1.png",
    role: "CS · Reativação",
    status: "Ativo",
    total: 124.9,
    consumption: 74,
  },
  {
    id: "nova",
    label: "Nova",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_08-1.png",
    role: "Outbound",
    status: "Pausado",
    total: 98.18,
    consumption: 61,
  },
  {
    id: "stella",
    label: "Stella",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_11-1.png",
    role: "Onboarding",
    status: "Treinando",
    total: 87.45,
    consumption: 48,
  },
  {
    id: "iris",
    label: "Íris",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_02-1.png",
    role: "SDR · Inbound",
    status: "Ativo",
    total: 76.02,
    consumption: 83,
  },
  {
    id: "theo",
    label: "Theo",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_03-1.png",
    role: "Qualificação",
    status: "Ativo",
    total: 68.54,
    consumption: 55,
  },
  {
    id: "luma",
    label: "Luma",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_04-1.png",
    role: "CS · Suporte",
    status: "Ativo",
    total: 59.83,
    consumption: 39,
  },
  {
    id: "kai",
    label: "Kai",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_06-1.png",
    role: "Follow-up",
    status: "Ativo",
    total: 52.17,
    consumption: 67,
  },
  {
    id: "vega",
    label: "Vega",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_07-1.png",
    role: "Cobrança",
    status: "Pausado",
    total: 47.6,
    consumption: 28,
  },
  {
    id: "milo",
    label: "Milo",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_09-1.png",
    role: "Agendamento",
    status: "Ativo",
    total: 43.92,
    consumption: 44,
  },
  {
    id: "sol",
    label: "Sol",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_10-1.png",
    role: "Pesquisa · NPS",
    status: "Treinando",
    total: 40.28,
    consumption: 31,
  },
  {
    id: "bria",
    label: "Bria",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_12-1.png",
    role: "Reengajamento",
    status: "Ativo",
    total: 36.42,
    consumption: 58,
  },
];

// Tipo do agente (coluna "Tipo" da tabela por agente) — rótulo amigável por id,
// pra não vazar jargão (SDR/CS) nem precisar tocar em cada linha do fixture.
export const AGENT_TYPE_BY_ID: Record<string, string> = {
  aria: "Prospecção",
  atlas: "Reativação",
  nova: "Prospecção",
  stella: "Onboarding",
  iris: "Qualificação",
  theo: "Qualificação",
  luma: "Suporte",
  kai: "Follow-up",
  vega: "Cobrança",
  milo: "Agendamento",
  sol: "Pesquisa",
  bria: "Reativação",
};

export function agentType(id: string): string {
  return AGENT_TYPE_BY_ID[id] ?? "Geral";
}

// Detalhamento do gasto de um agente, por tipo de cobrança (modal "Ver
// detalhes"). Os tokens seguem o canon atual — Knowledge / Brain / Skills, sem
// quebra input/output. A quantidade exibida é derivada do valor alocado ÷ taxa,
// então o detalhamento sempre fecha com o total da linha ("confere com a tabela").
export type AgentFeeLine = {
  label: string;
  qty: number;
  quantityFormat: "decimal" | "abbrev";
  unitNoun: string;
  /** Taxa unitária resumida (ex.: "R$ 0,12", "R$ 0,002/1K"). */
  rateLabel: string;
  total: number;
};

export type AgentFeeGroup = {
  id: string;
  label: string;
  icon: string;
  lines: AgentFeeLine[];
};

type FeeTemplate = {
  groupId: string;
  groupLabel: string;
  groupIcon: string;
  label: string;
  rate: number;
  /** Multiplica a quantidade derivada (1 pra unidades, 1000 pra "/1K tokens"). */
  unitDivisor: number;
  unitNoun: string;
  rateLabel: string;
  weight: number;
  quantityFormat: "decimal" | "abbrev";
};

const AGENT_FEE_TEMPLATE: FeeTemplate[] = [
  { groupId: "disparos", groupLabel: "Disparos no WhatsApp", groupIcon: "campaign", label: "Disparos no WhatsApp", rate: 0.12, unitDivisor: 1, unitNoun: "disparos", rateLabel: "R$ 0,12", weight: 0.34, quantityFormat: "decimal" },
  { groupId: "leads", groupLabel: "Leads ativos", groupIcon: "person_add", label: "Leads ativos", rate: 2.0, unitDivisor: 1, unitNoun: "leads", rateLabel: "R$ 2,00", weight: 0.16, quantityFormat: "decimal" },
  { groupId: "msgs", groupLabel: "Mensagens transacionadas", groupIcon: "forum", label: "Mensagens transacionadas", rate: 0.03, unitDivisor: 1, unitNoun: "mensagens", rateLabel: "R$ 0,03", weight: 0.22, quantityFormat: "decimal" },
  { groupId: "tokens", groupLabel: "Tokens", groupIcon: "neurology", label: "Knowledge", rate: 0.002, unitDivisor: 1000, unitNoun: "tokens", rateLabel: "R$ 0,002/1K", weight: 0.1, quantityFormat: "abbrev" },
  { groupId: "tokens", groupLabel: "Tokens", groupIcon: "neurology", label: "Brain", rate: 0.005, unitDivisor: 1000, unitNoun: "tokens", rateLabel: "R$ 0,005/1K", weight: 0.1, quantityFormat: "abbrev" },
  { groupId: "tokens", groupLabel: "Tokens", groupIcon: "neurology", label: "Skills", rate: 0.009, unitDivisor: 1000, unitNoun: "tokens", rateLabel: "R$ 0,009/1K", weight: 0.08, quantityFormat: "abbrev" },
];

/** Quebra o total (já escalado pelo período) de um agente nas macro-cobranças.
 *  Pesos variam por agente (determinístico), e a última linha absorve o
 *  arredondamento pra soma fechar exatamente com o total. */
export function getAgentFeeBreakdown(total: number, seed: number): AgentFeeGroup[] {
  const raw = AGENT_FEE_TEMPLATE.map(
    (t, i) => Math.max(0.02, t.weight + 0.4 * t.weight * Math.sin(seed * 1.3 + i * 2.1)),
  );
  const sum = raw.reduce((a, b) => a + b, 0);
  const lineTotals = raw.map((v) => Math.round(((total * v) / sum) * 100) / 100);
  const drift =
    Math.round((total - lineTotals.reduce((a, b) => a + b, 0)) * 100) / 100;
  lineTotals[lineTotals.length - 1] =
    Math.round((lineTotals[lineTotals.length - 1] + drift) * 100) / 100;

  const groups: AgentFeeGroup[] = [];
  AGENT_FEE_TEMPLATE.forEach((t, i) => {
    const lineTotal = lineTotals[i];
    const qty = (lineTotal / t.rate) * t.unitDivisor;
    const line: AgentFeeLine = {
      label: t.label,
      qty,
      quantityFormat: t.quantityFormat,
      unitNoun: t.unitNoun,
      rateLabel: t.rateLabel,
      total: lineTotal,
    };
    const existing = groups.find((g) => g.id === t.groupId);
    if (existing) existing.lines.push(line);
    else
      groups.push({
        id: t.groupId,
        label: t.groupLabel,
        icon: t.groupIcon,
        lines: [line],
      });
  });
  return groups;
}

export type InvoiceHistoryRow = {
  id: string;
  refMonth: string;
  description: string;
  dueAt: string;
  paidAt: string | null;
  gross: number;
  discount: number | null;
  discountCode: string | null;
  net: number;
  paymentMethod: string;
  status: "Paga" | "Em aberto" | "Em atraso" | "Falhou" | "Disputada";
};

export const INVOICE_HISTORY: InvoiceHistoryRow[] = [
  {
    id: "INV-2026-04-1234",
    refMonth: "Abr/26",
    description: "Custos variáveis",
    dueAt: "28/04/2026",
    paidAt: null,
    gross: 1253.04,
    discount: 250.61,
    discountCode: "BF2025",
    net: 1002.43,
    paymentMethod: "Visa •••• 3012",
    status: "Em atraso",
  },
  {
    id: "INV-2026-04-PLN",
    refMonth: "Abr/26",
    description: "Plano Enterprise",
    dueAt: "28/04/2026",
    paidAt: null,
    gross: 2497.98,
    discount: null,
    discountCode: null,
    net: 2497.98,
    paymentMethod: "Visa •••• 3012",
    status: "Falhou",
  },
  {
    id: "INV-2026-03-PLN",
    refMonth: "Mar/26",
    description: "Plano Enterprise",
    dueAt: "28/03/2026",
    paidAt: "28/03/2026",
    gross: 2497.98,
    discount: null,
    discountCode: null,
    net: 2497.98,
    paymentMethod: "Visa •••• 3012",
    status: "Paga",
  },
  {
    id: "INV-2026-03-0987",
    refMonth: "Mar/26",
    description: "Custos variáveis",
    dueAt: "25/03/2026",
    paidAt: null,
    gross: 5268.49,
    discount: null,
    discountCode: null,
    net: 5268.49,
    paymentMethod: "Boleto",
    status: "Falhou",
  },
  {
    id: "INV-2026-02-PLN",
    refMonth: "Fev/26",
    description: "Plano Enterprise",
    dueAt: "28/02/2026",
    paidAt: "28/02/2026",
    gross: 2497.98,
    discount: null,
    discountCode: null,
    net: 2497.98,
    paymentMethod: "Visa •••• 8888",
    status: "Paga",
  },
  {
    id: "INV-2026-01-PLN",
    refMonth: "Jan/26",
    description: "Plano Enterprise",
    dueAt: "28/01/2026",
    paidAt: "28/01/2026",
    gross: 2497.98,
    discount: null,
    discountCode: null,
    net: 2497.98,
    paymentMethod: "Visa •••• 8888",
    status: "Paga",
  },
];

// ---- Detalhamento: Usado × Cobrado ----
//
// "Usado no período" = o que o cliente consumiu (taxas da Aswork/WC + valor
// aproximado do Meta, cobrado direto pela Meta). "Valor atribuído ao provedor
// de pagamento no período" (antigo "cobrado") = o que entrou na fatura via
// Stripe/AWS — só a parte da Aswork, sujeita a atrasos de processamento. A
// diferença é normal: nada se perde e nada é cobrado duas vezes.

export const DETALHAMENTO_DAYS = 15; // 01–15/05 (ciclo atual, até hoje)

// Total usado pela Aswork (WhatsApp Cloud + IA + leads + operacional).
export const USED_WC_TOTAL = 712.1;
// Valor aproximado dos disparos/conversas cobrados DIRETO pela Meta.
export const USED_META_TOTAL = 179.53;
// Usado total no período (bate com o acumulado do ciclo).
export const USED_TOTAL = Math.round((USED_WC_TOTAL + USED_META_TOTAL) * 100) / 100;
// Valor atribuído ao provedor de pagamento no período (entrou na fatura).
// Inclui lançamentos retidos do ciclo anterior; exclui o que ficou pra próxima.
export const CHARGED_TOTAL = 780.5;
// Diferença = cobrado − usado(WC). O Meta não entra aqui (é cobrado fora).
export const PERIOD_DIFF = Math.round((CHARGED_TOTAL - USED_WC_TOTAL) * 100) / 100;
export const PERIOD_DIFF_REASON =
  "R$ 121,10 de lançamentos do ciclo anterior entraram nesta fatura; R$ 52,70 do fim deste período entram na próxima.";

/** Distribui um total por N dias com jitter determinístico (soma exata). */
function spreadDaily(total: number, n: number, seed: number): number[] {
  let s = seed;
  const raw: number[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    raw.push(s / 233280 + 0.35);
  }
  const rawTotal = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => Math.round((v / rawTotal) * total * 100) / 100);
}

export type UsedDay = { label: string; wc: number; meta: number };

function ddmmFromIndex(index: number): string {
  const d = new Date(2026, 4, index + 1); // maio/2026
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Usado por dia, separado em taxas da Aswork (WC) e valor aproximado do Meta. */
export const USED_BY_DAY: UsedDay[] = (() => {
  const wc = spreadDaily(USED_WC_TOTAL, DETALHAMENTO_DAYS, 5);
  const meta = spreadDaily(USED_META_TOTAL, DETALHAMENTO_DAYS, 9);
  return wc.map((v, i) => ({ label: ddmmFromIndex(i), wc: v, meta: meta[i] }));
})();

/** Valor atribuído ao provedor por dia (com atrasos de processamento). */
export const CHARGED_BY_DAY: { label: string; value: number }[] = (() => {
  const v = spreadDaily(CHARGED_TOTAL, DETALHAMENTO_DAYS, 3);
  return v.map((val, i) => ({ label: ddmmFromIndex(i), value: val }));
})();

export type ReconDay = { wc: number; meta: number; charged: number };

/** Série "usado × cobrado" por bucket, escalada pro período ativo. O baseline
 * (USED_*_TOTAL / CHARGED_TOTAL) casa com "este mês", então outros períodos
 * partem dele — assim o gráfico de reconciliação acompanha o controle de tempo
 * junto com os demais widgets do dashboard. */
export function getUsedChargedSeries(bars: number, scale: number): ReconDay[] {
  const n = Math.max(1, bars);
  const wc = spreadDaily(USED_WC_TOTAL * scale, n, 5);
  const meta = spreadDaily(USED_META_TOTAL * scale, n, 9);
  const charged = spreadDaily(CHARGED_TOTAL * scale, n, 3);
  return wc.map((v, i) => ({ wc: v, meta: meta[i], charged: charged[i] }));
}

/** Fator de escala do usado×cobrado, relativo ao baseline "este mês". */
export function reconScaleForPeriod(period: SpendingPeriod): number {
  return PERIOD_TOTAL[period] / PERIOD_TOTAL["this-month"];
}

export function reconScaleForCustom(dayCount: number): number {
  const days = Math.max(1, Math.min(dayCount, 90));
  return customPeriodTotal(days) / PERIOD_TOTAL["this-month"];
}

// Resumo do período pros 4 cards de destaque do dashboard de Consumo e custos.
// Sem "Tributos" (fora do escopo do dashboard). É period-aware: recebe o
// subtotal já apurado pro período/filtro ativo e devolve as 4 linhas coerentes
// (subtotal − créditos + ajustes = total). A proporção de créditos espelha o
// ciclo atual (R$ 125,41 de crédito sobre R$ 891,63 de uso).
export const PERIOD_CREDIT_RATIO = 0.1407;

export type PeriodSummary = {
  /** Tudo que foi consumido no período, antes de créditos e ajustes. */
  subtotal: number;
  /** Vouchers e cupons — valor absoluto (a UI exibe com sinal de menos). */
  credits: number;
  /** Estornos e correções reconhecidos no período. */
  adjustments: number;
  /** subtotal − créditos + ajustes. */
  total: number;
};

export function getPeriodSummary(subtotal: number): PeriodSummary {
  const credits = Math.round(subtotal * PERIOD_CREDIT_RATIO * 100) / 100;
  // Ajuste de exemplo (estorno) pra ilustrar o card "Ajustes" e o sinal +/−.
  // Em produção vem do backend e costuma ser 0.
  const adjustments = -24.9;
  const total = Math.round((subtotal - credits + adjustments) * 100) / 100;
  return { subtotal, credits, adjustments, total };
}

// DRE do período — referente ao gráfico "Usado no período". Cada linha tem
// tooltip própria. Subtotal − descontos + tributos = total.
export type DRELineKind = "subtotal" | "subtract" | "add" | "total";
export type DRELine = {
  id: string;
  label: string;
  value: number;
  kind: DRELineKind;
  tooltip: string;
};

export const DRE_SUMMARY: DRELine[] = [
  {
    id: "subtotal",
    label: "Subtotal de uso",
    value: 891.63,
    kind: "subtotal",
    tooltip:
      "Soma de tudo que foi consumido no período, antes de créditos, ajustes e tributos. Refere-se ao gráfico “Usado no período”.",
  },
  {
    id: "descontos",
    label: "Descontos e créditos",
    value: -250.61,
    kind: "subtract",
    tooltip:
      "Vouchers e cupons aplicados no período. Incidem só sobre valores cobrados pela Aswork — não abatem os valores aproximados do Meta.",
  },
  {
    id: "ajustes",
    label: "Ajustes",
    value: 0,
    kind: "add",
    tooltip:
      "Correções de lançamentos retidos por falha temporária ou estornos reconhecidos no período.",
  },
  {
    id: "tributos",
    label: "Tributos",
    value: 33.41,
    kind: "add",
    tooltip:
      "Impostos sobre serviço aplicáveis (ISS/PIS/COFINS) destacados na nota fiscal.",
  },
  {
    id: "total",
    label: "Total no período",
    value: 674.43,
    kind: "total",
    tooltip:
      "Subtotal de uso − descontos + tributos. É o valor atribuído ao provedor de pagamento no período.",
  },
];

// ---- Métodos de pagamento ----

export type CardBrand = "Visa" | "Mastercard" | "Amex";

export type PaymentMethod = {
  id: string;
  brand: CardBrand;
  last4: string;
  /** MM/AAAA */
  expiresAt: string;
  isDefault: boolean;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm-visa-3012",
    brand: "Visa",
    last4: "3012",
    expiresAt: "08/2028",
    isDefault: true,
  },
  {
    id: "pm-mc-8888",
    brand: "Mastercard",
    last4: "8888",
    expiresAt: "04/2027",
    isDefault: false,
  },
  {
    id: "pm-amex-1004",
    brand: "Amex",
    last4: "1004",
    expiresAt: "11/2026",
    isDefault: false,
  },
];

export const BR_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

// ---- Saldo de créditos ----

export const CREDITS_KPIS = {
  // Lifetime: tudo que vouchers + cupons já abateram.
  totalSaved: 3412.3,
  // Saldo restante dos vouchers ATIVOS (não conta pendente/pausado).
  availableDiscount: 1890.0,
  activeVouchers: 2,
};

// Status do voucher (5 estados):
// - Ativo: vigente, abatendo o consumo
// - Pendente: ainda não entrou em vigência (effectiveAt no futuro)
// - Pausado: suspenso pela equipe de conta
// - Esgotado: saldo zerado por consumo (100% usado) — histórico
// - Vencido: passou da validade sem esgotar — histórico
export type VoucherStatus =
  | "Ativo"
  | "Pendente"
  | "Pausado"
  | "Esgotado"
  | "Vencido";

/** Uso do voucher numa fatura — alimenta o modal de detalhes. */
export type VoucherConsumption = {
  invoiceId: string;
  date: string; // dd/mm/aaaa
  amount: number;
};

export type VoucherRow = {
  id: string;
  description: string;
  applicableTo: string;
  status: VoucherStatus;
  total: number;
  consumed: number;
  /** Ativa a partir de (Pendente até lá). */
  effectiveAt?: string;
  expiresAt: string;
  /** Consumo acima do previsto — risco de esgotar antes do plano. */
  acceleratedConsumption?: boolean;
  /** Faturas que consumiram este voucher. */
  consumptions?: VoucherConsumption[];
};

export const VOUCHERS: VoucherRow[] = [
  {
    id: "v-q2",
    description: "Crédito Q2 — bônus anual",
    applicableTo: "Disparos WhatsApp + Tokens Knowledge",
    status: "Ativo",
    total: 1000,
    consumed: 250,
    expiresAt: "30/06/2026",
    consumptions: [
      { invoiceId: "INV-2026-04-1234", date: "10/05/2026", amount: 250 },
    ],
  },
  {
    id: "v-bf",
    description: "Bônus Black Friday Setup",
    applicableTo: "Todas as taxas",
    status: "Ativo",
    total: 3000,
    consumed: 1860,
    expiresAt: "15/06/2026",
    acceleratedConsumption: true,
    consumptions: [
      { invoiceId: "INV-2026-04-1234", date: "10/05/2026", amount: 1100 },
      { invoiceId: "INV-2026-03-0987", date: "12/04/2026", amount: 760 },
    ],
  },
  {
    id: "v-q3",
    description: "Crédito de boas-vindas Q3",
    applicableTo: "Todas as taxas",
    status: "Pendente",
    total: 500,
    consumed: 0,
    effectiveAt: "22/05/2026",
    expiresAt: "30/09/2026",
  },
  {
    id: "v-onb",
    description: "Cortesia de onboarding",
    applicableTo: "Tokens Knowledge",
    status: "Esgotado",
    total: 500,
    consumed: 500,
    expiresAt: "31/12/2026",
    consumptions: [
      { invoiceId: "INV-2026-02-PLN", date: "28/02/2026", amount: 500 },
    ],
  },
  {
    id: "v-2025",
    description: "Bônus 2025",
    applicableTo: "Todas as taxas",
    status: "Vencido",
    total: 800,
    consumed: 320,
    expiresAt: "31/03/2026",
    consumptions: [
      { invoiceId: "INV-2026-01-PLN", date: "28/01/2026", amount: 320 },
    ],
  },
  {
    id: "v-ret",
    description: "Crédito de retenção",
    applicableTo: "Disparos WhatsApp",
    status: "Pausado",
    total: 1200,
    consumed: 0,
    expiresAt: "31/12/2026",
  },
];

/** Cor do pill por status de voucher. Pendente é azul (entra em breve);
 *  Esgotado/Vencido são neutros (histórico, encerrados). */
export function voucherStatusVariant(status: VoucherStatus): AwPillVariant {
  switch (status) {
    case "Ativo":
      return "live";
    case "Pendente":
      return "info";
    case "Pausado":
      return "warning";
    case "Esgotado":
      return "neutral";
    case "Vencido":
      return "draft";
  }
}

export type CouponRow = {
  id: string;
  code: string;
  description: string;
  discount: number;
  application: string;
  invoiceId: string;
  appliedAt: string;
};

export const COUPONS_APPLIED: CouponRow[] = [
  {
    id: "c-onboard",
    code: "ONBOARD",
    description: "Bônus onboarding",
    discount: 482.3,
    application: "Uma única vez",
    invoiceId: "INV-2026-01-PLN",
    appliedAt: "11/01/2026",
  },
];

// ---- Auditoria ----

export type AuditExecutor = "Aswork" | "Cliente";
export type AuditEventType = "Plano" | "Cartão" | "Fatura" | "Cupom" | "Voucher";

export type AuditEvent = {
  id: string;
  date: string; // dd/mm/aaaa
  time: string; // HH:mm
  executor: AuditExecutor;
  actor: string;
  actorAvatar?: string;
  type: AuditEventType;
  action: string;
  meta?: string;
};

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "a-1",
    date: "11/05/2026",
    time: "14:32",
    executor: "Aswork",
    actor: "Bruno Costa",
    actorAvatar: "/assets/ui-faces/male-1.jpg",
    type: "Plano",
    action: "Plano alterado",
    meta: "Pro → Enterprise · R$ 1.997 → R$ 2.497,98",
  },
  {
    id: "a-2",
    date: "11/05/2026",
    time: "13:55",
    executor: "Cliente",
    actor: "Felipe Rezende",
    actorAvatar: "/assets/ui-faces/male-2.jpg",
    type: "Cartão",
    action: "Cartão padrão trocado",
    meta: "•••• 8888 → •••• 3012 · 200.4.1.5",
  },
  {
    id: "a-3",
    date: "11/05/2026",
    time: "11:22",
    executor: "Cliente",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    type: "Fatura",
    action: "Fatura paga",
    meta: "INV-2026-04-1234 · R$ 1.253,04",
  },
  {
    id: "a-4",
    date: "11/05/2026",
    time: "09:10",
    executor: "Cliente",
    actor: "Maria R.",
    actorAvatar: "/assets/ui-faces/female-2.jpg",
    type: "Cupom",
    action: "Cupom aplicado",
    meta: "BF2025 · 20% de desconto na próxima fatura",
  },
  {
    id: "a-5",
    date: "10/05/2026",
    time: "18:40",
    executor: "Cliente",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    type: "Voucher",
    action: "Voucher consumido",
    meta: "Crédito Q2 · R$ 250 debitados · saldo restante R$ 750",
  },
  {
    id: "a-6",
    date: "10/05/2026",
    time: "16:00",
    executor: "Aswork",
    actor: "Ana A.",
    actorAvatar: "/assets/ui-faces/female-1.jpg",
    type: "Fatura",
    action: "Cobrança parcial ajustada",
    meta: "R$ 3.000 → R$ 5.229,50",
  },
  {
    id: "a-7",
    date: "10/05/2026",
    time: "14:15",
    executor: "Cliente",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    type: "Fatura",
    action: "Fatura emitida",
    meta: "INV-2026-05-0042 · rascunho → em aberto",
  },
  {
    id: "a-8",
    date: "10/05/2026",
    time: "12:05",
    executor: "Cliente",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    type: "Voucher",
    action: "Voucher esgotando rápido",
    meta: "Bônus Black Friday Setup · 2,3× acima do previsto",
  },
  {
    id: "a-9",
    date: "09/05/2026",
    time: "10:30",
    executor: "Aswork",
    actor: "Bruno Costa",
    actorAvatar: "/assets/ui-faces/male-1.jpg",
    type: "Voucher",
    action: "Voucher emitido",
    meta: "Crédito Q2 · R$ 1.000 · vigente até 30/06",
  },
  {
    id: "a-10",
    date: "22/03/2026",
    time: "16:40",
    executor: "Cliente",
    actor: "Rafael Lima",
    actorAvatar: "/assets/ui-faces/male-3.jpg",
    type: "Fatura",
    action: "Disputa aceita",
    meta: "INV-2026-03-0987 · favorável à Aswork",
  },
];

// ---- helpers ----

export function brl(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
