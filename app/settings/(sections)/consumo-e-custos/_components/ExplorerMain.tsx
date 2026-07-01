"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwTrendDelta } from "@/components/ui/AwTrendDelta";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwLogo } from "@/components/ui/AwLogo";
import { Icon } from "@/components/ui/Icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { brl, INVOICE_HISTORY } from "../../financeiro/_components/data";
import { useConsumo, type ComparedAgent } from "./ConsumoContext";
import { type ProviderId } from "./explorer-model";
import { PeriodPicker, ScopeFilterDropdown } from "./controls";
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
  const {
    order,
    setOrder,
    spans,
    toggleSpan,
    setSpans,
    resetBoard,
    isBoardCustomized,
    drill,
    hiddenWidgets,
    userHiddenWidgets,
    toggleWidgetHidden,
    restoreAllWidgets,
  } = useConsumo();
  // No detalhamento de um custo específico (drill ativo) os 4 KPIs de topo
  // (subtotal/créditos/ajustes/total) deixam de fazer sentido — somem.
  const isDrilled = drill.length > 0;

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
      { id: "consumo", span: 2, label: "Uso por dia", icon: "bar_chart", render: (c) => <ConsumoChartWidget {...c} /> },
      { id: "composicao", span: 1, label: "Composição do período", icon: "donut_small", render: (c) => <ComposicaoWidget {...c} /> },
      { id: "usado-cobrado", span: 1, label: "Uso do período", icon: "sync_alt", render: (c) => <UsadoCobradoWidget {...c} /> },
      { id: "provedor", span: 1, label: "Valor atribuído ao provedor", icon: "account_balance", render: (c) => <ProvedorWidget {...c} /> },
      { id: "detalhamento", span: 2, label: "Detalhamento", icon: "table_rows", render: (c) => <DetalhamentoWidget {...c} /> },
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
        {!isDrilled && (
          <div className="mt-5">
            <HighlightCards />
          </div>
        )}
        {!hiddenWidgets.has("gasto-total") && (
          <div className="mt-5">
            <GastoTotalCard
              onHide={() => toggleWidgetHidden("gasto-total")}
            />
          </div>
        )}
        {userHiddenWidgets.size > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-muted) px-4 py-2.5">
            <span className="inline-flex items-center gap-2 body-sm text-(--fg-secondary)">
              <Icon name="visibility_off" size={16} className="text-(--fg-tertiary)" />
              {userHiddenWidgets.size === 1
                ? "1 gráfico removido desta visualização"
                : `${userHiddenWidgets.size} gráficos removidos desta visualização`}
            </span>
            <AwButton size="sm" variant="ghost" iconLeft="restart_alt" onClick={restoreAllWidgets}>
              Restaurar
            </AwButton>
          </div>
        )}
        <div className="mt-5">
          <DraggableBoard
            widgets={widgets}
            order={order}
            setOrder={setOrder}
            spans={spans}
            toggleSpan={toggleSpan}
            editing={editing}
            hidden={hiddenWidgets}
            onRemove={toggleWidgetHidden}
            onAdd={toggleWidgetHidden}
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
      <ActiveFilterPills />
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
          <ScopeFilters />
          <PeriodOrInvoice />
          <SaveReportButton />
          <ExportCsvMenu />
          <AwDropdownMenu
            align="end"
            aria-label="Opções do dashboard"
            trigger={
              <button
                type="button"
                aria-label="Opções do dashboard"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-raised) text-(--fg-tertiary) transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
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

/* ----------------------------------------------------------------------------
 * Filtro de pagador ("Por destino") na topbar — um dropdown compacto (estilo do
 * period picker) na mesma linha da busca/período. A lente "Dividir por" voltou
 * pro trilho esquerdo (ficava estranha lado a lado com a pill de agentes).
 * ------------------------------------------------------------------------- */
