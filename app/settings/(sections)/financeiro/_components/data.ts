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
    "Limite de uso variável de R$ 1.500 por ciclo",
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
  /** E-mails de administradores da organização — sempre recebem as faturas e
   *  NÃO podem ser removidos por esta tela (aparecem marcados e sem o X).
   *  (cmt-7d73c125) */
  adminRecipients: ["greg@awsales.io", "ana.azevedo@awsales.com.br"],
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
  // Uso variável do ciclo SEM a linha telefônica (esta é custo fixo do plano,
  // já embutido em CURRENT_PLAN.monthly) — antes 891,63 contava o telefone duas
  // vezes no total da fatura. (cmt-6fdd2425)
  accumulated: 852.63,
  accumulatedPct: 16, // % até a próxima cobrança parcial
  monthSavings: 132.4, // economia com créditos / cupons
};

// Limite mensal de gastos variáveis por usuário/organização.
// Quando atingido, o montante acumulado é cobrado automaticamente.
export const VARIABLE_SPENDING_LIMIT = 1500;

// Modelo de cobrança do uso variável.
//  "prepaid"  → conta com teto: mostra "Limite de uso antes da cobrança" + a
//               barra de uso, e cobra automático ao atingir o limite.
//  "postpaid" → conta com linha de crédito: sem teto ("Ilimitado"), cobrada na
//               data acordada do ciclo.
// Troque pra "postpaid" pra ver a variante pós-paga do card de consumo.
export const BILLING_MODE: "prepaid" | "postpaid" = "prepaid";

// Linha telefônica — custo fixo mensal que acompanha o plano (quando a
// organização tem um número provisionado). Entra no detalhamento como um
// item que abre dentro do plano fixo e soma ao total. 0 = "não tem".
export const PLAN_PHONE_LINE = 39.0;

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
    note: "Cupom de Black Friday aplicado ao uso variável do ciclo.",
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

/* ---------------------------------------------------------------------------
 * Gastos variáveis — recorte simbólico (Visão geral)
 * ---------------------------------------------------------------------------
 * Um recorte do ciclo vigente pra overview: gasto variável por dia, empilhado
 * por SERVIÇO ou por AGENTE (toggle), SEM a quebra Meta/Aswork — essa leitura
 * por pagador mora no relatório completo (explorador). O gráfico e a tabela
 * bebem EXATAMENTE desta fonte, então trocar o agrupamento muda os dois juntos.
 * O total fecha com o "Uso variável" do ciclo (OVERVIEW_KPIS.accumulated), pra
 * a overview se ler como um número só.
 *
 * Cores: rampa índigo→ciano própria do gráfico (fora dos tokens, autorizado
 * pelo Greg pra este gráfico). Vivem aqui como constantes e são aplicadas via
 * `style` inline — não entram no globals.css nem viram utilitárias arbitrárias.
 */

/** Rampa do gráfico de gastos — índigo (maior peso) → água (menor). Aplicada
 *  por ordem de empilhamento; a base da barra recebe a cor mais forte. */
export const SPEND_RAMP = [
  "#5d55b8", // índigo
  "#877dff", // violeta
  "#75b0fd", // azul
  "#7ed1f1", // ciano
  "#9aecec", // água
] as const;

/** Neutro da fatia agregada ("Outros") — não compete com a rampa. */
export const SPEND_REST_COLOR = "#aeb7c2";

export type OverviewSpendCategory = {
  id: string;
  label: string;
  /** Cor da fatia/legenda — hex direto (fora dos tokens; ver nota acima). */
  color: string;
  /** Ícone Material Symbols (modo serviço). */
  icon?: string;
  /** Avatar do agente (modo agente). */
  avatar?: string;
  /** Fatia agregada ("Outros"): renderiza com o gradient iridescente da marca
   *  em vez de uma cor sólida — no gráfico, na legenda e na tabela. */
  gradient?: boolean;
  /** Total canônico (R$) no baseline mensal — a série diária distribui ESTE
   *  valor pelas barras, então a soma da categoria no gráfico bate com a linha
   *  da tabela. Em modo agente, "Outros" é a soma da cauda (agentes fora do
   *  top 5), pra a fatia agregada aparecer no seu tamanho real. */
  total: number;
};

