"use client";

import * as React from "react";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import { InvoiceDetailsSheet } from "../_components/InvoiceDetailsSheet";
import {
  brl,
  INVOICE_HISTORY,
  type InvoiceHistoryRow,
} from "../_components/data";

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

export default function HistoricoFaturasPage() {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const openInvoice = INVOICE_HISTORY.find((r) => r.id === openId) ?? null;

  const periodTotals = React.useMemo(
    () =>
      INVOICE_HISTORY.reduce(
        (acc, r) => ({
          gross: acc.gross + r.gross,
          discount: acc.discount + (r.discount ?? 0),
          net: acc.net + r.net,
        }),
        { gross: 0, discount: 0, net: 0 },
      ),
    [],
  );

  return (
    <div className="flex flex-col gap-8">
      <PeriodSummary totals={periodTotals} count={INVOICE_HISTORY.length} />

      <AwCard className="!p-0">
        <AwTable>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Descrição</th>
              <th>Status</th>
              <th>Método</th>
              <th>Data</th>
              <th className="text-right">Valor</th>
              <th aria-label="Abrir" />
            </tr>
          </thead>
          <tbody>
            {INVOICE_HISTORY.map((row) => (
              <InvoiceRow
                key={row.id}
                row={row}
                onOpen={() => setOpenId(row.id)}
              />
            ))}
          </tbody>
        </AwTable>
      </AwCard>

      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

function PeriodSummary({
  totals,
  count,
}: {
  totals: { gross: number; discount: number; net: number };
  count: number;
}) {
  return (
    <section>
      <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
        Você economizou · últimos 4 meses
      </p>
      <h1 className="m-0 mt-2 display-md tabular-nums text-[var(--accent-success)]">
        {brl(totals.discount)}
      </h1>
      <p className="m-0 mt-2 max-w-[520px] body-xs text-[var(--fg-secondary)]">
        {count} fatura{count !== 1 ? "s" : ""} no período · pagou{" "}
        <strong className="font-medium tabular-nums text-[var(--fg-primary)]">
          {brl(totals.net)}
        </strong>{" "}
        de{" "}
        <strong className="font-medium tabular-nums text-[var(--fg-primary)]">
          {brl(totals.gross)}
        </strong>
        .
      </p>
    </section>
  );
}

function InvoiceRow({
  row,
  onOpen,
}: {
  row: InvoiceHistoryRow;
  onOpen: () => void;
}) {
  return (
    <tr
      onClick={onOpen}
      className="cursor-pointer hover:bg-[var(--bg-hover)]"
    >
      <td className="aw-eyebrow text-[var(--fg-tertiary)]">{row.refMonth}</td>
      <td>
        <div className="flex flex-col gap-0.5">
          <span className="body-sm font-medium text-[var(--fg-primary)]">
            {row.description}
          </span>
          {row.discountCode && (
            <span className="body-xs text-[var(--accent-success)]">
              −{brl(row.discount ?? 0)} {row.discountCode}
            </span>
          )}
        </div>
      </td>
      <td>
        <AwPill variant={statusVariant(row.status)}>{row.status}</AwPill>
      </td>
      <td className="body-xs text-[var(--fg-secondary)]">
        {row.paymentMethod}
      </td>
      <td className="body-xs text-[var(--fg-secondary)]">
        {row.paidAt ? `Paga ${row.paidAt}` : `Vence ${row.dueAt}`}
      </td>
      <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
        {brl(row.net)}
      </td>
      <td className="text-right">
        <Icon
          name="chevron_right"
          size={18}
          className="text-[var(--fg-tertiary)]"
        />
      </td>
    </tr>
  );
}
