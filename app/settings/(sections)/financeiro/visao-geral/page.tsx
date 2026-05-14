"use client";

import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "../../_components/shared";
import { InvoiceHistoryTable } from "../_components/InvoiceHistoryTable";
import { VariableSpendingBlock } from "../_components/VariableSpendingBlock";
import {
  brl,
  CURRENT_INVOICE,
  CURRENT_PLAN,
  INVOICE_HISTORY,
  OVERVIEW_KPIS,
} from "../_components/data";

export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-10">
      <BillingHero />
      <PartialChargeBanner />
      <ShortcutGrid />

      <section>
        <SectionHeading
          title="Gastos variáveis"
          description="Distribuição do consumo no período. Alterne entre serviço e campanha pra rastrear de onde vem o gasto."
        />
        <VariableSpendingBlock />
      </section>

      <section>
        <SectionHeading
          title="Histórico de faturas"
          description="Faturas dos últimos meses, com totais brutos, descontos aplicados e o valor efetivamente cobrado."
        />
        <InvoiceHistoryTable />
      </section>
    </div>
  );
}

/* ---------- hero ---------- */

function BillingHero() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <AccumulatedCard />
      <PlanCard />
    </section>
  );
}

function AccumulatedCard() {
  return (
    <AwCard className="flex flex-col gap-4 !p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
          Acumulado neste ciclo
        </p>
        <span className="text-[11px] font-medium tabular-nums text-[var(--fg-tertiary)]">
          {OVERVIEW_KPIS.accumulatedPct}% até a próxima cobrança parcial
        </span>
      </div>

      <div>
        <h2 className="m-0 text-[36px] font-semibold leading-none tracking-[-0.02em] text-[var(--fg-primary)]">
          {brl(OVERVIEW_KPIS.accumulated)}
        </h2>
        <p className="m-0 mt-1 text-[12px] text-[var(--fg-secondary)]">
          de {brl(OVERVIEW_KPIS.partialChargeAt)} até cobrança parcial
        </p>
      </div>

      <AwProgress
        value={OVERVIEW_KPIS.accumulatedPct}
        max={100}
        valueLabel=""
      />

      <p className="m-0 text-[12.5px] text-[var(--fg-secondary)]">
        Próximo fechamento em{" "}
        <strong className="font-medium text-[var(--fg-primary)]">
          {CURRENT_INVOICE.dueAt}
        </strong>{" "}
        · total estimado{" "}
        <strong className="font-medium text-[var(--fg-primary)]">
          {brl(CURRENT_INVOICE.total)}
        </strong>
      </p>
    </AwCard>
  );
}

function PlanCard() {
  return (
    <AwCard className="flex flex-col gap-4 !p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
          Plano atual
        </p>
        <AwPill variant="live">{CURRENT_PLAN.status}</AwPill>
      </div>

      <div>
        <h3 className="m-0 text-[24px] font-semibold leading-tight tracking-[-0.01em] text-[var(--fg-primary)]">
          {CURRENT_PLAN.name}
        </h3>
        <p className="m-0 mt-1 text-[12px] text-[var(--fg-secondary)]">
          {brl(CURRENT_PLAN.monthly)} / mês · próxima cobrança em{" "}
          <strong className="font-medium text-[var(--fg-primary)]">
            {CURRENT_PLAN.nextChargeAt}
          </strong>
        </p>
      </div>

      <ul className="m-0 flex flex-col gap-1.5 p-0 text-[12.5px] text-[var(--fg-secondary)]">
        <li className="flex items-center gap-2">
          <Icon
            name="check"
            size={14}
            className="text-[var(--accent-success)]"
          />
          Disparos, leads e tokens incluídos no plano
        </li>
        <li className="flex items-center gap-2">
          <Icon
            name="check"
            size={14}
            className="text-[var(--accent-success)]"
          />
          Cobrança parcial automática a cada {brl(OVERVIEW_KPIS.partialChargeAt)}
        </li>
        <li className="flex items-center gap-2">
          <Icon
            name="check"
            size={14}
            className="text-[var(--accent-success)]"
          />
          Suporte dedicado &amp; SLA prioritário
        </li>
      </ul>

      <div className="mt-auto flex flex-wrap gap-2">
        <AwButton size="sm" variant="secondary">
          Mudar plano
        </AwButton>
        <AwButton size="sm" variant="ghost">
          Detalhes do plano
        </AwButton>
      </div>
    </AwCard>
  );
}

/* ---------- info banner ---------- */

function PartialChargeBanner() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3">
      <Icon name="info" size={18} className="shrink-0 text-[var(--fg-tertiary)]" />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[13px] font-medium text-[var(--fg-primary)]">
          Cobrança parcial em {brl(OVERVIEW_KPIS.partialChargeAt)}
        </p>
        <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
          Não limitamos seu uso. Quando o acumulado atinge esse valor,
          emitimos uma fatura parcial e o contador reinicia.
        </p>
      </div>
      <AwButton size="sm" variant="ghost">
        Saiba mais
      </AwButton>
    </div>
  );
}

/* ---------- shortcut grid ---------- */

function ShortcutGrid() {
  const paidCount = INVOICE_HISTORY.filter((r) => r.status === "Paga").length;
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <Shortcut
        icon="receipt_long"
        title="Fatura atual"
        description={`Vence em ${CURRENT_INVOICE.dueAt} · ${brl(CURRENT_INVOICE.total)}`}
        href="#fatura-atual"
      />
      <Shortcut
        icon="credit_card"
        title="Forma de pagamento"
        description={`${CURRENT_INVOICE.paymentMethod.brand} •••• ${CURRENT_INVOICE.paymentMethod.last4} · trocar`}
        href="#metodos-pagamento"
      />
      <Shortcut
        icon="savings"
        title="Economia com créditos"
        description={`${brl(OVERVIEW_KPIS.monthSavings)} este mês · ver vouchers ativos`}
        href="/settings/financeiro/saldo-creditos"
      />
      <Shortcut
        icon="history"
        title="Histórico de faturas"
        description={`${paidCount} faturas pagas · baixar comprovantes`}
        href="#historico"
      />
    </div>
  );
}

function Shortcut({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brand)] focus-visible:ring-offset-2"
    >
      <AwCard interactive className="!p-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
            <Icon name={icon} size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[13.5px] font-medium text-[var(--fg-primary)]">
              {title}
            </p>
            <p className="m-0 truncate text-[12px] text-[var(--fg-secondary)]">
              {description}
            </p>
          </div>
          <Icon
            name="chevron_right"
            size={18}
            className="shrink-0 text-[var(--fg-tertiary)]"
          />
        </div>
      </AwCard>
    </Link>
  );
}
