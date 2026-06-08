"use client";

import * as React from "react";
import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwShortcutTile } from "@/components/ui/AwShortcutTile";
import { Icon } from "@/components/ui/Icon";
import { CardBrandLogo } from "../_components/CardBrandLogo";
import { MoneyHeading } from "../_components/MoneyHeading";
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
      <div className="grid grid-cols-[1.15fr_1fr] gap-6">
        <InvoiceCard />
        <SpendingHero limit={VARIABLE_SPENDING_LIMIT} />
      </div>
      <ShortcutGrid />
    </div>
  );
}

/* ---------- invoice card (panel with the upcoming total + actions) ---------- */

function InvoiceCard() {
  const total = CURRENT_PLAN.monthly + OVERVIEW_KPIS.accumulated;
  const days = daysUntil(CURRENT_INVOICE.dueAt);

  return (
    <AwCard className="flex flex-col gap-5 bg-(--bg-surface)! p-6!">
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
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <AwButton variant="primary" size="sm">
          Pagar agora
        </AwButton>
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

/* ---------- spending hero (variable consumption against the cap) ---------- */

function SpendingHero({ limit }: { limit: number }) {
  const pct = Math.round((OVERVIEW_KPIS.accumulated / limit) * 100);

  return (
    <section className="flex flex-col gap-5">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--bg-raised) px-2.5 py-1 body-xs font-medium text-(--fg-primary)">
        <Icon
          name="workspace_premium"
          size={14}
          className="text-(--aw-amber-600)"
        />
        {CURRENT_PLAN.name}
      </span>
      <div className="flex flex-col gap-1">
        <span className="aw-eyebrow text-(--fg-tertiary)">
          Consumo de variáveis
        </span>
        <p className="m-0 mt-1 body-sm text-(--fg-secondary)">
          Cada usuário tem um limite de{" "}
          <strong className="font-medium tabular-nums text-(--fg-primary)">
            {brl(limit)}
          </strong>{" "}
          em gastos variáveis por ciclo. Quando o montante é atingido, a gente
          cobra automaticamente.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <AwProgress
          value={OVERVIEW_KPIS.accumulated}
          max={limit}
          className="[&_.aw-progress__fill]:bg-(--fg-primary)!"
        />
        <div className="flex items-baseline justify-between">
          <span className="body-xs tabular-nums text-(--fg-tertiary)">
            {pct}% utilizado
          </span>
          <span className="body-md tabular-nums text-(--fg-primary)">
            <span className="mr-1 body-xs text-(--fg-tertiary)">R$</span>
            <strong className="font-medium">
              {brl(OVERVIEW_KPIS.accumulated).replace(/^R\$\s*/, "")}
            </strong>
            <span className="body-xs text-(--fg-tertiary)">
              {" "}
              / {brl(limit)}
            </span>
          </span>
        </div>
      </div>
    </section>
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
