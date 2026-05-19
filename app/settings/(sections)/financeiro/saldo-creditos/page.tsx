"use client";

import * as React from "react";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import {
  brl,
  COUPONS_APPLIED,
  VOUCHERS,
  type CouponRow,
  type VoucherRow,
} from "../_components/data";

// O mundo dos fixtures está ancorado em maio/2026 — usamos esta data como
// "hoje" para os contadores de vencimento em vez do relógio real.
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
  if (days === 0) return `vence hoje (${br})`;
  return `vence ${br} · ${days} dia${days !== 1 ? "s" : ""}`;
}

export default function SaldoCreditosPage() {
  const [addOpen, setAddOpen] = React.useState(false);

  // Saldo disponível = soma do que ainda resta em cada voucher ativo.
  const available = React.useMemo(
    () => VOUCHERS.reduce((acc, v) => acc + (v.total - v.consumed), 0),
    [],
  );
  const accelerated = VOUCHERS.find((v) => v.acceleratedConsumption);

  return (
    <div className="flex flex-col gap-10">
      <CreditsHero
        available={available}
        onAddCredits={() => setAddOpen(true)}
      />

      {accelerated && (
        <AwAlert variant="warning">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <strong className="aw-alert__title">
                {accelerated.description} está esgotando rápido
              </strong>
              <p className="m-0 body-xs text-[var(--fg-secondary)]">
                Consumido 2,3× acima do previsto — pode acabar antes de{" "}
                {accelerated.expiresAt} ({daysUntil(accelerated.expiresAt)}{" "}
                dias restantes).
              </p>
            </div>
            <AwButton size="sm" variant="ghost" iconRight="arrow_forward">
              Revisar consumo
            </AwButton>
          </div>
        </AwAlert>
      )}

      <VouchersTable />

      <section className="grid grid-cols-2 items-start gap-6">
        <CouponsApplied />
        <ApplyCoupon />
      </section>

      <AddCreditsModal open={addOpen} onClose={() => setAddOpen(false)} />
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
    <section className="flex items-start justify-between gap-6">
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
          Créditos disponíveis para esta organização. Cada voucher e cupom
          abate produtos e taxas específicos.
        </p>
      </div>
      <AwButton
        variant="primary"
        iconLeft="add"
        className="shrink-0"
        onClick={onAddCredits}
      >
        Adicionar créditos
      </AwButton>
    </section>
  );
}

/* ---------- vouchers table ---------- */

function VouchersTable() {
  return (
    <section>
      <div className="mb-4">
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">Vouchers</h6>
        <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
          Créditos emitidos pela AwSales para a organização. O saldo de cada
          um cai conforme o uso.
        </p>
      </div>
      <AwCard className="!p-0">
        <AwTable>
          <thead>
            <tr>
              <th>Voucher</th>
              <th>Status</th>
              <th className="w-[260px]">Consumo</th>
              <th className="text-right">Saldo restante</th>
            </tr>
          </thead>
          <tbody>
            {VOUCHERS.map((v) => (
              <VoucherRowItem key={v.id} row={v} />
            ))}
          </tbody>
        </AwTable>
      </AwCard>
    </section>
  );
}

function VoucherRowItem({ row }: { row: VoucherRow }) {
  const pct = row.total > 0 ? Math.round((row.consumed / row.total) * 100) : 0;
  const remaining = row.total - row.consumed;
  const variant = row.acceleratedConsumption ? "warning" : "default";

  return (
    <tr>
      <td>
        <div className="flex flex-col gap-0.5">
          <span className="body-sm font-medium text-[var(--fg-primary)]">
            {row.description}
          </span>
          <span className="body-xs text-[var(--fg-tertiary)]">
            Aplica em {row.applicableTo} · {expiryLabel(row.expiresAt)}
          </span>
        </div>
      </td>
      <td>
        <AwPill variant={row.status === "Ativo" ? "live" : "neutral"}>
          {row.status}
        </AwPill>
      </td>
      <td>
        <AwProgress
          value={pct}
          variant={variant}
          label={`${brl(row.consumed)} usado`}
          valueLabel={`${pct}%`}
        />
        {row.acceleratedConsumption && (
          <span className="mt-1 inline-flex items-center gap-1 body-xs text-[var(--accent-warning)]">
            <Icon name="trending_up" size={13} />
            2,3× acima do previsto
          </span>
        )}
      </td>
      <td className="text-right">
        <div className="flex flex-col">
          <span className="body-sm font-medium tabular-nums text-[var(--fg-primary)]">
            {brl(remaining)}
          </span>
          <span className="body-xs tabular-nums text-[var(--fg-tertiary)]">
            de {brl(row.total)}
          </span>
        </div>
      </td>
    </tr>
  );
}

