"use client";

import * as React from "react";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import { InvoiceDetailsSheet } from "../_components/InvoiceDetailsSheet";
import {
  brl,
  COUPONS_APPLIED,
  INVOICE_HISTORY,
  PAYMENT_METHODS,
  VOUCHERS,
  type VoucherRow,
} from "../_components/data";

const TODAY = new Date(2026, 4, 19);

function daysUntil(br: string): number {
  const [d, m, y] = br.split("/").map(Number);
  return Math.round(
    (new Date(y, m - 1, d).getTime() - TODAY.getTime()) / 86_400_000,
  );
}

function expiryLabel(br: string): string {
  const days = daysUntil(br);
  if (days < 0) return `expirou em ${br}`;
  if (days === 0) return `vence hoje`;
  if (days <= 30) return `vence em ${days} dia${days !== 1 ? "s" : ""}`;
  return `vence ${br}`;
}

export default function SaldoCreditosPage() {
  const [addOpen, setAddOpen] = React.useState(false);
  const [openInvoiceId, setOpenInvoiceId] = React.useState<string | null>(null);

  const available = React.useMemo(
    () => VOUCHERS.reduce((acc, v) => acc + (v.total - v.consumed), 0),
    [],
  );
  const openInvoice =
    INVOICE_HISTORY.find((r) => r.id === openInvoiceId) ?? null;

  return (
    <div className="flex flex-col gap-10">
      <CreditsHero
        available={available}
        onAddCredits={() => setAddOpen(true)}
      />

      <VoucherGrid />

      <CouponHistory onOpenInvoice={setOpenInvoiceId} />

      <AddCreditsModal open={addOpen} onClose={() => setAddOpen(false)} />
      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenInvoiceId(null)}
      />
    </div>
  );
}

/* ---------- hero ---------- */

function CreditsHero({
  available,
  onAddCredits,
}: {
  available: number;
  onAddCredits: () => void;
}) {
  return (
    <section className="flex flex-col gap-5 border-b border-[var(--border-subtle)] pb-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
            Saldo disponível
          </p>
          <h1 className="m-0 mt-2 display-md tabular-nums text-[var(--fg-primary)]">
            <span className="mr-1 text-[0.45em] font-normal text-[var(--fg-tertiary)]">
              R$
            </span>
            {brl(available).replace(/^R\$\s*/, "")}
          </h1>
          <p className="m-0 mt-2 max-w-[480px] body-xs text-[var(--fg-secondary)]">
            Créditos disponíveis pra esta organização. Cada voucher e cupom
            abate produtos e taxas específicos.
          </p>
        </div>
        <AwButton
          variant="primary"
          iconLeft="add"
          className="shrink-0"
          onClick={onAddCredits}
        >
          Adicionar saldo
        </AwButton>
      </div>
    </section>
  );
}

/* ---------- vouchers as visual card grid ---------- */

function VoucherGrid() {
  return (
    <section>
      <div className="mb-4">
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">Vouchers ativos</h6>
        <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
          Créditos emitidos pela AwSales. O saldo cai conforme você usa o
          serviço aplicável.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {VOUCHERS.map((v) => (
          <VoucherCard key={v.id} row={v} />
        ))}
      </div>
    </section>
  );
}