function ScopeFilters() {
  const { payers, selectPayers } = useConsumo();
  // 2-way: os dois pagadores → "all"; senão → "aswork". A opção "só Meta" saiu
  // (pedido do Greg) — sempre há Aswork no recorte; Meta só acompanha junto.
  const payerMode = payers.has("aswork") && payers.has("meta") ? "all" : "aswork";
  return (
    <div className="flex shrink-0 items-center gap-2">
      <ScopeFilterDropdown
        collapsed
        ariaLabel="Filtrar por destino do pagamento"
        value={payerMode}
        onChange={(v) =>
          selectPayers(v === "all" ? (["aswork", "meta"] as ProviderId[]) : ([v] as ProviderId[]))
        }
        options={[
          {
            value: "aswork",
            label: "Aswork",
            leading: <AwLogo variant="mark" height={13} className="text-(--aw-blue-500)" />,
          },
          {
            value: "all",
            label: "Aswork e Meta",
            // Os dois logos juntos se confundiam (pedido do Greg): cada um ganha
            // um disco branco com anel, ficando dois "selos" separados.
            leading: (
              <span className="inline-flex items-center">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--bg-raised) ring-1 ring-(--border-subtle)">
                  <AwLogo variant="mark" height={11} className="text-(--aw-blue-500)" />
                </span>
                <span className="-ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--bg-raised) ring-1 ring-(--border-subtle)">
                  <AwBrandLogo brand="meta" size={12} markOnly />
                </span>
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Controle de recorte da topbar: relatório de faturas troca o controle temporal
 * por um seletor de fatura (pedido do Greg) — uma fatura fechada não é um período
 * que se arrasta no calendário, é um ciclo escolhido. Os outros tipos seguem com
 * o PeriodPicker normal.
 * ------------------------------------------------------------------------- */
function PeriodOrInvoice() {
  const { reportType } = useConsumo();
  return reportType === "faturas" ? <InvoiceSelector /> : <PeriodPicker />;
}

function InvoiceSelector() {
  const { invoiceId, selectInvoice } = useConsumo();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  // Fatura a confirmar (modal de troca) — null = sem modal aberto.
  const [pending, setPending] = React.useState<(typeof INVOICE_HISTORY)[number] | null>(null);

  const current = INVOICE_HISTORY.find((i) => i.id === invoiceId) ?? INVOICE_HISTORY[0];
  const label = (inv: (typeof INVOICE_HISTORY)[number]) => `${inv.refMonth} · ${inv.description}`;

  const confirmSwap = () => {
    if (!pending) return;
    selectInvoice(pending.id);
    // Mantém a URL coerente (?fatura=) pra sobreviver a refresh/nova aba.
    router.replace(
      `/settings/consumo-e-custos/explorar?tipo=faturas&fatura=${encodeURIComponent(pending.id)}`,
    );
    setPending(null);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Selecionar fatura"
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--bg-raised) px-3.5 body-sm font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover)"
          >
            <Icon name="receipt_long" size={16} className="text-(--fg-tertiary)" />
            {current ? label(current) : "Selecionar fatura"}
            <Icon name="expand_more" size={16} className="text-(--fg-tertiary)" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="flex max-h-80 w-72 flex-col gap-0.5 overflow-y-auto border border-(--border-subtle) bg-(--bg-raised) p-1.5 shadow-lg"
        >
          {INVOICE_HISTORY.map((inv) => {
            const active = inv.id === current?.id;
            return (
              <button
                key={inv.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  // Troca direta só pede confirmação quando muda de fatura.
                  if (inv.id !== current?.id) setPending(inv);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-aw-fast",
                  active
                    ? "bg-(--bg-muted) text-(--fg-primary)"
                    : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate body-sm font-medium">{label(inv)}</span>
                  <span className="truncate body-xs text-(--fg-tertiary)">{inv.id}</span>
                </span>
                <AwPill variant={inv.status === "Paga" ? "live" : "warning"}>{inv.status}</AwPill>
                {active && <Icon name="check" size={15} className="shrink-0 text-(--fg-primary)" />}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>

      <AwModal
        open={!!pending}
        onClose={() => setPending(null)}
        size="md"
        title="Trocar de fatura?"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <AwButton variant="ghost" onClick={() => setPending(null)}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" onClick={confirmSwap}>
              Ver esta fatura
            </AwButton>
          </div>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary)">
          Você está vendo{" "}
          <strong className="font-medium text-(--fg-primary)">{current ? label(current) : "—"}</strong>.
          Trocar para{" "}
          <strong className="font-medium text-(--fg-primary)">{pending ? label(pending) : "—"}</strong>{" "}
          recarrega o painel com os números dessa fatura.
        </p>
      </AwModal>
    </>
  );
}

/* ----------------------------------------------------------------------------
 * Pills de "visão filtrada" na topbar (pedido do José): deixam claro que o
 * usuário está vendo um recorte — os agentes que ele comparou e/ou só um
 * pagador. Ficam logo depois da busca e somem quando não há filtro. O ✕ limpa.
 * (Inspiração: o Google Ads ao comparar campanhas selecionadas.)
 * ------------------------------------------------------------------------- */
function ActiveFilterPills() {
  // Só o comparativo de agentes vira pill aqui — carrega info única (QUAIS
  // agentes). O filtro de pagador NÃO entra: o dropdown da topbar já indica
  // Aswork/Meta, então repetir numa pill seria redundante (pedido do Greg).
  const { agentComparison, clearAgentComparison } = useConsumo();
  if (!agentComparison) return null;
  return (
    <div className="flex min-w-0 shrink items-center gap-2">
      <AgentFilterPill agents={agentComparison} onClear={clearAgentComparison} />
    </div>
  );
}

function formatAgentNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  if (names.length === 3) return `${names[0]}, ${names[1]} e ${names[2]}`;
  return `${names[0]}, ${names[1]} e mais ${names.length - 2}`;
}

function PillShell({ children, onClear, clearLabel }: { children: React.ReactNode; onClear: () => void; clearLabel: string }) {
  return (
    <span className="inline-flex h-9 min-w-0 shrink items-center gap-2 rounded-full border border-(--border-default) bg-(--bg-raised) pl-1.5 pr-1 shadow-xs">
      {children}
      <button
        type="button"
        onClick={onClear}
        aria-label={clearLabel}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
      >
        <Icon name="close" size={16} />
      </button>
    </span>
  );
}

function AgentFilterPill({ agents, onClear }: { agents: ComparedAgent[]; onClear: () => void }) {
  return (
    <PillShell onClear={onClear} clearLabel="Limpar comparação de agentes">
      <span className="flex shrink-0 items-center pl-0.5">
        {agents.slice(0, 3).map((a, i) => (
          <span
            key={a.id}
            className={cn("inline-flex rounded-full ring-2 ring-(--bg-raised)", i > 0 && "-ml-2")}
            style={{ zIndex: 3 - i }}
          >
            <AwAvatar size="sm" src={a.avatar} alt={a.label} initials={a.label.slice(0, 1)} />
          </span>
        ))}
      </span>
      <span className="inline-flex min-w-0 items-baseline gap-1.5 body-sm">
        <span className="shrink-0 font-medium text-(--fg-primary)">Agentes</span>
        <span className="max-w-[210px] truncate text-(--fg-tertiary)">
          {formatAgentNames(agents.map((a) => a.label))}
        </span>
      </span>
    </PillShell>
  );
}

function SaveReportButton() {
  const { activeReport, isReportDirty, updateActiveReport } = useConsumo();
  const { openSave } = useReportsUI();

  // Com relatório ativo, "Salvar" atualiza o snapshot direto (sem perguntar
  // nome, como o Greg pediu); sem alterações, vira um "Salvo" passivo. Sem
  // relatório ativo, abre o modal pra nomear e criar.
  if (activeReport) {
    return (
      <AwButton
        type="button"
        variant="ghost"
        onClick={() => {
          if (isReportDirty) updateActiveReport();
        }}
        disabled={!isReportDirty}
        title={
          isReportDirty
            ? `Salvar alterações em "${activeReport.name}"`
            : `"${activeReport.name}" está salvo`
        }
        className="h-11! shrink-0"
      >
        {isReportDirty ? "Salvar" : "Salvo"}
      </AwButton>
    );
  }
  // Rascunho aberto por um card: destaca o "Salvar" (primário) pra deixar claro
  // que nada está guardado ainda. Exploração avulsa segue discreta (secundário).
  return (
    <AwButton
      type="button"
      variant="ghost"
      onClick={openSave}
      title="Salvar como relatório"
      className="h-11! shrink-0"
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
        className="h-11 w-full rounded-full border border-(--border-subtle) bg-(--bg-raised) pl-11 pr-16 body-sm text-(--fg-primary) outline-none placeholder:text-(--fg-muted) hover:border-(--border-default) focus:border-(--border-strong) focus:ring-2 focus:ring-(--ring-focus)"
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
  const { accumulated, trend, periodLabel, reportType } = useConsumo();
  // O frame do título muda por tipo: cobranças é dinheiro que saiu, não consumo.
  const headline =
    reportType === "cobrancas"
      ? "Cobrado no período"
      : reportType === "faturas"
        ? "Total nesta fatura"
        : "Uso no período";
  return (
    <header className="mt-4 flex flex-col gap-1.5">
      <span className="body-sm text-(--fg-secondary)">{headline}</span>
      <div className="flex items-baseline gap-3">
        <span className="display-sm font-semibold tabular-nums tracking-heading-tighter text-(--fg-primary)">
          {brl(accumulated)}
        </span>
        <AwTrendDelta value={trend} tone="neutral" />
      </div>
      <span className="body-xs text-(--fg-tertiary)">
        {periodLabel} · comparado ao período anterior equivalente
      </span>
    </header>
  );
}
