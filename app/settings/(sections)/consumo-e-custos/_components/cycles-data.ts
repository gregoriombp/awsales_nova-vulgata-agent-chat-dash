import {
  INVOICE_HISTORY,
  type InvoiceHistoryRow,
} from "../../financeiro/_components/data";

/* ----------------------------------------------------------------------------
 * Ciclos de cobrança — a fixture da aba "Por ciclos".
 *
 * Um ciclo = um mês-calendário de faturamento: as faturas emitidas (fixa do
 * plano + uso variável), o extrato estilo "fatura Google" (saldo que veio do
 * mês anterior → cobranças → créditos → ajustes → pagamentos → saldo final) e
 * a quebra do variável por fee.
 *
 * Regras que a UI depende:
 * - Os ciclos são ENCADEADOS: carryOut de um mês === carryIn do seguinte.
 * - Os valores conciliam com INVOICE_HISTORY (gross/net/status/pagamentos).
 * - A fatura NUNCA contempla o Meta: `variableByFee` traz só o que a Aswork
 *   fatura (inclusive o spread de disparos pago à Aswork); o uso aproximado do
 *   Meta fica em `metaUsageApprox`, sempre exibido com o disclaimer.
 * - O ciclo VIGENTE (Mai/26) espelha os números da Visão geral deste mês:
 *   uso 891,60 (712,10 Aswork + 179,50 Meta aprox.), créditos 125,45 e
 *   ajustes −24,90 — pra as duas abas conciliarem na frente do cliente.
 * - Âncora temporal do protótipo: 19/05/2026 (CHART_ANCHOR do consumo — a
 *   OVERVIEW_ANCHOR do financeiro é 15/05; os ciclos seguem a do consumo).
 * ------------------------------------------------------------------------- */

export type FeeId =
  | "leads"
  | "tokens"
  | "mensagens"
  | "disparos"
  | "telefone"
  | "outros";

/** Fees (taxas) na linguagem da fatura — cores das categorias de serviço da
 *  Visão geral, pra as duas abas falarem a mesma língua visual. "Disparos"
 *  aqui é só o spread pago à Aswork (o resto é Meta, fora da fatura). */
export const FEES: { id: FeeId; label: string; colorVar: string; icon: string }[] = [
  { id: "leads", label: "Leads ativos", colorVar: "var(--aw-emerald-500)", icon: "person_check" },
  { id: "tokens", label: "Tokens", colorVar: "var(--aw-purple-500)", icon: "memory" },
  { id: "mensagens", label: "Mensagens transacionadas", colorVar: "var(--aw-amber-500)", icon: "forum" },
  { id: "disparos", label: "Disparos · spread Aswork", colorVar: "var(--aw-blue-500)", icon: "send" },
  { id: "telefone", label: "Telefone", colorVar: "var(--aw-teal-500)", icon: "call" },
  { id: "outros", label: "Outros", colorVar: "var(--aw-gray-400)", icon: "more_horiz" },
];

export type CyclePayment = {
  /** "28/03/2026 · 16:40" — data e hora do pagamento confirmado. */
  at: string;
  amount: number;
  method: string;
  /** Id da fatura quitada por este pagamento. */
  invoiceId: string;
};

export type BillingCycle = {
  /** "2026-04" — id estável (âncora de URL `?ciclo=`). */
  id: string;
  /** "Abril de 2026" */
  label: string;
  /** "Abr/26" — casa com o refMonth das faturas. */
  refMonth: string;
  /** Início/fim do ciclo, com hora (pedido do Greg: deixar claro o recorte). */
  startsAt: string;
  endsAt: string;
  /** true = ciclo em andamento (fatura ainda não fechada). */
  open?: boolean;
  /** Faturas do ciclo (refs em INVOICE_HISTORY). */
  invoiceIds: string[];
  /** Plano fixo do ciclo (bruto). */
  fixed: number;
  /** Uso variável FATURADO pela Aswork no ciclo (bruto), quebrado por fee. */
  variableByFee: Record<FeeId, number>;
  /** Uso aproximado cobrado DIRETO pela Meta no ciclo — fora da fatura. */
  metaUsageApprox: number;
  /** Créditos e cupons aplicados no ciclo (abatem). */
  credits: number;
  /** Ajustes do ciclo: negativo abate, positivo soma. */
  adjustments: number;
  /** Pagamentos confirmados dentro do ciclo. */
  payments: CyclePayment[];
  /** Saldo que veio do ciclo anterior (= carryOut do anterior). */
  carryIn: number;
  /** Saldo que rola pro próximo ciclo (derivado — ver cycleBalance). */
  carryOut: number;
};

