"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AwButton } from "@/components/ui/AwButton";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwSheet } from "@/components/ui/AwSheet";
import { AwCardBrand, type AwCardBrandId } from "@/components/ui/AwCardBrand";
import { Icon } from "@/components/ui/Icon";
import {
  brl,
  INVOICE_DISPUTE_STAGES,
  invoiceStatusLabel,
  type InvoiceHistoryRow,
} from "./data";

/** Bandeira do cartão a partir do texto "Visa •••• 3012". */
export function paymentBrandId(method: string): AwCardBrandId {
  const w = method.trim().toLowerCase();
  if (w.startsWith("visa")) return "visa";
  if (w.startsWith("master")) return "mastercard";
  if (w.startsWith("amex") || w.startsWith("american")) return "amex";
  return "unknown";
}

/** Status da fatura → variant do AwPill. Exportado pra as telas de fatura
 *  (histórico, ciclos) falarem a mesma língua de cor. */
export function statusVariant(status: InvoiceHistoryRow["status"]): AwPillVariant {
  switch (status) {
    case "Paga":
      return "live";
    case "Em aberto":
      return "draft";
    case "Em atraso":
      return "warning";
    case "Falha no Pagamento":
      return "error";
    case "Disputada":
      return "dispute";
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
  const router = useRouter();
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
            {invoiceStatusLabel(invoice.status)}
          </AwPill>
          <span className="body-xs text-(--fg-secondary)">
            {invoice.refMonth} · {invoice.description}
          </span>
        </div>
      }
      footer={
        <div className="flex flex-nowrap items-center justify-end gap-2">
          <AwButton variant="ghost" iconLeft="content_copy">
            Copiar ID
          </AwButton>
          <AwButton
            variant="secondary"
            iconLeft="open_in_new"
            onClick={() =>
              router.push(
                `/settings/consumo-e-custos/explorar?tipo=faturas&fatura=${encodeURIComponent(invoice.id)}`,
              )
            }
          >
            Ver detalhes
          </AwButton>
          {paid && (
            <AwButton variant="secondary" iconLeft="receipt_long">
              Baixar nota fiscal
            </AwButton>
          )}
          <AwButton variant="primary">Baixar fatura</AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-1">
          <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
            Valor líquido
          </p>
          <h2 className="m-0 text-(--fg-primary) tabular-nums">
            {brl(invoice.net)}
          </h2>
          <p className="m-0 mt-1 body-xs text-(--fg-secondary)">
            Vencimento em{" "}
            <strong className="font-medium text-(--fg-primary)">
              {invoice.dueAt}
            </strong>
            {invoice.paidAt ? (
              <>
                {" "}· pago em{" "}
                <strong className="font-medium text-(--fg-primary)">
                  {invoice.paidAt}
                </strong>
              </>
            ) : null}
          </p>
        </section>

        <section>
          <p className="m-0 mb-2 aw-eyebrow text-(--fg-tertiary)">
            Composição
          </p>
          <ul className="m-0 flex flex-col gap-0 p-0 body-xs text-(--fg-primary) divide-y divide-(--border-subtle)">
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
          <p className="m-0 mb-2 aw-eyebrow text-(--fg-tertiary)">
            Pagamento
          </p>
          <ul className="m-0 flex flex-col gap-0 p-0 body-xs text-(--fg-primary) divide-y divide-(--border-subtle)">
            <Row
              label="Forma de pagamento"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <AwCardBrand
                    brand={paymentBrandId(invoice.paymentMethod)}
                    size="sm"
                  />
                  {invoice.paymentMethod}
                </span>
              }
            />
            <Row
              label="Mês de referência"
              value={invoice.refMonth}
            />
            <Row label="Descrição" value={invoice.description} />
          </ul>
        </section>

        {/* Linhas do tempo por status — sempre abaixo da tabela (pedido do Greg). */}
        {invoice.status === "Falha no Pagamento" && (
          <PaymentFailureTimeline invoice={invoice} />
        )}
        {invoice.status === "Disputada" && invoice.dispute && (
          <DisputeTimeline dispute={invoice.dispute} />
        )}
      </div>
    </AwSheet>
  );
}

/* ---------- linha do tempo da disputa ---------- */

