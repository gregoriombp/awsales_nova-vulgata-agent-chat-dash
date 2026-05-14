"use client";

import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import { brl, CURRENT_INVOICE } from "./data";

export function InvoiceCard() {
  const { dueAt, total, paymentMethod, status } = CURRENT_INVOICE;
  return (
    <AwCard className="!p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-2">
          <p className="m-0 text-[14px] font-semibold text-[var(--fg-primary)]">
            Fatura atual
          </p>
          <AwPill variant="draft">{status}</AwPill>
        </div>
        <AwButton size="sm" variant="ghost" iconRight="open_in_new">
          Ver detalhes
        </AwButton>
      </div>
      <div className="grid grid-cols-1 gap-5 px-6 py-5 md:grid-cols-3">
        <Field label="Vencimento" value={dueAt} />
        <Field label="Total" value={brl(total)} emphasis />
        <div className="min-w-0">
          <p className="m-0 mb-1 text-[10.5px] uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Forma de pagamento
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--fg-primary)]">
              <span className="flex h-6 w-9 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border-default)] bg-[var(--bg-raised)] text-[9px] font-bold tracking-wider text-[var(--fg-primary)]">
                {paymentMethod.brand.toUpperCase()}
              </span>
              •••• {paymentMethod.last4}
            </span>
            <AwButton size="sm" variant="ghost" iconLeft="edit">
              Trocar
            </AwButton>
          </div>
        </div>
      </div>
    </AwCard>
  );
}

function Field({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="m-0 mb-1 text-[10.5px] uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
        {label}
      </p>
      <p
        className={
          emphasis
            ? "m-0 text-[18px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]"
            : "m-0 text-[13px] font-medium text-[var(--fg-primary)]"
        }
      >
        {value}
      </p>
    </div>
  );
}
