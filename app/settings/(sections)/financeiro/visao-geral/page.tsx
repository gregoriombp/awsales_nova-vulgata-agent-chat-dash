"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { Icon } from "@/components/ui/Icon";
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
          description="Distribuição do consumo no período. Alterne entre serviço e campanha pra rastrear de onde vem o gasto."
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
        <h1 className="m-0 mt-2 display-lg tabular-nums text-[var(--fg-primary)]">
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

type ShortcutItem = {
  href: string;
  icon: string;
  title: string;
  detail: string;
};

function ShortcutGrid() {
  const defaultMethod =
    PAYMENT_METHODS.find((m) => m.isDefault) ?? PAYMENT_METHODS[0];
  const latestInvoice = INVOICE_HISTORY[0];
  const lastAudit = AUDIT_EVENTS[0];

  const items: ShortcutItem[] = [
    {
      href: "/settings/financeiro/saldo-creditos",
      icon: "redeem",
      title: "Saldo de créditos",
      detail: `${brl(CREDITS_KPIS.availableDiscount)} disponível · ${CREDITS_KPIS.activeVouchers} vouchers ativos`,
    },
    {
      href: "/settings/financeiro/metodos-pagamento",
      icon: "credit_card",
      title: "Métodos de pagamento",
      detail: defaultMethod
        ? `${defaultMethod.brand} •••• ${defaultMethod.last4} como padrão · ${PAYMENT_METHODS.length} cadastrados`
        : `${PAYMENT_METHODS.length} cadastrados`,
    },
    {
      href: "/settings/financeiro/historico-faturas",
      icon: "receipt_long",
      title: "Histórico de faturas",
      detail: `Última: ${latestInvoice.refMonth} · ${brl(latestInvoice.net)}`,
    },
    {
      href: "/settings/financeiro/auditoria",
      icon: "history",
      title: "Auditoria",
      detail: `Última atividade ${lastAudit.date} às ${lastAudit.time}`,
    },
  ];

  return (
    <AwCard className="!p-0">
      <ul className="m-0 grid grid-cols-1 list-none p-0 sm:grid-cols-2">
        {items.map((item, i) => {
          const isRightCol = i % 2 === 1;
          const isBottomRow = i >= 2;
          return (
            <li
              key={item.href}
              className={[
                "m-0",
                // horizontal divider between rows (mobile)
                i > 0 ? "border-t border-[var(--border-subtle)]" : "",
                // reset top border for second column on desktop
                isRightCol ? "sm:border-t-0" : "",
                // top border for bottom row on desktop
                isBottomRow ? "sm:border-t sm:border-[var(--border-subtle)]" : "",
                // vertical divider between columns on desktop
                !isRightCol ? "sm:border-r sm:border-[var(--border-subtle)]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Link
                href={item.href}
                className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-[var(--bg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brand)] focus-visible:ring-inset"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-[var(--fg-secondary)] transition-colors group-hover:bg-[var(--bg-raised)]">
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block body-sm font-medium text-[var(--fg-primary)]">
                    {item.title}
                  </span>
                  <span className="block body-xs text-[var(--fg-secondary)]">
                    {item.detail}
                  </span>
                </span>
                <Icon
                  name="chevron_right"
                  size={18}
                  className="shrink-0 text-[var(--fg-tertiary)] transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </AwCard>
  );
}
