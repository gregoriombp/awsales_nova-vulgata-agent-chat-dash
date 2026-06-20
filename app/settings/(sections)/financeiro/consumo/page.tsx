"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwTable } from "@/components/ui/AwTable";
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
import {
  brl,
  COUPONS_APPLIED,
  INVOICE_HISTORY,
  OVERVIEW_KPIS,
  VARIABLE_SPENDING_LIMIT,
  voucherStatusVariant,
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
  const [openVoucherId, setOpenVoucherId] = React.useState<string | null>(null);
  const [limit] = React.useState(VARIABLE_SPENDING_LIMIT);
  const [requestOpen, setRequestOpen] = React.useState(false);

  const accumulated = OVERVIEW_KPIS.accumulated;
  // Créditos abatidos NESTE ciclo. O lifetime de cada voucher (quanto já foi
  // usado no total) vive na tabela de vouchers abaixo.
  const creditsApplied = 250;
  const openInvoice =
    INVOICE_HISTORY.find((r) => r.id === openInvoiceId) ?? null;
  const openVoucher = VOUCHERS.find((v) => v.id === openVoucherId) ?? null;

  return (
    <div className="flex flex-col gap-14">
      <ConsumptionHero
        accumulated={accumulated}
        limit={limit}
        creditsApplied={creditsApplied}
        onRequestIncrease={() => setRequestOpen(true)}
      />

      <CreditsSection
        vouchers={VOUCHERS}
        coupons={COUPONS_APPLIED}
        onOpenInvoice={setOpenInvoiceId}
        onOpenVoucher={setOpenVoucherId}
      />

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
  creditsApplied,
  onRequestIncrease,
}: {
  accumulated: number;
  limit: number;
  creditsApplied: number;
  onRequestIncrease: () => void;
}) {
  const net = Math.max(accumulated - creditsApplied, 0);
  const pct = limit > 0 ? Math.min(Math.round((net / limit) * 100), 999) : 0;
  const remaining = Math.max(limit - net, 0);
  const overLimit = net > limit;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
          Consumo variável · ciclo atual
        </p>
        <MoneyHeading value={accumulated} size="sm" as="h1" />
        {creditsApplied > 0 && (
          <p className="m-0 body-xs tabular-nums text-(--fg-secondary)">
            <span className="font-medium text-(--accent-success)">
              −{brl(creditsApplied)}
            </span>{" "}
            abatidos por créditos ·{" "}
            <strong className="font-medium text-(--fg-primary)">
              {brl(net)}
            </strong>{" "}
            a cobrar
          </p>
        )}
        <p className="m-0 max-w-[600px] body-xs text-(--fg-secondary)">
          Seu limite é de{" "}
          <strong className="font-medium tabular-nums text-(--fg-primary)">
            {brl(limit)}
          </strong>{" "}
          por ciclo. Vouchers e cupons abatem o consumo antes da cobrança —
          não mudam o limite. Ao bater no teto, o valor é cobrado
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
          gross={accumulated}
          credits={creditsApplied}
          limit={limit}
        />
        <div className="flex items-center justify-between gap-3 body-xs tabular-nums">
          <span className="text-(--fg-secondary)">
            {pct}% do limite utilizado
          </span>
          <span
            className={
              overLimit ? "text-(--accent-danger)" : "text-(--fg-tertiary)"
            }
          >
            {overLimit
              ? `Limite atingido — cobrança automática em curso`
              : `Restam ${brl(remaining)} antes da cobrança`}
          </span>
        </div>
      </div>
    </section>
  );
}

/* -----------------------------------------------------------------
 * Consumption bar — limite fixo; créditos abatem o consumo
 * - Trecho sólido: valor líquido a cobrar
 * - Trecho claro: parte do consumo já abatida por créditos
 * - Agulha: limite do ciclo (só aparece se o consumo passa do limite)
 * ----------------------------------------------------------------- */

