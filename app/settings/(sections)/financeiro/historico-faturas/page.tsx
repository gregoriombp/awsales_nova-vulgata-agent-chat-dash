"use client";

import * as React from "react";
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
import { AwQrPlaceholder } from "@/components/ui/AwQrPlaceholder";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import {
  InvoiceDetailsSheet,
  paymentBrandId,
} from "../_components/InvoiceDetailsSheet";
import {
  brl,
  INVOICE_HISTORY,
  invoiceStatusLabel,
  PAYMENT_METHODS,
  type CardPaymentMethod,
  type InvoiceHistoryRow,
} from "../_components/data";
import {
  AddPaymentMethodModal,
  type NewPaymentMethod,
} from "../_components/AddPaymentMethodModal";

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
      return "dispute";
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
  const [regularizeOpen, setRegularizeOpen] = React.useState(false);

  // Abre o fluxo de regularização quando chega via "?regularizar=1" (botão do
  // banner de pagamento pendente, no cabeçalho global do Financeiro).
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("regularizar") === "1"
    ) {
      setRegularizeOpen(true);
    }
  }, []);

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
                Baixar relatório
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
            <AwPill variant={statusVariant(row.status)}>
              {invoiceStatusLabel(row.status)}
            </AwPill>
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
      ? invoiceStatusLabel(selected[0])
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
      label: invoiceStatusLabel(s),
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

type RegularizePhase = "select" | "method" | "checkout" | "success";

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
    description: "Escaneie o QR Code e a confirmação chega na hora.",
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
 * Regulariza faturas pendentes em quatro passos com transições suaves:
 * escolher as faturas (pode ser mais de uma) → escolher pix/cartão/boleto →
 * o processo real daquela forma de pagamento (QR do Pix, cobrança no cartão,
 * boleto com linha digitável) → confirmação. Cada passo traz um "Voltar"; o
 * conteúdo faz fade/slide ao trocar de fase.
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
  const [invoiceIds, setInvoiceIds] = React.useState<string[]>([]);
  const [method, setMethod] = React.useState<RegularizeMethod["id"] | null>(
    null,
  );

  const reset = () => {
    setPhase("select");
    setInvoiceIds([]);
    setMethod(null);
  };

  const close = () => {
    onClose();
    // Espera a animação de saída do modal antes de zerar o estado interno.
    window.setTimeout(reset, 200);
  };

  const toggleInvoice = (id: string) =>
    setInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const selectedInvoices = invoices.filter((r) => invoiceIds.includes(r.id));
  const totalDue = selectedInvoices.reduce((s, r) => s + r.net, 0);
  const selectedMethod =
    REGULARIZE_METHODS.find((m) => m.id === method) ?? null;

  const title =
    phase === "success"
      ? undefined
      : phase === "select"
        ? "Regularizar pagamento"
        : phase === "method"
          ? "Como você quer pagar?"
          : selectedMethod?.id === "pix"
            ? "Pague com Pix"
            : selectedMethod?.id === "boleto"
              ? "Boleto gerado"
              : "Confirmar cobrança";

  // No Pix a confirmação é automática (o QR detecta o pagamento), então essa
  // etapa NÃO tem CTA de avançar — o usuário só aguarda. Cartão é uma cobrança
  // ativa de verdade; boleto encerra o passo.
  const checkoutCta =
    selectedMethod?.id === "boleto" ? "Concluir" : "Confirmar pagamento";

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
          disabled={invoiceIds.length === 0}
          onClick={() => setPhase("method")}
        >
          {invoiceIds.length > 1
            ? `Pagar ${invoiceIds.length} faturas`
            : "Continuar"}
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
          iconRight="arrow_forward"
          disabled={!method}
          onClick={() => setPhase("checkout")}
        >
          Continuar
        </AwButton>
      </>
    ) : phase === "checkout" ? (
      selectedMethod?.id === "pix" ? (
        // Pix aguarda a confirmação automática do pagamento — sem CTA de
        // "já paguei"; só o caminho de volta. O modal pode ser fechado no X.
        <AwButton
          size="sm"
          variant="ghost"
          iconLeft="arrow_back"
          onClick={() => setPhase("method")}
        >
          Voltar
        </AwButton>
      ) : (
        <>
          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="arrow_back"
            onClick={() => setPhase("method")}
          >
            Voltar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            iconLeft="check"
            onClick={() => setPhase("success")}
          >
            {checkoutCta}
          </AwButton>
        </>
      )
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
            selectedIds={invoiceIds}
            onToggle={toggleInvoice}
          />
        )}

        {phase === "method" && (
          <SelectMethodStep
            invoices={selectedInvoices}
            total={totalDue}
            selected={method}
            onSelect={setMethod}
          />
        )}

        {phase === "checkout" && selectedMethod && (
          <CheckoutStep
            invoices={selectedInvoices}
            total={totalDue}
            method={selectedMethod}
          />
        )}

        {phase === "success" && selectedMethod && (
          <PaymentSuccess
            invoices={selectedInvoices}
            total={totalDue}
            method={selectedMethod}
          />
        )}
      </div>
    </AwModal>
  );
}

