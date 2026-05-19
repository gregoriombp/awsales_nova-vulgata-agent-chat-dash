"use client";

import Link from "next/link";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { Icon } from "@/components/ui/Icon";
import { CardBrandLogo } from "../_components/CardBrandLogo";
import { VariableSpendingBlock } from "../_components/VariableSpendingBlock";
import {
  AUDIT_EVENTS,
  brl,
  COUPONS_APPLIED,
  CURRENT_INVOICE,
  CURRENT_PLAN,
  INVOICE_HISTORY,
  OVERVIEW_KPIS,
  VOUCHERS,
} from "../_components/data";

const TODAY = new Date(2026, 4, 19);

function daysUntil(br: string): number {
  const [d, m, y] = br.split("/").map(Number);
  return Math.round(
    (new Date(y, m - 1, d).getTime() - TODAY.getTime()) / 86_400_000,
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-10">
      <StatusStrip />
      <SpendingHero />
      <SideBySideSummary />
    </div>
  );
}

/* ---------- status strip (top, no card) ---------- */

function StatusStrip() {
  const total = CURRENT_PLAN.monthly + OVERVIEW_KPIS.accumulated;
  const { brand, last4 } = CURRENT_INVOICE.paymentMethod;
  const days = daysUntil(CURRENT_INVOICE.dueAt);

  return (
    <section className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b border-[var(--border-subtle)] pb-6">
      <div className="flex flex-col">
        <span className="aw-eyebrow text-[var(--fg-tertiary)]">
          Próxima cobrança · {CURRENT_INVOICE.dueAt}
          {days > 0 && ` · em ${days} dia${days !== 1 ? "s" : ""}`}
        </span>
        <h1 className="m-0 mt-1 display-md tabular-nums text-[var(--fg-primary)]">
          <span className="mr-1 text-[0.45em] font-normal text-[var(--fg-tertiary)]">
            R$
          </span>
          {brl(total).replace(/^R\$\s*/, "")}
        </h1>
        <p className="m-0 mt-1 body-sm text-[var(--fg-secondary)]">
          {CURRENT_PLAN.name} {brl(CURRENT_PLAN.monthly)} + variáveis até agora{" "}
          <strong className="font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(OVERVIEW_KPIS.accumulated)}
          </strong>
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Link
          href="/settings/financeiro/metodos-pagamento"
          className="group inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 transition-colors hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
        >
          <CardBrandLogo brand={brand} size={22} />
          <span className="body-xs tabular-nums text-[var(--fg-secondary)]">
            {brand} •••• {last4}
          </span>
          <span className="body-xs text-[var(--fg-tertiary)]">·</span>
          <span className="body-xs text-[var(--fg-tertiary)]">
            débito automático
          </span>
          <Icon
            name="arrow_forward"
            size={14}
            className="text-[var(--fg-tertiary)] transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
}

/* ---------- spending hero (main focus) ---------- */

function SpendingHero() {
  const pct = Math.round(
    (OVERVIEW_KPIS.accumulated / OVERVIEW_KPIS.partialChargeAt) * 100,
  );

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
            Consumo do ciclo
          </h6>
          <p className="m-0 max-w-[560px] body-xs text-[var(--fg-secondary)]">
            Gastos variáveis acumulados desde o início do mês. Quando bater{" "}
            {brl(OVERVIEW_KPIS.partialChargeAt)} a gente cobra parcial
            automaticamente.
          </p>
        </div>
        <div className="text-right">
          <p className="m-0 display-sm tabular-nums text-[var(--fg-primary)]">
            <span className="mr-1 text-[0.45em] font-normal text-[var(--fg-tertiary)]">
              R$
            </span>
            {brl(OVERVIEW_KPIS.accumulated).replace(/^R\$\s*/, "")}
          </p>
          <p className="m-0 body-xs tabular-nums text-[var(--fg-tertiary)]">
            {pct}% de {brl(OVERVIEW_KPIS.partialChargeAt)}
          </p>
        </div>
      </div>
      <AwProgress
        value={OVERVIEW_KPIS.accumulated}
        max={OVERVIEW_KPIS.partialChargeAt}
        className="[&_.aw-progress__fill]:!bg-[var(--fg-primary)]"
      />
      <VariableSpendingBlock />
    </section>
  );
}

/* ---------- bottom side-by-side: credits | next invoice preview | activity ---------- */

function SideBySideSummary() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <CreditsSummary />
      <NextInvoicePreview />
      <RecentActivity />
    </section>
  );
}

