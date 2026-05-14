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

export const OVERVIEW_KPIS = {
  partialChargeAt: 5229.5,
  accumulated: 891.63,
  accumulatedPct: 17, // % até a próxima cobrança parcial
  monthSavings: 132.4, // economia com créditos / cupons
};

// Gastos variáveis — agrupados por dia (1..31) e por categoria.
// 4 categorias por agrupamento; cada valor é em BRL.
export type SpendingGrouping = "service" | "campaign";

export type SpendingCategory = {
  id: string;
  label: string;
  /** Token CSS var aplicado em background/fill — sem cor hardcoded. */
  colorVar: string;
};

export const SPENDING_CATEGORIES: Record<SpendingGrouping, SpendingCategory[]> = {
  service: [
    { id: "disparos", label: "Disparos WhatsApp", colorVar: "var(--aw-blue-500)" },
    { id: "leads", label: "Leads convertidos", colorVar: "var(--aw-emerald-500)" },
    { id: "mensagens", label: "Mensagens transacionadas", colorVar: "var(--aw-amber-500)" },
    { id: "tokens", label: "Tokens · Knowledge", colorVar: "var(--aw-purple-500)" },
  ],
  campaign: [
    { id: "bf", label: "Black Friday Lead Magnet", colorVar: "var(--aw-blue-500)" },
    { id: "crm", label: "Recuperação CRM Trial", colorVar: "var(--aw-emerald-500)" },
    { id: "sdr", label: "SDR Outbound Pro", colorVar: "var(--aw-amber-500)" },
    { id: "onb", label: "Onboarding Pós-Venda", colorVar: "var(--aw-purple-500)" },
  ],
};

// 31 dias × 4 valores por agrupamento. Os totais somam ~R$ 891,63 (acumulado).
function genDaily(seed: number, n = 31): number[][] {
  // pseudoaleatório determinístico só pra fixture parecer real
  const out: number[][] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    const v: number[] = [];
    for (let c = 0; c < 4; c++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      v.push(Math.round((r * 14 + 2) * 100) / 100);
    }
    out.push(v);
  }
  return out;
}

export const DAILY_SPENDING: Record<SpendingGrouping, number[][]> = {
  service: genDaily(7),
  campaign: genDaily(13),
};

export type ServiceBreakdownRow = {
  id: string;
  label: string;
  icon: string;
  quantity: string;
  unitPrice: string;
  total: number;
};

export const SERVICE_BREAKDOWN: ServiceBreakdownRow[] = [
  { id: "disp", label: "Disparos WhatsApp", icon: "campaign", quantity: "1.245", unitPrice: "R$ 0,12", total: 149.4 },
  { id: "leads", label: "Leads convertidos", icon: "person_add", quantity: "38", unitPrice: "R$ 2,00", total: 76.0 },
  { id: "msgs", label: "Mensagens transacionadas", icon: "forum", quantity: "3.872", unitPrice: "R$ 0,03", total: 116.16 },
  { id: "tokens-in", label: "Tokens · Knowledge Input", icon: "memory", quantity: "2.1M", unitPrice: "R$ 0,002 / 1K", total: 4.2 },
  { id: "tokens-out", label: "Tokens · Knowledge Output", icon: "memory", quantity: "780K", unitPrice: "R$ 0,008 / 1K", total: 6.24 },
  { id: "outros", label: "Outros serviços agregados", icon: "more_horiz", quantity: "—", unitPrice: "—", total: 539.63 },
];

export type CampaignBreakdownRow = {
  id: string;
  label: string;
  type: string;
  status: "Ativa" | "Pausada" | "Encerrada";
  total: number;
};

export const CAMPAIGN_BREAKDOWN: CampaignBreakdownRow[] = [
  { id: "bf", label: "Black Friday Lead Magnet", type: "Aquisição", status: "Ativa", total: 312.45 },
  { id: "crm", label: "Recuperação CRM Trial", type: "Reativação", status: "Ativa", total: 248.9 },
  { id: "sdr", label: "SDR Outbound Pro", type: "Outbound", status: "Pausada", total: 198.18 },
  { id: "onb", label: "Onboarding Pós-Venda", type: "Retenção", status: "Ativa", total: 132.1 },
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
  status: "Paga" | "Em aberto" | "Falhou" | "Disputada";
};

