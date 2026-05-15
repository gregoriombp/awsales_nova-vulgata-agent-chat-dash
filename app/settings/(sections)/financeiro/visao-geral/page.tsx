"use client";

import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwProgress } from "@/components/ui/AwProgress";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "../../_components/shared";
import { CardBrandLogo } from "../_components/CardBrandLogo";
import { VariableSpendingBlock } from "../_components/VariableSpendingBlock";
import {
  brl,
  CURRENT_INVOICE,
  CURRENT_PLAN,
  OVERVIEW_KPIS,
  PAYMENT_METHODS,
} from "../_components/data";

export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-10">
      <BillingHero />

      <section>
        <SectionHeading
          title="Gastos variáveis"
          description="Distribuição do consumo no período. Alterne entre serviço e campanha pra rastrear de onde vem o gasto."
        />
        <VariableSpendingBlock />
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
  const variableLimit = OVERVIEW_KPIS.partialChargeAt;
  const variableSoFar = OVERVIEW_KPIS.accumulated;
  const planMonthly = CURRENT_PLAN.monthly;
  const nextChargeTotal = planMonthly + variableSoFar;
  const variablePct = OVERVIEW_KPIS.accumulatedPct;

  return (
    <AwCard className="flex flex-col gap-6 !p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
          Próxima cobrança
        </p>
        <span className="body-xs font-medium tabular-nums text-[var(--fg-tertiary)]">
          em 14 dias · {CURRENT_INVOICE.dueAt}
        </span>
      </div>

      <div>
        <h1 className="m-0 display-md tabular-nums text-[var(--fg-primary)]">
          {brl(nextChargeTotal)}
        </h1>
        <p className="m-0 mt-3 body-xs text-[var(--fg-secondary)]">
          Cobrada em{" "}
          <strong className="font-medium text-[var(--fg-primary)]">
            {CURRENT_INVOICE.dueAt}
          </strong>{" "}
          <em>ou</em> quando os variáveis chegarem em{" "}
          <strong className="font-medium text-[var(--fg-primary)]">
            {brl(variableLimit)}
          </strong>{" "}
          — o que vier primeiro.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
        <div className="flex items-baseline justify-between gap-2 py-2 body-xs">
          <span className="text-[var(--fg-secondary)]">Plano mensal</span>
          <span className="font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(planMonthly)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2 py-2 body-xs">
          <span className="text-[var(--fg-secondary)]">Variáveis até agora</span>
          <span className="font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(variableSoFar)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2 body-xs text-[var(--fg-tertiary)]">
          <span>Limite de gastos variáveis</span>
          <span className="tabular-nums">
            {brl(variableSoFar)} / {brl(variableLimit)} · {variablePct}%
          </span>
        </div>
        <AwProgress value={variablePct} max={100} valueLabel="" />
      </div>
    </AwCard>
  );
}

function PlanCard() {
  const defaultMethod =
    PAYMENT_METHODS.find((m) => m.isDefault) ?? PAYMENT_METHODS[0];

  return (
    <AwCard className="flex flex-col gap-4 !p-6 !border-transparent !bg-[var(--aw-gray-1200)] text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 aw-eyebrow text-white/55">
          Plano atual
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 aw-eyebrow text-white/90 ring-1 ring-inset ring-white/20">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-success)]" />
          {CURRENT_PLAN.status}
        </span>
      </div>

      <div>
        <h4 className="m-0 text-white">
          {CURRENT_PLAN.name}
        </h4>
        <p className="m-0 mt-1 body-xs text-white/65">
          {brl(CURRENT_PLAN.monthly)} / mês · próxima cobrança em{" "}
          <strong className="font-medium text-white">
            {CURRENT_PLAN.nextChargeAt}
          </strong>
        </p>
      </div>

      {defaultMethod && (
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-white/[0.06] px-3 py-2.5 ring-1 ring-inset ring-white/10">
          <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded-[6px] bg-white">
            <CardBrandLogo brand={defaultMethod.brand} size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 aw-eyebrow text-white/55">
              Cobrado em
            </p>
            <p className="m-0 body-xs font-medium text-white tabular-nums">
              {defaultMethod.brand} •••• {defaultMethod.last4}
              <span className="ml-1.5 font-normal text-white/55">
                · expira {defaultMethod.expiresAt}
              </span>
            </p>
          </div>
          <Link
            href="/settings/financeiro/metodos-pagamento"
            className="shrink-0 body-xs font-medium text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            Trocar
          </Link>
        </div>
      )}

      <ul className="m-0 flex flex-col gap-1.5 p-0 body-xs text-white/75">
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

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <AwButton
          size="sm"
          variant="secondary"
          className="!bg-white !text-[var(--aw-gray-1200)] hover:!bg-white/90"
        >
          Mudar plano
        </AwButton>
        <AwButton
          size="sm"
          variant="ghost"
          className="!text-white/85 hover:!bg-white/10"
        >
          Detalhes do plano
        </AwButton>
      </div>
    </AwCard>
  );
}
