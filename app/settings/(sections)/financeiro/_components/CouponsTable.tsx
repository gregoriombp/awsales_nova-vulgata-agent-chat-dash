"use client";

import { AwTable } from "@/components/ui/AwTable";
import { brl, COUPONS_APPLIED } from "./data";

export function CouponsTable() {
  return (
    <AwTable>
      <thead>
        <tr>
          <th>Código</th>
          <th>Descrição</th>
          <th className="text-right">Valor descontado</th>
          <th>Aplicação</th>
          <th>Fatura</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        {COUPONS_APPLIED.map((c) => (
          <tr key={c.id}>
            <td>
              <span className="inline-flex items-center rounded-[var(--radius-xs)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-1.5 py-0.5 text-[12px] font-semibold tracking-[0.02em] text-[var(--fg-primary)]">
                {c.code}
              </span>
            </td>
            <td>{c.description}</td>
            <td className="text-right font-medium tabular-nums text-[var(--accent-success)]">
              −{brl(c.discount)}
            </td>
            <td className="text-[var(--fg-secondary)]">{c.application}</td>
            <td className="text-[12px] text-[var(--fg-secondary)]">
              {c.invoiceId}
            </td>
            <td className="text-[var(--fg-secondary)]">{c.appliedAt}</td>
          </tr>
        ))}
      </tbody>
    </AwTable>
  );
}