function SelectInvoiceStep({
  invoices,
  selectedIds,
  onToggle,
}: {
  invoices: InvoiceHistoryRow[];
  selectedIds: string[];
  onToggle: (id: string) => void;
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
        Marque quais cobranças você quer quitar — pode pagar várias de uma vez.
      </p>
      <div aria-label="Faturas pendentes" className="flex flex-col gap-2">
        {invoices.map((inv) => {
          const selected = selectedIds.includes(inv.id);
          return (
            <button
              key={inv.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => onToggle(inv.id)}
              className={
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-aw-fast " +
                (selected
                  ? "border-(--border-strong) bg-(--bg-hover)"
                  : "border-(--border-subtle) hover:border-(--border-default) hover:bg-(--bg-hover)")
              }
            >
              <span
                aria-hidden="true"
                className={
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-aw-fast " +
                  (selected
                    ? "border-(--fg-primary) bg-(--fg-primary) text-(--bg-raised)"
                    : "border-(--border-default)")
                }
              >
                {selected && <Icon name="check" size={14} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="body-sm font-medium text-(--fg-primary)">
                    {inv.description}
                  </span>
                  <AwPill variant={statusVariant(inv.status)}>
                    {invoiceStatusLabel(inv.status)}
                  </AwPill>
                </div>
                <p className="m-0 mt-0.5 body-xs tabular-nums text-(--fg-tertiary)">
                  {inv.id} · Venceu em {inv.dueAt}
                </p>
              </div>
              <span className="shrink-0 body-sm font-medium tabular-nums text-(--fg-primary)">
                {brl(inv.net)}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/** Resumo das faturas escolhidas — reaproveitado nos passos seguintes. */
function SelectionSummary({
  invoices,
  total,
}: {
  invoices: InvoiceHistoryRow[];
  total: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-2">
      <span className="body-xs text-(--fg-secondary)">
        {invoices.length === 1
          ? `${invoices[0].description} · ${invoices[0].id}`
          : `${invoices.length} faturas selecionadas`}
      </span>
      <span className="body-sm font-medium tabular-nums text-(--fg-primary)">
        {brl(total)}
      </span>
    </div>
  );
}

function SelectMethodStep({
  invoices,
  total,
  selected,
  onSelect,
}: {
  invoices: InvoiceHistoryRow[];
  total: number;
  selected: RegularizeMethod["id"] | null;
  onSelect: (id: RegularizeMethod["id"]) => void;
}) {
  return (
    <>
      <SelectionSummary invoices={invoices} total={total} />

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

/* ---------- checkout: o processo real de cada forma de pagamento ---------- */

function CheckoutStep({
  invoices,
  total,
  method,
}: {
  invoices: InvoiceHistoryRow[];
  total: number;
  method: RegularizeMethod;
}) {
  return (
    <>
      <SelectionSummary invoices={invoices} total={total} />
      {method.id === "pix" && <PixCheckout total={total} />}
      {method.id === "card" && <CardCheckout total={total} />}
      {method.id === "boleto" && <BoletoCheckout total={total} />}
    </>
  );
}

function PixCheckout({ total }: { total: number }) {
  const copyPaste =
    "00020126580014br.gov.bcb.pix0136aswork-" + total.toFixed(2).replace(".", "");

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <AwQrPlaceholder px={168} ariaLabel="QR Code do Pix" />
      <p className="m-0 body-sm font-medium text-(--fg-primary)">
        Escaneie o QR Code no app do seu banco
      </p>
      <p className="m-0 max-w-[320px] body-xs text-(--fg-secondary)">
        Assim que o Pix de{" "}
        <strong className="font-medium text-(--fg-primary)">{brl(total)}</strong>{" "}
        cair, a confirmação aparece aqui automaticamente.
      </p>
      <CopyField label="Pix copia e cola" value={copyPaste} />
      <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
        <Icon name="schedule" size={14} />
        Aguardando o pagamento…
      </span>
    </div>
  );
}

function CardCheckout({ total }: { total: number }) {
  // Cartões já salvos na conta — o usuário escolhe em qual lançar a cobrança,
  // ou adiciona um novo pelo MESMO modal padrão (sem fluxo paralelo).
  const initialCards = React.useMemo(
    () =>
      PAYMENT_METHODS.filter(
        (m): m is CardPaymentMethod => m.kind === "card",
      ),
    [],
  );
  const [cards, setCards] = React.useState<CardPaymentMethod[]>(initialCards);
  const [selectedId, setSelectedId] = React.useState<string>(
    () => initialCards.find((c) => c.isDefault)?.id ?? initialCards[0]?.id ?? "",
  );
  const [addOpen, setAddOpen] = React.useState(false);

  // Boleto e Pix são únicos: o modal padrão trava os que a conta já tem.
  const takenKinds = PAYMENT_METHODS.filter(
    (m) => m.kind === "boleto" || m.kind === "pix",
  ).map((m) => m.kind);

  // Adicionar pelo modal padrão: aqui o foco é cartão — entra na lista e já fica
  // selecionado pra cobrança.
  const handleAdd = (method: NewPaymentMethod) => {
    if (method.kind !== "card") return;
    const id = `pm-new-${method.last4}-${cards.length}`;
    setCards((prev) => [
      ...prev,
      {
        kind: "card",
        id,
        brand: method.brand,
        last4: method.last4,
        expiresAt: method.expiresAt,
        isDefault: false,
      },
    ]);
    setSelectedId(id);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="radiogroup"
        aria-label="Cartão para a cobrança"
        className="flex flex-col gap-2"
      >
        {cards.map((c) => {
          const selected = c.id === selectedId;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setSelectedId(c.id)}
              className={
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-aw-fast " +
                (selected
                  ? "border-(--border-strong) bg-(--bg-hover)"
                  : "border-(--border-subtle) hover:border-(--border-default) hover:bg-(--bg-hover)")
              }
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-primary)">
                <Icon name="credit_card" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 flex items-center gap-2 body-sm font-medium text-(--fg-primary)">
                  {c.brand} •••• {c.last4}
                  {c.isDefault && (
                    <span className="rounded-full bg-(--bg-muted) px-1.5 py-0.5 body-xs font-normal text-(--fg-tertiary)">
                      Padrão
                    </span>
                  )}
                </p>
                <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                  Expira em {c.expiresAt}
                </p>
              </div>
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

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-dashed border-(--border-default) p-3 text-left body-sm font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:border-(--border-strong) hover:bg-(--bg-hover)"
        >
          <Icon name="add" size={18} className="shrink-0" />
          Adicionar novo cartão
        </button>
      </div>

      <p className="m-0 body-xs text-(--fg-secondary)">
        Confirme para lançar a cobrança de{" "}
        <strong className="font-medium text-(--fg-primary)">{brl(total)}</strong>{" "}
        no cartão selecionado. Você recebe o comprovante por e-mail.
      </p>

      <AddPaymentMethodModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
        takenKinds={takenKinds}
      />
    </div>
  );
}

function BoletoCheckout({ total }: { total: number }) {
  const line =
    "34191.79001 01043.510047 91020.150008 1 99870000" +
    Math.round(total * 100).toString().padStart(6, "0");

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-(--border-subtle) bg-(--bg-raised) p-4">
        <BarcodeStrip payload={line} />
      </div>
      <CopyField label="Linha digitável" value={line} />
      <p className="m-0 body-xs text-(--fg-secondary)">
        O boleto de{" "}
        <strong className="font-medium text-(--fg-primary)">{brl(total)}</strong>{" "}
        também foi enviado para os e-mails de faturamento. Compensa em até 2
        dias úteis após o pagamento.
      </p>
    </div>
  );
}

/** Campo só-leitura com botão de copiar — usado no Pix e no boleto. */
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => {},
    );
  };
  return (
    <div className="flex w-full items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-muted) px-3 py-2">
      <div className="min-w-0 flex-1 text-left">
        <p className="m-0 body-xs text-(--fg-tertiary)">{label}</p>
        <p className="m-0 truncate body-xs font-medium tabular-nums text-(--fg-primary)">
          {value}
        </p>
      </div>
      <AwButton
        size="sm"
        variant="ghost"
        iconLeft={copied ? "check" : "content_copy"}
        onClick={copy}
      >
        {copied ? "Copiado" : "Copiar"}
      </AwButton>
    </div>
  );
}

/** Código de barras ilustrativo do boleto. */
function BarcodeStrip({ payload }: { payload: string }) {
  let s = 0;
  for (let i = 0; i < payload.length; i++) s = (s * 31 + payload.charCodeAt(i)) >>> 0;
  const bars: { w: number; on: boolean }[] = [];
  for (let i = 0; i < 60; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    bars.push({ w: ((s >> 4) % 3) + 1, on: i % 2 === 0 });
  }
  return (
    <div
      className="flex h-16 w-full items-stretch gap-px overflow-hidden"
      role="img"
      aria-label="Código de barras do boleto (ilustrativo)"
    >
      {bars.map((b, i) => (
        <span
          key={i}
          style={{ flexGrow: b.w }}
          className={b.on ? "bg-(--fg-primary)" : "bg-transparent"}
        />
      ))}
    </div>
  );
}

function PaymentSuccess({
  invoices,
  total,
  method,
}: {
  invoices: InvoiceHistoryRow[];
  total: number;
  method: RegularizeMethod;
}) {
  const isBoleto = method.id === "boleto";
  const target =
    invoices.length === 1 ? `da fatura ${invoices[0].id}` : `de ${invoices.length} faturas`;

  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--aw-emerald-100) text-(--aw-emerald-700) animate-in zoom-in-50 duration-300 ease-aw-out motion-reduce:animate-none">
        <Icon name={isBoleto ? "schedule" : "check_circle"} size={30} />
      </span>
      <h6 className="m-0 text-(--fg-primary)">
        {isBoleto ? "Boleto enviado" : "Pagamento bem-sucedido"}
      </h6>
      <p className="m-0 max-w-[360px] body-xs text-(--fg-secondary)">
        {isBoleto ? (
          <>
            O boleto de{" "}
            <strong className="font-medium text-(--fg-primary)">
              {brl(total)}
            </strong>{" "}
            {target} foi enviado para os e-mails de faturamento. Assim que
            compensar, a fatura é marcada como paga.
          </>
        ) : (
          <>
            Recebemos o pagamento de{" "}
            <strong className="font-medium text-(--fg-primary)">
              {brl(total)}
            </strong>{" "}
            {target} via {method.label.toLowerCase()}. O comprovante segue para
            os e-mails de faturamento.
          </>
        )}
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
