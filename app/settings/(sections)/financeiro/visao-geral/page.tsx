"use client";

import { AwCard } from "@/components/ui/AwCard";
import { AwShortcutTile } from "@/components/ui/AwShortcutTile";
import { AwInvoiceForecastCard } from "@/components/ui/AwInvoiceForecastCard";
import { AwConsumptionBar } from "@/components/ui/AwConsumptionBar";
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
 * Uma overview se lê em segundos: o total estimado da próxima fatura no topo,
 * consumo variável e plano lado a lado, um hub para as subpáginas e — só então —
 * o detalhamento de consumo, rebaixado para o fim.
 */
export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-8">
      <ForecastBlock />
      <UsageAndPlan />
      <NavHub />
      <ConsumptionSection />
    </div>
  );
}

/* ---------- herói: previsão (estimada) da próxima fatura ---------- */

function ForecastBlock() {
  const discount = OVERVIEW_KPIS.monthSavings;
  const total = CURRENT_PLAN.monthly + OVERVIEW_KPIS.accumulated - discount;
  const breakdown = [
    {
      label: "Assinatura",
      value: CURRENT_PLAN.monthly,
      kind: "base" as const,
      icon: "workspace_premium",
    },
    {
      label: "Variável",
      value: OVERVIEW_KPIS.accumulated,
      kind: "add" as const,
      icon: "bolt",
    },
    ...(discount > 0
      ? [
          {
            label: "Cupom",
            value: discount,
            kind: "subtract" as const,
            icon: "local_offer",
          },
        ]
      : []),
  ];

  return (
    <AwInvoiceForecastCard
      bare
      eyebrow={`Previsão da próxima fatura · ${CURRENT_INVOICE.dueAt}`}
      total={total}
      estimateNote={
        <>
          Estimativa. O valor pode mudar até o fechamento em{" "}
          {CURRENT_INVOICE.dueAt} — o consumo variável conta até o fim do ciclo
          e o câmbio é convertido na cobrança.
        </>
      }
      breakdown={breakdown}
      cta={{
        label: "Ver fatura detalhada",
        href: "/settings/financeiro/historico-faturas",
      }}
    />
  );
}

/* ---------- consumo variável + plano (dois cards) ---------- */

function UsageAndPlan() {
  return (
    <div className="grid grid-cols-2 items-stretch gap-6">
      <ConsumoVariavelCard />
      <PlanoCard />
    </div>
  );
}

function ConsumoVariavelCard() {
  const used = OVERVIEW_KPIS.accumulated;
  const limit = VARIABLE_SPENDING_LIMIT;
  const remaining = Math.max(limit - used, 0);

  return (
    <AwCard className="flex flex-col gap-4 px-6! py-4!">
      <div className="flex items-baseline justify-between gap-3">
        <h6 className="m-0 body-lg font-medium text-(--fg-primary)">
          Consumo variável
        </h6>
        <span className="body-sm tabular-nums text-(--fg-secondary)">
          <strong className="font-medium text-(--fg-primary)">
            {brl(used)}
          </strong>{" "}
          de {brl(limit)}
        </span>
      </div>
      <AwConsumptionBar gross={used} limit={limit} />
      <p className="m-0 body-xs tabular-nums text-(--fg-tertiary)">
        Restam {brl(remaining)} antes da cobrança automática do ciclo.
      </p>
    </AwCard>
  );
}

function PlanoCard() {
  return (
    <AwCard className="flex items-center gap-4 border-(--border-strong) px-6! py-4!">
      <span
        aria-hidden="true"
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-(--bg-inverse)"
      >
        <AwPlanIcon plan={planKey(CURRENT_PLAN.name)} variant="dark" size={44} />
      </span>
      <div className="min-w-0">
        <p className="m-0 body-lg font-medium text-(--fg-primary)">
          {CURRENT_PLAN.name}
        </p>
        <p className="m-0 mt-0.5 body-sm tabular-nums text-(--fg-secondary)">
          <strong className="font-medium text-(--fg-primary)">
            {brl(CURRENT_PLAN.monthly)}
          </strong>
          /mês · renova em {CURRENT_PLAN.nextChargeAt}
        </p>
      </div>
    </AwCard>
  );
}

/* ---------- hub de navegação para as subpáginas ---------- */

function NavHub() {
  const defaultMethod =
    PAYMENT_METHODS.find((m) => m.isDefault) ?? PAYMENT_METHODS[0];
  const latestInvoice = INVOICE_HISTORY[0];
  const lastAudit = AUDIT_EVENTS[0];

  return (
    <nav aria-label="Atalhos do financeiro">
      {/* Flat — sem caixa nem padding extra: os atalhos respiram no fluxo da
          página, separados só pelo gap. Hover de cada tile dá o contorno. */}
      <ul className="m-0 grid grid-cols-2 list-none gap-x-8 gap-y-1 p-0">
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
    </nav>
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