function CreditsSummary() {
  const active = VOUCHERS.filter((v) => v.status === "Ativo");
  const available = active.reduce((s, v) => s + (v.total - v.consumed), 0);

  return (
    <AwCard className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
            Saldo em créditos
          </p>
          <p className="m-0 mt-1 body-lg font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(available)}
          </p>
        </div>
        <Link
          href="/settings/financeiro/saldo-creditos"
          className="shrink-0 body-xs font-medium text-[var(--fg-secondary)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--fg-primary)] hover:no-underline"
        >
          Ver detalhes
        </Link>
      </div>
      <ul className="m-0 flex flex-col gap-2 p-0">
        {active.slice(0, 2).map((v) => {
          const remaining = v.total - v.consumed;
          return (
            <li
              key={v.id}
              className="m-0 flex items-center justify-between gap-3 list-none"
            >
              <span className="min-w-0 truncate body-xs text-[var(--fg-secondary)]">
                {v.description}
              </span>
              <span className="shrink-0 body-xs tabular-nums text-[var(--fg-tertiary)]">
                {brl(remaining)}
              </span>
            </li>
          );
        })}
        {COUPONS_APPLIED.length > 0 && (
          <li className="m-0 flex items-center justify-between gap-3 list-none">
            <span className="body-xs text-[var(--fg-secondary)]">
              {COUPONS_APPLIED.length}{" "}
              {COUPONS_APPLIED.length === 1
                ? "cupom aplicado"
                : "cupons aplicados"}
            </span>
            <Icon
              name="local_offer"
              size={14}
              className="text-[var(--fg-tertiary)]"
            />
          </li>
        )}
      </ul>
    </AwCard>
  );
}

function NextInvoicePreview() {
  const total = CURRENT_PLAN.monthly + OVERVIEW_KPIS.accumulated;
  return (
    <AwCard className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
            Fatura em formação
          </p>
          <p className="m-0 mt-1 body-lg font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(total)}
          </p>
        </div>
        <AwPill variant="draft">Em aberto</AwPill>
      </div>
      <ul className="m-0 flex flex-col gap-2 p-0">
        <li className="m-0 flex items-center justify-between gap-3 list-none">
          <span className="body-xs text-[var(--fg-secondary)]">
            Plano {CURRENT_PLAN.name.replace("Plano ", "")}
          </span>
          <span className="body-xs tabular-nums text-[var(--fg-tertiary)]">
            {brl(CURRENT_PLAN.monthly)}
          </span>
        </li>
        <li className="m-0 flex items-center justify-between gap-3 list-none">
          <span className="body-xs text-[var(--fg-secondary)]">
            Variáveis até agora
          </span>
          <span className="body-xs tabular-nums text-[var(--fg-tertiary)]">
            {brl(OVERVIEW_KPIS.accumulated)}
          </span>
        </li>
        <li className="m-0 flex items-center justify-between gap-3 list-none">
          <span className="body-xs text-[var(--fg-secondary)]">
            Fecha em {CURRENT_INVOICE.dueAt}
          </span>
          <Link
            href="/settings/financeiro/historico-faturas"
            className="body-xs font-medium text-[var(--fg-secondary)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--fg-primary)] hover:no-underline"
          >
            Ver histórico
          </Link>
        </li>
      </ul>
    </AwCard>
  );
}

function RecentActivity() {
  const recent = AUDIT_EVENTS.slice(0, 3);
  return (
    <AwCard className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
            Atividade recente
          </p>
          <p className="m-0 mt-1 body-xs text-[var(--fg-secondary)]">
            Últimos eventos do ciclo
          </p>
        </div>
        <Link
          href="/settings/financeiro/auditoria"
          className="shrink-0 body-xs font-medium text-[var(--fg-secondary)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--fg-primary)] hover:no-underline"
        >
          Ver tudo
        </Link>
      </div>
      <ul className="m-0 flex flex-col gap-3 p-0">
        {recent.map((event) => (
          <li
            key={event.id}
            className="m-0 flex items-start gap-3 list-none"
          >
            <AwAvatar
              size="sm"
              src={event.actorAvatar}
              alt={event.actor}
              initials={getInitials(event.actor)}
            />
            <div className="min-w-0 flex-1">
              <p className="m-0 body-xs font-medium text-[var(--fg-primary)]">
                {event.action}
              </p>
              <p className="m-0 line-clamp-1 body-xs text-[var(--fg-tertiary)]">
                {event.actor} · {event.date}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {INVOICE_HISTORY[0] && (
        <p className="m-0 body-xs text-[var(--fg-tertiary)]">
          Última fatura: {INVOICE_HISTORY[0].refMonth} ·{" "}
          {brl(INVOICE_HISTORY[0].net)}
        </p>
      )}
    </AwCard>
  );
}
