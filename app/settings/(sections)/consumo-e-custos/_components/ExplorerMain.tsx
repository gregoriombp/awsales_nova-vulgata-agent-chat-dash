"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwTrendDelta } from "@/components/ui/AwTrendDelta";
import { Icon } from "@/components/ui/Icon";
import { brl } from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";
import { PeriodPicker } from "./controls";
import { ExportCsvMenu } from "./ExportCsvMenu";
import { HighlightCards } from "./KpiCards";
import {
  ComposicaoWidget,
  ConsumoChartWidget,
  GastoTotalCard,
  ProvedorWidget,
  UsadoCobradoWidget,
} from "./ChartWidgets";
import { DetalhamentoWidget } from "./ExplorerTable";
import { DraggableBoard, type BoardWidget, type Span } from "./WidgetBoard";
import { useReportsUI } from "./SavedReports";

/* ----------------------------------------------------------------------------
 * Coluna principal: busca (⌘K) + período/export + menu de edição, breadcrumb do
 * drill, "Gasto no período" + tendência, os 4 cards de KPI e o board arrastável
 * (editável só no modo "Editar" → "Salvar").
 * ------------------------------------------------------------------------- */

export function ExplorerMain() {
  const { order, setOrder, spans, toggleSpan, setSpans, resetBoard, isBoardCustomized } = useConsumo();

  const [editing, setEditing] = React.useState(false);
  const snapshot = React.useRef<{ order: string[]; spans: Record<string, Span> } | null>(null);

  const startEdit = () => {
    snapshot.current = { order: [...order], spans: { ...spans } };
    setEditing(true);
  };
  const save = () => {
    snapshot.current = null;
    setEditing(false);
  };
  const cancel = () => {
    if (snapshot.current) {
      setOrder(snapshot.current.order);
      setSpans(snapshot.current.spans);
    }
    snapshot.current = null;
    setEditing(false);
  };
  const resetLayout = () => resetBoard();
  const isCustomized = isBoardCustomized;

  const widgets: BoardWidget[] = React.useMemo(
    () => [
      { id: "consumo", span: 2, render: (c) => <ConsumoChartWidget {...c} /> },
      { id: "composicao", span: 1, render: (c) => <ComposicaoWidget {...c} /> },
      { id: "usado-cobrado", span: 1, render: (c) => <UsadoCobradoWidget {...c} /> },
      { id: "provedor", span: 1, render: (c) => <ProvedorWidget {...c} /> },
      { id: "detalhamento", span: 2, render: (c) => <DetalhamentoWidget {...c} /> },
    ],
    [],
  );

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Toolbar
        editing={editing}
        isCustomized={isCustomized}
        onEdit={startEdit}
        onReset={resetLayout}
        onSave={save}
        onCancel={cancel}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-20 pt-6">
        <Breadcrumb />
        <SpendHeadline />
        <div className="mt-5">
          <HighlightCards />
        </div>
        <div className="mt-5">
          <GastoTotalCard />
        </div>
        <div className="mt-5">
          <DraggableBoard
            widgets={widgets}
            order={order}
            setOrder={setOrder}
            spans={spans}
            toggleSpan={toggleSpan}
            editing={editing}
          />
        </div>
      </div>
    </main>
  );
}

function Toolbar({
  editing,
  isCustomized,
  onEdit,
  onReset,
  onSave,
  onCancel,
}: {
  editing: boolean;
  isCustomized: boolean;
  onEdit: () => void;
  onReset: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-(--border-subtle) px-8 py-3.5">
      <SearchBar />
      {editing ? (
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 body-xs font-medium text-(--accent-brand)">
            <Icon name="dashboard_customize" size={16} />
            Editando layout
          </span>
          <AwButton size="sm" variant="ghost" onClick={onCancel}>
            Cancelar
          </AwButton>
          <AwButton size="sm" variant="primary" iconLeft="check" onClick={onSave}>
            Salvar
          </AwButton>
        </div>
      ) : (
        <>
          <PeriodPicker />
          <SaveReportButton />
          <ExportCsvMenu />
          <AwDropdownMenu
            align="end"
            aria-label="Opções do dashboard"
            trigger={
              <button
                type="button"
                aria-label="Opções do dashboard"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--bg-raised) text-(--fg-tertiary) transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
              >
                <Icon name="more_vert" size={18} />
              </button>
            }
            items={[
              { id: "edit", label: "Editar layout", icon: "dashboard_customize", onSelect: onEdit },
              { id: "reset", label: "Resetar layout", icon: "restart_alt", disabled: !isCustomized, onSelect: onReset },
            ]}
          />
        </>
      )}
    </div>
  );
}

