"use client";

import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwTable } from "@/components/ui/AwTable";
import { brl, INVOICE_HISTORY, type InvoiceHistoryRow } from "./data";

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

export function InvoiceHistoryTable() {
  const totals = INVOICE_HISTORY.reduce(
    (acc, r) => ({
      gross: acc.gross + r.gross,
      discount: acc.discount + (r.discount ?? 0),
      net: acc.net + r.net,
    }),
    { gross: 0, discount: 0, net: 0 },
  );

  return (
    <AwTable>
      <thead>
        <tr>
          <th>Mês ref.</th>
          <th>Descrição</th>
          <th>Vencimento</th>
          <th>Pago em</th>
          <th className="text-right">Bruto</th>
          <th className="text-right">Desconto</th>
          <th className="text-right">Líquido</th>
          <th>Forma pgto</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {INVOICE_HISTORY.map((r) => (
          <tr key={r.id}>
            <td>{r.refMonth}</td>
            <td>{r.description}</td>
            <td>{r.dueAt}</td>
            <td className="text-[var(--fg-secondary)]">{r.paidAt ?? "—"}</td>
            <td className="text-right tabular-nums">{brl(r.gross)}</td>
            <td className="text-right tabular-nums">
              {r.discount ? (
                <span className="inline-flex flex-col items-end">
                  <span className="text-[var(--accent-success)]">
                    −{brl(r.discount)}
                  </span>
                  {r.discountCode && (
                    <span className="text-[10.5px] uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
                      {r.discountCode}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[var(--fg-tertiary)]">—</span>
              )}
            </td>
            <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
              {brl(r.net)}
            </td>
            <td className="text-[var(--fg-secondary)]">{r.paymentMethod}</td>
            <td>
              <AwPill variant={statusVariant(r.status)}>{r.status}</AwPill>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4} className="text-right text-[var(--fg-secondary)]">
            Totais do período
          </td>
          <td className="text-right font-medium tabular-nums">
            {brl(totals.gross)}
          </td>
          <td className="text-right tabular-nums text-[var(--accent-success)]">
            {totals.discount > 0 ? `−${brl(totals.discount)}` : "—"}
          </td>
          <td className="text-right font-semibold tabular-nums text-[var(--fg-primary)]">
            {brl(totals.net)}
          </td>
          <td colSpan={2} />
        </tr>
      </tfoot>
    </AwTable>
  );
}
