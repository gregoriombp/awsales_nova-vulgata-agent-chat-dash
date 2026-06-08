"use client";

import * as React from "react";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwButton } from "@/components/ui/AwButton";
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
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
  "Em atraso",
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

function statusVariant(status: InvoiceStatus): AwPillVariant {
  switch (status) {
    case "Paga":
      return "live";
    case "Em aberto":
      return "draft";
    case "Em atraso":
      return "warning";
    case "Falhou":
      return "error";
    case "Disputada":
      return "beta";
  }
}

type MonthGroup = {
  refMonth: string;
  rows: InvoiceHistoryRow[];
  total: number;
  discount: number;
};

function groupByMonth(rows: InvoiceHistoryRow[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  rows.forEach((r) => {
    const existing = map.get(r.refMonth);
    if (existing) {
      existing.rows.push(r);
      existing.total += r.net;
      existing.discount += r.discount ?? 0;
    } else {
      map.set(r.refMonth, {
        refMonth: r.refMonth,
        rows: [r],
        total: r.net,
        discount: r.discount ?? 0,
      });
    }
  });
  return Array.from(map.values());
}

export default function HistoricoFaturasPage() {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [statuses, setStatuses] = React.useState<InvoiceStatus[]>(ALL_STATUSES);
  const [period, setPeriod] = React.useState<string>("Todo o período");

  const openInvoice = INVOICE_HISTORY.find((r) => r.id === openId) ?? null;

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICE_HISTORY.filter((r) => {
      if (!statuses.includes(r.status)) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        (r.discountCode?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, statuses]);

  const groups = React.useMemo(() => groupByMonth(rows), [rows]);
  const totalCount = rows.length;

  const overdueCount = INVOICE_HISTORY.filter((r) => r.status === "Falhou").length;
  const lateCount = INVOICE_HISTORY.filter((r) => r.status === "Em atraso").length;
  const showPaymentAlert = overdueCount + lateCount > 0;

  return (
    <div className="flex flex-col gap-8">
      {showPaymentAlert && (
        <AwAlert variant="warning" title="Regularize seu pagamento">
          <p className="m-0 body-xs text-(--fg-primary)">
            {overdueCount > 0 && (
              <>
                {overdueCount === 1
                  ? "1 fatura está vencida"
                  : `${overdueCount} faturas estão vencidas`}
                {lateCount > 0 ? " e " : "."}
              </>
            )}
            {lateCount > 0 && (
              <>
                {lateCount === 1
                  ? "1 fatura está em atraso"
                  : `${lateCount} faturas estão em atraso`}
                .
              </>
            )}
            {" "}
            Quite os pagamentos pendentes para evitar o congelamento da conta.
          </p>
        </AwAlert>
      )}

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
        <AwButton
          size="md"
          variant="ghost"
          iconLeft="download"
          onClick={() =>
            alert("Exportação iniciada — você receberá o CSV por e-mail.")
          }
        >
          Exportar CSV
        </AwButton>
      </div>

      {totalCount === 0 ? (
        <EmptyResults />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((g) => (
            <MonthSection
              key={g.refMonth}
              group={g}
              onOpen={(id) => setOpenId(id)}
            />
          ))}
        </div>
      )}

      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

/* ---------- month section ---------- */

function MonthSection({
  group,
  onOpen,
}: {
  group: MonthGroup;
  onOpen: (id: string) => void;
}) {
  return (
    <section>
      <header className="mb-3 flex items-baseline justify-between gap-4 border-b border-(--border-subtle) pb-2">
        <div className="flex items-baseline gap-3">
          <h6 className="m-0 text-(--fg-primary)">{group.refMonth}</h6>
          <span className="body-xs text-(--fg-tertiary)">
            {group.rows.length}{" "}
            {group.rows.length === 1 ? "fatura" : "faturas"}
          </span>
        </div>
        <span className="body-sm font-medium tabular-nums text-(--fg-primary)">
          {brl(group.total)}
        </span>
      </header>
      <ul className="m-0 flex flex-col gap-1 p-0">
        {group.rows.map((row) => (
          <InvoiceRow key={row.id} row={row} onOpen={() => onOpen(row.id)} />
        ))}
      </ul>
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
  const overdue = row.status === "Em atraso" || row.status === "Falhou";
  const dateLabel = row.paidAt
    ? `Paga em ${row.paidAt}`
    : overdue
      ? `Venceu em ${row.dueAt}`
      : `Vence em ${row.dueAt}`;

  return (
    <li className="m-0 list-none">
      <button
        type="button"
        onClick={onOpen}
        className="group grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 rounded-md px-3 py-3 text-left transition-colors hover:bg-(--bg-hover) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--accent-brand)"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="body-sm font-medium text-(--fg-primary)">
              {row.description}
            </span>
            <AwPill variant={statusVariant(row.status)}>{row.status}</AwPill>
          </div>
          <p className="m-0 mt-0.5 body-xs tabular-nums text-(--fg-tertiary)">
            {row.id} · {row.paymentMethod} · {dateLabel}
          </p>
        </div>
        <span className="body-sm font-medium tabular-nums text-(--fg-primary)">
          {brl(row.net)}
        </span>
        <Icon
          name="chevron_right"
          size={18}
          className="text-(--fg-tertiary) transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </li>
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

  const allSelected = selected.length === ALL_STATUSES.length;
  const triggerLabel = allSelected
    ? "Todos os status"
    : selected.length === 1
      ? selected[0]
      : selected.length === 0
        ? "Nenhum status"
        : `Status · ${selected.length}`;

  const items: AwDropdownItem[] = [
    {
      id: "all",
      label: "Selecionar todos",
      icon: "done_all",
      closeOnSelect: false,
      onSelect: () => onChange(ALL_STATUSES),
      disabled: allSelected,
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
      trigger={<AwSelect>{value}</AwSelect>}
      items={items}
    />
  );
}

/* ---------- empty ---------- */

function EmptyResults() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-(--border-subtle) px-6 py-12 text-center">
      <Icon
        name="search_off"
        size={24}
        className="text-(--fg-tertiary)"
      />
      <p className="m-0 body-sm font-medium text-(--fg-primary)">
        Nenhuma fatura corresponde aos filtros
      </p>
      <p className="m-0 body-xs text-(--fg-secondary)">
        Tente outro termo ou amplie o período.
      </p>
    </div>
  );
}
