"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import { ConsumoProvider, useConsumo } from "./ConsumoContext";
import { useReportsUI } from "./SavedReports";
import { PeriodPicker, SegmentedFilter } from "./controls";
import { DIMENSIONS } from "./explorer-model";
import { ExportCsvMenu } from "./ExportCsvMenu";
import { HighlightCards } from "./KpiCards";
import { SpendHeadline } from "./SpendHeadline";
import { ScopeFilters } from "./ExplorerMain";
import {
  ComposicaoWidget,
  ConsumoChartWidget,
  GastoTotalCard,
  UsadoCobradoWidget,
} from "./ChartWidgets";
import { DetalhamentoWidget } from "./ExplorerTable";

/* ----------------------------------------------------------------------------
 * Dashboard FIXO da aba "Visão geral" — o retrato do consumo, sem edição.
 *
 * Reusa os widgets do explorador numa composição estática: sem arrastar, sem
 * remover, sem salvar relatório. Quem quer recortar/organizar vai pro
 * explorador (CTA no fim da linha de controles). Monta um ConsumoProvider
 * ANINHADO com surface="overview": estado 100% em memória — não herda nem suja
 * o board/relatórios do explorador (localStorage).
 * ------------------------------------------------------------------------- */

export function OverviewDashboard() {
  return (
    <ConsumoProvider surface="overview">
      <OverviewBody />
    </ConsumoProvider>
  );
}

function OverviewBody() {
  const { grouping, setGrouping } = useConsumo();
  const { beginReport } = useReportsUI();

  return (
    <section aria-label="Visão geral de consumo" className="flex w-full flex-col gap-5">
      {/* Linha de controles do recorte */}
      <div className="flex flex-wrap items-center gap-3">
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
        <ScopeFilters />
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <PeriodPicker />
          <ExportCsvMenu />
          <AwButton
            variant="secondary"
            iconLeft="query_stats"
            onClick={() => beginReport("variaveis")}
            title="Abrir este recorte no explorador de custos"
            className="h-11! shrink-0"
          >
            Abrir no explorador
          </AwButton>
        </div>
      </div>

      <SpendHeadline />

      <HighlightCards />

      <GastoTotalCard />

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
        <div className="min-w-0 lg:col-span-2">
          <DetalhamentoWidget />
        </div>
      </div>
    </section>
  );
}
