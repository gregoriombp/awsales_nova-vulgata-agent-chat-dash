"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
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
  // Créditos (vouchers) abatem o consumo do ciclo — nunca mudam o limite.
  const creditsApplied = React.useMemo(
    () => VOUCHERS.reduce((s, v) => s + v.consumed, 0),
    [],
  );
  const openInvoice =
    INVOICE_HISTORY.find((r) => r.id === openInvoiceId) ?? null;

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
      />

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
}: {
  vouchers: VoucherRow[];
  coupons: CouponRow[];
  onOpenInvoice: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      <header>
        <h6 className="m-0 mb-1 text-(--fg-primary)">Créditos</h6>
        <p className="m-0 max-w-[640px] body-xs text-(--fg-secondary)">
          Dois tipos de crédito abatem o que você consome — nenhum deles
          aumenta o limite do ciclo.
        </p>
      </header>

      <div className="grid grid-cols-2 items-stretch gap-6">
        <VoucherCard vouchers={vouchers} />
        <CouponCard coupons={coupons} onOpenInvoice={onOpenInvoice} />
      </div>
    </section>
  );
}

function VoucherCard({ vouchers }: { vouchers: VoucherRow[] }) {
  const totalAvailable = vouchers.reduce(
    (s, v) => s + (v.total - v.consumed),
    0,
  );

  return (
    <AwCard className="flex h-full flex-col gap-4 p-5!">
      <header className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-(--aw-purple-300) bg-(--aw-purple-150) text-(--aw-purple-700)"
        >
          <Icon name="card_giftcard" size={20} fill={0} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 body-sm font-medium text-(--fg-primary)">
            Voucher
          </p>
          <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
            Concedido pela Aswork — POC, cortesia ou bônus de contrato. Abate
            dos gastos variáveis até a validade.
          </p>
        </div>
      </header>

      {vouchers.length === 0 ? (
        <p className="m-0 body-xs text-(--fg-tertiary)">
          Nenhum voucher ativo no momento.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {vouchers.map((v) => {
            const isExpired = v.status === "Expirado";
            const days = daysUntil(v.expiresAt);
            const expiringSoon = days >= 0 && days <= 30 && !isExpired;
            return (
              <li
                key={v.id}
                className="flex items-start justify-between gap-4 border-t border-(--border-subtle) py-3"
              >
                <div className="min-w-0">
                  <p className="m-0 flex items-center gap-2 body-sm font-medium text-(--fg-primary)">
                    {v.description}
                    {isExpired && (
                      <AwPill variant="neutral" dot={false}>
                        Expirado
                      </AwPill>
                    )}
                  </p>
                  <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                    Válido até {formatExpiry(v.expiresAt)}
                    {expiringSoon && (
                      <span className="text-(--accent-warning)">
                        {" "}
                        · em {days} dia{days !== 1 ? "s" : ""}
                      </span>
                    )}{" "}
                    · {v.applicableTo}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {v.consumed > 0 ? (
                    <p className="m-0 body-sm font-medium tabular-nums text-(--accent-success)">
                      −{brl(v.consumed)}
                    </p>
                  ) : (
                    <p className="m-0 body-sm text-(--fg-tertiary)">
                      Sem uso até agora
                    </p>
                  )}
                  <p className="m-0 mt-0.5 body-xs tabular-nums text-(--fg-tertiary)">
                    {brl(v.total - v.consumed)} disponíveis
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-(--border-subtle) pt-3">
        <span className="body-xs text-(--fg-secondary)">
          Disponível para abater
        </span>
        <span className="body-xs font-medium tabular-nums text-(--fg-primary)">
          {brl(totalAvailable)}
        </span>
      </footer>
    </AwCard>
  );
}

function CouponCard({
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
        (a, b) =>
          parseBR(b.appliedAt).getTime() - parseBR(a.appliedAt).getTime(),
      ),
    [coupons],
  );

  return (
    <AwCard className="flex h-full flex-col gap-4 p-5!">
      <header className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-(--aw-emerald-300) bg-(--aw-emerald-100) text-(--aw-emerald-700)"
        >
          <Icon name="local_offer" size={20} fill={0} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 body-sm font-medium text-(--fg-primary)">Cupom</p>
          <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
            Código promocional aplicado por você — abate uma única vez do
            valor da fatura.
          </p>
        </div>
      </header>

      {sorted.length === 0 ? (
        <p className="m-0 body-xs text-(--fg-tertiary)">
          Nenhum cupom aplicado.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {sorted.map((c) => {
            const invoiceExists = INVOICE_HISTORY.some(
              (r) => r.id === c.invoiceId,
            );
            return (
              <li
                key={c.id}
                className="flex items-start justify-between gap-4 border-t border-(--border-subtle) py-3"
              >
                <div className="min-w-0">
                  <p className="m-0 body-sm font-medium text-(--fg-primary)">
                    {c.code}
                    <span className="font-normal text-(--fg-tertiary)">
                      {" "}
                      · {c.description}
                    </span>
                  </p>
                  <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                    Aplicado em {formatShort(parseBR(c.appliedAt))} · fatura{" "}
                    {invoiceExists ? (
                      <button
                        type="button"
                        onClick={() => onOpenInvoice(c.invoiceId)}
                        className="font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 hover:text-(--fg-primary) hover:no-underline"
                      >
                        {c.invoiceId}
                      </button>
                    ) : (
                      c.invoiceId
                    )}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="m-0 body-sm font-medium tabular-nums text-(--accent-success)">
                    −{brl(c.discount)}
                  </p>
                  <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                    {c.application}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-(--border-subtle) pt-3">
        <span className="body-xs text-(--fg-secondary)">
          Abatido em cupons
        </span>
        <span className="body-xs font-medium tabular-nums text-(--accent-success)">
          −{brl(totalDiscount)}
        </span>
      </footer>
    </AwCard>
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
