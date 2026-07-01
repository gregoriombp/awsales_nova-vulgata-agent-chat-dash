"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { Icon } from "@/components/ui/Icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { invoiceStatusLabel } from "../../financeiro/_components/data";
import { statementRows } from "./CycleStatement";
import {
  cycleInvoices,
  cycleVariableTotal,
  FEES,
  type BillingCycle,
} from "./cycles-data";

/* ----------------------------------------------------------------------------
 * Export da aba "Por ciclos" — a SEGUNDA exportação que o Greg pediu
 * (cmt-adf6a318): aqui os valores seguem a data de COBRANÇA/PAGAMENTO (o que
 * bateu no provedor dentro do ciclo), diferente do export da Visão geral,
 * que segue a data de uso. A diferença fica explícita na própria UI.
 * ------------------------------------------------------------------------- */

export function CycleExportMenu({ cycle }: { cycle: BillingCycle }) {
  const [open, setOpen] = React.useState(false);
  const [parts, setParts] = React.useState({
    statement: true,
    invoices: true,
    fees: true,
  });
  const nothing = !parts.statement && !parts.invoices && !parts.fees;

  const onExport = () => {
    if (nothing) return;
    download(`ciclo-${cycle.id}.csv`, buildCycleCsv(cycle, parts));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <AwButton variant="primary" size="md" iconLeft="download" className="h-11!">
          Exportar ciclo
          <Icon name="expand_more" size={15} className="ml-0.5" />
        </AwButton>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="flex w-[380px] flex-col gap-4 border border-(--border-subtle) bg-(--bg-raised) p-4 shadow-lg"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon name="download" size={16} className="text-(--fg-secondary)" />
            <h6 className="m-0 text-(--fg-primary)">Exportar {cycle.label}</h6>
          </div>
          <p className="m-0 body-xs text-(--fg-tertiary)">
            Valores pela{" "}
            <strong className="font-medium text-(--fg-secondary)">
              data de cobrança
            </strong>{" "}
            — o que entrou na fatura deste ciclo. Diferente do export da Visão
            geral, que segue a data de uso.
          </p>
        </div>

        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-1 aw-eyebrow text-(--fg-tertiary)">O que incluir</legend>
          {(
            [
              ["statement", "Extrato do ciclo", "Saldo anterior, cobranças, pagamentos e saldo final."],
              ["invoices", "Faturas do ciclo", "Uma linha por fatura, com status e vencimento."],
              ["fees", "Variável por fee", "A quebra do uso variável faturado, por taxa."],
            ] as const
          ).map(([key, label, hint]) => (
            <label
              key={key}
              className="flex cursor-pointer items-start gap-2.5 body-sm text-(--fg-primary)"
            >
              <AwCheckbox
                checked={parts[key]}
                onChange={(v) => setParts((p) => ({ ...p, [key]: v }))}
                label={label}
              />
              <span className="flex flex-col">
                {label}
                <span className="body-xs text-(--fg-tertiary)">{hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-2.5">
          <p className="m-0 flex gap-2 body-xs text-(--fg-secondary)">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-(--fg-tertiary)" />
            <span>
              O arquivo traz só o que a Aswork faturou. O que a Meta cobra
              direto fica fora da fatura — acompanhe pelo uso.
            </span>
          </p>
        </div>

        <div className="flex justify-end">
          <AwButton
            variant="primary"
            size="sm"
            iconLeft="download"
            disabled={nothing}
            onClick={onExport}
          >
            Exportar CSV
          </AwButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ---------- CSV ---------- */

function esc(v: string): string {
  return `"${v.replace(/"/g, '""')}"`;
}

function money(v: number): string {
  return v.toFixed(2).replace(".", ",");
}

function buildCycleCsv(
  cycle: BillingCycle,
  parts: { statement: boolean; invoices: boolean; fees: boolean },
): string {
  const lines: string[] = [
    `${esc("Ciclo")},${esc(cycle.label)}`,
    `${esc("Período")},${esc(`${cycle.startsAt} → ${cycle.endsAt}`)}`,
    `${esc("Base")},${esc("Data de cobrança (o que entrou na fatura do ciclo)")}`,
    "",
  ];

  if (parts.statement) {
    lines.push("Extrato,Valor (BRL)");
    statementRows(cycle).forEach((row) => {
      lines.push(`${esc(row.label)},${money(row.signed)}`);
    });
    lines.push("");
  }

  if (parts.invoices) {
    lines.push("Fatura,Descrição,Vencimento,Paga em,Status,Valor (BRL)");
    cycleInvoices(cycle).forEach((inv) => {
      lines.push(
        [
          esc(inv.id),
          esc(inv.description),
          esc(inv.dueAt),
          esc(inv.paidAt ?? "—"),
          esc(invoiceStatusLabel(inv.status)),
          money(inv.net),
        ].join(","),
      );
    });
    if (cycleInvoices(cycle).length === 0) {
      lines.push(`${esc("(fatura ainda não fechada)")},,,,,`);
    }
    lines.push("");
  }

  if (parts.fees) {
    lines.push("Fee,Valor faturado (BRL)");
    FEES.forEach((fee) => {
      const v = cycle.variableByFee[fee.id] ?? 0;
      if (v > 0) lines.push(`${esc(fee.label)},${money(v)}`);
    });
    lines.push(`${esc("Total variável (Aswork)")},${money(cycleVariableTotal(cycle))}`);
    lines.push(
      `${esc("Uso Meta aproximado (fora da fatura)")},${money(cycle.metaUsageApprox)}`,
    );
  }

  return lines.join("\r\n");
}

function download(filename: string, content: string) {
  const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