export const INVOICE_HISTORY: InvoiceHistoryRow[] = [
  {
    id: "INV-2026-04-1234",
    refMonth: "Abr/26",
    description: "Custos variáveis",
    dueAt: "28/04/2026",
    paidAt: "28/04/2026",
    gross: 1253.04,
    discount: 250.61,
    discountCode: "BF2025",
    net: 1002.43,
    paymentMethod: "Visa •••• 3012",
    status: "Paga",
  },
  {
    id: "INV-2026-04-PLN",
    refMonth: "Abr/26",
    description: "Plano",
    dueAt: "28/04/2026",
    paidAt: "28/04/2026",
    gross: 2497.98,
    discount: null,
    discountCode: null,
    net: 2497.98,
    paymentMethod: "Visa •••• 3012",
    status: "Paga",
  },
  {
    id: "INV-2026-03-PLN",
    refMonth: "Mar/26",
    description: "Plano",
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
    description: "Plano",
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
    description: "Plano",
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
    id: "v-bf",
    description: "Bônus Black Friday Setup",
    applicableTo: "Todas as taxas",
    status: "Ativo",
    total: 3000,
    consumed: 1860,
    expiresAt: "15/06/2026",
    acceleratedConsumption: true,
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
    id: "c-bf",
    code: "BF2025",
    description: "Black Friday 2025",
    discount: 250.61,
    application: "Em 3 ciclos",
    invoiceId: "INV-2026-04-1234",
    appliedAt: "28/04/2026",
  },
  {
    id: "c-onboard",
    code: "ONBOARD",
    description: "Bônus onboarding",
    discount: 482.3,
    application: "Uma única vez",
    invoiceId: "INV-2026-01-1001",
    appliedAt: "11/01/2026",
  },
];

// ---- Auditoria ----

export type AuditExecutor = "AwSales" | "Cliente" | "Sistema";
export type AuditEventType = "Plano" | "Cartão" | "Fatura" | "Cupom" | "Voucher";

export type AuditEvent = {
  id: string;
  date: string; // dd/mm/aaaa
  time: string; // HH:mm
  executor: AuditExecutor;
  actor: string;
  type: AuditEventType;
  action: string;
  meta?: string;
};

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "a-1",
    date: "11/05/2026",
    time: "14:32",
    executor: "AwSales",
    actor: "Bruno Costa",
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
    type: "Cartão",
    action: "Cartão padrão trocado",
    meta: "•••• 8888 → •••• 3012 · 200.4.1.5",
  },
  {
    id: "a-3",
    date: "11/05/2026",
    time: "11:22",
    executor: "Sistema",
    actor: "webhook Stripe",
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
    type: "Cupom",
    action: "Cupom aplicado",
    meta: "BF2025 · 20% off próxima fatura",
  },
  {
    id: "a-5",
    date: "10/05/2026",
    time: "18:40",
    executor: "Sistema",
    actor: "webhook Stripe",
    type: "Voucher",
    action: "Voucher consumido",
    meta: "Crédito Q2 · R$ 250 debitados · saldo restante R$ 750",
  },
  {
    id: "a-6",
    date: "10/05/2026",
    time: "16:00",
    executor: "AwSales",
    actor: "Ana A.",
    type: "Fatura",
    action: "Cobrança parcial reconfigurada",
    meta: "R$ 3.000 → R$ 5.229,50",
  },
  {
    id: "a-7",
    date: "10/05/2026",
    time: "14:15",
    executor: "Sistema",
    actor: "webhook Stripe",
    type: "Fatura",
    action: "Fatura emitida",
    meta: "INV-2026-05-0042 · status DRAFT → OPEN",
  },
  {
    id: "a-8",
    date: "10/05/2026",
    time: "12:05",
    executor: "Sistema",
    actor: "webhook Stripe",
    type: "Voucher",
    action: "Voucher esgotando rápido",
    meta: "Bônus Black Friday Setup · 2,3× acima do previsto",
  },
  {
    id: "a-9",
    date: "09/05/2026",
    time: "10:30",
    executor: "AwSales",
    actor: "Bruno Costa",
    type: "Voucher",
    action: "Voucher emitido",
    meta: "Crédito Q2 · R$ 1.000 · vigente até 30/06",
  },
  {
    id: "a-10",
    date: "22/03/2026",
    time: "16:40",
    executor: "Sistema",
    actor: "webhook Stripe",
    type: "Fatura",
    action: "Disputa aceita",
    meta: "INV-2026-03-0987 · favorável à AwSales",
  },
];

// ---- helpers ----

export function brl(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
