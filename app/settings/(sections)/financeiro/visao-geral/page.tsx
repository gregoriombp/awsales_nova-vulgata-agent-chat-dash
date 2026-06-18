"use client";

import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import { AwShortcutTile } from "@/components/ui/AwShortcutTile";
import { AwInvoiceForecastCard } from "@/components/ui/AwInvoiceForecastCard";
import { AwPlanIcon, type PlanKey } from "@/components/ui/AwPlanIcon";
import { VariableSpendingBlock } from "../_components/VariableSpendingBlock";
import {
  AUDIT_EVENTS,
  brl,
  CURRENT_INVOICE,
  CURRENT_PLAN,
  INVOICE_HISTORY,
  OVERVIEW_KPIS,
  PAYMENT_METHODS,
  VARIABLE_SPENDING_LIMIT,
} from "../_components/data";

function planKey(name: string): PlanKey {
  const n = name.toLowerCase();
  if (n.includes("enterprise")) return "enterprise";
  if (n.includes("pro")) return "pro";
  return "starter";
}

/**
 * Visão geral — reestruturação.
 * Uma overview se lê em segundos: um único número que importa (próxima fatura),
 * o plano resumido numa linha, um hub para as subpáginas e — só então — o
 * detalhamento de consumo, rebaixado para o fim. Antes, três cartões de resumo
 * disputavam o topo e o mesmo valor se repetia até 5×.
 */
export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-8">
      <ForecastBlock />
      <PlanStrip />
      <NavHub />
      <ConsumptionSection />
    </div>
  );
}

/* ---------- herói: previsão da próxima fatura ---------- */

function ForecastBlock() {
  const discount = OVERVIEW_KPIS.monthSavings;
  const total = CURRENT_PLAN.monthly + OVERVIEW_KPIS.accumulated - discount;
  const breakdown = [
    { label: "Assinatura", value: CURRENT_PLAN.monthly, kind: "base" as const },
    { label: "variável", value: OVERVIEW_KPIS.accumulated, kind: "add" as const },
    ...(discount > 0
      ? [{ label: "cupom", value: discount, kind: "subtract" as const }]
      : []),
  ];

  return (
    <AwInvoiceForecastCard
      eyebrow={`Previsão da próxima fatura · ${CURRENT_INVOICE.dueAt}`}
      total={total}
      trend={{ value: 4.8, direction: "up", tone: "bad" }}
      breakdown={breakdown}
      cta={{
        label: "Ver fatura detalhada",
        href: "/settings/financeiro/historico-faturas",
      }}
      gauge={{
        value: OVERVIEW_KPIS.accumulated,
        max: VARIABLE_SPENDING_LIMIT,
        caption: (
          <>
            do teto
            <br />
            {brl(VARIABLE_SPENDING_LIMIT)}
          </>
        ),
      }}
    />
  );
}

/* ---------- plano em uma linha (status, não card) ---------- */

function PlanStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-(--border-subtle) bg-(--bg-surface) px-5 py-3.5">
      <AwPlanIcon
        plan={planKey(CURRENT_PLAN.name)}
        variant="light"
        size={26}
        className="shrink-0"
      />
      <span className="body-sm font-medium text-(--fg-primary)">
        {CURRENT_PLAN.name}
      </span>
      <AwPill variant="live">{CURRENT_PLAN.status}</AwPill>
      <span className="text-(--fg-tertiary)">·</span>
      <span className="body-sm tabular-nums text-(--fg-secondary)">
        <strong className="font-medium text-(--fg-primary)">
          {brl(CURRENT_PLAN.monthly)}
        </strong>
        /mês
      </span>
      <span className="text-(--fg-tertiary)">·</span>
      <span className="body-sm text-(--fg-tertiary)">
        renova em {CURRENT_PLAN.nextChargeAt}
      </span>
    </div>
  );
}

/* ---------- hub de navegação para as subpáginas ---------- */

function NavHub() {
  const defaultMethod =
    PAYMENT_METHODS.find((m) => m.isDefault) ?? PAYMENT_METHODS[0];
  const latestInvoice = INVOICE_HISTORY[0];
  const lastAudit = AUDIT_EVENTS[0];

  return (
    <AwCard className="p-2!">
      <ul className="m-0 grid grid-cols-2 list-none p-0">
        <li className="m-0">
          <AwShortcutTile
            icon="bar_chart"
            title="Consumo"
            description={`${brl(OVERVIEW_KPIS.accumulated)} este ciclo`}
            href="/settings/financeiro/consumo"
          />
        </li>
        <li className="m-0">
          <AwShortcutTile
            icon="credit_card"
            title="Métodos de pagamento"
            description={`${defaultMethod.brand} •••• ${defaultMethod.last4} · ${PAYMENT_METHODS.length} cartões`}
            href="/settings/financeiro/metodos-pagamento"
          />
        </li>
        <li className="m-0">
          <AwShortcutTile
            icon="receipt_long"
            title="Faturas"
            description={`${latestInvoice.refMonth} · ${latestInvoice.status}`}
            href="/settings/financeiro/historico-faturas"
          />
        </li>
        <li className="m-0">
          <AwShortcutTile
            icon="history"
            title="Atividade"
            description={`${lastAudit.date} às ${lastAudit.time}`}
            href="/settings/financeiro/auditoria"
          />
        </li>
      </ul>
    </AwCard>
  );
}

/* ---------- consumo por dia (detalhe, rebaixado para o fim) ---------- */

function ConsumptionSection() {
  return (
    <section className="flex flex-col gap-4 border-t border-(--border-subtle) pt-8">
      <h6 className="m-0 text-(--fg-primary)">Consumo por dia</h6>
      <VariableSpendingBlock />
    </section>
  );
}
