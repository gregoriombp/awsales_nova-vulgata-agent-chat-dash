"use client";

import { AwConsumptionBar } from "@/components/ui/AwConsumptionBar";
import { ANNUAL_COMMITMENT, brl } from "../../financeiro/_components/data";
import { InfoTip } from "./KpiCards";
import { WidgetShell, type WidgetChrome } from "./WidgetBoard";

/* ----------------------------------------------------------------------------
 * "Compromisso anual" — clientes com acordo personalizado de uso (ex.:
 * R$ 300 mil/ano) acompanham aqui quanto do combinado já foi honrado
 * (cmt-63540355). Só renderiza pra quem TEM o acordo; sem acordo, o widget
 * simplesmente não existe no board (protótipo — os devs ligam por conta).
 * ------------------------------------------------------------------------- */

export function CommitmentWidget({ dragHandle, menu }: WidgetChrome) {
  if (!ANNUAL_COMMITMENT.active) return null;

  const { label, totalBRL, honoredBRL, startedAt, endsAt } = ANNUAL_COMMITMENT;
  const pct = Math.min(100, (honoredBRL / totalBRL) * 100);
  const remaining = Math.max(0, totalBRL - honoredBRL);

  return (
    <WidgetShell
      title={
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span className="truncate">Compromisso anual</span>
          <InfoTip text="Uso negociado no seu acordo personalizado. A barra mostra quanto do combinado já foi consumido no ano — não é um limite: passar do valor só muda a condição comercial." />
        </span>
      }
      icon="handshake"
      description={`${label} · ${startedAt} → ${endsAt}`}
      dragHandle={dragHandle}
      menu={menu}
    >
      <div className="flex h-full flex-col justify-center gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-(length:--h3-size) font-semibold leading-none tracking-heading-tighter tabular-nums text-(--fg-primary)">
            {brl(honoredBRL)}
          </span>
          <span className="body-sm text-(--fg-tertiary)">
            de <strong className="font-medium text-(--fg-secondary)">{brl(totalBRL)}</strong>
          </span>
        </div>

        <AwConsumptionBar
          gross={honoredBRL}
          limit={totalBRL}
          ariaLabel="Quanto do acordo anual já foi honrado"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="body-xs text-(--fg-secondary)">
            <strong className="font-semibold tabular-nums">{pct.toFixed(0)}%</strong> do
            acordo honrado
          </span>
          <span className="body-xs text-(--fg-tertiary)">
            Restam {brl(remaining)} até {endsAt.slice(3)}
          </span>
        </div>
      </div>
    </WidgetShell>
  );
}
