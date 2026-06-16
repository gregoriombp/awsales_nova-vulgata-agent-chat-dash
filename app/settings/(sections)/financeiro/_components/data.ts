// Fixtures pra Settings → Financeiro. Substituir por dados reais quando o
// backend expor endpoints. Valores em BRL; datas em formato pt-BR.

export const CURRENT_PLAN = {
  name: "Plano Enterprise",
  status: "Ativo" as const,
  monthly: 2497.98,
  nextChargeAt: "28/05/2026",
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
    { id: "disparos", label: "Disparos WhatsApp", colorVar: "var(--aw-blue-500)" },
    { id: "leads", label: "Leads convertidos", colorVar: "var(--aw-emerald-500)" },
    { id: "mensagens", label: "Mensagens transacionadas", colorVar: "var(--aw-amber-500)" },
    { id: "tokens", label: "Tokens · Knowledge", colorVar: "var(--aw-purple-500)" },
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

export type ServiceBreakdownRow = {
  id: string;
  label: string;
  icon: string;
  /** Quantidade base no período "Este mês". -1 sinaliza linha agregada sem unidade. */
  quantity: number;
  /** Como apresentar a quantidade — "decimal" (1.245), "abbrev" (2,1M / 780K) ou "lump" (—). */
  quantityFormat: "decimal" | "abbrev" | "lump";
  unitPriceLabel: string;
  total: number;
};

export const SERVICE_BREAKDOWN: ServiceBreakdownRow[] = [
  { id: "disp", label: "Disparos WhatsApp", icon: "campaign", quantity: 1245, quantityFormat: "decimal", unitPriceLabel: "R$ 0,12", total: 149.4 },
  { id: "leads", label: "Leads convertidos", icon: "person_add", quantity: 38, quantityFormat: "decimal", unitPriceLabel: "R$ 2,00", total: 76.0 },
  { id: "msgs", label: "Mensagens transacionadas", icon: "forum", quantity: 3872, quantityFormat: "decimal", unitPriceLabel: "R$ 0,03", total: 116.16 },
  { id: "tokens-in", label: "Tokens · Knowledge Input", icon: "memory", quantity: 2_100_000, quantityFormat: "abbrev", unitPriceLabel: "R$ 0,002 / 1K", total: 4.2 },
  { id: "tokens-out", label: "Tokens · Knowledge Output", icon: "memory", quantity: 780_000, quantityFormat: "abbrev", unitPriceLabel: "R$ 0,008 / 1K", total: 6.24 },
  { id: "outros", label: "Outros serviços agregados", icon: "more_horiz", quantity: -1, quantityFormat: "lump", unitPriceLabel: "—", total: 539.63 },
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
};

export const AGENT_BREAKDOWN: AgentBreakdownRow[] = [
  {
    id: "aria",
    label: "Aria",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_01-1.png",
    role: "SDR · Aquisição",
    status: "Ativo",
    total: 156.32,
  },
  {
    id: "atlas",
    label: "Atlas",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_05-1.png",
    role: "CS · Reativação",
    status: "Ativo",
    total: 124.9,
  },
  {
    id: "nova",
    label: "Nova",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_08-1.png",
    role: "Outbound",
    status: "Pausado",
    total: 98.18,
  },
  {
    id: "stella",
    label: "Stella",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_11-1.png",
    role: "Onboarding",
    status: "Treinando",
    total: 87.45,
  },
  {
    id: "iris",
    label: "Íris",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_02-1.png",
    role: "SDR · Inbound",
    status: "Ativo",
    total: 76.02,
  },
  {
    id: "theo",
    label: "Theo",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_03-1.png",
    role: "Qualificação",
    status: "Ativo",
    total: 68.54,
  },
  {
    id: "luma",
    label: "Luma",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_04-1.png",
    role: "CS · Suporte",
    status: "Ativo",
    total: 59.83,
  },
  {
    id: "kai",
    label: "Kai",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_06-1.png",
    role: "Follow-up",
    status: "Ativo",
    total: 52.17,
  },
  {
    id: "vega",
    label: "Vega",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_07-1.png",
    role: "Cobrança",
    status: "Pausado",
    total: 47.6,
  },
  {
    id: "milo",
    label: "Milo",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_09-1.png",
    role: "Agendamento",
    status: "Ativo",
    total: 43.92,
  },
  {
    id: "sol",
    label: "Sol",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_10-1.png",
    role: "Pesquisa · NPS",
    status: "Treinando",
    total: 40.28,
  },
  {
    id: "bria",
    label: "Bria",
    avatar: "/assets/agent_imgs/orbs/orb_model-a_12-1.png",
    role: "Reengajamento",
    status: "Ativo",
    total: 36.42,
  },
];

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
  totalSaved: 482.3,
  availableDiscount: 1250.0,
  activeVouchers: 2,
};

export type VoucherRow = {
  id: string;
  description: string;
  applicableTo: string;
  status: "Ativo" | "Expirado";
  total: number;
  consumed: number;
  expiresAt: string;
  /** Quando o consumo está acima do previsto e há risco de expirar antes do plano. */
  acceleratedConsumption?: boolean;
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
  },
  {
    id: "v-2025",
    description: "Bônus 2025",
    applicableTo: "Todas as taxas",
    status: "Ativo",
    total: 500,
    consumed: 0,
    expiresAt: "31/12/2026",
  },
];

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
    meta: "BF2025 · 20% off próxima fatura",
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
    action: "Cobrança parcial reconfigurada",
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
    meta: "INV-2026-05-0042 · status DRAFT → OPEN",
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
