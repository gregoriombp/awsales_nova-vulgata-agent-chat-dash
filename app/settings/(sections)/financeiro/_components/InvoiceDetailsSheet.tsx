"use client";

import { AwButton } from "@/components/ui/AwButton";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwSheet } from "@/components/ui/AwSheet";
import { Icon } from "@/components/ui/Icon";
import { brl, type InvoiceHistoryRow } from "./data";

function statusVariant(status: InvoiceHistoryRow["status"]): AwPillVariant {
  switch (status) {
    case "Paga":
      return "live";
    case "Em aberto":
      return "draft";
    case "Falhou":
      return "error";
    case "Disputada":
      return "beta";
  }
}

export function InvoiceDetailsSheet({
  invoice,
  open,
  onClose,
}: {
  invoice: InvoiceHistoryRow | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!invoice) return null;

  const paid = invoice.status === "Paga";
  const grossMinusDiscount = invoice.gross - (invoice.discount ?? 0);

  return (
    <AwSheet
      open={open}
      onClose={onClose}
      title={invoice.id}
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <AwPill variant={statusVariant(invoice.status)}>
            {invoice.status}
          </AwPill>
          <span className="text-[12px] text-[var(--fg-secondary)]">
            {invoice.refMonth} · {invoice.description}
          </span>
        </div>
      }
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AwButton variant="ghost" iconLeft="content_copy">
            Copiar ID
          </AwButton>
          {paid && (
            <AwButton variant="secondary" iconLeft="receipt_long">
              Baixar recibo
            </AwButton>
          )}
          <AwButton variant="primary" iconLeft="download">
            Baixar fatura (PDF)
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-1">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Valor líquido
          </p>
          <h2 className="m-0 text-[32px] font-semibold leading-none tracking-[-0.02em] text-[var(--fg-primary)] tabular-nums">
            {brl(invoice.net)}
          </h2>
          <p className="m-0 mt-1 text-[12px] text-[var(--fg-secondary)]">
            Vencimento em{" "}
            <strong className="font-medium text-[var(--fg-primary)]">
              {invoice.dueAt}
            </strong>
            {invoice.paidAt ? (
              <>
                {" "}· pago em{" "}
                <strong className="font-medium text-[var(--fg-primary)]">
                  {invoice.paidAt}
                </strong>
              </>
            ) : null}
          </p>
        </section>

        <section>
          <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Composição
          </p>
          <ul className="m-0 flex flex-col gap-0 p-0 text-[13px] text-[var(--fg-primary)] divide-y divide-[var(--border-subtle)]">
            <Row label="Valor bruto" value={brl(invoice.gross)} />
            {invoice.discount ? (
              <Row
                label={
                  invoice.discountCode
                    ? `Desconto (${invoice.discountCode})`
                    : "Desconto"
                }
                value={`−${brl(invoice.discount)}`}
                emphasis="success"
              />
            ) : null}
            <Row
              label="Valor líquido"
              value={brl(grossMinusDiscount)}
              emphasis="strong"
            />
          </ul>
        </section>

        <section>
          <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Pagamento
          </p>
          <ul className="m-0 flex flex-col gap-0 p-0 text-[13px] text-[var(--fg-primary)] divide-y divide-[var(--border-subtle)]">
            <Row label="Forma de pagamento" value={invoice.paymentMethod} />
            <Row
              label="Mês de referência"
              value={invoice.refMonth}
            />
            <Row label="Descrição" value={invoice.description} />
          </ul>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Icon
              name="info"
              size={16}
              className="mt-0.5 shrink-0 text-[var(--fg-tertiary)]"
            />
            <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
              A fatura em PDF e o recibo (quando aplicável) são gerados pelo
              processador no momento do download — espelham exatamente o que
              foi cobrado no cartão / boleto.
            </p>
          </div>
        </section>
      </div>
    </AwSheet>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: "success" | "strong";
}) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-2">
      <span className="text-[var(--fg-secondary)]">{label}</span>
      <span
        className={
          "tabular-nums " +
          (emphasis === "success"
            ? "text-[var(--accent-success)]"
            : emphasis === "strong"
              ? "font-semibold text-[var(--fg-primary)]"
              : "font-medium text-[var(--fg-primary)]")
        }
      >
        {value}
      </span>
    </li>
  );
}
