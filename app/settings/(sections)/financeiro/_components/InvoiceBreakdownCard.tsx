"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { brl, type ForecastDiscount } from "./data";
import { CreditDetailModal } from "./CreditDetailModal";

/**
 * Detalhamento da fatura — a versão itemizada do número-herói: plano + consumo
 * variável − descontos, fechando no total. A linha de descontos abre
 * (cupom/voucher). Renderiza só o conteúdo (sem caixa própria) — a moldura e o
 * fundo cinza vêm de fora, via `className`, pra virar a coluna direita do card
 * "Fatura atual" sem card-dentro-de-card. Feature-local: compõe Icon do DS.
 */
export function InvoiceBreakdownCard({
  subscription,
  subscriptionLabel = "Assinatura",
  variable,
  discounts,
  total,
  totalLabel = "Total estimado",
  className,
}: {
  /** Mensalidade do plano. */
  subscription: number;
  /** Rótulo da linha de assinatura (ex.: "Plano Enterprise"). */
  subscriptionLabel?: string;
  /** Consumo variável acumulado no ciclo. */
  variable: number;
  /** Créditos que compõem o desconto (a soma vira a linha "Descontos"). */
  discounts: ForecastDiscount[];
  /** Total da fatura — bate com o número-herói. */
  total: number;
  /** Rótulo da linha de total (ex.: "Total em aberto"). */
  totalLabel?: string;
  /** Moldura/fundo/padding da coluna, aplicados de fora. */
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <h6 className="m-0 mb-2 body-lg font-medium text-(--fg-primary)">
        Detalhamento
      </h6>

      <ul className="m-0 flex list-none flex-col gap-0 p-0">
        <BreakdownRow label={subscriptionLabel}>
          <Money value={subscription} suffix="/mês" />
        </BreakdownRow>

        <BreakdownRow label="Consumo variável">
          <Money value={variable} />
        </BreakdownRow>

        <DiscountRow discounts={discounts} />
      </ul>

      <div className="mt-1 flex items-center justify-between gap-4 border-t border-(--border-subtle) pt-3">
        <span className="body-sm font-semibold text-(--fg-primary)">
          {totalLabel}
        </span>
        <span className="body-sm font-semibold tabular-nums text-(--fg-primary)">
          {brl(total)}
        </span>
      </div>
    </div>
  );
}

/* ---------- linha simples (label + valor) ---------- */

function BreakdownRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-4 py-2">
      <span className="body-sm text-(--fg-secondary)">{label}</span>
      {children}
    </li>
  );
}

function Money({ value, suffix }: { value: number; suffix?: string }) {
  return (
    <span className="body-sm font-medium tabular-nums text-(--fg-primary)">
      {brl(value)}
      {suffix && (
        <span className="font-normal text-(--fg-tertiary)">{suffix}</span>
      )}
    </span>
  );
}

/* ---------- descontos: linha expansível (cupom + voucher) ----------
 * Setinha à esquerda do rótulo (indica que abre); a tag verde acompanha o
 * valor à direita, sinalizando crédito. */

function DiscountRow({ discounts }: { discounts: ForecastDiscount[] }) {
  const [open, setOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<ForecastDiscount | null>(null);
  const panelId = React.useId();
  const total = discounts.reduce((sum, d) => sum + d.value, 0);

  return (
    <li className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-2 text-left"
      >
        <span className="inline-flex items-center gap-1.5 body-sm text-(--fg-secondary)">
          <Icon
            name="expand_more"
            size={18}
            className={cn(
              "-ml-0.5 shrink-0 text-(--fg-tertiary) transition-transform duration-aw-fast",
              open && "rotate-180",
            )}
          />
          Descontos
        </span>
        <span className="inline-flex items-center gap-1.5 text-(--accent-success)">
          <Icon name="local_offer" size={15} className="shrink-0" />
          <span className="body-sm font-medium tabular-nums">−{brl(total)}</span>
        </span>
      </button>

      {/* Reveal por grid-rows (0fr→1fr): anima a altura sem medir em JS. */}
      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-aw-fast ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <ul className="m-0 flex list-none flex-col gap-0 p-0 pb-1 pl-5">
            {discounts.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-4 py-1.5"
              >
                <span className="inline-flex items-baseline gap-1.5 body-xs text-(--fg-tertiary)">
                  <span className="text-(--fg-secondary)">{d.kind}</span>
                  <button
                    type="button"
                    onClick={() => setDetail(d)}
                    className="inline-flex items-center gap-1 rounded-sm font-medium text-(--fg-secondary) underline decoration-(--border-strong) decoration-dotted underline-offset-2 transition-colors hover:text-(--fg-primary) hover:decoration-(--fg-primary)"
                  >
                    {d.label}
                    <Icon name="info" size={12} className="text-(--fg-tertiary)" />
                  </button>
                </span>
                <span className="body-xs tabular-nums text-(--accent-success)">
                  −{brl(d.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <CreditDetailModal
        credit={detail}
        open={detail !== null}
        onClose={() => setDetail(null)}
      />
    </li>
  );
}
