"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { Icon } from "@/components/ui/Icon";
import {
  brl,
  COUPONS_APPLIED,
  CREDITS_KPIS,
  VOUCHERS,
  type CouponRow,
  type VoucherRow,
} from "../_components/data";

export default function SaldoCreditosPage() {
  const accelerated = VOUCHERS.find((v) => v.acceleratedConsumption);

  return (
    <div className="flex flex-col gap-10">
      <CreditsHero />

      {accelerated && (
        <AcceleratedBanner
          name={accelerated.description}
          expiresAt={accelerated.expiresAt}
        />
      )}

      <VouchersList />
      <CouponsAppliedList />
      <ApplyCouponInline />
    </div>
  );
}

/* ---------- hero ---------- */

function CreditsHero() {
  return (
    <section>
      <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
        Saldo disponível
      </p>
      <h1 className="m-0 mt-2 display-md tabular-nums text-[var(--fg-primary)]">
        {brl(CREDITS_KPIS.availableDiscount)}
      </h1>
      <p className="m-0 mt-2 max-w-[520px] body-xs text-[var(--fg-secondary)]">
        Vouchers e cupons não consumidos. A aplicação varia por item — alguns
        valem para disparos, tokens ou taxas específicas.
      </p>
    </section>
  );
}

/* ---------- accelerated banner ---------- */

function AcceleratedBanner({
  name,
  expiresAt,
}: {
  name: string;
  expiresAt: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3">
      <Icon
        name="warning"
        size={18}
        className="shrink-0 text-[var(--accent-warning)]"
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 body-xs font-medium text-[var(--fg-primary)]">
          {name} está sendo consumido 2,3× acima do previsto
        </p>
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
          No ritmo atual, pode expirar antes da data de término ({expiresAt}).
        </p>
      </div>
    </div>
  );
}

/* ---------- vouchers timeline ---------- */

function VouchersList() {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h6 className="m-0 mb-1 text-[var(--fg-primary)]">Vouchers</h6>
          <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
            Créditos emitidos pra esta organização. O consumo é em tempo real.
          </p>
        </div>
      </div>
      <AwCard className="!p-0">
        <ul className="m-0 divide-y divide-[var(--border-subtle)] p-0">
          {VOUCHERS.map((v) => (
            <VoucherRowItem key={v.id} row={v} />
          ))}
        </ul>
      </AwCard>
    </section>
  );
}

function VoucherRowItem({ row }: { row: VoucherRow }) {
  const pct = row.total > 0 ? Math.round((row.consumed / row.total) * 100) : 0;
  const remaining = row.total - row.consumed;
  const progressVariant = row.acceleratedConsumption ? "warning" : "default";

  return (
    <li className="m-0 p-0">
      <div className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AwPill variant={row.status === "Ativo" ? "live" : "neutral"}>
              {row.status}
            </AwPill>
            <span className="body-sm font-medium text-[var(--fg-primary)]">
              {row.description}
            </span>
          </div>
          <p className="m-0 mt-1 body-xs text-[var(--fg-tertiary)]">
            Aplica em: {row.applicableTo}
          </p>
          {row.acceleratedConsumption && (
            <p className="m-0 mt-1.5 inline-flex items-center gap-1.5 body-xs text-[var(--accent-warning)]">
              <Icon name="warning" size={13} />
              Consumo 2,3× acima do previsto
            </p>
          )}
          <div className="mt-3">
            <AwProgress
              value={pct}
              max={100}
              variant={progressVariant}
              valueLabel={`${brl(row.consumed)} de ${brl(row.total)} · ${pct}%`}
            />
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-3 md:flex-col md:items-end md:gap-2 md:pt-1 md:text-right">
          <span className="body-xs text-[var(--fg-tertiary)]">
            Vigente até{" "}
            <span className="text-[var(--fg-primary)]">{row.expiresAt}</span>
          </span>
          <span className="body-sm font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(remaining)} restantes
          </span>
        </div>
      </div>
    </li>
  );
}

/* ---------- coupons applied (compact) ---------- */

function CouponsAppliedList() {
  if (COUPONS_APPLIED.length === 0) return null;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
            Cupons aplicados
          </h6>
          <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
            Códigos de desconto redimidos. O valor aparece na fatura referente.
          </p>
        </div>
      </div>
      <AwCard className="!p-0">
        <ul className="m-0 divide-y divide-[var(--border-subtle)] p-0">
          {COUPONS_APPLIED.map((c) => (
            <CouponRowItem key={c.id} row={c} />
          ))}
        </ul>
      </AwCard>
    </section>
  );
}

function CouponRowItem({ row }: { row: CouponRow }) {
  return (
    <li className="m-0 p-0">
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="body-sm font-medium text-[var(--fg-primary)]">
              {row.description}
            </span>
            <span className="rounded-[var(--radius-sm)] bg-[var(--bg-muted)] px-1.5 py-0.5 aw-eyebrow text-[var(--fg-tertiary)]">
              {row.code}
            </span>
          </div>
          <p className="m-0 mt-0.5 body-xs text-[var(--fg-secondary)]">
            {row.application} · aplicado em {row.invoiceId} ({row.appliedAt})
          </p>
        </div>
        <span className="body-sm font-medium tabular-nums text-[var(--accent-success)]">
          −{brl(row.discount)}
        </span>
      </div>
    </li>
  );
}

/* ---------- inline coupon apply ---------- */

type Feedback =
  | { kind: "idle" }
  | { kind: "success"; code: string }
  | { kind: "error"; reason: string };

const ERRORS = [
  "Código não encontrado.",
  "Código expirado.",
  "Limite de uso já atingido.",
  "Moeda incompatível com sua conta.",
];

function ApplyCouponInline() {
  const [code, setCode] = React.useState("");
  const [feedback, setFeedback] = React.useState<Feedback>({ kind: "idle" });
  const [submitting, setSubmitting] = React.useState(false);

  const apply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setTimeout(() => {
      if (Math.random() < 0.5) {
        setFeedback({ kind: "success", code: trimmed.toUpperCase() });
        setCode("");
      } else {
        setFeedback({
          kind: "error",
          reason: ERRORS[Math.floor(Math.random() * ERRORS.length)],
        });
      }
      setSubmitting(false);
    }, 350);
  };

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <span className="body-xs font-medium text-[var(--fg-primary)]">
          Aplicar cupom
        </span>
        <div className="min-w-[180px] flex-1 sm:max-w-[280px]">
          <AwInput
            placeholder="Ex.: BF2026"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") apply();
            }}
            aria-label="Código de cupom"
          />
        </div>
        <AwButton
          size="md"
          variant="secondary"
          loading={submitting}
          onClick={apply}
          disabled={!code.trim()}
        >
          Aplicar
        </AwButton>
      </div>
      {feedback.kind === "success" && (
        <p
          className="m-0 mt-2 inline-flex items-center gap-1.5 body-xs text-[var(--accent-success)]"
          role="status"
        >
          <Icon name="check_circle" size={14} fill={1} />
          Cupom <strong>{feedback.code}</strong> aplicado. O desconto vai
          aparecer na sua próxima fatura.
        </p>
      )}
      {feedback.kind === "error" && (
        <p
          className="m-0 mt-2 inline-flex items-center gap-1.5 body-xs text-[var(--accent-danger)]"
          role="alert"
        >
          <Icon name="error" size={14} fill={1} />
          {feedback.reason}
        </p>
      )}
    </section>
  );
}
