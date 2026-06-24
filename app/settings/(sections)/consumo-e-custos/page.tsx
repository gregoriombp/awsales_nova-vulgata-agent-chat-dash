"use client";

import * as React from "react";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { Icon } from "@/components/ui/Icon";
import { ConsumoProvider } from "./_components/ConsumoContext";
import {
  GroupingToggle,
  PeriodPicker,
  SpendingFilterMenu,
} from "./_components/controls";
import { ExportCsvMenu } from "./_components/ExportCsvMenu";
import { HighlightCards } from "./_components/KpiCards";
import {
  ComposicaoWidget,
  ConsumoChartWidget,
  UsadoCobradoWidget,
} from "./_components/ChartWidgets";
import { BreakdownTableWidget } from "./_components/BreakdownTable";
import {
  DraggableBoard,
  useBoardOrder,
  useBoardSpans,
  type BoardWidget,
  type Span,
} from "./_components/WidgetBoard";

/**
 * "Consumo e custos" — dashboard de analytics em largura total.
 *
 * Casa única do detalhamento de uso × cobrança. Toolbar global no canto
 * superior direito (lente, filtro, período, export CSV custom), 4 cards de
 * destaque fixos no topo e um board de widgets arrastáveis (gráficos com
 * visualizações alternativas + tabela). A ordem do board é salva por navegador.
 */
const STORAGE_KEY = "consumo-dash-order-v1";
const SPANS_KEY = "consumo-dash-spans-v1";

const DEFAULT_ORDER = [
  "consumo",
  "composicao",
  "usado-cobrado",
  "detalhamento",
];

// Largura padrão de cada widget no grid de 2 colunas (resize troca 1↔2).
const DEFAULT_SPANS: Record<string, Span> = {
  consumo: 2,
  composicao: 1,
  "usado-cobrado": 1,
  detalhamento: 2,
};

export default function ConsumoECustosPage() {
  return (
    <ConsumoProvider>
      <Dashboard />
    </ConsumoProvider>
  );
}

function Dashboard() {
  const {
    order,
    setOrder,
    reset: resetOrder,
    isCustomized: orderCustomized,
  } = useBoardOrder(STORAGE_KEY, DEFAULT_ORDER);
  const {
    spans,
    toggleSpan,
    reset: resetSpans,
    isCustomized: spansCustomized,
  } = useBoardSpans(SPANS_KEY, DEFAULT_SPANS);

  const isCustomized = orderCustomized || spansCustomized;
  const reset = React.useCallback(() => {
    resetOrder();
    resetSpans();
  }, [resetOrder, resetSpans]);

  const widgets: BoardWidget[] = React.useMemo(
    () => [
      { id: "consumo", span: 2, render: (c) => <ConsumoChartWidget {...c} /> },
      { id: "composicao", span: 1, render: (c) => <ComposicaoWidget {...c} /> },
      { id: "usado-cobrado", span: 1, render: (c) => <UsadoCobradoWidget {...c} /> },
      { id: "detalhamento", span: 2, render: (c) => <BreakdownTableWidget {...c} /> },
    ],
    [],
  );

  return (
    <div className="w-full px-8 pb-28 pt-10">
      <div className="flex flex-col gap-6">
        {/* cabeçalho + toolbar global (canto superior direito) */}
        <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="m-0 text-(--fg-primary)">Consumo e custos</h3>
            <p className="m-0 max-w-[460px] body-sm text-(--fg-secondary)">
              O que você usou no período e quanto custou, item a item. Cobre só o
              consumo variável — o plano fixo está no Financeiro e na fatura.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <GroupingToggle />
            <SpendingFilterMenu />
            <PeriodPicker />
            <ExportCsvMenu />
            <AwDropdownMenu
              align="end"
              aria-label="Opções do dashboard"
              trigger={
                <button
                  type="button"
                  aria-label="Opções do dashboard"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
                >
                  <Icon name="more_vert" size={18} />
                </button>
              }
              items={[
                {
                  id: "reset",
                  label: "Resetar layout",
                  icon: "restart_alt",
                  disabled: !isCustomized,
                  onSelect: reset,
                },
              ]}
            />
          </div>
        </header>

        {/* 4 cards de destaque (fixos) */}
        <HighlightCards />

        {/* board arrastável + redimensionável */}
        <DraggableBoard
          widgets={widgets}
          order={order}
          setOrder={setOrder}
          spans={spans}
          toggleSpan={toggleSpan}
        />
      </div>
    </div>
  );
}
