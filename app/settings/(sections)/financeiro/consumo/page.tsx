"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { Icon } from "@/components/ui/Icon";
import { InvoiceDetailsSheet } from "../_components/InvoiceDetailsSheet";
import { VariableSpendingBlock } from "../_components/VariableSpendingBlock";
import {
  brl,
  COUPONS_APPLIED,
  INVOICE_HISTORY,
  OVERVIEW_KPIS,
  VARIABLE_SPENDING_LIMIT,
  VOUCHERS,
  type CouponRow,
  type VoucherRow,
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

function inferReceivedDate(voucher: VoucherRow): string {
  const expires = parseBR(voucher.expiresAt);
  const received = new Date(expires);
  received.setMonth(received.getMonth() - 12);
  return formatShort(received);
}

function formatExpiry(br: string): string {
  return formatShort(parseBR(br));
}

/* -----------------------------------------------------------------
 * Page
 * ----------------------------------------------------------------- */

export default function ConsumoPage() {
  const [openInvoiceId, setOpenInvoiceId] = React.useState<string | null>(
    null,
  );
  const [limit, setLimit] = React.useState(VARIABLE_SPENDING_LIMIT);
  const [limitOpen, setLimitOpen] = React.useState(false);

  const accumulated = OVERVIEW_KPIS.accumulated;
  const couponBonus = React.useMemo(
    () => COUPONS_APPLIED.reduce((s, c) => s + c.discount, 0),
    [],
  );
  const openInvoice =
    INVOICE_HISTORY.find((r) => r.id === openInvoiceId) ?? null;

  return (
    <div className="flex flex-col gap-14">
      <ConsumptionHero
        accumulated={accumulated}
        limit={limit}
        couponBonus={couponBonus}
        onChangeLimit={() => setLimitOpen(true)}
      />

      <UnifiedCreditsTable
        vouchers={VOUCHERS}
        coupons={COUPONS_APPLIED}
        onOpenInvoice={setOpenInvoiceId}
      />

      <DetailsSection />

      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenInvoiceId(null)}
      />

      <ChangeLimitModal
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
        currentLimit={limit}
        onSave={(v) => {
          setLimit(v);
          setLimitOpen(false);
        }}
      />
    </div>
  );
}

/* -----------------------------------------------------------------
 * Hero — consumo variável vs limite
 * ----------------------------------------------------------------- */

function ConsumptionHero({
  accumulated,
  limit,
  couponBonus,
  onChangeLimit,
}: {
  accumulated: number;
  limit: number;
  couponBonus: number;
  onChangeLimit: () => void;
}) {
  const extended = limit + couponBonus;
  const pct =
    extended > 0 ? Math.min(Math.round((accumulated / extended) * 100), 999) : 0;
  const remainingBase = Math.max(limit - accumulated, 0);
  const overBase = accumulated > limit;
  const overExtended = accumulated > extended;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
          Consumo variável · ciclo atual
        </p>
        <h1 className="m-0 display-md tabular-nums text-[var(--fg-primary)]">
          <span className="mr-1 text-[0.45em] font-normal text-[var(--fg-tertiary)]">
            R$
          </span>
          {brl(accumulated).replace(/^R\$\s*/, "")}
        </h1>
        <p className="m-0 max-w-[600px] body-xs text-[var(--fg-secondary)]">
          Seu limite é de{" "}
          <strong className="font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(limit)}
          </strong>
          {couponBonus > 0 && (
            <>
              {" "}— estendido para{" "}
              <strong className="font-medium tabular-nums text-[var(--fg-primary)]">
                {brl(extended)}
              </strong>{" "}
              com cupons aplicados
            </>
          )}
          . Quando o consumo atinge esse teto, o montante é cobrado
          automaticamente.{" "}
          <button
            type="button"
            onClick={onChangeLimit}
            className="font-medium text-[var(--fg-secondary)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--fg-primary)] hover:no-underline"
          >
            Alterar limite
          </button>
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <ConsumptionBar
          consumed={accumulated}
          baseLimit={limit}
          extendedLimit={extended}
        />
        <div className="flex items-center justify-between gap-3 body-xs tabular-nums">
          <span className="text-[var(--fg-secondary)]">
            {pct}% de {brl(extended)}
          </span>
          <span
            className={
              overExtended
                ? "text-[var(--accent-danger)]"
                : overBase
                  ? "text-[var(--accent-warning)]"
                  : "text-[var(--fg-tertiary)]"
            }
          >
            {overExtended
              ? `Limite atingido — cobrança automática em curso`
              : overBase
                ? `Em zona estendida por cupons — restam ${brl(extended - accumulated)}`
                : `Restam ${brl(remainingBase)} antes da cobrança`}
          </span>
        </div>
      </div>
    </section>
  );
}

