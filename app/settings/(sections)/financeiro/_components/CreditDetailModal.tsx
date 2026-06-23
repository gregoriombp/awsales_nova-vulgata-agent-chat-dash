"use client";

import * as React from "react";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { brl, type ForecastDiscount } from "./data";

/**
 * CreditDetailModal — detalhe de um crédito (cupom ou voucher) aplicado à
 * fatura. Aberto ao clicar no código do crédito no detalhamento. Mostra quanto
 * foi concedido, quanto já foi consumido (com barra), o que abate neste ciclo,
 * a validade e a origem — tudo em token, sem card-dentro-de-card.
 */
export function CreditDetailModal({
  credit,
  open,
  onClose,
}: {
  credit: ForecastDiscount | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!credit) return null;

  const remaining = Math.max(credit.grantedValue - credit.consumed, 0);
  const pct =
    credit.grantedValue > 0
      ? Math.min((credit.consumed / credit.grantedValue) * 100, 100)
      : 0;

  return (
    <AwModal open={open} onClose={onClose} title={`${credit.kind} ${credit.label}`}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <AwPill variant="live" dot={false}>
            <Icon name="local_offer" size={12} />
            {credit.kind}
          </AwPill>
          <span className="body-sm text-(--fg-secondary)">{credit.note}</span>
        </div>

        {/* Consumo do crédito */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="body-sm text-(--fg-secondary)">Crédito usado</span>
            <span className="body-sm tabular-nums text-(--fg-secondary)">
              <strong className="font-medium text-(--fg-primary)">
                {brl(credit.consumed)}
              </strong>{" "}
              de {brl(credit.grantedValue)}
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-(--bg-muted)"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-(--accent-success)"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="m-0 body-xs tabular-nums text-(--fg-tertiary)">
            Restam {brl(remaining)} para abater em faturas futuras.
          </p>
        </div>

        {/* Linhas de detalhe */}
        <dl className="m-0 flex flex-col gap-0">
          <DetailRow label="Abatido nesta fatura" value={`−${brl(credit.value)}`} accent />
          <DetailRow label="Total concedido" value={brl(credit.grantedValue)} />
          <DetailRow label="Concedido em" value={credit.grantedAt} />
          <DetailRow label="Válido até" value={credit.expiresAt} />
        </dl>
      </div>
    </AwModal>
  );
}

function DetailRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) py-2.5 last:border-b-0">
      <dt className="body-sm text-(--fg-secondary)">{label}</dt>
      <dd
        className={
          "m-0 body-sm font-medium tabular-nums " +
          (accent ? "text-(--accent-success)" : "text-(--fg-primary)")
        }
      >
        {value}
      </dd>
    </div>
  );
}
