"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import { InvoiceDetailsSheet } from "../_components/InvoiceDetailsSheet";
import {
  brl,
  INVOICE_HISTORY,
  type InvoiceHistoryRow,
} from "../_components/data";

type InvoiceStatus = InvoiceHistoryRow["status"];

const ALL_STATUSES: InvoiceStatus[] = [
  "Paga",
  "Em aberto",
  "Falhou",
  "Disputada",
];

const PERIOD_OPTIONS = [
  "Últimos 30 dias",
  "Últimos 3 meses",
  "Últimos 6 meses",
  "Últimos 12 meses",
  "Todo o período",
] as const;

const PAGE_SIZE = 5;

function statusVariant(status: InvoiceStatus): AwPillVariant {
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

function sum(rows: InvoiceHistoryRow[]) {
  return rows.reduce(
    (acc, r) => ({
      gross: acc.gross + r.gross,
      discount: acc.discount + (r.discount ?? 0),
      net: acc.net + r.net,
    }),
    { gross: 0, discount: 0, net: 0 },
  );
}

export default function HistoricoFaturasPage() {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [statuses, setStatuses] = React.useState<InvoiceStatus[]>([]);
  const [period, setPeriod] = React.useState<string>("Últimos 6 meses");
  const [page, setPage] = React.useState(1);

  const openInvoice = INVOICE_HISTORY.find((r) => r.id === openId) ?? null;

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICE_HISTORY.filter((r) => {
      if (statuses.length > 0 && !statuses.includes(r.status)) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        (r.discountCode?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, statuses]);

  const visibleTotals = React.useMemo(() => sum(rows), [rows]);

  // Filtering can shrink the result set below the current page — keep the
  // page index in range instead of rendering an empty slice.
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  React.useEffect(() => {
    setPage(1);
  }, [query, statuses]);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] flex-1">
          <AwInput
            iconLeft="search"
            placeholder="Buscar ID, código de cupom…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <StatusFilter selected={statuses} onChange={setStatuses} />
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <AwCard className="!p-0">
        <AwTable>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Descrição</th>
              <th>Status</th>
              <th>Método</th>
              <th>Data</th>
              <th className="text-right">Bruto</th>
              <th className="text-right">Desconto</th>
              <th className="text-right">Líquido</th>
              <th aria-label="Abrir" />
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="body-sm text-center text-[var(--fg-tertiary)]"
                >
                  Nenhuma fatura corresponde aos filtros.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <InvoiceRow
                  key={row.id}
                  row={row}
                  onOpen={() => setOpenId(row.id)}
                />
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-[var(--bg-surface)]">
                <td
                  colSpan={5}
                  className="body-xs font-medium text-[var(--fg-secondary)]"
                >
                  Totais do período · {rows.length} fatura
                  {rows.length !== 1 ? "s" : ""}
                </td>
                <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
                  {brl(visibleTotals.gross)}
                </td>
                <td className="text-right font-medium tabular-nums text-[var(--accent-success)]">
                  {visibleTotals.discount > 0
                    ? `−${brl(visibleTotals.discount)}`
                    : "—"}
                </td>
                <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
                  {brl(visibleTotals.net)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </AwTable>

        {rows.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            rangeStart={pageStart + 1}
            rangeEnd={pageStart + pageRows.length}
            total={rows.length}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        )}
      </AwCard>

      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

/* ---------- filters ---------- */

function StatusFilter({
  selected,
  onChange,
}: {
  selected: InvoiceStatus[];
  onChange: (v: InvoiceStatus[]) => void;
}) {
  const toggle = (s: InvoiceStatus) => {
    onChange(
      selected.includes(s)
        ? selected.filter((x) => x !== s)
        : [...selected, s],
    );
  };

  const triggerLabel =
    selected.length === 0
      ? "Todos os status"
      : selected.length === 1
        ? selected[0]
        : `Status · ${selected.length}`;

  const items: AwDropdownItem[] = [
    {
      id: "all",
      label: "Todos os status",
      icon: "done_all",
      closeOnSelect: false,
      onSelect: () => onChange([]),
      disabled: selected.length === 0,
    },
    { id: "sep", separator: true },
    ...ALL_STATUSES.map((s) => ({
      id: s,
      label: s,
      checked: selected.includes(s),
      closeOnSelect: false,
      onSelect: () => toggle(s),
    })),
  ];

  return (
    <AwDropdownMenu
      align="start"
      aria-label="Filtrar por status"
      trigger={<AwSelect>{triggerLabel}</AwSelect>}
      items={items}
    />
  );
}

function PeriodFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const items: AwDropdownItem[] = PERIOD_OPTIONS.map((opt) => ({
    id: opt,
    label: opt,
    checked: opt === value,
    onSelect: () => onChange(opt),
  }));

  return (
    <AwDropdownMenu
      align="end"
      aria-label="Selecionar período"
      trigger={<AwSelect className="ml-auto">{value}</AwSelect>}
      items={items}
    />
  );
}

/* ---------- pagination ---------- */

function Pagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] px-5 py-3">
      <span className="body-xs tabular-nums text-[var(--fg-tertiary)]">
        Mostrando {rangeStart}–{rangeEnd} de {total}
      </span>
      <div className="flex items-center gap-3">
        <span className="body-xs tabular-nums text-[var(--fg-secondary)]">
          Página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <AwButton
            size="sm"
            variant="ghost"
            iconOnly="chevron_left"
            aria-label="Página anterior"
            disabled={page <= 1}
            onClick={onPrev}
          />
          <AwButton
            size="sm"
            variant="ghost"
            iconOnly="chevron_right"
            aria-label="Próxima página"
            disabled={page >= totalPages}
            onClick={onNext}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- table row ---------- */

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
          <span className="body-xs tabular-nums text-[var(--fg-tertiary)]">
            {row.id}
          </span>
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
      <td className="text-right tabular-nums text-[var(--fg-secondary)]">
        {brl(row.gross)}
      </td>
      <td className="text-right tabular-nums">
        {row.discount && row.discount > 0 ? (
          <span className="text-[var(--accent-success)]">
            −{brl(row.discount)}
          </span>
        ) : (
          <span className="text-[var(--fg-tertiary)]">—</span>
        )}
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