function ConsumptionBar({
  gross,
  credits,
  limit,
}: {
  gross: number;
  credits: number;
  limit: number;
}) {
  const net = Math.max(gross - credits, 0);
  const scaleMax = Math.max(limit, gross);
  const netPct = scaleMax > 0 ? (net / scaleMax) * 100 : 0;
  const grossPct = scaleMax > 0 ? (gross / scaleMax) * 100 : 0;
  const limitPct = scaleMax > 0 ? (limit / scaleMax) * 100 : 0;
  const overLimit = net > limit;

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative h-2.5 w-full" aria-label="Consumo do ciclo">
            <div className="absolute inset-0 rounded-full bg-(--bg-muted)" />

            {/* consumo bruto — a faixa entre líquido e bruto é o abatido */}
            <div
              className={
                "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out " +
                (grossPct >= 100 ? "rounded-full" : "rounded-l-full")
              }
              style={{
                width: `${Math.min(grossPct, 100)}%`,
                background: overLimit
                  ? "color-mix(in srgb, var(--aw-red-600) 35%, transparent)"
                  : "color-mix(in srgb, var(--aw-emerald-600) 35%, transparent)",
              }}
            />

            {/* valor líquido a cobrar */}
            <div
              className={
                "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out " +
                (netPct >= 100 ? "rounded-full" : "rounded-l-full") +
                (overLimit ? " bg-(--aw-red-600)" : " bg-(--aw-emerald-600)")
              }
              style={{ width: `${Math.min(netPct, 100)}%` }}
            />

            {limitPct > 0 && limitPct < 100 && (
              <ConsumptionNeedle
                leftPct={limitPct}
                color="var(--fg-primary)"
                label={`Limite do ciclo · ${brl(limit)}`}
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
              <span className="text-(--fg-secondary)">Consumo bruto</span>
              <span className="tabular-nums">{brl(gross)}</span>
            </div>
            {credits > 0 && (
              <div className="flex items-center justify-between gap-6">
                <span className="text-(--fg-secondary)">
                  Abatido por créditos
                </span>
                <span className="tabular-nums text-(--accent-success)">
                  −{brl(credits)}
                </span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between gap-6 border-t border-(--border-subtle) pt-1.5 font-medium">
              <span>A cobrar</span>
              <span className="tabular-nums">{brl(net)}</span>
            </div>
            <div className="flex items-center justify-between gap-6 text-(--fg-secondary)">
              <span>Limite do ciclo</span>
              <span className="tabular-nums">{brl(limit)}</span>
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
 * Créditos — voucher e cupom lado a lado, cada um com identidade
 * própria. Ambos abatem o que será cobrado; nenhum aumenta o limite.
 * O gráfico de consumo mora na Visão geral — aqui o foco é entender
 * de onde vem cada abatimento.
 * ----------------------------------------------------------------- */

function CreditsSection({
  vouchers,
  coupons,
  onOpenInvoice,
  onOpenVoucher,
}: {
  vouchers: VoucherRow[];
  coupons: CouponRow[];
  onOpenInvoice: (id: string) => void;
  onOpenVoucher: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-12">
      <VouchersBlock vouchers={vouchers} onOpenVoucher={onOpenVoucher} />
      <CouponsBlock coupons={coupons} onOpenInvoice={onOpenInvoice} />
    </div>
  );
}

function CreditInfoTooltip({ kind }: { kind: "voucher" | "coupon" }) {
  const text =
    kind === "voucher"
      ? "Voucher é um crédito concedido pela Aswork (POC, cortesia, bônus de contrato). Abate dos seus gastos variáveis até a validade — não muda o limite."
      : "Cupom é um código promocional aplicado por você. Abate uma única vez do valor do plano fixo.";
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
    (v) => v.status === "Usado" || v.status === "Parcialmente usado",
  );

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h6 className="m-0 flex items-center gap-2 text-(--fg-primary)">
            Vouchers
            <CreditInfoTooltip kind="voucher" />
          </h6>
          <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
            Abatem dos seus gastos variáveis até a validade.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AwButton size="sm" variant="ghost" iconLeft="account_balance_wallet">
            Adicionar saldo
          </AwButton>
          <AwButton size="sm" variant="secondary" iconLeft="redeem">
            Adicionar voucher
          </AwButton>
        </div>
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

function VoucherRowItem({
  v,
  onOpenVoucher,
}: {
  v: VoucherRow;
  onOpenVoucher: (id: string) => void;
}) {
  const pct = v.total > 0 ? (v.consumed / v.total) * 100 : 0;
  const days = daysUntil(v.expiresAt);
  const expiringSoon = days >= 0 && days <= 15 && v.status === "Ativo";
  const muted = v.status === "Usado" || v.status === "Parcialmente usado";
  const validity =
    v.status === "Pendente" && v.effectiveAt
      ? `Ativa em ${formatExpiry(v.effectiveAt)}`
      : `Válido até ${formatExpiry(v.expiresAt)}`;

  return (
    <li className="flex items-center gap-4 border-t border-(--border-subtle) py-4">
      {/* ícone grayscale com stroke — sem cor (pedido do review) */}
      <span
        aria-hidden="true"
        className={
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-muted) text-(--fg-tertiary) " +
          (muted ? "opacity-70" : "")
        }
      >
        <Icon name="redeem" size={22} fill={0} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* título + status bem à direita */}
        <div className="flex items-center justify-between gap-3">
          <span className="truncate body-sm font-medium text-(--fg-primary)">
            {v.description}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {v.acceleratedConsumption && (
              <span className="inline-flex items-center gap-1 body-xs text-(--accent-warning)">
                <Icon name="trending_up" size={13} />
                Consumo acelerado
              </span>
            )}
            <AwPill variant={voucherStatusVariant(v.status)}>{v.status}</AwPill>
          </span>
        </div>

        {/* validade embaixo do chip de status */}
        <span className="body-xs text-(--fg-tertiary)">
          {validity}
          {expiringSoon && (
            <span className="text-(--accent-warning)">
              {" "}
              · em {days} dia{days !== 1 ? "s" : ""}
            </span>
          )}{" "}
          · {v.applicableTo}
        </span>

        {/* barra verde + duas linhas (usado / total) */}
        <div className="mt-0.5 flex items-center gap-3">
          <AwProgress
            value={pct}
            max={100}
            variant="success"
            className="flex-1"
          />
          <span className="shrink-0 text-right leading-tight">
            <span className="block body-sm font-medium tabular-nums text-(--fg-primary)">
              {brl(v.consumed)}
            </span>
            <span className="block body-xs tabular-nums text-(--fg-tertiary)">
              de {brl(v.total)}
            </span>
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenVoucher(v.id)}
        className="group flex shrink-0 items-center gap-1 self-start body-xs font-medium text-(--fg-secondary) transition-colors hover:text-(--fg-primary)"
      >
        Ver detalhes
        <Icon
          name="chevron_right"
          size={15}
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
                ? `Ativa em ${formatExpiry(voucher.effectiveAt)}`
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
          O seu account manager ajusta os limites. Mande um recado para o{" "}
          {amFirstName} pelo canal que preferir — ele avalia e devolve a próxima
          faixa.
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
