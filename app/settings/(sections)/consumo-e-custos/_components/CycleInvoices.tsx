"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import {
  brl,
  invoiceStatusLabel,
  type InvoiceHistoryRow,
} from "../../financeiro/_components/data";
import {
  InvoiceDetailsSheet,
  statusVariant,
} from "../../financeiro/_components/InvoiceDetailsSheet";
import { cycleInvoices, type BillingCycle } from "./cycles-data";

/* ----------------------------------------------------------------------------
 * Faturas do ciclo — a fixa do plano + as de uso variável que bateram no mês.
 * Linhas flat (sem card-em-card); clicar abre o MESMO sheet de detalhes do
 * Financeiro. O disclaimer do Meta é OBRIGATÓRIO (Notion): fatura nunca
 * contempla o que a Meta cobra direto.
 * ------------------------------------------------------------------------- */

export function CycleInvoices({ cycle }: { cycle: BillingCycle }) {
  const invoices = cycleInvoices(cycle);
  const [selected, setSelected] = React.useState<InvoiceHistoryRow | null>(null);

  return (
    <section aria-label="Faturas do ciclo" className="flex flex-col gap-4">
      <header>
        <h4 className="m-0 text-(--fg-primary)">Faturas do ciclo</h4>
        <p className="m-0 mt-1 body-xs text-(--fg-tertiary)">
          O que foi cobrado neste mês — a fixa do plano e o uso variável.
        </p>
      </header>

      {invoices.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-(--border-default) px-5 py-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--bg-muted) text-(--fg-tertiary)">
            <Icon name="receipt_long" size={20} />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="body-sm font-medium text-(--fg-primary)">
              A fatura deste ciclo ainda não fechou
            </span>
            <span className="body-xs text-(--fg-tertiary)">
              Fecha em {cycle.endsAt} — até lá, os valores desta aba são parciais.
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col rounded-2xl border border-(--border-subtle) bg-(--bg-raised)">
          {invoices.map((inv, i) => (
            <button
              key={inv.id}
              type="button"
              onClick={() => setSelected(inv)}
              className={cn(
                "group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-aw-fast hover:bg-(--bg-hover)",
                i > 0 && "border-t border-(--border-subtle)",
                i === 0 && "rounded-t-2xl",
                i === invoices.length - 1 && "rounded-b-2xl",
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--bg-muted) text-(--fg-secondary)">
                <Icon
                  name={inv.description.startsWith("Plano") ? "workspace_premium" : "receipt_long"}
                  size={20}
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate body-sm font-medium text-(--fg-primary)">
                  {inv.description}
                </span>
                <span className="truncate body-xs text-(--fg-tertiary)">
                  {inv.id} · vence em {inv.dueAt}
                  {inv.paidAt ? ` · paga em ${inv.paidAt}` : ""}
                </span>
              </span>
              <span className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
                <span className="body-sm font-semibold tabular-nums text-(--fg-primary)">
                  {brl(inv.net)}
                </span>
                {inv.discount ? (
                  <span className="body-xs text-(--accent-success)">
                    cupom {inv.discountCode} · − {brl(inv.discount)}
                  </span>
                ) : (
                  <span className="body-xs text-(--fg-tertiary)">{inv.paymentMethod}</span>
                )}
              </span>
              <AwPill variant={statusVariant(inv.status)}>
                {invoiceStatusLabel(inv.status)}
              </AwPill>
              <Icon
                name="chevron_right"
                size={18}
                className="shrink-0 text-(--fg-muted) transition-colors duration-aw-fast group-hover:text-(--fg-secondary)"
              />
            </button>
          ))}
        </div>
      )}

      <AwAlert
        variant="info"
        title="As faturas não incluem o Meta"
        icon="info"
      >
        <span className="inline-flex flex-wrap items-center gap-1">
          Disparos cobrados pela Meta (
          <AwBrandLogo brand="meta" size={14} markOnly /> aprox.{" "}
          <strong className="font-medium">{brl(cycle.metaUsageApprox)}</strong> neste
          ciclo) são pagos direto a ela e não passam pela Aswork — por isso
          aparecem no uso, mas nunca na fatura.
        </span>
      </AwAlert>

      <InvoiceDetailsSheet
        invoice={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