export function cycleVariableTotal(c: BillingCycle): number {
  return round2(
    (Object.values(c.variableByFee) as number[]).reduce((s, v) => s + v, 0),
  );
}

/** Total pago dentro do ciclo. */
export function cyclePaymentsTotal(c: BillingCycle): number {
  return round2(c.payments.reduce((s, p) => s + p.amount, 0));
}

/** Confere a conta do extrato: carryIn + fixo + variável − créditos + ajustes
 *  − pagamentos. DEVE bater com carryOut (validado em dev). */
export function cycleBalance(c: BillingCycle): number {
  return round2(
    c.carryIn +
      c.fixed +
      cycleVariableTotal(c) -
      c.credits +
      c.adjustments -
      cyclePaymentsTotal(c),
  );
}

export function cycleInvoices(c: BillingCycle): InvoiceHistoryRow[] {
  return c.invoiceIds
    .map((id) => INVOICE_HISTORY.find((r) => r.id === id))
    .filter((r): r is InvoiceHistoryRow => Boolean(r));
}

/** Pior status entre as faturas do ciclo — vira a pill do cabeçalho. */
const STATUS_SEVERITY: InvoiceHistoryRow["status"][] = [
  "Falha no Pagamento",
  "Em atraso",
  "Disputada",
  "Em aberto",
  "Paga",
];
export function cycleWorstStatus(
  c: BillingCycle,
): InvoiceHistoryRow["status"] | null {
  const statuses = cycleInvoices(c).map((r) => r.status);
  if (!statuses.length) return null;
  for (const s of STATUS_SEVERITY) if (statuses.includes(s)) return s;
  return statuses[0];
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Reparte um total pelos fees numa proporção fixa (soma EXATA o total). */
function feeSplit(total: number): Record<FeeId, number> {
  const shares: [FeeId, number][] = [
    ["leads", 0.28],
    ["tokens", 0.27],
    ["mensagens", 0.25],
    ["disparos", 0.12],
    ["telefone", 0.05],
    ["outros", 0.03],
  ];
  const out = {} as Record<FeeId, number>;
  let acc = 0;
  shares.forEach(([id, share], i) => {
    if (i === shares.length - 1) {
      out[id] = round2(total - acc);
    } else {
      const v = round2(total * share);
      out[id] = v;
      acc = round2(acc + v);
    }
  });
  return out;
}

/* ---------- os ciclos (Dez/25 → Mai/26, encadeados) ---------- */

export const BILLING_CYCLES: BillingCycle[] = [
  {
    id: "2025-12",
    label: "Dezembro de 2025",
    refMonth: "Dez/25",
    startsAt: "01/12/2025 · 00:00",
    endsAt: "31/12/2025 · 23:59",
    invoiceIds: ["INV-2025-12-PLN", "INV-2025-12-0741"],
    fixed: 2497.98,
    variableByFee: feeSplit(4100.0),
    metaUsageApprox: 812.4,
    credits: 0,
    adjustments: 0,
    payments: [
      { at: "28/12/2025 · 09:12", amount: 2497.98, method: "Visa •••• 8888", invoiceId: "INV-2025-12-PLN" },
      { at: "28/12/2025 · 09:12", amount: 4100.0, method: "Visa •••• 8888", invoiceId: "INV-2025-12-0741" },
    ],
    carryIn: 0,
    carryOut: 0,
  },
  {
    id: "2026-01",
    label: "Janeiro de 2026",
    refMonth: "Jan/26",
    startsAt: "01/01/2026 · 00:00",
    endsAt: "31/01/2026 · 23:59",
    invoiceIds: ["INV-2026-01-PLN", "INV-2026-01-0788"],
    fixed: 2497.98,
    variableByFee: feeSplit(3890.5),
    metaUsageApprox: 744.15,
    credits: 0,
    adjustments: 0,
    payments: [
      { at: "28/01/2026 · 11:03", amount: 2497.98, method: "Visa •••• 8888", invoiceId: "INV-2026-01-PLN" },
      { at: "28/01/2026 · 11:03", amount: 3890.5, method: "Visa •••• 8888", invoiceId: "INV-2026-01-0788" },
    ],
    carryIn: 0,
    carryOut: 0,
  },
  {
    id: "2026-02",
    label: "Fevereiro de 2026",
    refMonth: "Fev/26",
    startsAt: "01/02/2026 · 00:00",
    endsAt: "28/02/2026 · 23:59",
    invoiceIds: ["INV-2026-02-PLN", "INV-2026-02-0850"],
    fixed: 2497.98,
    variableByFee: feeSplit(4412.3),
    metaUsageApprox: 903.72,
    credits: 0,
    adjustments: 0,
    payments: [
      { at: "28/02/2026 · 08:47", amount: 2497.98, method: "Visa •••• 8888", invoiceId: "INV-2026-02-PLN" },
      { at: "28/02/2026 · 08:47", amount: 4412.3, method: "Visa •••• 8888", invoiceId: "INV-2026-02-0850" },
    ],
    carryIn: 0,
    carryOut: 0,
  },
  {
    id: "2026-03",
    label: "Março de 2026",
    refMonth: "Mar/26",
    startsAt: "01/03/2026 · 00:00",
    endsAt: "31/03/2026 · 23:59",
    invoiceIds: ["INV-2026-03-PLN", "INV-2026-03-0987"],
    fixed: 2497.98,
    variableByFee: feeSplit(5268.49),
    metaUsageApprox: 1054.2,
    credits: 0,
    adjustments: 0,
    // Só o plano foi pago — o variável falhou e rolou pro saldo.
    payments: [
      { at: "28/03/2026 · 10:21", amount: 2497.98, method: "Visa •••• 3012", invoiceId: "INV-2026-03-PLN" },
    ],
    carryIn: 0,
    carryOut: 5268.49,
  },
  {
    id: "2026-04",
    label: "Abril de 2026",
    refMonth: "Abr/26",
    startsAt: "01/04/2026 · 00:00",
    endsAt: "30/04/2026 · 23:59",
    invoiceIds: ["INV-2026-04-PLN", "INV-2026-04-1234", "INV-2026-04-DSP"],
    fixed: 2497.98,
    // 1253,04 (variável em atraso) + 980,00 (disputada) — brutos.
    variableByFee: feeSplit(2233.04),
    metaUsageApprox: 431.86,
    credits: 250.61, // cupom BF2025 na fatura de uso variável
    adjustments: 0,
    payments: [], // nada quitado: atraso + falha + disputa
    carryIn: 5268.49,
    carryOut: 9748.9,
  },
  {
    id: "2026-05",
    label: "Maio de 2026",
    refMonth: "Mai/26",
    startsAt: "01/05/2026 · 00:00",
    endsAt: "31/05/2026 · 23:59",
    open: true, // ciclo vigente — fatura fecha em 31/05
    invoiceIds: [],
    fixed: 2497.98,
    // Espelha a Visão geral deste mês: uso Aswork 712,10 (o Meta ~179,50 fica
    // fora da fatura — ver metaUsageApprox) — parcial até 19/05.
    variableByFee: feeSplit(712.1),
    metaUsageApprox: 179.5,
    credits: 125.45,
    adjustments: -24.9,
    payments: [],
    carryIn: 9748.9,
    carryOut: 12808.63,
  },
];

/** Ciclo vigente do protótipo (âncora 19/05/2026). */
export const DEFAULT_CYCLE_ID = "2026-05";

export function cycleById(id: string | null | undefined): BillingCycle {
  return (
    BILLING_CYCLES.find((c) => c.id === id) ??
    BILLING_CYCLES.find((c) => c.id === DEFAULT_CYCLE_ID) ??
    BILLING_CYCLES[BILLING_CYCLES.length - 1]
  );
}

/** Range de datas do ciclo — alimenta o ConsumoProvider surface="cycle". */
export function cycleRange(c: BillingCycle): { from: Date; to: Date } {
  const [y, m] = c.id.split("-").map(Number);
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 0); // último dia do mês
  return { from, to };
}

if (process.env.NODE_ENV !== "production") {
  // O extrato é uma CONTA — se o encadeamento quebrar, melhor gritar em dev.
  BILLING_CYCLES.forEach((c, i) => {
    const bal = cycleBalance(c);
    if (Math.abs(bal - c.carryOut) > 0.01) {
      console.warn(
        `[ciclos] extrato de ${c.label} não fecha: carryOut declarado ${c.carryOut}, calculado ${bal}`,
      );
    }
    const next = BILLING_CYCLES[i + 1];
    if (next && Math.abs(c.carryOut - next.carryIn) > 0.01) {
      console.warn(
        `[ciclos] encadeamento quebrado: ${c.label} termina em ${c.carryOut}, ${next.label} começa em ${next.carryIn}`,
      );
    }
  });
}