export const OVERVIEW_SPEND_CATEGORIES: Record<
  SpendingGrouping,
  OverviewSpendCategory[]
> = {
  // service: totais batem com OVERVIEW_SERVICE_GROUPS (somam 852,63). Telefone
  // saiu — é custo fixo do plano, não uso variável (cmt-6fdd2425).
  service: [
    { id: "leads", label: "Leads ativos", color: SPEND_RAMP[0], icon: "person_check", total: 96.0 },
    { id: "tokens", label: "Tokens", color: SPEND_RAMP[1], icon: "toll", total: 181.9 },
    { id: "mensagens", label: "Mensagens transacionadas", color: SPEND_RAMP[2], icon: "forum", total: 186.16 },
    { id: "disparos", label: "Disparos", color: SPEND_RAMP[3], icon: "send", total: 388.57 },
  ],
  // agent: top 5 do AGENT_BREAKDOWN + "Outros" = soma da cauda (309,76). Somam 852,63.
  agent: [
    { id: "aria", label: "Aria", color: SPEND_RAMP[0], avatar: "/assets/agent_imgs/orbs/orb_model-a_01-1.png", total: 156.32 },
    { id: "atlas", label: "Atlas", color: SPEND_RAMP[1], avatar: "/assets/agent_imgs/orbs/orb_model-a_05-1.png", total: 124.9 },
    { id: "nova", label: "Nova", color: SPEND_RAMP[2], avatar: "/assets/agent_imgs/orbs/orb_model-a_08-1.png", total: 98.18 },
    { id: "stella", label: "Stella", color: SPEND_RAMP[3], avatar: "/assets/agent_imgs/orbs/orb_model-a_11-1.png", total: 87.45 },
    { id: "iris", label: "Íris", color: SPEND_RAMP[4], avatar: "/assets/agent_imgs/orbs/orb_model-a_02-1.png", total: 76.02 },
    { id: "outros", label: "Outros", color: SPEND_REST_COLOR, icon: "groups", gradient: true, total: 309.76 },
  ],
};

/** Dias do recorte (ciclo vigente, 01–15/05). */
export const OVERVIEW_SPEND_DAYS = 15;

export type OverviewSpendBar = {
  /** Rótulo do dia, ex. "03/05". */
  label: string;
  /** Valor por categoria, na ordem de OVERVIEW_SPEND_CATEGORIES[grouping]. */
  values: number[];
};

/* ---------------------------------------------------------------------------
 * Controle de tempo da Visão geral (presets + range custom). Espelha o modelo
 * do explorador (ConsumoContext.PeriodSelection); vive aqui pra a overview não
 * importar o contexto do explorador. Consolidar os dois é dívida futura.
 */
export type PeriodSelection =
  | { kind: "preset"; id: SpendingPeriod }
  | { kind: "custom"; from: Date; to: Date };

export const DEFAULT_PERIOD: PeriodSelection = { kind: "preset", id: "this-month" };

export function diffInDaysInclusive(from: Date, to: Date): number {
  const ms = Math.abs(to.getTime() - from.getTime());
  return Math.floor(ms / 86_400_000) + 1;
}

