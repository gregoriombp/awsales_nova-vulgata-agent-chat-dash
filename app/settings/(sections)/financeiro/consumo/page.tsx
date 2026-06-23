"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwStatCard } from "@/components/ui/AwStatCard";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InvoiceDetailsSheet } from "../_components/InvoiceDetailsSheet";
import {
  brl,
  COUPONS_APPLIED,
  CREDITS_KPIS,
  INVOICE_HISTORY,
  voucherStatusVariant,
  VOUCHERS,
  type CouponRow,
  type VoucherRow,
  type VoucherStatus,
} from "../_components/data";

const TODAY = new Date(2026, 4, 19);

function parseBR(date: string): Date {
  const [d, m, y] = date.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function daysUntil(br: string): number {
  return Math.round((parseBR(br).getTime() - TODAY.getTime()) / 86_400_000);
}

const MONTHS_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatShort(d: Date): string {
  return `${MONTHS_PT[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

function formatExpiry(br: string): string {
  return formatShort(parseBR(br));
}

/* -----------------------------------------------------------------
 * Page — Saldo de créditos. Resumo (3 KPIs) → vouchers → cupons.
 * O consumo variável × limite mora na aba "Visão geral"; aqui o foco
 * é entender de onde vem cada abatimento e quanto ainda há de saldo.
 * ----------------------------------------------------------------- */

export default function ConsumoPage() {
  const [openInvoiceId, setOpenInvoiceId] = React.useState<string | null>(
    null,
  );
  const [openVoucherId, setOpenVoucherId] = React.useState<string | null>(null);

  const openInvoice =
    INVOICE_HISTORY.find((r) => r.id === openInvoiceId) ?? null;
  const openVoucher = VOUCHERS.find((v) => v.id === openVoucherId) ?? null;

  return (
    <div className="flex flex-col gap-12">
      <CreditsKpis />

      <VouchersBlock vouchers={VOUCHERS} onOpenVoucher={setOpenVoucherId} />

      <CouponsBlock coupons={COUPONS_APPLIED} onOpenInvoice={setOpenInvoiceId} />

      <ProvenanceNote />

      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenInvoiceId(null)}
      />

      <VoucherDetailModal
        voucher={openVoucher}
        open={openVoucher !== null}
        onClose={() => setOpenVoucherId(null)}
        onOpenInvoice={(id) => {
          setOpenVoucherId(null);
          setOpenInvoiceId(id);
        }}
      />
    </div>
  );
}

/* -----------------------------------------------------------------
 * Resumo — 3 KPIs de crédito. Dados em CREDITS_KPIS; cada card carrega
 * uma linha de apoio que desambigua "economizado" × "disponível".
 * ----------------------------------------------------------------- */

function CreditsKpis() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <AwStatCard
        icon="savings"
        label="Total economizado"
        value={brl(CREDITS_KPIS.totalSaved)}
        hint="Lifetime · cupons + vouchers já abatidos"
      />
      <AwStatCard
        icon="account_balance_wallet"
        label="Desconto disponível"
        value={brl(CREDITS_KPIS.availableDiscount)}
        hint="Saldo de vouchers ativos a abater"
      />
      <AwStatCard
        icon="confirmation_number"
        label="Vouchers ativos"
        value={CREDITS_KPIS.activeVouchers}
        hint="Vouchers em uso agora"
      />
    </div>
  );
}

function CreditInfoTooltip({ kind }: { kind: "voucher" | "coupon" }) {
  const text =
    kind === "voucher"
      ? "Voucher é um crédito concedido pela Aswork (POC, cortesia, bônus de contrato). Abate dos seus gastos variáveis até a validade — não muda o limite."
      : "Cupom é um código promocional aplicado pela sua equipe de conta. Abate uma única vez do valor do plano fixo.";
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`O que é ${kind === "voucher" ? "um voucher" : "um cupom"}`}
            className="inline-flex text-(--fg-tertiary) hover:text-(--fg-primary)"
          >
            <Icon name="info" size={15} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[280px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ---------- vouchers (impacto no variável) ---------- */

function VouchersBlock({
  vouchers,
  onOpenVoucher,
}: {
  vouchers: VoucherRow[];
  onOpenVoucher: (id: string) => void;
}) {
  const [showHistory, setShowHistory] = React.useState(false);
  const current = vouchers.filter(
    (v) =>
      v.status === "Ativo" ||
      v.status === "Pendente" ||
      v.status === "Pausado",
  );
  const history = vouchers.filter(
    (v) => v.status === "Esgotado" || v.status === "Vencido",
  );

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h6 className="m-0 text-(--fg-primary)">Vouchers</h6>
        <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
          Abatem dos seus gastos variáveis até a validade.
        </p>
      </header>

      {current.length === 0 ? (
        <p className="m-0 border-t border-(--border-subtle) py-4 body-xs text-(--fg-tertiary)">
          Nenhum voucher ativo no momento.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {current.map((v) => (
            <VoucherRowItem key={v.id} v={v} onOpenVoucher={onOpenVoucher} />
          ))}
        </ul>
      )}

      {history.length > 0 && (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setShowHistory((s) => !s)}
            aria-expanded={showHistory}
            className="flex w-fit items-center gap-1.5 py-1 body-xs font-medium text-(--fg-tertiary) transition-colors hover:text-(--fg-primary)"
          >
            <Icon
              name={showHistory ? "expand_less" : "expand_more"}
              size={16}
            />
            Histórico · {history.length} encerrado
            {history.length !== 1 ? "s" : ""}
          </button>
          {showHistory && (
            <ul className="m-0 flex list-none flex-col p-0">
              {history.map((v) => (
                <VoucherRowItem
                  key={v.id}
                  v={v}
                  onOpenVoucher={onOpenVoucher}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

/** Cor da bolinha de status sobre o ícone (sem chip de texto). */
const VOUCHER_DOT: Record<VoucherStatus, string> = {
  Ativo: "var(--aw-emerald-500)",
  Pendente: "var(--aw-blue-500)",
  Pausado: "var(--aw-amber-500)",
  Esgotado: "var(--fg-tertiary)",
  Vencido: "var(--fg-tertiary)",
};

/** Texto da tooltip que explica a cor da bolinha de status. */
function voucherStatusHint(status: VoucherStatus): string {
  switch (status) {
    case "Ativo":
      return "Ativo · abatendo o consumo";
    case "Pendente":
      return "Pendente · começa em breve, ainda não abate";
    case "Pausado":
      return "Pausado · suspenso pela equipe de conta";
    case "Esgotado":
      return "Esgotado · saldo zerado por consumo";
    case "Vencido":
      return "Vencido · passou da validade";
  }
}

function VoucherInfoTip({ v }: { v: VoucherRow }) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Sobre ${v.description}`}
            className="inline-flex text-(--fg-tertiary) hover:text-(--fg-secondary)"
          >
            <Icon name="info" size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[260px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
        >
          Crédito da Aswork ({v.status.toLowerCase()}). Aplica em{" "}
          {v.applicableTo}. Válido até {formatExpiry(v.expiresAt)}.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function VoucherRowItem({
  v,
  onOpenVoucher,
}: {
  v: VoucherRow;
  onOpenVoucher: (id: string) => void;
}) {
  const pct = v.total > 0 ? Math.round((v.consumed / v.total) * 100) : 0;
  const muted = v.status === "Esgotado" || v.status === "Vencido";
  const pending = v.status === "Pendente" && Boolean(v.effectiveAt);
  const year = parseBR(v.expiresAt).getFullYear();

  // Ativos/pausados mostram a data de expiração; pendentes, a contagem até virar.
  const startDays = pending ? daysUntil(v.effectiveAt!) : 0;
  const dateLabel = pending
    ? `Inicia em ${startDays} dia${startDays !== 1 ? "s" : ""}`
    : `Expira em ${v.expiresAt}`;

  // Barra verde local: a AwProgress do DS é grayscale por design (sem matiz),
  // então o voucher usa a própria barra; histórico fica neutro.
  const barColor = muted ? "var(--fg-tertiary)" : "var(--aw-emerald-500)";

  return (
    <li
      className={
        "flex items-center gap-5 border-t border-(--border-subtle) py-5 " +
        (muted ? "opacity-70" : "")
      }
    >
      {/* ícone + bolinha de status (tooltip explica a cor) */}
      <TooltipProvider delayDuration={120}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              role="img"
              aria-label={`Status: ${v.status}`}
              className="relative shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-(--border-strong)"
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--border-default) bg-(--bg-raised) text-(--fg-secondary)"
              >
                <Icon name="sell" size={22} fill={1} />
              </span>
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full"
                style={{
                  background: VOUCHER_DOT[v.status],
                  boxShadow: "0 0 0 2px var(--bg-canvas)",
                }}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
          >
            {voucherStatusHint(v.status)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* título + subtítulo (coluna estreita pra descrição quebrar em 2 linhas) */}
      <div className="flex w-[240px] shrink-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span className="truncate body-md font-medium text-(--fg-primary)">
            {v.description}
          </span>
          <VoucherInfoTip v={v} />
        </span>
        <span
          className="line-clamp-2 body-xs text-(--fg-tertiary)"
          style={{ minHeight: "2lh" }}
        >
          {year} · {v.applicableTo}
        </span>
      </div>

      {/* barra verde + legenda em duas linhas */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--bg-muted)">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="flex flex-col leading-tight">
            <span className="body-xs">
              <strong className="font-semibold text-(--fg-primary)">
                {pct}%
              </strong>{" "}
              <span className="text-(--fg-tertiary)">utilizados</span>
            </span>
            <span className="body-xs text-(--fg-tertiary)">{dateLabel}</span>
          </span>
          <span className="flex shrink-0 flex-col items-end text-right leading-tight">
            <span className="body-sm font-semibold tabular-nums text-(--fg-primary)">
              {brl(v.consumed)}
            </span>
            <span className="body-xs tabular-nums text-(--fg-tertiary)">
              de {brl(v.total)}
            </span>
          </span>
        </div>
      </div>

      {/* ver detalhes */}
      <button
        type="button"
        onClick={() => onOpenVoucher(v.id)}
        className="group flex shrink-0 items-center gap-1 body-xs font-medium text-(--fg-secondary) transition-colors hover:text-(--fg-primary)"
      >
        Ver detalhes
        <Icon
          name="arrow_forward"
          size={14}
          className="text-(--fg-tertiary) transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </li>
  );
}

/* ---------- cupons (impacto no plano fixo) ---------- */

function CouponsBlock({
  coupons,
  onOpenInvoice,
}: {
  coupons: CouponRow[];
  onOpenInvoice: (id: string) => void;
}) {
  const sorted = React.useMemo(
    () =>
      [...coupons].sort(
        (a, b) =>
          parseBR(b.appliedAt).getTime() - parseBR(a.appliedAt).getTime(),
      ),
    [coupons],
  );

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h6 className="m-0 flex items-center gap-2 text-(--fg-primary)">
          Cupons
          <CreditInfoTooltip kind="coupon" />
        </h6>
        <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
          Abatem uma única vez do valor do plano fixo.
        </p>
      </header>

      {sorted.length === 0 ? (
        <p className="m-0 border-t border-(--border-subtle) py-4 body-xs text-(--fg-tertiary)">
          Nenhum cupom aplicado.
        </p>
      ) : (
        <AwTable>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Aplicação</th>
              <th>Fatura</th>
              <th>Data</th>
              <th className="text-right">Valor descontado</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const invoiceExists = INVOICE_HISTORY.some(
                (r) => r.id === c.invoiceId,
              );
              return (
                <tr key={c.id}>
                  <td className="font-medium text-(--fg-primary)">{c.code}</td>
                  <td className="text-(--fg-secondary)">{c.description}</td>
                  <td className="text-(--fg-secondary)">{c.application}</td>
                  <td>
                    {invoiceExists ? (
                      <button
                        type="button"
                        onClick={() => onOpenInvoice(c.invoiceId)}
                        className="font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 hover:text-(--fg-primary) hover:no-underline"
                      >
                        {c.invoiceId}
                      </button>
                    ) : (
                      <span className="text-(--fg-tertiary)">
                        {c.invoiceId}
                      </span>
                    )}
                  </td>
                  <td className="tabular-nums text-(--fg-secondary)">
                    {formatShort(parseBR(c.appliedAt))}
                  </td>
                  <td className="text-right font-medium tabular-nums text-(--accent-success)">
                    −{brl(c.discount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AwTable>
      )}
    </section>
  );
}

/* ---------- nota de procedência (cliente não resgata código) ---------- */

function ProvenanceNote() {
  return (
    <p className="m-0 flex items-start gap-2 border-t border-(--border-subtle) pt-4 body-xs text-(--fg-tertiary)">
      <Icon name="info" size={15} className="mt-px shrink-0" />
      <span className="max-w-[640px]">
        Vouchers e cupons são aplicados pela sua equipe de conta — não há código
        para resgatar aqui. Tudo que entrou aparece acima, com o valor e a fatura
        de origem.
      </span>
    </p>
  );
}

/* ---------- modal de detalhes do voucher ---------- */

function VoucherDetailModal({
  voucher,
  open,
  onClose,
  onOpenInvoice,
}: {
  voucher: VoucherRow | null;
  open: boolean;
  onClose: () => void;
  onOpenInvoice: (id: string) => void;
}) {
  const remaining = voucher ? Math.max(voucher.total - voucher.consumed, 0) : 0;

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title={voucher?.description ?? "Voucher"}
      footer={
        <div className="flex items-center justify-end">
          <AwButton variant="ghost" onClick={onClose}>
            Fechar
          </AwButton>
        </div>
      }
    >
      {voucher && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <AwPill variant={voucherStatusVariant(voucher.status)}>
              {voucher.status}
            </AwPill>
            <span className="body-xs text-(--fg-tertiary)">
              {voucher.status === "Pendente" && voucher.effectiveAt
                ? `Começa em ${formatExpiry(voucher.effectiveAt)}`
                : `Válido até ${formatExpiry(voucher.expiresAt)}`}
            </span>
          </div>

          {/* três números, flat (divisória, sem card aninhado) */}
          <div className="grid grid-cols-3 divide-x divide-(--border-subtle)">
            <ModalStat label="Valor total" value={brl(voucher.total)} />
            <ModalStat
              label="Usado"
              value={brl(voucher.consumed)}
              className="pl-4"
            />
            <ModalStat
              label="Restante"
              value={brl(remaining)}
              accent
              className="pl-4"
            />
          </div>

          <p className="m-0 body-xs text-(--fg-secondary)">
            Aplica em:{" "}
            <span className="font-medium text-(--fg-primary)">
              {voucher.applicableTo}
            </span>
          </p>

          {voucher.consumptions && voucher.consumptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
                Faturas que usaram este voucher
              </p>
              <AwTable>
                <thead>
                  <tr>
                    <th>Fatura</th>
                    <th>Data</th>
                    <th className="text-right">Valor usado</th>
                  </tr>
                </thead>
                <tbody>
                  {voucher.consumptions.map((u) => (
                    <tr key={u.invoiceId + u.date}>
                      <td>
                        <button
                          type="button"
                          onClick={() => onOpenInvoice(u.invoiceId)}
                          className="font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 hover:text-(--fg-primary) hover:no-underline"
                        >
                          {u.invoiceId}
                        </button>
                      </td>
                      <td className="tabular-nums text-(--fg-secondary)">
                        {u.date}
                      </td>
                      <td className="text-right font-medium tabular-nums text-(--accent-success)">
                        −{brl(u.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AwTable>
            </div>
          )}
        </div>
      )}
    </AwModal>
  );
}

function ModalStat({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={"flex flex-col gap-1 " + (className ?? "")}>
      <span className="aw-eyebrow text-(--fg-tertiary)">{label}</span>
      <span
        className={
          "body-lg font-medium tabular-nums " +
          (accent ? "text-(--accent-success)" : "text-(--fg-primary)")
        }
      >
        {value}
      </span>
    </div>
  );
}
