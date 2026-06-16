"use client";

import * as React from "react";
import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwShortcutTile } from "@/components/ui/AwShortcutTile";
import { Icon } from "@/components/ui/Icon";
import { AwPlanIcon, type PlanKey } from "@/components/ui/AwPlanIcon";
import { CardBrandLogo } from "../_components/CardBrandLogo";
import { MoneyHeading } from "../_components/MoneyHeading";
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
  VARIABLE_SPENDING_LIMIT,
} from "../_components/data";

const TODAY = new Date(2026, 4, 19);

function daysUntil(br: string): number {
  const [d, m, y] = br.split("/").map(Number);
  return Math.round(
    (new Date(y, m - 1, d).getTime() - TODAY.getTime()) / 86_400_000,
  );
}

export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6">
        <div className="grid grid-cols-[1.15fr_1fr] gap-6">
          <PlanCard />
          <InvoiceCard />
        </div>
        <KpiGrid />
      </header>
      <ShortcutGrid />
      <ConsumptionDetails />
    </div>
  );
}

/* ---------- consumption details (gráfico + breakdown, mesmo bloco do Consumo) ---------- */

function ConsumptionDetails() {
  const [comingSoonOpen, setComingSoonOpen] = React.useState(false);

  return (
    <section className="flex flex-col gap-4 border-t border-(--border-subtle) pt-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h6 className="m-0 mb-1 text-(--fg-primary)">Detalhes de consumo</h6>
          <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
            Breakdown por serviço ou por agente, com o gráfico de gastos por dia
            logo acima da tabela. Use o filtro de período para investigar o que
            está consumindo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setComingSoonOpen(true)}
          className="mt-0.5 inline-flex shrink-0 items-center gap-1 body-xs font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 transition-colors duration-aw-fast hover:text-(--fg-primary) hover:no-underline"
        >
          <Icon name="open_in_full" size={13} />
          Visão detalhada
        </button>
      </header>
      <VariableSpendingBlock />

      <AwModal
        open={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        title="Visão detalhada"
        footer={
          <AwButton
            size="sm"
            variant="primary"
            onClick={() => setComingSoonOpen(false)}
          >
            Entendi
          </AwButton>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-muted) text-(--fg-secondary)">
            <Icon name="rocket_launch" size={24} />
          </span>
          <h6 className="m-0 text-(--fg-primary)">Em breve</h6>
          <p className="m-0 max-w-[360px] body-xs text-(--fg-secondary)">
            Estamos preparando uma análise de consumo mais aprofundada — com
            cruzamentos por serviço, agente e período no mesmo lugar. Em breve
            ela aparece aqui.
          </p>
        </div>
      </AwModal>
    </section>
  );
}

/* ---------- plan card (dark hero — plano atual + consumo do ciclo) ---------- */

function planKey(name: string): PlanKey {
  const n = name.toLowerCase();
  if (n.includes("enterprise")) return "enterprise";
  if (n.includes("pro")) return "pro";
  return "starter";
}

function PlanCard() {
  const pct = Math.round(
    (OVERVIEW_KPIS.accumulated / VARIABLE_SPENDING_LIMIT) * 100,
  );

  return (
    <AwCard className="relative isolate overflow-hidden bg-(--bg-inverse)! p-6! text-(--fg-on-inverse)">
      <AwPlanIcon
        plan={planKey(CURRENT_PLAN.name)}
        variant="dark"
        className="pointer-events-none absolute -right-6 -top-4 -z-10 h-44 w-44 opacity-[0.20]"
      />

      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="aw-eyebrow text-(--fg-on-inverse) opacity-55">
            Seu plano
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2 className="m-0 display-sm text-[2rem] text-(--fg-on-inverse)">
              {CURRENT_PLAN.name}
            </h2>
            <AwPill variant="live">{CURRENT_PLAN.status}</AwPill>
          </div>
          <p className="m-0 body-sm tabular-nums text-(--fg-on-inverse) opacity-65">
            <strong className="font-medium opacity-100">
              {brl(CURRENT_PLAN.monthly)}
            </strong>{" "}
            /mês · renova em {CURRENT_PLAN.nextChargeAt}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="body-sm text-(--fg-on-inverse) opacity-65">
                Consumo variável do ciclo
              </span>
              <span className="body-sm tabular-nums text-(--fg-on-inverse) opacity-55">
                <strong className="font-medium opacity-100">
                  {brl(OVERVIEW_KPIS.accumulated)}
                </strong>{" "}
                / {brl(VARIABLE_SPENDING_LIMIT)}
              </span>
            </div>
            <AwProgress
              value={OVERVIEW_KPIS.accumulated}
              max={VARIABLE_SPENDING_LIMIT}
              className="[&_.aw-progress]:bg-(--fg-on-inverse)/15 [&_.aw-progress__fill]:bg-(--fg-on-inverse)!"
            />
          </div>

          <Link
            href="/settings/financeiro/consumo"
            className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-(--border-inverse) px-4 py-2 body-sm font-medium text-(--fg-on-inverse) transition-colors duration-aw-fast hover:bg-(--fg-on-inverse)/10"
          >
            <Icon name="compare_arrows" size={16} />
            Comparar planos
          </Link>
        </div>
      </div>
    </AwCard>
  );
}

/* ---------- invoice card (panel with the upcoming total + actions) ---------- */

