"use client";

import { useRouter } from "next/navigation";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwShortcutTile } from "@/components/ui/AwShortcutTile";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "../../_components/shared";
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

export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-10">
      <BillingHero />
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
  const total = CURRENT_PLAN.monthly + OVERVIEW_KPIS.accumulated;
  const { brand, last4 } = CURRENT_INVOICE.paymentMethod;

  const activeVouchers = VOUCHERS.filter((v) => v.status === "Ativo");
  const creditTotal = activeVouchers.reduce((s, v) => s + v.total, 0);
  const creditConsumed = activeVouchers.reduce((s, v) => s + v.consumed, 0);

  return (
    <section className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
      <AwCard className="flex flex-col gap-2 !px-6 !py-5">
        <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
          Próxima cobrança · {CURRENT_INVOICE.dueAt}
        </p>
        <h1 className="m-0 display-md tabular-nums text-[var(--fg-primary)]">
          <span className="mr-1 text-[0.45em] font-normal text-[var(--fg-tertiary)]">
            R$
          </span>
          {brl(total).replace(/^R\$\s*/, "")}
        </h1>
        <p className="m-0 mt-1 max-w-[520px] body-xs text-[var(--fg-secondary)]">
          {CURRENT_PLAN.name}{" "}
          <strong className="font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(CURRENT_PLAN.monthly)}
          </strong>{" "}
          + variáveis até agora{" "}
          <strong className="font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(OVERVIEW_KPIS.accumulated)}
          </strong>
          .
        </p>
        <div className="mt-auto flex items-center gap-2 border-t border-[var(--border-subtle)] pt-3">
          <CardBrandLogo brand={brand} size={26} />
          <span className="body-xs text-[var(--fg-secondary)]">
            {brand} •••• {last4} · débito automático
          </span>
        </div>
      </AwCard>

      <CreditBalanceCard
        balance={creditTotal - creditConsumed}
        consumed={creditConsumed}
        total={creditTotal}
        vouchers={activeVouchers.length}
        coupons={COUPONS_APPLIED.length}
      />
    </section>
  );
}

/* ---------- credit balance card ---------- */

function CreditBalanceCard({
  balance,
  consumed,
  total,
  vouchers,
  coupons,
}: {
  balance: number;
  consumed: number;
  total: number;
  vouchers: number;
  coupons: number;
}) {
  const router = useRouter();
  const consumedPct = total > 0 ? Math.round((consumed / total) * 100) : 0;

  return (
    <AwCard className="flex flex-col gap-4 !px-6 !py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
            Saldo em créditos
          </p>
          <p className="m-0 display-sm tabular-nums text-[var(--fg-primary)]">
            <span className="mr-1 text-[0.5em] font-normal text-[var(--fg-tertiary)]">
              R$
            </span>
            {brl(balance).replace(/^R\$\s*/, "")}
          </p>
        </div>
        <AwButton
          size="sm"
          variant="secondary"
          iconLeft="add"
          onClick={() => router.push("/settings/financeiro/saldo-creditos")}
        >
          Adicionar saldo
        </AwButton>
      </div>
      <AwProgress
        value={consumed}
        max={total}
        label="Consumo do saldo"
        valueLabel={`${100 - consumedPct}% restante`}
        className="[&_.aw-progress__fill]:!bg-[var(--aw-slate-700)]"
      />
      <div className="mt-auto flex items-center gap-2 border-t border-[var(--border-subtle)] pt-3">
        <Icon name="redeem" size={15} className="text-[var(--fg-tertiary)]" />
        <span className="body-xs text-[var(--fg-secondary)]">
          Acumulado de {vouchers} {vouchers === 1 ? "voucher" : "vouchers"} e{" "}
          {coupons} {coupons === 1 ? "cupom" : "cupons"}
        </span>
      </div>
    </AwCard>
  );
}

/* ---------- shortcut grid ---------- */

function ShortcutGrid() {
  const latestInvoice = INVOICE_HISTORY[0];
  const lastAudit = AUDIT_EVENTS[0];

  return (
    <AwCard className="!p-2 !border-0">
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        <AwShortcutTile
          icon="receipt_long"
          title="Histórico de faturas"
          description={`Última: ${latestInvoice.refMonth} · ${brl(latestInvoice.net)}`}
          href="/settings/financeiro/historico-faturas"
        />
        <AwShortcutTile
          icon="history"
          title="Atividade"
          description={`Última atividade ${lastAudit.date} às ${lastAudit.time}`}
          href="/settings/financeiro/auditoria"
        />
      </div>
    </AwCard>
  );
}