function SaveReportButton() {
  const { activeReport, isReportDirty, updateActiveReport } = useConsumo();
  const { openCreate } = useReportsUI();

  // Com relatório ativo, "Salvar" atualiza o snapshot direto (sem perguntar
  // nome, como o Greg pediu); sem alterações, vira um "Salvo" passivo. Sem
  // relatório ativo, abre o modal pra nomear e criar.
  if (activeReport) {
    return (
      <AwButton
        type="button"
        variant="secondary"
        iconLeft={isReportDirty ? "save" : "check"}
        onClick={() => {
          if (isReportDirty) updateActiveReport();
        }}
        disabled={!isReportDirty}
        title={
          isReportDirty
            ? `Salvar alterações em "${activeReport.name}"`
            : `"${activeReport.name}" está salvo`
        }
        className="h-11! shrink-0 rounded-xl!"
      >
        {isReportDirty ? "Salvar" : "Salvo"}
      </AwButton>
    );
  }
  return (
    <AwButton
      type="button"
      variant="secondary"
      iconLeft="bookmark_add"
      onClick={openCreate}
      title="Salvar como relatório"
      className="h-11! shrink-0 rounded-xl!"
    >
      Salvar
    </AwButton>
  );
}

function SearchBar() {
  const { search, setSearch } = useConsumo();
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative flex-1">
      <Icon
        name="search"
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-(--fg-tertiary)"
      />
      <input
        ref={ref}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar qualquer item de custo…"
        aria-label="Buscar item de custo"
        className="h-11 w-full rounded-xl border border-(--border-subtle) bg-(--bg-raised) pl-11 pr-16 body-sm text-(--fg-primary) outline-none placeholder:text-(--fg-muted) hover:border-(--border-default) focus:border-(--border-strong) focus:ring-2 focus:ring-(--ring-focus)"
      />
      <kbd className="pointer-events-none absolute right-3.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-1.5 py-0.5 font-mono text-3xs text-(--fg-tertiary)">
        ⌘K
      </kbd>
    </div>
  );
}

function Breadcrumb() {
  const { crumbs } = useConsumo();
  return (
    <nav aria-label="Caminho do custo" className="flex flex-wrap items-center gap-1">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={`${c.label}-${i}`}>
            {i > 0 && <Icon name="chevron_right" size={16} className="text-(--fg-muted)" />}
            {c.onClick && !isLast ? (
              <button
                type="button"
                onClick={c.onClick}
                className="rounded body-sm font-medium text-(--fg-tertiary) hover:text-(--fg-primary)"
              >
                {c.label}
              </button>
            ) : (
              <span className={cn("body-sm font-medium", isLast ? "text-(--fg-primary)" : "text-(--fg-tertiary)")}>
                {c.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

function SpendHeadline() {
  const { accumulated, trend, periodLabel } = useConsumo();
  return (
    <header className="mt-4 flex flex-col gap-1.5">
      <span className="body-sm text-(--fg-secondary)">Uso no período</span>
      <div className="flex items-baseline gap-3">
        <span className="display-sm font-semibold tabular-nums tracking-heading-tighter text-(--fg-primary)">
          {brl(accumulated)}
        </span>
        <AwTrendDelta value={trend} tone="neutral" />
      </div>
      <span className="body-xs text-(--fg-tertiary)">
        {periodLabel} · comparado ao período anterior
      </span>
    </header>
  );
}