export function formatRangeShort(from: Date, to: Date): string {
  const f = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${f(from)} – ${f(to)}`;
}

/** Nº de barras do gráfico pro período. */
export function selectionBars(sel: PeriodSelection): number {
  return sel.kind === "preset"
    ? periodBars(sel.id)
    : Math.max(1, Math.min(diffInDaysInclusive(sel.from, sel.to), 90));
}

/** Total alvo (R$) do período. */
export function selectionTarget(sel: PeriodSelection): number {
  return sel.kind === "preset"
    ? periodTotal(sel.id)
    : customPeriodTotal(diffInDaysInclusive(sel.from, sel.to));
}

/** Fator de escala em relação ao baseline mensal (891,63). */
export function selectionRatio(sel: PeriodSelection): number {
  return selectionTarget(sel) / periodTotal("this-month");
}

/** Rótulo curto do período (gatilho do picker + subtítulo). */
export function selectionLabel(sel: PeriodSelection): string {
  return sel.kind === "preset"
    ? SPENDING_PERIODS.find((p) => p.id === sel.id)?.label ?? "Período"
    : `Personalizado · ${formatRangeShort(sel.from, sel.to)}`;
}

/** Só mostra o marcador "Limite restaurado" (11/05) quando ele está no recorte
 *  — é um evento do ciclo vigente. */
export function selectionShowsLimitEvent(sel: PeriodSelection): boolean {
  return sel.kind === "preset" && sel.id === "this-month";
}

// "Hoje" do protótipo — âncora fixa pros rótulos não dependerem do relógio.
const OVERVIEW_ANCHOR = new Date(2026, 4, 15); // 15/05/2026

function ddmm(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Datas do centro de cada barra do período (terminando "hoje" do protótipo).
 *  Fonte única usada tanto pelos rótulos do eixo quanto pelo posicionamento dos
 *  marcadores de evento — assim rótulo e marcador nunca saem de sincronia. */
function selectionDayDates(sel: PeriodSelection, bars: number): Date[] {
  if (sel.kind === "custom") {
    const step =
      bars > 1 ? (sel.to.getTime() - sel.from.getTime()) / (bars - 1) : 0;
    return Array.from(
      { length: bars },
      (_, i) => new Date(sel.from.getTime() + step * i),
    );
  }
  if (sel.id === "this-month") {
    return Array.from(
      { length: bars },
      (_, i) =>
        new Date(OVERVIEW_ANCHOR.getFullYear(), OVERVIEW_ANCHOR.getMonth(), i + 1),
    );
  }
  if (sel.id === "yesterday") {
    const d = new Date(OVERVIEW_ANCHOR);
    d.setDate(d.getDate() - 1);
    return [d];
  }
  // today / last-7 / last-30 / last-90 — termina em "hoje", recuando.
  const stepDays = sel.id === "last-90" ? 3 : 1;
  return Array.from({ length: bars }, (_, i) => {
    const d = new Date(OVERVIEW_ANCHOR);
    d.setDate(d.getDate() - (bars - 1 - i) * stepDays);
    return d;
  });
}

/** Rótulos dos N dias do período (terminando "hoje" do protótipo). */
function selectionDayLabels(sel: PeriodSelection, bars: number): string[] {
  return selectionDayDates(sel, bars).map(ddmm);
}

/** Pesos por dia (somam 1) — espalha um total por N barras com variação
 *  determinística. Piso pra nenhuma barra zerar de vez. */
function dayWeights(seed: number, n: number): number[] {
  let s = ((seed % 233280) + 233280) % 233280;
  const raw = Array.from({ length: n }, () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280 + 0.4;
  });
  const sum = raw.reduce((a, b) => a + b, 0);
  return sum > 0 ? raw.map((v) => v / sum) : raw.map(() => 1 / n);
}

/** Série diária empilhada do período: N barras, cada categoria distribuída a
 *  partir do SEU total canônico (escalado pelo período). Assim a soma de cada
 *  categoria no gráfico bate com a linha da tabela, e o total fecha com o card.
 *  Determinística — mesmo desenho a cada render. */
export function overviewSpendSeries(
  grouping: SpendingGrouping,
  selection: PeriodSelection = DEFAULT_PERIOD,
): OverviewSpendBar[] {
  const cats = OVERVIEW_SPEND_CATEGORIES[grouping];
  const bars = selectionBars(selection);
  const ratio = selectionRatio(selection);
  const labels = selectionDayLabels(selection, bars);
  const baseSeed = grouping === "service" ? 23 : 41;
  const perCatWeights = cats.map((_, c) => dayWeights(baseSeed + c * 97, bars));
  return Array.from({ length: bars }, (_, day) => ({
    label: labels[day] ?? "",
    values: cats.map(
      (cat, c) =>
        Math.round(cat.total * ratio * perCatWeights[c][day] * 100) / 100,
    ),
  }));
}

/** Marcador de evento no gráfico — o dia em que o limite do ciclo foi atingido,
 *  a cobrança parcial caiu e o limite foi restaurado. `dayIndex` é 0-based. O
 *  card que abre no hover conta essa história (pagamento + limite liberado). */
export const OVERVIEW_SPEND_EVENT = {
  dayIndex: 10, // 11/05
  label: "Limite restaurado",
  title: "Pagamento realizado",
  description: `Você atingiu o limite de ${brl(VARIABLE_SPENDING_LIMIT)} de uso. Uma cobrança foi debitada no seu Cartão de Crédito e seu limite foi liberado.`,
} as const;

/** Dia do mês em que o ciclo fecha e o limite é restaurado (cobrança parcial).
 *  Ancorado no evento do ciclo vigente (11/05). */
const RESET_DAY = OVERVIEW_ANCHOR.getDate() - 4; // 11

/** Datas dos resets de limite — um por ciclo, recuando alguns meses a partir do
 *  "hoje" do protótipo. Em janelas longas (Últimos 90 dias) aparecem vários;
 *  no ciclo vigente, só o de 11/05. */
function resetEventDates(): Date[] {
  return Array.from({ length: 6 }, (_, back) => {
    return new Date(
      OVERVIEW_ANCHOR.getFullYear(),
      OVERVIEW_ANCHOR.getMonth() - back,
      RESET_DAY,
    );
  }).filter((d) => d.getTime() <= OVERVIEW_ANCHOR.getTime());
}

export type LimitEventMarker = {
  /** Posição horizontal no plot, em % (centro da barra correspondente). */
  leftPct: number;
  dateLabel: string;
  label: string;
  title: string;
  description: string;
};

/** Marcadores de "Limite restaurado" visíveis no recorte atual. Antes só o
 *  ciclo vigente (this-month) mostrava o evento; agora qualquer janela mostra os
 *  resets de ciclo que caem dentro dela — incluindo os de ciclos anteriores nos
 *  Últimos 90 dias. Determinístico. */
export function selectionLimitEvents(sel: PeriodSelection): LimitEventMarker[] {
  const bars = selectionBars(sel);
  const dates = selectionDayDates(sel, bars);
  if (dates.length === 0) return [];
  const first = dates[0].getTime();
  const last = dates[dates.length - 1].getTime();
  const span = last - first;
  // Tolerância de meia-barra: um reset entre dois centros de barra ainda
  // pertence ao recorte representado.
  const halfBucket = bars > 1 ? span / (bars - 1) / 2 : 12 * 60 * 60 * 1000;

  return resetEventDates()
    .filter((d) => {
      const t = d.getTime();
      return t >= first - halfBucket && t <= last + halfBucket;
    })
    .map((d) => {
      const t = d.getTime();
      // Fração do eixo: mapeia a data pro centro da barra correspondente.
      // Em this-month (15 barras) o reset de 11/05 cai em 70%, igual ao
      // posicionamento original.
      const ratio = span > 0 ? (t - first) / span : 0.5;
      const frac = bars > 1 ? (0.5 + ratio * (bars - 1)) / bars : 0.5;
      return {
        leftPct: Math.min(100, Math.max(0, frac * 100)),
        dateLabel: ddmm(d),
        label: OVERVIEW_SPEND_EVENT.label,
        title: OVERVIEW_SPEND_EVENT.title,
        description: OVERVIEW_SPEND_EVENT.description,
      };
    });
}

/* ---------------------------------------------------------------------------
 * Tabela de detalhamento da Visão geral — por SERVIÇO.
 * ---------------------------------------------------------------------------
 * Mesma estrutura do explorador (Item · Quantidade · Unitário · Total BRL ·
 * Total USD · Participação), porém SEM a coluna de provedor (Meta×Aswork) — na
 * overview a leitura é só "quanto cada serviço custou". Grupos com sub-níveis
 * canônicos (taxonomia W2C do PG): Disparos → marketing/utilidade/serviço;
 * Tokens → Knowledge/Brain/Skills. A soma fecha com o uso variável do ciclo
 * (OVERVIEW_KPIS.accumulated). A cor é a mesma da fatia no gráfico. */
export type OverviewServiceLeaf = {
  id: string;
  label: string;
  icon: string;
  quantity: number;
  quantityFormat: "decimal" | "abbrev" | "lump";
  unitPriceLabel: string;
  total: number;
  /** Apoio curto exibido abaixo do rótulo (só sub-níveis que pedem contexto). */
  desc?: string;
  /** Explicação longa no tooltip — só onde costuma gerar dúvida (ex.: Tokens). */
  tooltip?: string;
};
export type OverviewServiceGroup = OverviewServiceLeaf & {
  /** Cor da fatia no gráfico — liga a linha da tabela à pilha. */
  color: string;
  /** Sub-níveis canônicos, exibidos quando o serviço se expande. */
  children?: OverviewServiceLeaf[];
};

export const OVERVIEW_SERVICE_GROUPS: OverviewServiceGroup[] = [
  {
    id: "disparos", label: "Disparos", icon: "send", color: SPEND_RAMP[3],
    quantity: 3116, quantityFormat: "decimal", unitPriceLabel: "Misto", total: 388.57,
    children: [
      { id: "disp-mkt", label: "Disparo · marketing", icon: "campaign", quantity: 1245, quantityFormat: "decimal", unitPriceLabel: "R$ 0,12 / disparo", total: 149.4 },
      { id: "disp-util", label: "Disparo · utilidade", icon: "campaign", quantity: 1560, quantityFormat: "decimal", unitPriceLabel: "R$ 0,08 / disparo", total: 124.8 },
      { id: "disp-serv", label: "Disparo · serviço", icon: "support_agent", quantity: 311, quantityFormat: "decimal", unitPriceLabel: "R$ 0,3676 / conversa", total: 114.37 },
    ],
  },
  {
    id: "mensagens", label: "Mensagens transacionadas", icon: "forum", color: SPEND_RAMP[2],
    quantity: 6205, quantityFormat: "decimal", unitPriceLabel: "R$ 0,03 / mensagem", total: 186.16,
  },
  {
    id: "tokens", label: "Tokens", icon: "toll", color: SPEND_RAMP[1],
    quantity: 36_860_000, quantityFormat: "abbrev", unitPriceLabel: "Misto", total: 181.9,
    tooltip:
      "Tokens consumidos por agentes e recursos de inteligência da plataforma, incluindo conversas, skills, bases de conhecimento e análises do Cortex.",
    // Taxonomia W2C + Cortex: separar o consumo de inteligência (análise,
    // recomendação, otimização, predição) das camadas de conversa/skills/
    // conhecimento. As 4 fatias somam o total do grupo (181,9) — Cortex é
    // recortado do envelope de Tokens, não adicionado por cima.
    children: [
      { id: "tok-b", label: "Tokens · Brain", icon: "neurology", quantity: 11_780_000, quantityFormat: "abbrev", unitPriceLabel: "R$ 0,005 / 1K", total: 58.9,
        desc: "Raciocínio e respostas dos agentes",
        tooltip: "Tokens usados pelo agente para entender mensagens, raciocinar e gerar respostas durante a conversa." },
      { id: "tok-s", label: "Tokens · Skills", icon: "extension", quantity: 8_780_000, quantityFormat: "abbrev", unitPriceLabel: "R$ 0,009 / 1K", total: 79.0,
        desc: "Skills, tools, integrações e guardrails",
        tooltip: "Tokens usados por skills, tools, integrações, automações e guardrails dos agentes." },
      { id: "tok-k", label: "Tokens · Knowledge", icon: "memory", quantity: 10_600_000, quantityFormat: "abbrev", unitPriceLabel: "R$ 0,002 / 1K", total: 21.2,
        desc: "Bases de conhecimento dos agentes",
        tooltip: "Tokens usados na criação, processamento e consulta das bases de conhecimento que alimentam as respostas dos agentes." },
      { id: "tok-c", label: "Tokens · Cortex", icon: "insights", quantity: 5_700_000, quantityFormat: "abbrev", unitPriceLabel: "R$ 0,004 / 1K", total: 22.8,
        desc: "Análises, recomendações e otimizações",
        tooltip: "Tokens usados pelo Cortex para analisar conversas, gerar recomendações e otimizar agentes, jornadas, AOPs e bases de conhecimento. Também podem incluir análises preditivas para melhorar a escolha de agentes e fluxos." },
    ],
  },
  {
    id: "leads", label: "Leads ativos", icon: "person_add", color: SPEND_RAMP[0],
    quantity: 48, quantityFormat: "decimal", unitPriceLabel: "R$ 2,00 / lead", total: 96.0,
    // Tooltip única cobrindo os dois recortes do detalhamento: "Leads ativos" só
    // aparece como linha própria no agrupamento por Serviço — por Agente o custo
    // é diluído em cada agente, então não há âncora separada pra alternar. (cmt-c59366d2)
    tooltip:
      "Leads ativos são contatos elegíveis para cobrança no período. Em “Serviço”, o valor é o total de leads ativos da organização multiplicado pelo valor unitário contratado por lead. Em “Agente”, esse custo é distribuído entre os agentes conforme o volume de mensagens transacionadas com cada lead — se um lead conversou com vários agentes, o valor é dividido proporcionalmente entre eles.",
  },
  // Telefone saiu do detalhamento de uso variável: é custo FIXO da assinatura
  // (linha telefônica embutida na mensalidade do plano), não consumo variável.
  // Passou a aparecer no modal "Detalhes do plano". (cmt-6fdd2425)
];

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

// Disputa de fatura — o cliente contestou o valor e o time interno analisa.
// Estágios em ordem; o `stage` aponta o atual. Copy em voz de produto (sem
// "tecniquez"): o cliente entende em que pé está a análise.
export type DisputeStage = "received" | "review" | "resolved" | "settled";

export type InvoiceDispute = {
  stage: DisputeStage;
  /** Quando o cliente abriu a contestação (pt-BR). */
  openedAt: string;
  /** Por que foi contestada — resumo curto exibido ao cliente. */
  reason: string;
};

export const INVOICE_DISPUTE_STAGES: {
  id: DisputeStage;
  label: string;
  description: string;
}[] = [
  {
    id: "received",
    label: "Contestação recebida",
    description: "Você sinalizou que o valor desta fatura não está certo.",
  },
  {
    id: "review",
    label: "Em análise pelo nosso time",
    description:
      "Estamos conferindo os lançamentos. Você não precisa pagar enquanto a análise não termina.",
  },
  {
    id: "resolved",
    label: "Análise concluída",
    description: "Avisamos por e-mail assim que houver uma definição.",
  },
  {
    id: "settled",
    label: "Resolução aplicada",
    description:
      "Havendo ajuste a seu favor, o crédito entra na próxima fatura.",
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
  status: "Paga" | "Em aberto" | "Em atraso" | "Falha no Pagamento" | "Disputada";
  /** Presente quando status === "Disputada": estágio da análise interna. */
  dispute?: InvoiceDispute;
};

/** Rótulo da fatura em voz de produto. "Disputada" lê como "Em disputa" — o
 *  valor do enum fica intocado (o DS/styleguide usam o original). */
export function invoiceStatusLabel(
  status: InvoiceHistoryRow["status"],
): string {
  return status === "Disputada" ? "Em disputa" : status;
}

export const INVOICE_HISTORY: InvoiceHistoryRow[] = [
  {
    id: "INV-2026-04-1234",
    refMonth: "Abr/26",
    description: "Uso variável",
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
    status: "Falha no Pagamento",
  },
  {
    id: "INV-2026-04-DSP",
    refMonth: "Abr/26",
    description: "Uso variável",
    dueAt: "28/04/2026",
    paidAt: null,
    gross: 980.0,
    discount: null,
    discountCode: null,
    net: 980.0,
    paymentMethod: "Visa •••• 3012",
    status: "Disputada",
    dispute: {
      stage: "review",
      openedAt: "12/05/2026",
      reason: "Cobrança de disparos acima do esperado neste período.",
    },
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
    description: "Uso variável",
    dueAt: "25/03/2026",
    paidAt: null,
    gross: 5268.49,
    discount: null,
    discountCode: null,
    net: 5268.49,
    paymentMethod: "Boleto",
    status: "Falha no Pagamento",
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
    id: "INV-2026-02-0850",
    refMonth: "Fev/26",
    description: "Uso variável",
    dueAt: "28/02/2026",
    paidAt: "28/02/2026",
    gross: 4412.3,
    discount: null,
    discountCode: null,
    net: 4412.3,
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
  {
    id: "INV-2026-01-0788",
    refMonth: "Jan/26",
    description: "Uso variável",
    dueAt: "28/01/2026",
    paidAt: "28/01/2026",
    gross: 3890.5,
    discount: null,
    discountCode: null,
    net: 3890.5,
    paymentMethod: "Visa •••• 8888",
    status: "Paga",
  },
  {
    id: "INV-2025-12-PLN",
    refMonth: "Dez/25",
    description: "Plano Enterprise",
    dueAt: "28/12/2025",
    paidAt: "28/12/2025",
    gross: 2497.98,
    discount: null,
    discountCode: null,
    net: 2497.98,
    paymentMethod: "Visa •••• 8888",
    status: "Paga",
  },
  {
    id: "INV-2025-12-0741",
    refMonth: "Dez/25",
    description: "Uso variável",
    dueAt: "28/12/2025",
    paidAt: "28/12/2025",
    gross: 4100.0,
    discount: null,
    discountCode: null,
    net: 4100.0,
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

// Detalhe dos ajustes do período — alimenta o "saiba mais" do card Ajustes.
// Cada item é assinado: negativo abate, positivo soma. A soma bate com
// `adjustments` do PeriodSummary. Em produção vem do backend (costuma vir
// vazio); aqui são exemplos pra ilustrar o motivo de cada valor.
export type AdjustmentItem = {
  id: string;
  label: string;
  /** Valor assinado em BRL: negativo abate, positivo soma. */
  value: number;
  detail: string;
};

export const ADJUSTMENT_ITEMS: AdjustmentItem[] = [
  {
    id: "estorno-disparo",
    label: "Estorno de disparos com falha",
    value: -18.4,
    detail:
      "Disparos que retornaram erro do provedor e foram estornados no período.",
  },
  {
    id: "correcao-token",
    label: "Correção de tokens reprocessados",
    value: -6.5,
    detail:
      "Tokens contabilizados em duplicidade por reprocessamento, corrigidos nesta fatura.",
  },
];

export function getPeriodSummary(subtotal: number): PeriodSummary {
  const credits = Math.round(subtotal * PERIOD_CREDIT_RATIO * 100) / 100;
  // Ajuste de exemplo (estorno) pra ilustrar o card "Ajustes" e o sinal +/−.
  // Em produção vem do backend e costuma ser 0. Deriva da soma dos itens
  // detalhados pra o card e o "saiba mais" nunca divergirem.
  const adjustments =
    Math.round(ADJUSTMENT_ITEMS.reduce((s, i) => s + i.value, 0) * 100) / 100;
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

/** Tipo de método de cobrança aceito pela organização. */
export type PaymentMethodKind = "card" | "boleto" | "pix";

/** Cartão de crédito salvo. */
export type CardPaymentMethod = {
  kind: "card";
  id: string;
  brand: CardBrand;
  last4: string;
  /** MM/AAAA */
  expiresAt: string;
  isDefault: boolean;
};

/** Boleto bancário — cobrança recorrente por boleto registrado. */
export type BoletoPaymentMethod = {
  kind: "boleto";
  id: string;
  /** Nome do titular / sacado que aparece no boleto. */
  holder: string;
  /** CNPJ/CPF do sacado, mascarado. */
  taxId: string;
  isDefault: boolean;
};

/** Pix automático — débito recorrente autorizado via chave Pix. */
export type PixPaymentMethod = {
  kind: "pix";
  id: string;
  /** Tipo da chave: CNPJ, e-mail, telefone, aleatória. */
  keyType: string;
  /** Chave Pix, mascarada. */
  key: string;
  isDefault: boolean;
};

export type PaymentMethod =
  | CardPaymentMethod
  | BoletoPaymentMethod
  | PixPaymentMethod;

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    kind: "card",
    id: "pm-visa-3012",
    brand: "Visa",
    last4: "3012",
    expiresAt: "08/2028",
    isDefault: true,
  },
  {
    kind: "card",
    id: "pm-mc-8888",
    brand: "Mastercard",
    last4: "8888",
    expiresAt: "04/2027",
    isDefault: false,
  },
  {
    kind: "card",
    id: "pm-amex-1004",
    brand: "Amex",
    last4: "1004",
    expiresAt: "11/2026",
    isDefault: false,
  },
  {
    kind: "boleto",
    id: "pm-boleto-aswork",
    holder: "Aswork Tecnologia Ltda.",
    taxId: "12.345.678/0001-90",
    isDefault: false,
  },
  {
    kind: "pix",
    id: "pm-pix-cnpj",
    keyType: "CNPJ",
    key: "12.•••.•••/0001-90",
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

/** Onde o cupom incide. */
export type CouponScope = "Plano fixo" | "Tokens" | "Leads ativos" | "Disparos";
export type CouponStatus = "Ativo" | "Encerrado" | "Agendado" | "Aplicado";

export type CouponRow = {
  id: string;
  code: string;
  description: string;
  /** O que o cupom desconta (plano fixo ou um serviço variável específico). */
  scope: CouponScope;
  /** Magnitude percentual (ex.: 20 → "−20%"). Ausente em cupom de valor fixo. */
  percent?: number;
  /** Termo em ciclos: 1 = uma única vez; N = recorrente por N meses;
   *  0 = recorrente sem fim definido. */
  cyclesTotal: number;
  /** Ciclos já aplicados (>= cyclesTotal num cupom finito ⇒ encerrado). */
  cyclesUsed: number;
  status: CouponStatus;
  /** Economia acumulada — soma do que já foi descontado em todos os ciclos. */
  discount: number;
  /** Fatura de origem / mais recente. */
  invoiceId: string;
  /** Data da 1ª aplicação. */
  appliedAt: string;
};

export const COUPONS_APPLIED: CouponRow[] = [
  {
    id: "c-plano-anual",
    code: "PLANO20",
    description: "Desconto anual no plano",
    scope: "Plano fixo",
    percent: 20,
    cyclesTotal: 12,
    cyclesUsed: 6,
    status: "Ativo",
    discount: 2997.0,
    invoiceId: "INV-2026-05-PLN",
    appliedAt: "01/01/2026",
  },
  {
    id: "c-plano-4m",
    code: "BEMVINDO4",
    description: "Boas-vindas — 4 meses",
    scope: "Plano fixo",
    percent: 10,
    cyclesTotal: 4,
    cyclesUsed: 2,
    status: "Ativo",
    discount: 499.6,
    invoiceId: "INV-2026-05-PLN",
    appliedAt: "01/03/2026",
  },
  {
    id: "c-tokens",
    code: "TOKENS15",
    description: "Desconto em tokens",
    scope: "Tokens",
    percent: 15,
    cyclesTotal: 0,
    cyclesUsed: 3,
    status: "Ativo",
    discount: 312.4,
    invoiceId: "INV-2026-05-PLN",
    appliedAt: "10/03/2026",
  },
  {
    id: "c-leads",
    code: "LEADS10",
    description: "Desconto em leads ativos",
    scope: "Leads ativos",
    percent: 10,
    cyclesTotal: 0,
    cyclesUsed: 2,
    status: "Ativo",
    discount: 148.0,
    invoiceId: "INV-2026-05-PLN",
    appliedAt: "02/04/2026",
  },
  {
    id: "c-onboard",
    code: "ONBOARD",
    description: "Bônus onboarding",
    scope: "Plano fixo",
    cyclesTotal: 1,
    cyclesUsed: 1,
    status: "Aplicado",
    discount: 482.3,
    invoiceId: "INV-2026-01-PLN",
    appliedAt: "11/01/2026",
  },
  {
    id: "c-plano-anterior",
    code: "ANUAL25",
    description: "Plano fixo — ciclo anterior",
    scope: "Plano fixo",
    percent: 25,
    cyclesTotal: 12,
    cyclesUsed: 12,
    status: "Encerrado",
    discount: 5994.0,
    invoiceId: "INV-2025-12-PLN",
    appliedAt: "01/01/2025",
  },
];

// ---- Auditoria ----

export type AuditExecutor = "Aswork" | "Cliente";
export type AuditEventType = "Plano" | "Cartão" | "Fatura" | "Cupom" | "Crédito";

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
    // A própria Aswork (organização) como ator: atribui um crédito à conta do
    // cliente. Avatar = símbolo da marca (ActorAvatar trata executor "Aswork"),
    // ator = "Aswork", com o valor do crédito. Pedido do Genê/Greg (cmt-7437d212).
    id: "a-0",
    date: "11/05/2026",
    time: "15:10",
    executor: "Aswork",
    actor: "Aswork",
    type: "Crédito",
    action: "atribuiu um crédito à conta",
    meta: "Crédito de cortesia · R$ 500 · vigente até 31/07",
  },
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
    type: "Crédito",
    action: "Crédito consumido",
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
    type: "Crédito",
    action: "Crédito esgotando rápido",
    meta: "Bônus Black Friday Setup · 2,3× acima do previsto",
  },
  {
    id: "a-9",
    date: "09/05/2026",
    time: "10:30",
    executor: "Aswork",
    actor: "Bruno Costa",
    actorAvatar: "/assets/ui-faces/male-1.jpg",
    type: "Crédito",
    action: "Crédito emitido",
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
