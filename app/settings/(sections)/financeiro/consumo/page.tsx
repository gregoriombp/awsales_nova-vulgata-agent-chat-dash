"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InvoiceDetailsSheet } from "../_components/InvoiceDetailsSheet";
import { MoneyHeading } from "../_components/MoneyHeading";
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
  const [limit] = React.useState(VARIABLE_SPENDING_LIMIT);
  const [requestOpen, setRequestOpen] = React.useState(false);

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
        onRequestIncrease={() => setRequestOpen(true)}
      />

      <VouchersTable vouchers={VOUCHERS} />

      <CouponsTable
        coupons={COUPONS_APPLIED}
        onOpenInvoice={setOpenInvoiceId}
      />

      <DetailsSection />

      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenInvoiceId(null)}
      />

      <RequestLimitIncreaseModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        currentLimit={limit}
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
  onRequestIncrease,
}: {
  accumulated: number;
  limit: number;
  couponBonus: number;
  onRequestIncrease: () => void;
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
        <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
          Consumo variável · ciclo atual
        </p>
        <MoneyHeading value={accumulated} size="md" as="h1" />
        <p className="m-0 max-w-[600px] body-xs text-(--fg-secondary)">
          Seu limite é de{" "}
          <strong className="font-medium tabular-nums text-(--fg-primary)">
            {brl(limit)}
          </strong>
          {couponBonus > 0 && (
            <>
              {" "}— estendido para{" "}
              <strong className="font-medium tabular-nums text-(--fg-primary)">
                {brl(extended)}
              </strong>{" "}
              com cupons aplicados
            </>
          )}
          . Quando o consumo atinge esse teto, o montante é cobrado
          automaticamente.{" "}
          <button
            type="button"
            onClick={onRequestIncrease}
            className="font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 transition-colors hover:text-(--fg-primary) hover:no-underline"
          >
            Solicitar aumento de limite
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
          <span className="text-(--fg-secondary)">
            {pct}% de {brl(extended)}
          </span>
          <span
            className={
              overExtended
                ? "text-(--accent-danger)"
                : overBase
                  ? "text-(--accent-warning)"
                  : "text-(--fg-tertiary)"
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
  const bonus = extendedLimit - baseLimit;

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative h-2.5 w-full" aria-label="Consumo do ciclo">
            <div className="absolute inset-0 rounded-full bg-(--bg-muted)" />

            <div
              className={
                "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out " +
                (fullBar ? "rounded-full" : "rounded-l-full") +
                (overExtended
                  ? " bg-(--aw-red-600)"
                  : " bg-(--aw-emerald-600)")
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
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="border-(--border-subtle) bg-(--bg-raised) text-(--fg-primary)"
        >
          <div className="flex flex-col gap-1.5 py-0.5 text-xs">
            <div className="flex items-center justify-between gap-6">
              <span className="text-(--fg-secondary)">
                Limite concedido
              </span>
              <span className="tabular-nums">{brl(baseLimit)}</span>
            </div>
            {hasBonus && (
              <div className="flex items-center justify-between gap-6">
                <span className="text-(--fg-secondary)">
                  Estendido por cupons
                </span>
                <span className="tabular-nums text-(--accent-success)">
                  +{brl(bonus)}
                </span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between gap-6 border-t border-(--border-subtle) pt-1.5 font-medium">
              <span>Limite de uso</span>
              <span className="tabular-nums">{brl(extendedLimit)}</span>
            </div>
            <div className="flex items-center justify-between gap-6 text-(--fg-secondary)">
              <span>Consumido até agora</span>
              <span className="tabular-nums">{brl(consumed)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
      className="pointer-events-auto absolute -top-1 bottom-[-4px] z-1"
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
 * Vouchers — abatem gastos variáveis. Tabela própria, separada dos
 * cupons (que mexem no valor fixo).
 * ----------------------------------------------------------------- */

function VouchersTable({ vouchers }: { vouchers: VoucherRow[] }) {
  const totalGranted = vouchers.reduce((s, v) => s + v.total, 0);
  const totalAvailable = vouchers.reduce(
    (s, v) => s + (v.total - v.consumed),
    0,
  );

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h6 className="m-0 mb-1 text-(--fg-primary)">Vouchers</h6>
          <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
            Créditos emitidos pela AwSales que descontam dos{" "}
            <strong className="font-medium text-(--fg-primary)">
              gastos variáveis
            </strong>{" "}
            do ciclo — disparos, tokens, telefonia.
          </p>
          {vouchers.length > 0 && (
            <p className="m-0 mt-2 body-xs tabular-nums text-(--fg-tertiary)">
              <span className="font-medium text-(--fg-primary)">
                {brl(totalAvailable)}
              </span>{" "}
              disponíveis · de {brl(totalGranted)}
            </p>
          )}
        </div>
        <AwButton size="md" variant="primary" iconLeft="add">
          Adicionar voucher
        </AwButton>
      </header>

      {vouchers.length === 0 ? (
        <p className="m-0 body-xs text-(--fg-secondary)">
          Nenhum voucher ativo no momento.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <Th>Voucher</Th>
                <Th>Valor</Th>
                <Th>Status</Th>
                <Th>Recebido</Th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <VoucherRowEl key={v.id} row={v} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* -----------------------------------------------------------------
 * Cupons — impactam o valor fixo (plano/implementação). Tabela
 * separada dos vouchers.
 * ----------------------------------------------------------------- */

function CouponsTable({
  coupons,
  onOpenInvoice,
}: {
  coupons: CouponRow[];
  onOpenInvoice: (id: string) => void;
}) {
  const totalDiscount = coupons.reduce((s, c) => s + c.discount, 0);
  const sorted = React.useMemo(
    () =>
      [...coupons].sort(
        (a, b) => parseBR(b.appliedAt).getTime() - parseBR(a.appliedAt).getTime(),
      ),
    [coupons],
  );

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h6 className="m-0 mb-1 text-(--fg-primary)">Cupons</h6>
          <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
            Códigos aplicados que descontam no{" "}
            <strong className="font-medium text-(--fg-primary)">
              valor fixo
            </strong>{" "}
            da próxima fatura — plano, implementação, taxas.
          </p>
          {totalDiscount > 0 && (
            <p className="m-0 mt-2 body-xs tabular-nums text-(--fg-tertiary)">
              <span className="font-medium text-(--accent-success)">
                −{brl(totalDiscount)}
              </span>{" "}
              em cupons aplicados
            </p>
          )}
        </div>
      </header>

      {sorted.length === 0 ? (
        <p className="m-0 body-xs text-(--fg-secondary)">
          Nenhum cupom aplicado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <Th>Cupom</Th>
                <Th>Desconto</Th>
                <Th>Status</Th>
                <Th>Aplicado</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <CouponRowEl
                  key={c.id}
                  row={c}
                  onOpenInvoice={onOpenInvoice}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function VoucherRowEl({ row }: { row: VoucherRow }) {
  const isExpired = row.status === "Expirado";
  const days = daysUntil(row.expiresAt);
  const expiringSoon = days <= 30 && !isExpired;

  return (
    <tr className="border-b border-(--border-subtle) last:border-b-0">
      <Td>
        <CreditCell
          kind="voucher"
          title={row.description}
          subtitle={`Voucher · ${row.applicableTo}`}
        />
      </Td>
      <Td>
        <span className="block tabular-nums text-(--fg-primary)">
          {brl(row.total)}
        </span>
        <span className="block body-xs tabular-nums text-(--fg-tertiary)">
          Consumido {brl(row.consumed)}
        </span>
      </Td>
      <Td>
        <div className="flex flex-col items-start gap-1">
          <AwPill variant={isExpired ? "neutral" : "live"} dot={false}>
            {isExpired ? "Expirado" : "Ativo"}
          </AwPill>
          <span className="body-xs text-(--fg-tertiary)">
            Vence {formatExpiry(row.expiresAt)}
            {expiringSoon && (
              <span className="ml-1 text-(--accent-warning)">
                · em {days} dia{days !== 1 ? "s" : ""}
              </span>
            )}
          </span>
        </div>
      </Td>
      <Td muted>{inferReceivedDate(row)}</Td>
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
    <tr className="border-b border-(--border-subtle) last:border-b-0">
      <Td>
        <CreditCell
          kind="coupon"
          title={row.description}
          subtitle={`Cupom · ${row.code}`}
        />
      </Td>
      <Td>
        <span className="block font-medium tabular-nums text-(--accent-success)">
          −{brl(row.discount)}
        </span>
        <span className="block body-xs text-(--fg-tertiary)">
          Uso único
        </span>
      </Td>
      <Td>
        <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
          <Icon
            name="check_circle"
            size={14}
            className="text-(--accent-success)"
          />
          Aplicado
          {invoiceExists ? (
            <>
              {" em "}
              <button
                type="button"
                onClick={() => onOpenInvoice(row.invoiceId)}
                className="font-medium text-(--fg-primary) underline decoration-dotted underline-offset-2 transition-colors hover:text-(--accent-brand) hover:no-underline"
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
    </tr>
  );
}

function CreditCell({
  kind,
  title,
  subtitle,
}: {
  kind: "voucher" | "coupon";
  title: string;
  subtitle?: string;
}) {
  const isVoucher = kind === "voucher";
  return (
    <span className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)"
      >
        <Icon
          name={isVoucher ? "card_giftcard" : "local_offer"}
          size={20}
          fill={0}
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate body-sm font-medium text-(--fg-primary)">
          {title}
        </span>
        {subtitle && (
          <span className="truncate body-xs text-(--fg-tertiary)">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-0 py-3 pr-6 text-left aw-eyebrow font-medium text-(--fg-tertiary) last:pr-0"
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
        (muted ? "text-(--fg-secondary)" : "text-(--fg-primary)")
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
    <section className="flex flex-col gap-4 border-t border-(--border-subtle) pt-8">
      <header>
        <h6 className="m-0 mb-1 text-(--fg-primary)">
          Detalhes de consumo
        </h6>
        <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
          Gráfico por dia, com breakdown por serviço ou por agente. Use o
          filtro de período pra investigar o que está consumindo.
        </p>
      </header>
      <VariableSpendingBlock />
    </section>
  );
}

/* -----------------------------------------------------------------
 * Request limit increase — opens a contact form with the account manager
 * ----------------------------------------------------------------- */

function RequestLimitIncreaseModal({
  open,
  onClose,
  currentLimit,
}: {
  open: boolean;
  onClose: () => void;
  currentLimit: number;
}) {
  const am = ONBOARDING_ORG.accountManager;
  const amFirstName = am.name.split(/\s+/)[0];
  const phoneDigits = am.phone.replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Oi ${amFirstName}, queria pedir aumento do limite variável (atual: ${brl(currentLimit)}).`,
  );
  const whatsappUrl = `https://wa.me/${phoneDigits}?text=${waText}`;
  const slackUrl = `https://slack.com/app_redirect?channel=@${am.email.split("@")[0]}`;

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Solicitar aumento de limite"
      footer={
        <div className="flex items-center justify-end">
          <AwButton variant="ghost" onClick={onClose}>
            Fechar
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 body-xs text-(--fg-secondary)">
          Limites são ajustados direto pelo seu account manager. Manda um
          recado pro {amFirstName} pelo canal que preferir — ele avalia e
          devolve a próxima faixa disponível.
        </p>

        <div className="flex items-center gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-2.5">
          <AwAvatar
            size="md"
            src={am.photo}
            alt={am.name}
            initials={am.initials}
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              {am.name}
            </p>
            <p className="m-0 body-xs text-(--fg-tertiary)">{am.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md border border-(--border-default) bg-(--bg-raised) px-3 py-3 transition-colors hover:border-(--border-strong) hover:bg-(--bg-surface)"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--aw-emerald-500) text-(--aw-white)">
              <Icon name="chat" size={18} fill={1} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block body-sm font-medium text-(--fg-primary)">
                Falar no WhatsApp
              </span>
              <span className="block body-xs tabular-nums text-(--fg-tertiary)">
                {am.phone}
              </span>
            </span>
            <Icon
              name="arrow_outward"
              size={16}
              className="text-(--fg-tertiary)"
            />
          </a>

          <a
            href={slackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md border border-(--border-default) bg-(--bg-raised) px-3 py-3 transition-colors hover:border-(--border-strong) hover:bg-(--bg-surface)"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--aw-purple-600) text-(--aw-white)">
              <Icon name="tag" size={18} fill={1} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block body-sm font-medium text-(--fg-primary)">
                Falar no Slack
              </span>
              <span className="block body-xs text-(--fg-tertiary)">
                @{am.email.split("@")[0]}
              </span>
            </span>
            <Icon
              name="arrow_outward"
              size={16}
              className="text-(--fg-tertiary)"
            />
          </a>
        </div>
      </div>
    </AwModal>
  );
}