/* -----------------------------------------------------------------
 * Consumption bar — green fill with two needles (base + extended)
 * - Ponta direita reta quando consumo < 100% do limite estendido
 * - Agulha 1 (verde escuro): limite base
 * - Agulha 2 (cinza): limite + cupons (só renderiza se houver bonus)
 * ----------------------------------------------------------------- */

function ConsumptionBar({
  consumed,
  baseLimit,
  extendedLimit,
}: {
  consumed: number;
  baseLimit: number;
  extendedLimit: number;
}) {
  const scaleMax = Math.max(extendedLimit, consumed);
  const fillPct = scaleMax > 0 ? (consumed / scaleMax) * 100 : 0;
  const basePct = scaleMax > 0 ? (baseLimit / scaleMax) * 100 : 0;
  const extPct = scaleMax > 0 ? (extendedLimit / scaleMax) * 100 : 0;
  const hasBonus = extendedLimit > baseLimit;
  const fullBar = fillPct >= 100;
  const overExtended = consumed > extendedLimit;

  return (
    <div className="relative h-2.5 w-full" aria-label="Consumo do ciclo">
      <div className="absolute inset-0 rounded-full bg-[var(--bg-muted)]" />

      <div
        className={
          "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out " +
          (fullBar ? "rounded-full" : "rounded-l-full") +
          (overExtended
            ? " bg-[var(--aw-red-600)]"
            : " bg-[var(--aw-emerald-600)]")
        }
        style={{ width: `${Math.min(fillPct, 100)}%` }}
      />

      {basePct > 0 && basePct < 100 && (
        <ConsumptionNeedle
          leftPct={basePct}
          color="var(--aw-emerald-700)"
          label={`Limite base · ${brl(baseLimit)}`}
        />
      )}

      {hasBonus && extPct > 0 && extPct < 100 && (
        <ConsumptionNeedle
          leftPct={extPct}
          color="var(--fg-tertiary)"
          dashed
          label={`Limite + cupons · ${brl(extendedLimit)}`}
        />
      )}
    </div>
  );
}

function ConsumptionNeedle({
  leftPct,
  color,
  label,
  dashed,
}: {
  leftPct: number;
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className="pointer-events-auto absolute -top-1 bottom-[-4px] z-[1]"
      style={{ left: `${leftPct}%` }}
    >
      <span
        className="absolute left-1/2 top-0 -translate-x-1/2 h-full"
        style={{
          width: 1.5,
          background: dashed
            ? `repeating-linear-gradient(to bottom, ${color} 0 3px, transparent 3px 5px)`
            : color,
        }}
      />
    </span>
  );
}

/* -----------------------------------------------------------------
 * Unified credits & coupons table
 * ----------------------------------------------------------------- */

type UnifiedRow =
  | {
      kind: "voucher";
      id: string;
      received: Date;
      data: VoucherRow;
    }
  | {
      kind: "coupon";
      id: string;
      received: Date;
      data: CouponRow;
    };