function InvoiceCard() {
  const discount = OVERVIEW_KPIS.monthSavings;
  const total =
    CURRENT_PLAN.monthly + OVERVIEW_KPIS.accumulated - discount;
  const days = daysUntil(CURRENT_INVOICE.dueAt);

  return (
    <AwCard className="flex flex-col gap-5 p-6!">
      <div className="flex items-center justify-between gap-3">
        <h6 className="m-0 body-md font-medium text-(--fg-primary)">
          Fatura atual
        </h6>
        <PaymentMethodLink />
      </div>

      <div className="flex flex-col gap-1">
        <MoneyHeading value={total} size="sm" as="p" />
        <span className="aw-eyebrow text-(--fg-tertiary)">
          Próxima cobrança · {CURRENT_INVOICE.dueAt}
          {days > 0 && ` · em ${days} dia${days !== 1 ? "s" : ""}`}
        </span>
        <p className="m-0 mt-1 body-sm text-(--fg-secondary)">
          {CURRENT_PLAN.name} {brl(CURRENT_PLAN.monthly)} + variáveis até agora{" "}
          <strong className="font-medium tabular-nums text-(--fg-primary)">
            {brl(OVERVIEW_KPIS.accumulated)}
          </strong>
        </p>
        {discount > 0 && (
          <p className="m-0 inline-flex items-center gap-1.5 body-sm text-(--accent-success)">
            <Icon name="local_offer" size={14} />
            Descontos neste ciclo{" "}
            <strong className="font-medium tabular-nums">
              −{brl(discount)}
            </strong>
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <AwButton variant="secondary" size="sm">
          Adiantar pagamento
        </AwButton>
      </div>
    </AwCard>
  );
}

function PaymentMethodLink() {
  const { brand, last4 } = CURRENT_INVOICE.paymentMethod;
  return (
    <Link
      href="/settings/financeiro/metodos-pagamento"
      className="group inline-flex items-center gap-2 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-2.5 py-1.5 transition-colors hover:border-(--border-default) hover:bg-(--bg-hover)"
    >
      <CardBrandLogo brand={brand} size={18} />
      <span className="body-xs tabular-nums text-(--fg-secondary)">
        {brand} •••• {last4}
      </span>
      <Icon
        name="arrow_forward"
        size={12}
        className="text-(--fg-tertiary) transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/* ---------- kpi grid (resumo do ciclo em três cartões) ---------- */

function KpiGrid() {
  const usagePct = Math.round(
    (OVERVIEW_KPIS.accumulated / VARIABLE_SPENDING_LIMIT) * 100,
  );

  return (
    <div className="grid grid-cols-3 gap-6">
      <KpiCard
        icon="trending_up"
        accent="blue"
        label="Consumo variável · ciclo"
        value={brl(OVERVIEW_KPIS.accumulated)}
        hint={`${usagePct}% do limite de ${brl(VARIABLE_SPENDING_LIMIT)}`}
      />
      <KpiCard
        icon="redeem"
        accent="purple"
        label="Créditos disponíveis"
        value={brl(CREDITS_KPIS.availableDiscount)}
        hint={`${CREDITS_KPIS.activeVouchers} vouchers ativos`}
      />
      <KpiCard
        icon="savings"
        accent="emerald"
        label="Economia no ciclo"
        value={`−${brl(OVERVIEW_KPIS.monthSavings)}`}
        hint="Cupons e créditos aplicados"
        valueClassName="text-(--accent-success)"
      />
    </div>
  );
}

const KPI_ACCENTS = {
  blue: "border-(--aw-blue-200) bg-(--aw-blue-100) text-(--aw-blue-600)",
  purple: "border-(--aw-purple-200) bg-(--aw-purple-100) text-(--aw-purple-600)",
  emerald:
    "border-(--aw-emerald-200) bg-(--aw-emerald-100) text-(--aw-emerald-600)",
} as const;

function KpiCard({
  icon,
  accent,
  label,
  value,
  hint,
  valueClassName,
}: {
  icon: string;
  accent: keyof typeof KPI_ACCENTS;
  label: string;
  value: string;
  hint: string;
  valueClassName?: string;
}) {
  return (
    <AwCard className="flex flex-col gap-3 p-5!">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${KPI_ACCENTS[accent]}`}
        >
          <Icon name={icon} size={16} />
        </span>
        <span className="body-sm text-(--fg-secondary)">{label}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className={`text-[1.75rem] font-medium leading-none tracking-tight tabular-nums text-(--fg-primary) ${valueClassName ?? ""}`}
        >
          {value}
        </span>
        <span className="body-xs text-(--fg-tertiary)">{hint}</span>
      </div>
    </AwCard>
  );
}

/* ---------- shortcut grid (atalhos para as subpáginas) ---------- */

function ShortcutGrid() {
  const defaultMethod =
    PAYMENT_METHODS.find((m) => m.isDefault) ?? PAYMENT_METHODS[0];
  const latestInvoice = INVOICE_HISTORY[0];
  const lastAudit = AUDIT_EVENTS[0];

  return (
    <AwCard className="p-2!">
      <ul className="m-0 grid grid-cols-2 list-none p-0">
        <li className="m-0">
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
        </li>
        <li className="m-0">
          <AwShortcutTile
            icon="receipt_long"
            title="Faturas"
            description={`Última: ${latestInvoice.refMonth} · ${brl(latestInvoice.net)}`}
            href="/settings/financeiro/historico-faturas"
          />
        </li>
        <li className="m-0">
          <AwShortcutTile
            icon="history"
            title="Atividade"
            description={`Última: ${lastAudit.date} às ${lastAudit.time}`}
            href="/settings/financeiro/auditoria"
          />
        </li>
      </ul>
    </AwCard>
  );
}
