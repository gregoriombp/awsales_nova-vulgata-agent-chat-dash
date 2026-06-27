"use client";

import * as React from "react";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwCardBrand } from "@/components/ui/AwCardBrand";
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu";
import { AwFileIcon } from "@/components/ui/AwFileIcon";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import {
  InvoiceDetailsSheet,
  paymentBrandId,
} from "../_components/InvoiceDetailsSheet";
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
  "Falha no Pagamento",
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
    case "Falha no Pagamento":
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
  const [exportFormat, setExportFormat] = React.useState<"pdf" | "csv" | null>(
    null,
  );
  const [exportConfirmed, setExportConfirmed] = React.useState(false);
  const [alertDismissed, setAlertDismissed] = React.useState(false);
  const [regularizeOpen, setRegularizeOpen] = React.useState(false);

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

  const overdueCount = INVOICE_HISTORY.filter((r) => r.status === "Falha no Pagamento").length;
  const lateCount = INVOICE_HISTORY.filter((r) => r.status === "Em atraso").length;
  const showPaymentAlert = overdueCount + lateCount > 0;

  // Faturas que ainda precisam ser quitadas — entram no modal de regularização.
  const pendingInvoices = React.useMemo(
    () =>
      INVOICE_HISTORY.filter(
        (r) =>
          r.status === "Em atraso" ||
          r.status === "Falha no Pagamento" ||
          r.status === "Em aberto",
      ),
    [],
  );

  const openExport = (format: "pdf" | "csv") => {
    setExportConfirmed(false);
    setExportFormat(format);
  };
  const closeExport = () => {
    setExportFormat(null);
    setExportConfirmed(false);
  };
  const confirmExport = () => {
    if (!exportFormat) return;
    const isCsv = exportFormat === "csv";
    const content = isCsv
      ? "ID,Mês,Descrição,Status,Valor\n" +
        INVOICE_HISTORY.map(
          (r) => `${r.id},${r.refMonth},"${r.description}",${r.status},${r.net}`,
        ).join("\n")
      : "Relatório de faturas — Aswork\n(prévia: o PDF definitivo é gerado no servidor)";
    const blob = new Blob([content], {
      type: isCsv ? "text/csv" : "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faturas-aswork.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setExportConfirmed(true);
  };

  return (
    <div className="flex flex-col gap-8">
      {showPaymentAlert && !alertDismissed && (
        <AwAlert
          variant="warning"
          title="Regularize seu pagamento"
          onClose={() => setAlertDismissed(true)}
        >
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
            Quite para evitar o congelamento da conta.
          </p>
          <div className="mt-3">
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="payments"
              onClick={() => setRegularizeOpen(true)}
            >
              Regularizar pagamento
            </AwButton>
          </div>
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
        <AwDropdownMenu
          align="end"
          trigger={
            <AwButton size="md" variant="ghost" iconLeft="download">
              Exportar
              <Icon name="expand_more" size={16} className="ml-0.5" />
            </AwButton>
          }
          items={[
            {
              id: "pdf",
              label: "Exportar em PDF",
              icon: "picture_as_pdf",
              onSelect: () => openExport("pdf"),
            },
            {
              id: "csv",
              label: "Exportar em CSV",
              icon: "table_view",
              onSelect: () => openExport("csv"),
            },
          ]}
        />
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

      <RegularizePaymentModal
        open={regularizeOpen}
        invoices={pendingInvoices}
        onClose={() => setRegularizeOpen(false)}
      />

      <AwModal
        open={exportFormat !== null}
        onClose={closeExport}
        title={exportConfirmed ? "Relatório a caminho" : "Exportar relatório"}
        footer={
          exportConfirmed ? (
            <div className="flex items-center justify-end">
              <AwButton variant="primary" onClick={closeExport}>
                Concluir
              </AwButton>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <AwButton variant="ghost" onClick={closeExport}>
                Cancelar
              </AwButton>
              <AwButton
                variant="primary"
                iconLeft="download"
                onClick={confirmExport}
              >
                Confirmar
              </AwButton>
            </div>
          )
        }
      >
        {exportConfirmed ? (
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--aw-emerald-100) text-(--aw-emerald-700)">
              <Icon name="mark_email_read" size={18} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                Seu relatório está sendo preparado.
              </p>
              <p className="m-0 body-xs text-(--fg-secondary)">
                Enviaremos o arquivo em {exportFormat?.toUpperCase()} para o seu
                e-mail pessoal. O download no formato escolhido também começou
                automaticamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {exportFormat && <AwFileIcon type={exportFormat} size="md" />}
              <div className="flex flex-col gap-0.5">
                <p className="m-0 body-sm font-medium text-(--fg-primary)">
                  Exportar em {exportFormat?.toUpperCase()}
                </p>
                <p className="m-0 body-xs text-(--fg-secondary)">
                  Geramos o histórico completo e enviamos para o seu e-mail.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--bg-raised) text-(--fg-primary)">
                <Icon name="shield_lock" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 body-xs font-medium text-(--fg-primary)">
                  Este arquivo contém dados pessoais
                </p>
                <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                  As faturas trazem dados de faturamento e pagamento. Ao
                  exportar, você assume a responsabilidade pelo tratamento —
                  LGPD e a política da sua organização valem aqui.
                </p>
              </div>
            </div>
          </div>
        )}
      </AwModal>
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
  const overdue = row.status === "Em atraso" || row.status === "Falha no Pagamento";
  const dateLabel = row.paidAt
    ? `Paga em ${row.paidAt}`
    : overdue
      ? `Venceu em ${row.dueAt}`
      : `Vence em ${row.dueAt}`;
  // Só cartões têm bandeira; Boleto/Pix caem em "unknown" e ficam só com texto.
  const cardBrand = paymentBrandId(row.paymentMethod);

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
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 body-xs tabular-nums text-(--fg-tertiary)">
            <span>{row.id}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              {cardBrand !== "unknown" && (
                <AwCardBrand brand={cardBrand} size="sm" />
              )}
              {row.paymentMethod}
            </span>
            <span aria-hidden>·</span>
            <span>{dateLabel}</span>
          </div>
        </div>
        <span className="flex flex-col items-end">
          <span className="body-sm font-medium tabular-nums text-(--fg-primary)">
            {brl(row.net)}
          </span>
          {row.discount ? (
            <span className="mt-0.5 body-xs tabular-nums text-(--accent-success)">
              −{brl(row.discount)}
              {row.discountCode ? ` · ${row.discountCode}` : ""}
            </span>
          ) : null}
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

/* ---------- regularizar pagamento ---------- */

type RegularizePhase = "select" | "method" | "success";

type RegularizeMethod = {
  id: "pix" | "card" | "boleto";
  label: string;
  description: string;
  brand: string;
};

const REGULARIZE_METHODS: RegularizeMethod[] = [
  {
    id: "pix",
    label: "Pix",
    description: "Confirmação na hora.",
    brand: "pix",
  },
  {
    id: "card",
    label: "Cartão de crédito",
    description: "Cobrança imediata no cartão padrão.",
    brand: "card",
  },
  {
    id: "boleto",
    label: "Boleto bancário",
    description: "Compensa em até 2 dias úteis.",
    brand: "boleto",
  },
];

/**
 * Regulariza uma fatura pendente em três passos com transições suaves:
 * escolher a fatura → escolher pix/cartão/boleto → confirmação de sucesso.
 * Cada passo traz um "Voltar"; o conteúdo faz fade/slide ao trocar de fase.
 */
function RegularizePaymentModal({
  open,
  invoices,
  onClose,
}: {
  open: boolean;
  invoices: InvoiceHistoryRow[];
  onClose: () => void;
}) {
  const [phase, setPhase] = React.useState<RegularizePhase>("select");
  const [invoiceId, setInvoiceId] = React.useState<string | null>(null);
  const [method, setMethod] = React.useState<RegularizeMethod["id"] | null>(
    null,
  );

  const reset = () => {
    setPhase("select");
    setInvoiceId(null);
    setMethod(null);
  };

  const close = () => {
    onClose();
    // Espera a animação de saída do modal antes de zerar o estado interno.
    window.setTimeout(reset, 200);
  };

  const selectedInvoice = invoices.find((r) => r.id === invoiceId) ?? null;
  const selectedMethod =
    REGULARIZE_METHODS.find((m) => m.id === method) ?? null;

  const title =
    phase === "success"
      ? undefined
      : phase === "select"
        ? "Regularizar pagamento"
        : "Como você quer pagar?";

  const footer =
    phase === "select" ? (
      <>
        <AwButton size="sm" variant="ghost" onClick={close}>
          Cancelar
        </AwButton>
        <AwButton
          size="sm"
          variant="primary"
          iconRight="arrow_forward"
          disabled={!invoiceId}
          onClick={() => setPhase("method")}
        >
          Continuar
        </AwButton>
      </>
    ) : phase === "method" ? (
      <>
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="arrow_back"
          onClick={() => setPhase("select")}
        >
          Voltar
        </AwButton>
        <AwButton
          size="sm"
          variant="primary"
          iconLeft="check"
          disabled={!method}
          onClick={() => setPhase("success")}
        >
          Confirmar pagamento
        </AwButton>
      </>
    ) : (
      <AwButton size="sm" variant="primary" onClick={close}>
        Concluir
      </AwButton>
    );

  return (
    <AwModal open={open} onClose={close} title={title} footer={footer}>
      {/* key por fase: o React remonta a fração e dispara o fade/slide. */}
      <div
        key={phase}
        className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-1 duration-300 ease-aw-out motion-reduce:animate-none"
      >
        {phase === "select" && (
          <SelectInvoiceStep
            invoices={invoices}
            selectedId={invoiceId}
            onSelect={setInvoiceId}
          />
        )}

        {phase === "method" && selectedInvoice && (
          <SelectMethodStep
            invoice={selectedInvoice}
            selected={method}
            onSelect={setMethod}
          />
        )}

        {phase === "success" && selectedInvoice && selectedMethod && (
          <PaymentSuccess
            invoice={selectedInvoice}
            method={selectedMethod}
          />
        )}
      </div>
    </AwModal>
  );
}

function SelectInvoiceStep({
  invoices,
  selectedId,
  onSelect,
}: {
  invoices: InvoiceHistoryRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--bg-muted) text-(--accent-success)">
          <Icon name="check_circle" size={22} />
        </span>
        <p className="m-0 body-sm font-medium text-(--fg-primary)">
          Nenhuma fatura pendente
        </p>
        <p className="m-0 body-xs text-(--fg-secondary)">
          Está tudo em dia por aqui.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="m-0 body-xs text-(--fg-secondary)">
        Escolha qual cobrança você quer quitar agora.
      </p>
      <div
        role="radiogroup"
        aria-label="Fatura pendente"
        className="flex flex-col gap-2"
      >
        {invoices.map((inv) => {
          const selected = inv.id === selectedId;
          return (
            <button
              key={inv.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(inv.id)}
              className={
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-aw-fast " +
                (selected
                  ? "border-(--border-strong) bg-(--bg-hover)"
                  : "border-(--border-subtle) hover:border-(--border-default) hover:bg-(--bg-hover)")
              }
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="body-sm font-medium text-(--fg-primary)">
                    {inv.description}
                  </span>
                  <AwPill variant={statusVariant(inv.status)}>
                    {inv.status}
                  </AwPill>
                </div>
                <p className="m-0 mt-0.5 body-xs tabular-nums text-(--fg-tertiary)">
                  {inv.id} · Venceu em {inv.dueAt}
                </p>
              </div>
              <span className="shrink-0 body-sm font-medium tabular-nums text-(--fg-primary)">
                {brl(inv.net)}
              </span>
              <span
                aria-hidden="true"
                className={
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-aw-fast " +
                  (selected
                    ? "border-(--fg-primary) bg-(--fg-primary)"
                    : "border-(--border-default)")
                }
              >
                {selected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-(--bg-raised)" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function SelectMethodStep({
  invoice,
  selected,
  onSelect,
}: {
  invoice: InvoiceHistoryRow;
  selected: RegularizeMethod["id"] | null;
  onSelect: (id: RegularizeMethod["id"]) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-2">
        <span className="body-xs text-(--fg-secondary)">
          {invoice.description} · {invoice.id}
        </span>
        <span className="body-sm font-medium tabular-nums text-(--fg-primary)">
          {brl(invoice.net)}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Forma de pagamento"
        className="flex flex-col gap-2"
      >
        {REGULARIZE_METHODS.map((m) => {
          const isSel = m.id === selected;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={isSel}
              onClick={() => onSelect(m.id)}
              className={
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-aw-fast " +
                (isSel
                  ? "border-(--border-strong) bg-(--bg-hover)"
                  : "border-(--border-subtle) hover:border-(--border-default) hover:bg-(--bg-hover)")
              }
            >
              <AwBrandLogo brand={m.brand} size="md" />
              <div className="min-w-0 flex-1">
                <p className="m-0 body-sm font-medium text-(--fg-primary)">
                  {m.label}
                </p>
                <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                  {m.description}
                </p>
              </div>
              <span
                aria-hidden="true"
                className={
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-aw-fast " +
                  (isSel
                    ? "border-(--fg-primary) bg-(--fg-primary)"
                    : "border-(--border-default)")
                }
              >
                {isSel && (
                  <span className="h-1.5 w-1.5 rounded-full bg-(--bg-raised)" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function PaymentSuccess({
  invoice,
  method,
}: {
  invoice: InvoiceHistoryRow;
  method: RegularizeMethod;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--aw-emerald-100) text-(--aw-emerald-700) animate-in zoom-in-50 duration-300 ease-aw-out motion-reduce:animate-none">
        <Icon name="check_circle" size={30} />
      </span>
      <h6 className="m-0 text-(--fg-primary)">Pagamento bem-sucedido</h6>
      <p className="m-0 max-w-[360px] body-xs text-(--fg-secondary)">
        Recebemos o pagamento de{" "}
        <strong className="font-medium text-(--fg-primary)">
          {brl(invoice.net)}
        </strong>{" "}
        da fatura{" "}
        <strong className="font-medium text-(--fg-primary)">
          {invoice.id}
        </strong>{" "}
        via {method.label.toLowerCase()}. O comprovante segue para os e-mails de
        faturamento.
      </p>
    </div>
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