function UnifiedCreditsTable({
  vouchers,
  coupons,
  onOpenInvoice,
}: {
  vouchers: VoucherRow[];
  coupons: CouponRow[];
  onOpenInvoice: (id: string) => void;
}) {
  const rows: UnifiedRow[] = React.useMemo(() => {
    const v: UnifiedRow[] = vouchers.map((voucher) => {
      const expires = parseBR(voucher.expiresAt);
      const received = new Date(expires);
      received.setMonth(received.getMonth() - 12);
      return {
        kind: "voucher" as const,
        id: voucher.id,
        received,
        data: voucher,
      };
    });
    const c: UnifiedRow[] = coupons.map((coupon) => ({
      kind: "coupon" as const,
      id: coupon.id,
      received: parseBR(coupon.appliedAt),
      data: coupon,
    }));
    return [...v, ...c].sort(
      (a, b) => b.received.getTime() - a.received.getTime(),
    );
  }, [vouchers, coupons]);

  const totalGranted = vouchers.reduce((s, v) => s + v.total, 0);
  const totalAvailable = vouchers.reduce(
    (s, v) => s + (v.total - v.consumed),
    0,
  );
  const totalDiscount = coupons.reduce((s, c) => s + c.discount, 0);

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
            Créditos &amp; cupons
          </h6>
          <p className="m-0 max-w-[560px] body-xs text-[var(--fg-secondary)]">
            Vouchers ativos e cupons aplicados — tudo que reduz a fatura desta
            organização em um só lugar.
          </p>
        </div>
        <div className="flex flex-col items-end body-xs tabular-nums text-[var(--fg-tertiary)]">
          <span>
            <span className="font-medium text-[var(--fg-primary)]">
              {brl(totalAvailable)}
            </span>
            {" "}em vouchers · de {brl(totalGranted)}
          </span>
          {totalDiscount > 0 && (
            <span>
              <span className="font-medium text-[var(--accent-success)]">
                −{brl(totalDiscount)}
              </span>
              {" "}em cupons aplicados
            </span>
          )}
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
          Nenhum crédito ou cupom ativo no momento.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <Th>Crédito</Th>
                <Th>Valor</Th>
                <Th>Status</Th>
                <Th>Recebido</Th>
                <Th>Validade</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) =>
                row.kind === "voucher" ? (
                  <VoucherRowEl key={row.id} row={row.data} />
                ) : (
                  <CouponRowEl
                    key={row.id}
                    row={row.data}
                    onOpenInvoice={onOpenInvoice}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function VoucherRowEl({ row }: { row: VoucherRow }) {
  const remaining = row.total - row.consumed;
  const isExpired = row.status === "Expirado";
  const days = daysUntil(row.expiresAt);
  const expiringSoon = days <= 30 && !isExpired;

  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-b-0">
      <Td>
        <CreditCell
          kind="voucher"
          title={row.description}
          subtitle={row.applicableTo}
        />
      </Td>
      <Td>
        <span className="tabular-nums text-[var(--fg-primary)]">
          {brl(remaining)}
        </span>
        <span className="ml-1 body-xs tabular-nums text-[var(--fg-tertiary)]">
          / {brl(row.total)}
        </span>
      </Td>
      <Td>
        <AwPill variant={isExpired ? "neutral" : "live"} dot={false}>
          {isExpired ? "Expirado" : "Ativo"}
        </AwPill>
      </Td>
      <Td muted>{inferReceivedDate(row)}</Td>
      <Td muted>
        {formatExpiry(row.expiresAt)}
        {expiringSoon && (
          <span className="ml-1.5 body-xs text-[var(--accent-warning)]">
            (em {days} dia{days !== 1 ? "s" : ""})
          </span>
        )}
      </Td>
    </tr>
  );
}

function CouponRowEl({
  row,
  onOpenInvoice,
}: {
  row: CouponRow;
  onOpenInvoice: (id: string) => void;
}) {
  const invoiceExists = INVOICE_HISTORY.some((r) => r.id === row.invoiceId);
  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-b-0">
      <Td>
        <CreditCell
          kind="coupon"
          title={row.description}
          subtitle={row.code}
          subtitleVariant="code"
        />
      </Td>
      <Td>
        <span className="font-medium tabular-nums text-[var(--accent-success)]">
          −{brl(row.discount)}
        </span>
      </Td>
      <Td>
        <span className="inline-flex items-center gap-1.5 body-xs text-[var(--fg-secondary)]">
          <Icon
            name="check_circle"
            size={14}
            className="text-[var(--accent-success)]"
          />
          Aplicado
          {invoiceExists ? (
            <>
              {" em "}
              <button
                type="button"
                onClick={() => onOpenInvoice(row.invoiceId)}
                className="font-medium text-[var(--fg-primary)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--accent-brand)] hover:no-underline"
              >
                {row.invoiceId}
              </button>
            </>
          ) : (
            <> em {row.invoiceId}</>
          )}
        </span>
      </Td>
      <Td muted>{formatShort(parseBR(row.appliedAt))}</Td>
      <Td muted>{row.application}</Td>
    </tr>
  );
}