function VoucherCard({ row }: { row: VoucherRow }) {
  const pct = row.total > 0 ? Math.round((row.consumed / row.total) * 100) : 0;
  const remaining = row.total - row.consumed;
  const variant = row.acceleratedConsumption ? "warning" : "default";

  return (
    <AwCard className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 body-sm font-medium text-[var(--fg-primary)]">
            {row.description}
          </p>
          <p className="m-0 mt-0.5 body-xs text-[var(--fg-tertiary)]">
            {row.applicableTo}
          </p>
        </div>
        {row.status === "Expirado" && (
          <AwPill variant="neutral">Expirado</AwPill>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="display-sm tabular-nums text-[var(--fg-primary)]">
          {brl(remaining)}
        </span>
        <span className="body-xs tabular-nums text-[var(--fg-tertiary)]">
          de {brl(row.total)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <AwProgress value={pct} variant={variant} />
        <div className="flex items-center justify-between gap-2 body-xs text-[var(--fg-tertiary)]">
          <span className="inline-flex items-center gap-1">
            {row.acceleratedConsumption && (
              <Icon
                name="trending_up"
                size={12}
                className="text-[var(--accent-warning)]"
              />
            )}
            <span
              className={
                row.acceleratedConsumption
                  ? "text-[var(--accent-warning)]"
                  : undefined
              }
            >
              {pct}% usado
            </span>
          </span>
          <span>{expiryLabel(row.expiresAt)}</span>
        </div>
      </div>
    </AwCard>
  );
}

/* ---------- coupon history ---------- */

function CouponHistory({
  onOpenInvoice,
}: {
  onOpenInvoice: (invoiceId: string) => void;
}) {
  if (COUPONS_APPLIED.length === 0) {
    return null;
  }
  return (
    <section>
      <div className="mb-4">
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">Cupons usados</h6>
        <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
          Cada cupom vale só na primeira aplicação. O desconto entra na fatura
          correspondente.
        </p>
      </div>
      <ul className="m-0 flex flex-col gap-2 p-0">
        {COUPONS_APPLIED.map((c) => {
          const invoiceExists = INVOICE_HISTORY.some(
            (r) => r.id === c.invoiceId,
          );
          return (
            <li
              key={c.id}
              className="m-0 flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 list-none"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)]">
                <Icon
                  name="local_offer"
                  size={16}
                  className="text-[var(--fg-tertiary)]"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 body-sm font-medium text-[var(--fg-primary)]">
                  {c.description}{" "}
                  <span className="ml-1 aw-eyebrow text-[var(--fg-tertiary)]">
                    {c.code}
                  </span>
                </p>
                <p className="m-0 mt-0.5 body-xs tabular-nums text-[var(--fg-secondary)]">
                  {c.application} ·{" "}
                  {invoiceExists ? (
                    <button
                      type="button"
                      onClick={() => onOpenInvoice(c.invoiceId)}
                      className="font-medium text-[var(--fg-primary)] underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--accent-brand)] hover:no-underline"
                    >
                      {c.invoiceId}
                    </button>
                  ) : (
                    c.invoiceId
                  )}{" "}
                  · {c.appliedAt}
                </p>
              </div>
              <span className="body-sm font-medium tabular-nums text-[var(--accent-success)]">
                −{brl(c.discount)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- add credits modal ---------- */

type AddStep = "method" | "details";
type AddMethod = "pix" | "cartao" | "boleto";

const ADD_STEPS: { id: AddStep; label: string }[] = [
  { id: "method", label: "Método" },
  { id: "details", label: "Detalhes" },
];

const ADD_METHODS: {
  id: AddMethod;
  brand: "pix" | "card" | "boleto";
  title: string;
  desc: string;
}[] = [
  { id: "pix", brand: "pix", title: "Pix", desc: "Crédito na hora" },
  {
    id: "cartao",
    brand: "card",
    title: "Cartão de crédito",
    desc: "Aprovação imediata",
  },
  {
    id: "boleto",
    brand: "boleto",
    title: "Boleto bancário",
    desc: "Compensa em 2 a 3 dias úteis",
  },
];

function AddCreditsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = React.useState<AddStep>("method");
  const [method, setMethod] = React.useState<AddMethod | null>(null);
  const [amount, setAmount] = React.useState("");

  const reset = () => {
    setStep("method");
    setMethod(null);
    setAmount("");
  };
  const close = () => {
    reset();
    onClose();
  };
  const selected = ADD_METHODS.find((m) => m.id === method) ?? null;

  return (
    <AwModal
      open={open}
      onClose={close}
      title="Adicionar saldo"
      footer={
        step === "method" ? (
          <AwButton size="sm" variant="ghost" onClick={close}>
            Cancelar
          </AwButton>
        ) : (
          <>
            <AwButton
              size="sm"
              variant="ghost"
              iconLeft="arrow_back"
              onClick={() => setStep("method")}
            >
              Voltar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="add"
              disabled={!amount.trim()}
              onClick={close}
            >
              Adicionar saldo
            </AwButton>
          </>
        )
      }
    >
      <div className="flex flex-col gap-5">
        <CreditsStepIndicator step={step} />

        {step === "method" ? (
          <MethodStep
            onPick={(m) => {
              setMethod(m);
              setStep("details");
            }}
          />
        ) : (
          selected && (
            <DetailsStep
              method={selected}
              amount={amount}
              onAmount={setAmount}
            />
          )
        )}
      </div>
    </AwModal>
  );
}

function CreditsStepIndicator({ step }: { step: AddStep }) {
  const currentIndex = ADD_STEPS.findIndex((s) => s.id === step);
  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={ADD_STEPS.length}
      aria-label={`Passo ${currentIndex + 1} de ${ADD_STEPS.length}`}
    >
      {ADD_STEPS.map((s, i) => {
        const active = i === currentIndex;
        const done = i < currentIndex;
        return (
          <React.Fragment key={s.id}>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full body-xs font-semibold tabular-nums transition-colors duration-aw-fast " +
                  (done || active
                    ? "bg-[var(--fg-primary)] text-[var(--bg-raised)]"
                    : "bg-[var(--bg-muted)] text-[var(--fg-tertiary)]")
                }
              >
                {i + 1}
              </span>
              <span
                className={
                  "body-xs font-medium " +
                  (active
                    ? "text-[var(--fg-primary)]"
                    : "text-[var(--fg-tertiary)]")
                }
              >
                {s.label}
              </span>
            </span>
            {i < ADD_STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="h-px w-6 shrink-0 bg-[var(--border-default)]"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function MethodStep({ onPick }: { onPick: (m: AddMethod) => void }) {
  return (
    <>
      <p className="m-0 body-xs text-[var(--fg-secondary)]">
        Escolha como adicionar saldo à organização.
      </p>
      <div className="flex flex-col gap-2">
        {ADD_METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick(m.id)}
            className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-raised)] px-4 py-3 text-left transition-colors duration-aw-fast hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)]"
          >
            <AwBrandLogo brand={m.brand} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block body-sm font-medium text-[var(--fg-primary)]">
                {m.title}
              </span>
              <span className="block body-xs text-[var(--fg-tertiary)]">
                {m.desc}
              </span>
            </span>
            <Icon
              name="arrow_forward"
              size={16}
              className="text-[var(--fg-tertiary)]"
            />
          </button>
        ))}
      </div>
    </>
  );
}

function DetailsStep({
  method,
  amount,
  onAmount,
}: {
  method: (typeof ADD_METHODS)[number];
  amount: string;
  onAmount: (v: string) => void;
}) {
  const [card, setCard] = React.useState(
    PAYMENT_METHODS.find((m) => m.isDefault) ?? PAYMENT_METHODS[0],
  );

  return (
    <>
      <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2.5">
        <AwBrandLogo brand={method.brand} size="sm" />
        <span className="body-xs text-[var(--fg-secondary)]">
          Adicionando saldo via{" "}
          <strong className="font-medium text-[var(--fg-primary)]">
            {method.title}
          </strong>
        </span>
      </div>

      <AwField label="Valor a adicionar" htmlFor="credit-amount">
        <AwInput
          id="credit-amount"
          placeholder="R$ 0,00"
          inputMode="numeric"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
          autoFocus
        />
      </AwField>

      {method.id === "cartao" && (
        <AwField label="Cobrar no cartão" htmlFor="credit-card">
          <AwDropdownMenu
            trigger={
              <AwSelect id="credit-card" className="w-full justify-between">
                {card.brand} •••• {card.last4}
              </AwSelect>
            }
            items={PAYMENT_METHODS.map((m) => ({
              id: m.id,
              label: `${m.brand} •••• ${m.last4}`,
              checked: m.id === card.id,
              onSelect: () => setCard(m),
            }))}
          />
        </AwField>
      )}

      {method.id === "pix" && (
        <InfoLine
          icon="qr_code_2"
          text="Você vai receber um QR Code Pix pra concluir o pagamento. O saldo entra na hora."
        />
      )}
      {method.id === "boleto" && (
        <InfoLine
          icon="schedule"
          text="O boleto é gerado na hora e vence em 3 dias úteis. O saldo entra após a compensação."
        />
      )}
    </>
  );
}

function InfoLine({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2.5">
      <Icon
        name={icon}
        size={16}
        className="mt-0.5 shrink-0 text-[var(--fg-tertiary)]"
      />
      <p className="m-0 body-xs text-[var(--fg-secondary)]">{text}</p>
    </div>
  );
}
