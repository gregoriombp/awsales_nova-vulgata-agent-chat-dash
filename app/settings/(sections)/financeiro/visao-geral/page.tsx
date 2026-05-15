"use client";

import { useRouter } from "next/navigation";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwShortcutTile } from "@/components/ui/AwShortcutTile";
import { SectionHeading } from "../../_components/shared";
import { VariableSpendingBlock } from "../_components/VariableSpendingBlock";
import {
  AUDIT_EVENTS,
  brl,
  CREDITS_KPIS,
  CURRENT_INVOICE,
  CURRENT_PLAN,
  INVOICE_HISTORY,
  OVERVIEW_KPIS,
  PAYMENT_METHODS,
} from "../_components/data";

export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-10">
      <BillingHero />
      <PlanBanner />
      <ShortcutGrid />

      <section>
        <SectionHeading
          title="Gastos variáveis"
          description="Distribuição do consumo no período. Alterne entre serviço e agente pra rastrear de onde vem o gasto."
        />
        <VariableSpendingBlock />
      </section>
    </div>
  );
}

/* ---------- hero ---------- */

function BillingHero() {
  const router = useRouter();
  const total = CURRENT_PLAN.monthly + OVERVIEW_KPIS.accumulated;

  return (
    <section className="flex flex-col gap-5">
      <div>
        <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
          Próxima cobrança · {CURRENT_INVOICE.dueAt}
        </p>
        <h1 className="m-0 mt-2 display-md tabular-nums text-[var(--fg-primary)]">
          {brl(total)}
        </h1>
        <p className="m-0 mt-2 max-w-[520px] body-xs text-[var(--fg-secondary)]">
          Plano{" "}
          <strong className="font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(CURRENT_PLAN.monthly)}
          </strong>{" "}
          + variáveis até agora{" "}
          <strong className="font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(OVERVIEW_KPIS.accumulated)}
          </strong>
          .
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <AwButton size="md" variant="primary">
          Mudar plano
        </AwButton>
        <AwButton
          size="md"
          variant="secondary"
          onClick={() => router.push("/settings/financeiro/metodos-pagamento")}
        >
          Atualizar cartão
        </AwButton>
      </div>
    </section>
  );
}

/* ---------- inline plan banner ---------- */

function PlanBanner() {
  const variableLimit = OVERVIEW_KPIS.partialChargeAt;
  const variableSoFar = OVERVIEW_KPIS.accumulated;
  const variablePct = OVERVIEW_KPIS.accumulatedPct;

  return (
    <AwCard className="flex flex-col gap-3 !px-5 !py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <AwPill variant="live">{CURRENT_PLAN.status}</AwPill>
          <span className="body-sm font-medium text-[var(--fg-primary)]">
            {CURRENT_PLAN.name}
          </span>
          <span className="body-xs text-[var(--fg-tertiary)]">
            · cobrança parcial automática a cada {brl(variableLimit)}
          </span>
        </div>
        <span className="body-xs tabular-nums text-[var(--fg-tertiary)]">
          {brl(variableSoFar)} / {brl(variableLimit)} · {variablePct}%
        </span>
      </div>
      <AwProgress value={variablePct} max={100} valueLabel="" />
    </AwCard>
  );
}

/* ---------- shortcut grid ---------- */

function ShortcutGrid() {
  const defaultMethod =
    PAYMENT_METHODS.find((m) => m.isDefault) ?? PAYMENT_METHODS[0];
  const latestInvoice = INVOICE_HISTORY[0];
  const lastAudit = AUDIT_EVENTS[0];

  return (
    <AwCard className="!p-2">
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        <AwShortcutTile
          icon="redeem"
          title="Saldo de créditos"
          description={`${brl(CREDITS_KPIS.availableDiscount)} disponível · ${CREDITS_KPIS.activeVouchers} vouchers ativos`}
          href="/settings/financeiro/saldo-creditos"
        />
        <AwShortcutTile
          icon="credit_card"
          title="Métodos de pagamento"
          description={
            defaultMethod
              ? `${defaultMethod.brand} •••• ${defaultMethod.last4} como padrão · ${PAYMENT_METHODS.length} cadastrados`
              : `${PAYMENT_METHODS.length} cadastrados`
          }
          href="/settings/financeiro/metodos-pagamento"
        />
        <AwShortcutTile
          icon="receipt_long"
          title="Histórico de faturas"
          description={`Última: ${latestInvoice.refMonth} · ${brl(latestInvoice.net)}`}
          href="/settings/financeiro/historico-faturas"
        />
        <AwShortcutTile
          icon="history"
          title="Auditoria"
          description={`Última atividade ${lastAudit.date} às ${lastAudit.time}`}
          href="/settings/financeiro/auditoria"
        />
      </div>
    </AwCard>
  );
}
