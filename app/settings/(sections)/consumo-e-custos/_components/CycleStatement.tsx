"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { brl } from "../../financeiro/_components/data";
import { SegmentedToggle } from "./controls";
import { InfoTip } from "./KpiCards";
import { CycleWaterfall } from "./CycleWaterfall";
import {
  cyclePaymentsTotal,
  cycleVariableTotal,
  type BillingCycle,
} from "./cycles-data";

/* ----------------------------------------------------------------------------
 * Extrato do ciclo — estilo fatura Google (pedido do Greg + Notion): o saldo
 * que veio do mês anterior nunca some; a conta inteira aparece linha a linha
 * até o saldo que rola pro próximo ciclo. Tabela por padrão, com a opção
 * visual em cascata (waterfall).
 * ------------------------------------------------------------------------- */

export type StatementRow = {
  id: string;
  label: string;
  hint?: string;
  /** Valor JÁ com sinal do efeito no saldo: cobrança +, redução −. */
  signed: number;
  kind: "balance" | "charge" | "reduction";
  emphasized?: boolean;
};

export function statementRows(c: BillingCycle): StatementRow[] {
  const variable = cycleVariableTotal(c);
  const payments = cyclePaymentsTotal(c);
  const rows: StatementRow[] = [
    {
      id: "carry-in",
      label: "Saldo do ciclo anterior",
      hint:
        c.carryIn > 0
          ? "Valores de meses anteriores ainda não quitados."
          : "Nada pendente do mês anterior.",
      signed: c.carryIn,
      kind: "balance",
    },
    { id: "fixed", label: "Plano (fixo)", signed: c.fixed, kind: "charge" },
    {
      id: "variable",
      label: "Uso variável · Aswork",
      hint: "O que a Aswork faturou pelo uso do ciclo — o Meta fica fora da fatura.",
      signed: variable,
      kind: "charge",
    },
  ];
  if (c.credits > 0) {
    rows.push({
      id: "credits",
      label: "Créditos e cupons",
      signed: -c.credits,
      kind: "reduction",
    });
  }
  if (c.adjustments !== 0) {
    rows.push({
      id: "adjustments",
      label: "Ajustes",
      hint: "Correções da Aswork — somam (+) ou abatem (−).",
      signed: c.adjustments,
      kind: c.adjustments < 0 ? "reduction" : "charge",
    });
  }
  if (payments > 0) {
    rows.push({
      id: "payments",
      label: "Pagamentos recebidos",
      hint:
        c.payments.length === 1
          ? `1 pagamento · ${c.payments[0].at}`
          : `${c.payments.length} pagamentos no ciclo`,
      signed: -payments,
      kind: "reduction",
    });
  }
  rows.push({
    id: "carry-out",
    label: c.open ? "Saldo parcial do ciclo" : "Saldo que rola pro próximo ciclo",
    hint: c.open
      ? "O ciclo ainda está aberto — a conta fecha no último dia do mês."
      : undefined,
    signed: c.carryOut,
    kind: "balance",
    emphasized: true,
  });
  return rows;
}

type StatementViz = "table" | "waterfall";

export function CycleStatement({ cycle }: { cycle: BillingCycle }) {
  const [viz, setViz] = React.useState<StatementViz>("table");
  const rows = React.useMemo(() => statementRows(cycle), [cycle]);

  return (
    <section aria-label="Extrato do ciclo" className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h4 className="m-0 inline-flex items-center gap-1.5 text-(--fg-primary)">
            Extrato do ciclo
            <InfoTip text="A conta do mês, linha a linha: o saldo que veio do ciclo anterior, o que foi cobrado, o que abateu e o que rola pro próximo — como numa fatura de cartão." />
          </h4>
          <p className="m-0 mt-1 body-xs text-(--fg-tertiary)">
            Pela data de cobrança — o que entrou (e saiu) da fatura neste ciclo.
          </p>
        </div>
        <SegmentedToggle
          ariaLabel="Visualização do extrato"
          value={viz}
          onChange={setViz}
          options={[
            { value: "table", icon: "table_rows", label: "Tabela" },
            { value: "waterfall", icon: "waterfall_chart", label: "Cascata" },
          ]}
        />
      </header>

      {viz === "table" ? <StatementTable rows={rows} /> : <CycleWaterfall rows={rows} />}
    </section>
  );
}

function StatementTable({ rows }: { rows: StatementRow[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((row, i) => (
        <div
          key={row.id}
          className={cn(
            "flex items-center justify-between gap-4 py-3",
            i > 0 && "border-t border-(--border-subtle)",
            row.emphasized && "rounded-xl border-t-0 bg-(--bg-muted) px-4 py-3.5 mt-1.5",
          )}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className={cn(
                "body-sm text-(--fg-primary)",
                row.emphasized ? "font-semibold" : "font-medium",
              )}
            >
              {row.label}
            </span>
            {row.hint && (
              <span className="body-xs text-(--fg-tertiary)">{row.hint}</span>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 tabular-nums",
              row.emphasized ? "body-md font-semibold" : "body-sm font-medium",
              row.kind === "reduction"
                ? "text-(--accent-success)"
                : "text-(--fg-primary)",
            )}
          >
            {formatSigned(row)}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatSigned(row: StatementRow): string {
  if (row.kind === "balance") return brl(row.signed);
  const sign = row.signed < 0 ? "−" : "+";
  return `${sign} ${brl(Math.abs(row.signed))}`;
}