/* ---------- coupons applied (card list) ---------- */

function CouponsApplied() {
  return (
    <div>
      <div className="mb-3">
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">Cupons aplicados</h6>
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
          Códigos já resgatados — o desconto aparece na fatura correspondente.
        </p>
      </div>
      <AwCard className="!p-0">
        <ul className="m-0 list-none divide-y divide-[var(--border-subtle)] p-0">
          {COUPONS_APPLIED.map((c) => (
            <CouponRowItem key={c.id} row={c} />
          ))}
        </ul>
      </AwCard>
    </div>
  );
}

function CouponRowItem({ row }: { row: CouponRow }) {
  return (
    <li className="m-0 grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4">
      <span className="flex h-7 items-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-2 aw-eyebrow text-[var(--fg-secondary)]">
        {row.code}
      </span>
      <div className="min-w-0">
        <p className="m-0 body-sm font-medium text-[var(--fg-primary)]">
          {row.description}
        </p>
        <p className="m-0 mt-0.5 body-xs tabular-nums text-[var(--fg-secondary)]">
          {row.application} · {row.invoiceId} ({row.appliedAt})
        </p>
      </div>
      <span className="body-sm font-medium tabular-nums text-[var(--accent-success)]">
        −{brl(row.discount)}
      </span>
    </li>
  );
}

/* ---------- apply coupon ---------- */

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

function ApplyCoupon() {
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
    <div>
      <div className="mb-3">
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">Aplicar cupom</h6>
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
          Cole o código para resgatar o desconto na sua próxima fatura.
        </p>
      </div>
      <AwCard className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <AwInput
            className="flex-1"
            placeholder="Ex.: BF2026"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") apply();
            }}
            aria-label="Código de cupom"
          />
          <AwButton
            size="md"
            variant="primary"
            loading={submitting}
            onClick={apply}
            disabled={!code.trim()}
          >
            Aplicar
          </AwButton>
        </div>
        {feedback.kind === "success" && (
          <p
            className="m-0 inline-flex items-center gap-1.5 body-xs text-[var(--accent-success)]"
            role="status"
          >
            <Icon name="check_circle" size={14} fill={1} />
            Cupom <strong>{feedback.code}</strong> aplicado. O desconto vai
            aparecer na sua próxima fatura.
          </p>
        )}
        {feedback.kind === "error" && (
          <p
            className="m-0 inline-flex items-center gap-1.5 body-xs text-[var(--accent-danger)]"
            role="alert"
          >
            <Icon name="error" size={14} fill={1} />
            {feedback.reason}
          </p>
        )}
        <p className="m-0 body-xs text-[var(--fg-tertiary)]">
          Cada cupom vale só na primeira aplicação. Cupons já consumidos
          aparecem ao lado.
        </p>
      </AwCard>
    </div>
  );
}

/* ---------- add credits modal ---------- */

function AddCreditsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Adicionar créditos"
      footer={
        <div className="flex justify-end gap-2">
          <AwButton variant="secondary" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton variant="primary" onClick={onClose}>
            Falar com a AwSales
          </AwButton>
        </div>
      }
    >
      <p className="m-0 body-sm text-[var(--fg-secondary)]">
        Vouchers são emitidos pela AwSales para a sua organização. Para
        liberar um novo crédito, fale com o seu gerente de conta.
      </p>
      <p className="m-0 mt-3 body-sm text-[var(--fg-secondary)]">
        Tem um código de cupom? Resgate-o direto na seção{" "}
        <strong className="font-medium text-[var(--fg-primary)]">
          Aplicar cupom
        </strong>
        , logo abaixo.
      </p>
    </AwModal>
  );
}