function CreditCell({
  kind,
  title,
  subtitle,
  subtitleVariant = "muted",
}: {
  kind: "voucher" | "coupon";
  title: string;
  subtitle?: string;
  subtitleVariant?: "muted" | "code";
}) {
  const isVoucher = kind === "voucher";
  return (
    <span className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] " +
          (isVoucher
            ? "bg-[var(--aw-emerald-500)]/12 text-[var(--aw-emerald-700)]"
            : "bg-[var(--aw-purple-500)]/12 text-[var(--aw-purple-700)]")
        }
      >
        <Icon name={isVoucher ? "card_giftcard" : "local_offer"} size={20} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate body-sm font-medium text-[var(--fg-primary)]">
          {title}
        </span>
        {subtitle && (
          <span
            className={
              "truncate body-xs " +
              (subtitleVariant === "code"
                ? "aw-eyebrow text-[var(--fg-tertiary)]"
                : "text-[var(--fg-tertiary)]")
            }
          >
            {subtitle}
          </span>
        )}
        <span className="body-xs text-[var(--fg-tertiary)]">
          {isVoucher ? "Voucher" : "Cupom"}
        </span>
      </span>
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-0 py-3 pr-6 text-left aw-eyebrow font-medium text-[var(--fg-tertiary)] last:pr-0"
    >
      {children}
    </th>
  );
}

function Td({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <td
      className={
        "px-0 py-4 pr-6 align-top body-xs last:pr-0 " +
        (muted ? "text-[var(--fg-secondary)]" : "text-[var(--fg-primary)]")
      }
    >
      {children}
    </td>
  );
}

/* -----------------------------------------------------------------
 * Details — chart + breakdown shown naturally
 * ----------------------------------------------------------------- */

function DetailsSection() {
  return (
    <section className="flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-8">
      <header>
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
          Detalhes de consumo
        </h6>
        <p className="m-0 max-w-[560px] body-xs text-[var(--fg-secondary)]">
          Gráfico por dia, com breakdown por serviço ou por agente. Use o
          filtro de período pra investigar o que está consumindo.
        </p>
      </header>
      <VariableSpendingBlock />
    </section>
  );
}

/* -----------------------------------------------------------------
 * Limit modal
 * ----------------------------------------------------------------- */

function ChangeLimitModal({
  open,
  onClose,
  currentLimit,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  currentLimit: number;
  onSave: (v: number) => void;
}) {
  const [draft, setDraft] = React.useState(String(currentLimit));
  React.useEffect(() => {
    if (open) setDraft(String(currentLimit));
  }, [open, currentLimit]);

  const parsed = Number(draft.replace(/\./g, "").replace(",", "."));
  const valid = Number.isFinite(parsed) && parsed > 0;

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Alterar limite por usuário"
      footer={
        <div className="flex items-center justify-end gap-2">
          <AwButton variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            variant="primary"
            iconLeft="check"
            disabled={!valid}
            onClick={() => onSave(parsed)}
          >
            Salvar
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
          Cada usuário tem esse teto de gastos variáveis por ciclo. Quando o
          montante é atingido, a gente cobra automaticamente.
        </p>
        <label
          htmlFor="consumo-limit"
          className="aw-eyebrow text-[var(--fg-tertiary)]"
        >
          Limite mensal por usuário
        </label>
        <AwInput
          id="consumo-limit"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
        />
        <p className="m-0 body-xs text-[var(--fg-tertiary)]">
          Atualmente: <span className="tabular-nums">{brl(currentLimit)}</span>
        </p>
      </div>
    </AwModal>
  );
}
