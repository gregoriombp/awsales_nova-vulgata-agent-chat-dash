"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { brl, invoiceStatusLabel } from "../../../financeiro/_components/data";
import { MoneyHeading } from "../../../financeiro/_components/MoneyHeading";
import { statusVariant } from "../../../financeiro/_components/InvoiceDetailsSheet";
import { ConsumoProvider, useConsumo } from "../../_components/ConsumoContext";
import { SegmentedFilter } from "../../_components/controls";
import { DIMENSIONS } from "../../_components/explorer-model";
import { InfoTip } from "../../_components/KpiCards";
import { CyclePicker } from "../../_components/CyclePicker";
import { CycleStatement } from "../../_components/CycleStatement";
import { CycleInvoices } from "../../_components/CycleInvoices";
import { CycleFeeBreakdown } from "../../_components/CycleFeeBreakdown";
import { CyclesCompare } from "../../_components/CyclesCompare";
import { CycleExportMenu } from "../../_components/CycleExportMenu";
import {
  ComposicaoWidget,
  ConsumoChartWidget,
  UsadoCobradoWidget,
} from "../../_components/ChartWidgets";
import {
  cycleById,
  cycleRange,
  cycleVariableTotal,
  cycleWorstStatus,
  DEFAULT_CYCLE_ID,
  type BillingCycle,
} from "../../_components/cycles-data";

/* ----------------------------------------------------------------------------
 * Aba "Por ciclos" — o mês de cobrança como unidade (pedido do Greg,
 * cmt-4185be9f + Notion). O filtro temporal aqui é SÓ o ciclo (mês): extrato
 * estilo fatura Google com saldo remanescente, faturas do ciclo (fixa ×
 * variável), quebra por fee, o uso dentro do mês e a comparação entre meses.
 * `?ciclo=` mantém o recorte estável a refresh/compartilhamento.
 * ------------------------------------------------------------------------- */

export default function PorCiclosPage() {
  return (
    <React.Suspense fallback={null}>
      <CiclosBody />
    </React.Suspense>
  );
}

function CiclosBody() {
  const sp = useSearchParams();
  const router = useRouter();
  const [cycleId, setCycleId] = React.useState<string>(
    () => sp.get("ciclo") ?? DEFAULT_CYCLE_ID,
  );
  const cycle = cycleById(cycleId);

  const selectCycle = React.useCallback(
    (id: string) => {
      setCycleId(id);
      router.replace(`/settings/consumo-e-custos/ciclos?ciclo=${encodeURIComponent(id)}`, {
        scroll: false,
      });
    },
    [router],
  );

  const initialSelection = React.useMemo(() => {
    const { from, to } = cycleRange(cycle);
    return { kind: "custom" as const, from, to };
  }, [cycle]);

  return (
    <ConsumoProvider surface="cycle" initialSelection={initialSelection}>
      <CyclePeriodSync cycle={cycle} />
      <div className="flex w-full flex-col gap-10">
        {/* Controles do ciclo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CyclePicker value={cycle} onChange={selectCycle} />
          <CycleExportMenu cycle={cycle} />
        </div>

        <CycleHero cycle={cycle} />

        <CycleStatement cycle={cycle} />

        <CycleInvoices cycle={cycle} />

        <CycleFeeBreakdown cycle={cycle} />

        <CycleUsage cycle={cycle} />

        <CyclesCompare current={cycle} onSelectCycle={selectCycle} />
      </div>
    </ConsumoProvider>
  );
}

/** Mantém o período do provider colado ao ciclo escolhido. */
function CyclePeriodSync({ cycle }: { cycle: BillingCycle }) {
  const { setSelection } = useConsumo();
  React.useEffect(() => {
    const { from, to } = cycleRange(cycle);
    setSelection({ kind: "custom", from, to });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle.id]);
  return null;
}

/* ---------- hero do ciclo ---------- */

function CycleHero({ cycle }: { cycle: BillingCycle }) {
  // Total que ESTE ciclo adicionou à conta: fixo + variável − créditos ± ajustes.
  // O saldo anterior fica no extrato — aqui é o retrato do mês.
  const total =
    cycle.fixed + cycleVariableTotal(cycle) - cycle.credits + cycle.adjustments;
  const status = cycleWorstStatus(cycle);

  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center gap-1.5 body-sm text-(--fg-secondary)">
          Total do ciclo
          <InfoTip text="Plano + uso variável faturados pela Aswork neste ciclo, após créditos e ajustes. Não inclui o que a Meta cobra direto nem o saldo de meses anteriores — esses ficam no extrato." />
        </span>
        <MoneyHeading value={total} size="md" as="p" />
        <span className="inline-flex flex-wrap items-center gap-2 body-xs text-(--fg-tertiary)">
          {cycle.open ? (
            <AwPill variant="info">Em andamento</AwPill>
          ) : status ? (
            <AwPill variant={statusVariant(status)}>{invoiceStatusLabel(status)}</AwPill>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Icon name="schedule" size={14} />
            {cycle.startsAt} <Icon name="arrow_right_alt" size={14} /> {cycle.endsAt}
          </span>
          {cycle.open && <span>· valores parciais até o fechamento</span>}
        </span>
      </div>

      {cycle.carryIn > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--bg-raised) text-(--fg-secondary)">
            <Icon name="south_west" size={18} />
          </span>
          <div className="flex flex-col">
            <span className="body-xs text-(--fg-tertiary)">Veio do ciclo anterior</span>
            <span className="body-sm font-semibold tabular-nums text-(--fg-primary)">
              {brl(cycle.carryIn)}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- uso dentro do ciclo (gráficos da Visão geral, no recorte) ---------- */

function CycleUsage({ cycle }: { cycle: BillingCycle }) {
  const { grouping, setGrouping } = useConsumo();
  return (
    <section aria-label="Uso dentro do ciclo" className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h4 className="m-0 inline-flex items-center gap-1.5 text-(--fg-primary)">
            Uso dentro do ciclo
            <InfoTip text="Aqui a base é a data de USO: o consumo que aconteceu dentro do mês, incluindo o que a Meta cobra direto. A fatura segue o extrato acima — por isso os números não são iguais." />
          </h4>
          <p className="m-0 mt-1 body-xs text-(--fg-tertiary)">
            {cycle.startsAt.slice(0, 10)} → {cycle.endsAt.slice(0, 10)} · os mesmos
            gráficos da Visão geral, recortados ao mês.
          </p>
        </div>
        <SegmentedFilter
          ariaLabel="Dividir por"
          value={grouping}
          onChange={setGrouping}
          options={DIMENSIONS.map((d) => ({
            value: d.id,
            label: d.label,
            leading: (
              <Icon
                name={d.icon}
                size={16}
                fill={d.id === grouping ? 1 : 0}
                className="text-(--fg-tertiary)"
              />
            ),
          }))}
        />
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="min-w-0 lg:col-span-2">
          <ConsumoChartWidget />
        </div>
        <div className="min-w-0">
          <ComposicaoWidget />
        </div>
        <div className="min-w-0">
          <UsadoCobradoWidget />
        </div>
      </div>
    </section>
  );
}
