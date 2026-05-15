"use client";

import * as React from "react";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
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

  const grouped = React.useMemo(() => groupByMonth(INVOICE_HISTORY), []);
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

      <section className="flex flex-col gap-5">
        {grouped.map((g) => (
          <MonthGroup
            key={g.refMonth}
            refMonth={g.refMonth}
            rows={g.rows}
            onOpen={setOpenId}
          />
        ))}
      </section>

      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

/* ---------- period summary ---------- */

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
        Total líquido cobrado · últimos 4 meses
      </p>
      <h1 className="m-0 mt-2 display-lg tabular-nums text-[var(--fg-primary)]">
        {brl(totals.net)}
      </h1>
      <p className="m-0 mt-2 max-w-[520px] body-xs text-[var(--fg-secondary)]">
        {count} fatura{count !== 1 ? "s" : ""} no período · bruto{" "}
        <strong className="font-medium tabular-nums text-[var(--fg-primary)]">
          {brl(totals.gross)}
        </strong>{" "}
        {totals.discount > 0 && (
          <>
            · descontos{" "}
            <strong className="font-medium tabular-nums text-[var(--accent-success)]">
              −{brl(totals.discount)}
            </strong>
          </>
        )}
      </p>
    </section>
  );
}

/* ---------- month group ---------- */

type MonthBucket = { refMonth: string; rows: InvoiceHistoryRow[] };

function groupByMonth(rows: InvoiceHistoryRow[]): MonthBucket[] {
  const map = new Map<string, InvoiceHistoryRow[]>();
  for (const r of rows) {
    const bucket = map.get(r.refMonth) ?? [];
    bucket.push(r);
    map.set(r.refMonth, bucket);
  }
  return Array.from(map.entries()).map(([refMonth, rows]) => ({
    refMonth,
    rows,
  }));
}

function MonthGroup({
  refMonth,
  rows,
  onOpen,
}: {
  refMonth: string;
  rows: InvoiceHistoryRow[];
  onOpen: (id: string) => void;
}) {
  const total = rows.reduce((s, r) => s + r.net, 0);

  return (
    <AwCard className="!p-0">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-muted)] px-5 py-2.5">
        <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">{refMonth}</p>
        <span className="body-xs tabular-nums text-[var(--fg-secondary)]">
          Líquido do mês:{" "}
          <strong className="font-medium text-[var(--fg-primary)]">
            {brl(total)}
          </strong>
        </span>
      </header>
      <ul className="m-0 divide-y divide-[var(--border-subtle)] p-0">
        {rows.map((r) => (
          <InvoiceRow key={r.id} row={r} onOpen={() => onOpen(r.id)} />
        ))}
      </ul>
    </AwCard>
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
    <li className="m-0 p-0">
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brand)] focus-visible:ring-inset"
        aria-label={`Ver detalhes da fatura ${row.id}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="body-sm font-medium text-[var(--fg-primary)]">
              {row.description}
            </span>
            <AwPill variant={statusVariant(row.status)}>{row.status}</AwPill>
          </div>
          <p className="m-0 mt-0.5 body-xs text-[var(--fg-secondary)]">
            {row.paidAt ? `Paga em ${row.paidAt}` : `Vencimento ${row.dueAt}`}
            {" · "}
            {row.paymentMethod}
            {row.discountCode && (
              <>
                {" · "}
                <span className="text-[var(--accent-success)]">
                  −{brl(row.discount ?? 0)} {row.discountCode}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-baseline gap-3 text-right">
          <span className="body-sm font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(row.net)}
          </span>
          <Icon
            name="chevron_right"
            size={18}
            className="text-[var(--fg-tertiary)] transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </button>
    </li>
  );
}