function DisputeTimeline({
  dispute,
}: {
  dispute: NonNullable<InvoiceHistoryRow["dispute"]>;
}) {
  const currentIndex = INVOICE_DISPUTE_STAGES.findIndex(
    (s) => s.id === dispute.stage,
  );

  return (
    <section className="rounded-xl border border-(--border-subtle) p-4">
      <div className="mb-3 flex items-start gap-2">
        <Icon
          name="gavel"
          size={18}
          className="mt-0.5 shrink-0 text-(--fg-tertiary)"
        />
        <div className="min-w-0">
          <p className="m-0 body-sm font-medium text-(--fg-primary)">
            Em análise
          </p>
          <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
            Você contestou esta fatura em {dispute.openedAt}. Motivo:{" "}
            {dispute.reason}
          </p>
        </div>
      </div>

      <ol className="m-0 flex list-none flex-col gap-0 p-0">
        {INVOICE_DISPUTE_STAGES.map((stage, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex;
          const last = i === INVOICE_DISPUTE_STAGES.length - 1;
          return (
            <li key={stage.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border " +
                    (done
                      ? "border-(--accent-success) bg-(--accent-success) text-(--bg-raised)"
                      : current
                        ? "border-(--fg-primary) bg-(--fg-primary) text-(--bg-raised)"
                        : "border-(--border-default) bg-(--bg-raised) text-(--fg-tertiary)")
                  }
                >
                  {done ? (
                    <Icon name="check" size={12} />
                  ) : current ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-(--bg-raised)" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-(--border-default)" />
                  )}
                </span>
                {!last && (
                  <span
                    aria-hidden="true"
                    className={
                      "w-px flex-1 " +
                      (done ? "bg-(--accent-success)" : "bg-(--border-subtle)")
                    }
                  />
                )}
              </div>
              <div className={"min-w-0 pb-3 " + (last ? "pb-0" : "")}>
                <p
                  className={
                    "m-0 body-sm " +
                    (current || done
                      ? "font-medium text-(--fg-primary)"
                      : "text-(--fg-tertiary)")
                  }
                >
                  {stage.label}
                </p>
                {current && (
                  <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                    {stage.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------- linha do tempo da falha de pagamento ---------- */

function PaymentFailureTimeline({ invoice }: { invoice: InvoiceHistoryRow }) {
  const steps: {
    label: string;
    sub?: string;
    state: "done" | "error" | "pending";
  }[] = [
    { label: "Cobrança lançada", sub: invoice.dueAt, state: "done" },
    {
      label: "Pagamento recusado pelo emissor do cartão",
      sub: invoice.paymentMethod,
      state: "error",
    },
    {
      label: "Aguardando regularização",
      sub: "Quite para evitar o congelamento da conta.",
      state: "pending",
    },
  ];

  return (
    <section className="rounded-xl border border-(--border-subtle) p-4">
      <div className="mb-3 flex items-start gap-2">
        <Icon
          name="credit_card_off"
          size={18}
          className="mt-0.5 shrink-0 text-(--accent-danger)"
        />
        <div className="min-w-0">
          <p className="m-0 body-sm font-medium text-(--fg-primary)">
            Pagamento não concluído
          </p>
          <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
            A cobrança foi tentada em {invoice.dueAt} e não foi autorizada.
          </p>
        </div>
      </div>

      <ol className="m-0 flex list-none flex-col gap-0 p-0">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border " +
                    (step.state === "done"
                      ? "border-(--accent-success) bg-(--accent-success) text-(--bg-raised)"
                      : step.state === "error"
                        ? "border-(--accent-danger) bg-(--accent-danger) text-(--bg-raised)"
                        : "border-(--border-default) bg-(--bg-raised) text-(--fg-tertiary)")
                  }
                >
                  {step.state === "done" ? (
                    <Icon name="check" size={12} />
                  ) : step.state === "error" ? (
                    <Icon name="priority_high" size={12} />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-(--border-default)" />
                  )}
                </span>
                {!last && (
                  <span
                    aria-hidden="true"
                    className={
                      "w-px flex-1 " +
                      (step.state === "done"
                        ? "bg-(--accent-success)"
                        : "bg-(--border-subtle)")
                    }
                  />
                )}
              </div>
              <div className={"min-w-0 pb-3 " + (last ? "pb-0" : "")}>
                <p
                  className={
                    "m-0 body-sm " +
                    (step.state === "pending"
                      ? "text-(--fg-tertiary)"
                      : "font-medium text-(--fg-primary)")
                  }
                >
                  {step.label}
                </p>
                {step.sub && (
                  <p className="m-0 mt-0.5 body-xs tabular-nums text-(--fg-secondary)">
                    {step.sub}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: ReactNode;
  emphasis?: "success" | "strong";
}) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-2">
      <span className="text-(--fg-secondary)">{label}</span>
      <span
        className={
          "tabular-nums " +
          (emphasis === "success"
            ? "text-(--accent-success)"
            : emphasis === "strong"
              ? "font-semibold text-(--fg-primary)"
              : "font-medium text-(--fg-primary)")
        }
      >
        {value}
      </span>
    </li>
  );
}
