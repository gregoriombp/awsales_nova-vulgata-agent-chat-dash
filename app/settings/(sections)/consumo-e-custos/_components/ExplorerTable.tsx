"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwLogo } from "@/components/ui/AwLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwDropdownMenu, type AwDropdownItem } from "@/components/ui/AwDropdownMenu";
import { AwPill } from "@/components/ui/AwPill";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import { AgentDetailModal } from "../../financeiro/_components/AgentDetailModal";
import {
  AGENT_STATUS_VARIANT,
  OutlierBadge,
  RowInfoTip,
  ShareBarCell,
} from "../../financeiro/_components/BreakdownCells";
import {
  brl,
  type AgentBreakdownRow,
  type SpendingPeriod,
} from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";
import {
  leafRows,
  metaPayerSubtree,
  PROVIDERS,
  scaledAgentRows,
  scaledServiceRows,
  type ExplorerRow,
  type MetaPayerNode,
  type ProviderId,
} from "./explorer-model";
import { WidgetShell, type WidgetChrome } from "./WidgetBoard";

/* ----------------------------------------------------------------------------
 * Widget "Detalhamento" — tabela drill-aware. Clicar numa linha estreita o
 * escopo (gráfico/composição/KPIs re-escopam) e empilha o breadcrumb; na lente
 * Agente, "Ver detalhes" abre o modal. Serviço e Agente têm colunas próprias,
 * porque cada lente responde a perguntas diferentes.
 * ------------------------------------------------------------------------- */

const TH = "aw-eyebrow font-medium text-(--fg-tertiary)";

// Info por item — o MESMO texto de apoio da tabela do Financeiro (dados
// complementares, cmt-55aa536b), pra as duas contarem a mesma história.
const GROUP_INFO: Record<string, string> = {
  tokens:
    "Tokens somam Brain (raciocínio), Skills (habilidades), Knowledge (conhecimento) e Cortex dos agentes — cobrados por volume processado.",
  meta: "Disparos de WhatsApp — marketing, utilidade e serviço. Parte fica com a Aswork (spread) e parte é repassada ao Meta.",
  msgs: "Mensagens transacionadas pelos agentes nas conversas do período.",
  leads: "Contatos que viraram lead ativo no período — cobrança por lead.",
  tel: "Linha telefônica de um parceiro da Aswork — valor fixo por linha.",
};
// Hover ocupa a LINHA INTEIRA, não a célula de uma coluna: o realce global
// arredonda CADA td (fica "esquisito", como uma pílula por coluna). Aqui a faixa
// de hover vira uma só — sem raio por célula, arredondando apenas as pontas da
// linha (1ª e última td). Vale pras linhas-pai e pras filhas (drill).
const ROW_HOVER =
  "[&_tbody_tr:hover_td]:!rounded-none " +
  "[&_tbody_tr:hover_td:first-child]:!rounded-l-md " +
  "[&_tbody_tr:hover_td:last-child]:!rounded-r-md";
// Formato único das duas tabelas (BreakdownCells.usdLabel usa BRL→USD; aqui o
// USD já vem pronto do model, então só formata igual).
function fmtUsd(value: number): string {
  return `US$ ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isOutlier(value: number, all: number[]): boolean {
  const pos = all.filter((v) => v > 0);
  if (pos.length < 3 || value <= 0) return false;
  const sorted = [...pos].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return median > 0 && value >= median * 2;
}

export function DetalhamentoWidget({ dragHandle, menu }: WidgetChrome) {
  const { detailRows, grouping, drill, drillInto, compareAgents, selection, customDays, periodLabel } = useConsumo();
  const [agentDetail, setAgentDetail] = React.useState<AgentBreakdownRow | null>(null);
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(
    () => new Set(["tokens"]),
  );

  // X-Ray: agentes marcados pra comparar (só faz sentido na lente Agente).
  const [selectedAgents, setSelectedAgents] = React.useState<Set<string>>(() => new Set());
  // Trocar de lente esvazia a seleção (os ids são de agente).
  React.useEffect(() => {
    if (grouping !== "agent") setSelectedAgents(new Set());
  }, [grouping]);
  const toggleAgent = React.useCallback((id: string) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Filtros por coluna (funil no cabeçalho — pedido do José). Cada coluna
  // categórica guarda os valores PERMITIDOS; ausente = sem filtro (mostra tudo).
  // Troca de lente zera (colunas diferentes por lente).
  const [colFilters, setColFilters] = React.useState<Record<string, string[]>>({});
  React.useEffect(() => setColFilters({}), [grouping]);
  const colValue = React.useCallback(
    (row: ExplorerRow, key: string): string =>
      key === "tipo"
        ? row.sub ?? "Geral"
        : key === "status"
          ? row.status ?? "—"
          : key === "provedor"
            ? providerFilterLabel(row.provider)
            : "",
    [],
  );
  const distinctColValues = React.useCallback(
    (key: string) =>
      [...new Set(detailRows.map((r) => colValue(r, key)))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [detailRows, colValue],
  );
  const toggleColValue = React.useCallback(
    (key: string, value: string, allValues: string[]) =>
      setColFilters((prev) => {
        const cur = prev[key] ?? allValues;
        const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
        const out = { ...prev };
        // Tudo marcado (ou nada) = sem filtro, pra não deixar a tabela vazia à toa.
        if (next.length === 0 || next.length === allValues.length) delete out[key];
        else out[key] = next;
        return out;
      }),
    [],
  );
  const resetCol = React.useCallback(
    (key: string) =>
      setColFilters((prev) => {
        const out = { ...prev };
        delete out[key];
        return out;
      }),
    [],
  );

  // Transição do drill: a tabela desliza pra dentro ao avançar um nível (entra
  // pela direita) e ao voltar (entra pela esquerda), dando a sensação de
  // "andar" pelo escopo em vez de um corte seco. A `key` (lente + profundidade)
  // remonta o bloco e re-dispara o animate-in a cada mudança.
  const depth = drill.length;
  const prevDepth = React.useRef(depth);
  const [drillDir, setDrillDir] = React.useState<"fwd" | "back">("fwd");
  React.useEffect(() => {
    if (depth !== prevDepth.current) {
      setDrillDir(depth > prevDepth.current ? "fwd" : "back");
      prevDepth.current = depth;
    }
  }, [depth]);

  const agentRows = React.useMemo(() => {
    const period: SpendingPeriod | null = selection.kind === "preset" ? selection.id : null;
    return scaledAgentRows(period, customDays);
  }, [selection, customDays]);
  const serviceRows = React.useMemo(() => {
    const period: SpendingPeriod | null = selection.kind === "preset" ? selection.id : null;
    return scaledServiceRows(period, customDays);
  }, [selection, customDays]);
  const serviceById = React.useMemo(
    () => new Map(serviceRows.map((row) => [row.id, row])),
    [serviceRows],
  );
  const serviceChildren = React.useMemo(() => {
    return new Map(
      detailRows
        .filter((row) => row.rowIds.length > 1)
        .map((row) => [row.id, leafRows(row.rowIds, serviceById)]),
    );
  }, [detailRows, serviceById]);
  // Subárvore de 3 níveis do grupo Meta: pagador (Aswork × Meta) → disparo.
  const metaSubtree = React.useMemo(() => {
    const metaRow = detailRows.find((row) => row.id === "meta");
    if (!metaRow || metaRow.rowIds.length === 0) return null;
    return metaPayerSubtree(metaRow.rowIds, serviceById);
  }, [detailRows, serviceById]);

  // Linhas após os filtros de coluna — é o que a tabela mostra e soma.
  const visibleRows = React.useMemo(
    () =>
      detailRows.filter((row) =>
        Object.entries(colFilters).every(([key, allowed]) => allowed.includes(colValue(row, key))),
      ),
    [detailRows, colFilters, colValue],
  );

  const allTotals = React.useMemo(() => visibleRows.map((r) => r.total), [visibleRows]);
  const detailTotal = React.useMemo(
    () => visibleRows.reduce((sum, row) => sum + row.total, 0),
    [visibleRows],
  );
  const detailUsdTotal = React.useMemo(
    () => visibleRows.reduce((sum, row) => sum + row.usd, 0),
    [visibleRows],
  );

  // Linhas resolvidas pra comparação (ordem = maior gasto primeiro).
  const selectedAgentRows = React.useMemo(
    () => agentRows.filter((a) => selectedAgents.has(a.id)).sort((a, b) => b.total - a.total),
    [agentRows, selectedAgents],
  );
  const allVisibleSelected =
    grouping === "agent" && visibleRows.length > 0 && visibleRows.every((r) => selectedAgents.has(r.id));
  const someVisibleSelected = grouping === "agent" && visibleRows.some((r) => selectedAgents.has(r.id));
  const toggleAllVisible = React.useCallback(() => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (visibleRows.every((r) => prev.has(r.id))) visibleRows.forEach((r) => next.delete(r.id));
      else visibleRows.forEach((r) => next.add(r.id));
      return next;
    });
  }, [visibleRows]);

  const openAgent = (row: ExplorerRow) =>
    setAgentDetail(agentRows.find((a) => a.id === row.agentId) ?? null);
  const toggleExpanded = React.useCallback((rowId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }, []);

  return (
    <WidgetShell
      title="Detalhamento"
      icon="table_rows"
      description={
        grouping === "service"
          ? "Cada serviço e taxa do período, em USD e BRL"
          : "Consumo por agente no período, em USD e BRL"
      }
      dragHandle={dragHandle}
      menu={menu}
    >
      {grouping === "agent" && selectedAgents.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--border-default) bg-(--bg-muted) px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
          <span className="inline-flex items-center gap-2 body-sm text-(--fg-secondary)">
            <Icon name="compare_arrows" size={16} className="text-(--fg-tertiary)" />
            <span>
              <strong className="text-(--fg-primary)">{selectedAgents.size}</strong>{" "}
              {selectedAgents.size === 1 ? "agente selecionado" : "agentes selecionados"}
            </span>
            {selectedAgents.size === 1 && (
              <span className="body-xs text-(--fg-tertiary)">· escolha mais um pra comparar</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <AwButton size="sm" variant="ghost" onClick={() => setSelectedAgents(new Set())}>
              Limpar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              iconLeft="stacked_bar_chart"
              disabled={selectedAgents.size < 2}
              onClick={() => {
                compareAgents(selectedAgentRows);
                setSelectedAgents(new Set());
              }}
            >
              Comparar
            </AwButton>
          </div>
        </div>
      )}
      {visibleRows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Icon name="search_off" size={22} className="text-(--fg-tertiary)" />
          <p className="m-0 body-sm text-(--fg-tertiary)">
            {Object.keys(colFilters).length > 0
              ? "Nenhum item com os filtros aplicados."
              : "Nenhum item de custo bate com a busca."}
          </p>
          {Object.keys(colFilters).length > 0 && (
            <AwButton size="sm" variant="ghost" iconLeft="restart_alt" onClick={() => setColFilters({})}>
              Limpar filtros
            </AwButton>
          )}
        </div>
      ) : (
        <div
          key={`${grouping}-${depth}`}
          className={cn(
            "animate-in fade-in duration-300 ease-aw-out motion-reduce:animate-none",
            drillDir === "fwd" ? "slide-in-from-right-4" : "slide-in-from-left-4",
          )}
        >
          {grouping === "agent" ? (
          <AwTable className={ROW_HOVER}>
            <thead>
              <tr>
                <th className="w-10">
                  <AwCheckbox
                    checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                    onChange={toggleAllVisible}
                    label="Selecionar todos os agentes pra comparar"
                  />
                </th>
                <th className={TH}>Nome</th>
                <FilterableTh
                  label="Tipo"
                  columnKey="tipo"
                  values={distinctColValues("tipo")}
                  filter={colFilters["tipo"]}
                  onToggle={toggleColValue}
                  onReset={resetCol}
                />
                <FilterableTh
                  label="Status"
                  columnKey="status"
                  values={distinctColValues("status")}
                  filter={colFilters["status"]}
                  onToggle={toggleColValue}
                  onReset={resetCol}
                />
                <th className={cn(TH, "text-right")}>Total BRL</th>
                <th className={cn(TH, "text-right")}>Total USD</th>
                <th className="w-28" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={row.drillable ? () => drillInto(row) : undefined}
                  className={cn(
                    row.drillable && "cursor-pointer",
                    selectedAgents.has(row.id) && "bg-(--bg-selected)",
                  )}
                  aria-label={row.drillable ? `Explorar ${row.label}` : undefined}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <AwCheckbox
                      checked={selectedAgents.has(row.id)}
                      onChange={() => toggleAgent(row.id)}
                      label={`Selecionar ${row.label} pra comparar`}
                    />
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-3">
                      {row.avatar && <AwAvatar size="sm" src={row.avatar} alt={row.label} />}
                      <span className="inline-flex items-center gap-2">
                        <span className="truncate font-medium text-(--fg-primary)">{row.label}</span>
                        {isOutlier(row.total, allTotals) && <OutlierBadge />}
                      </span>
                    </span>
                  </td>
                  <td className="text-(--fg-secondary)">{row.sub ?? "Geral"}</td>
                  <td>
                    {row.status ? (
                      <AwPill variant={AGENT_STATUS_VARIANT[row.status]}>
                        {row.status}
                      </AwPill>
                    ) : (
                      <span className="text-(--fg-tertiary)">—</span>
                    )}
                  </td>
                  <td className="text-right font-medium tabular-nums text-(--fg-primary)">{brl(row.total)}</td>
                  <td className="text-right tabular-nums text-(--fg-tertiary)">{fmtUsd(row.usd)}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAgent(row);
                      }}
                      className="inline-flex items-center gap-1 whitespace-nowrap body-xs font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:underline"
                    >
                      Ver detalhes
                      <Icon name="arrow_forward" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="font-medium text-(--fg-secondary)">
                  Total por agente
                </td>
                <td className="text-right font-semibold tabular-nums text-(--fg-primary)">
                  {brl(detailTotal)}
                </td>
                <td className="text-right font-medium tabular-nums text-(--fg-secondary)">
                  {fmtUsd(detailUsdTotal)}
                </td>
                <td aria-hidden="true" />
              </tr>
            </tfoot>
          </AwTable>
        ) : (
          <AwTable className={ROW_HOVER}>
            <thead>
              <tr>
                <th className={TH}>Item</th>
                <FilterableTh
                  label="Provedor"
                  columnKey="provedor"
                  values={distinctColValues("provedor")}
                  filter={colFilters["provedor"]}
                  onToggle={toggleColValue}
                  onReset={resetCol}
                />
                <th className={cn(TH, "text-right")}>Quantidade</th>
                <th className={TH}>Unitário</th>
                <th className={cn(TH, "text-right")}>Total BRL</th>
                <th className={cn(TH, "text-right")}>Total USD</th>
                <th className={cn(TH, "w-36")}>Participação</th>
                <th className="w-20" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const clickable = row.drillable;
                const isMeta = row.id === "meta" && metaSubtree !== null;
                const children = serviceChildren.get(row.id) ?? [];
                const hasChildren = isMeta || children.length > 0;
                const expanded = expandedRows.has(row.id);
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={clickable ? () => drillInto(row) : undefined}
                      className={cn(clickable && "cursor-pointer")}
                      aria-label={clickable ? `Explorar ${row.label}` : undefined}
                    >
                      <td>
                        <span className="inline-flex items-center gap-3">
                          {hasChildren ? (
                            <button
                              type="button"
                              aria-label={expanded ? `Recolher ${row.label}` : `Expandir ${row.label}`}
                              aria-expanded={expanded}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(row.id);
                              }}
                              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-(--fg-tertiary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
                            >
                              {/* Mesmo ícone, rotaciona — evita o "flip" entre dois SVGs. */}
                              <Icon
                                name="keyboard_arrow_down"
                                size={18}
                                className={cn(
                                  "transition-transform duration-aw-fast ease-aw-out",
                                  !expanded && "-rotate-90",
                                )}
                              />
                            </button>
                          ) : (
                            <span className="h-6 w-6 shrink-0" aria-hidden="true" />
                          )}
                          {row.provider === "meta" ? (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted)">
                              <AwBrandLogo brand="meta" size={18} markOnly />
                            </span>
                          ) : (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
                              <Icon name={row.icon ?? "category"} size={18} fill={1} />
                            </span>
                          )}
                          <span className="flex min-w-0 flex-col">
                            <span className="inline-flex items-center gap-2">
                              <span className="truncate font-medium text-(--fg-primary)">{row.label}</span>
                              {GROUP_INFO[row.id] && (
                                <RowInfoTip text={GROUP_INFO[row.id]} label={`O que é ${row.label}`} />
                              )}
                              {isOutlier(row.total, allTotals) && <OutlierBadge />}
                            </span>
                            {row.sub && <span className="truncate body-xs text-(--fg-tertiary)">{row.sub}</span>}
                          </span>
                        </span>
                      </td>
                      <td>
                        <ProviderTag provider={row.provider} />
                      </td>
                      <td className="text-right tabular-nums text-(--fg-secondary)">{row.quantity ?? "—"}</td>
                      <td className="tabular-nums text-(--fg-tertiary)">{row.unitPrice ?? "—"}</td>
                      <td className="text-right font-medium tabular-nums text-(--fg-primary)">{brl(row.total)}</td>
                      <td className="text-right tabular-nums text-(--fg-tertiary)">{fmtUsd(row.usd)}</td>
                      <td>
                        <ShareBar share={row.share} provider={row.provider} />
                      </td>
                      <td className="text-right">
                        {row.drillable && <Icon name="chevron_right" size={18} className="text-(--fg-tertiary)" />}
                      </td>
                    </tr>
                    {expanded && isMeta && metaSubtree
                      ? metaSubtree.map((node) => (
                          <MetaPayerRows
                            key={`${row.id}-${node.payer}`}
                            node={node}
                            expanded={expandedRows.has(`meta-${node.payer}`)}
                            onToggle={() => toggleExpanded(`meta-${node.payer}`)}
                          />
                        ))
                      : expanded &&
                        children.map((child) => (
                          <tr
                            key={`${row.id}-${child.id}`}
                            className="animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none"
                          >
                            <td>
                              <span className="inline-flex items-center gap-3 pl-14">
                                <Icon name="subdirectory_arrow_right" size={16} className="text-(--fg-muted)" />
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-(--fg-tertiary)">
                                  <Icon name={child.icon ?? "category"} size={16} fill={1} />
                                </span>
                                <span className="truncate body-sm text-(--fg-secondary)">{child.label}</span>
                              </span>
                            </td>
                            <td>
                              <ProviderTag provider={child.provider} />
                            </td>
                            <td className="text-right tabular-nums text-(--fg-tertiary)">{child.quantity ?? "—"}</td>
                            <td className="tabular-nums text-(--fg-tertiary)">{child.unitPrice ?? "—"}</td>
                            <td className="text-right tabular-nums text-(--fg-secondary)">{brl(child.total)}</td>
                            <td className="text-right tabular-nums text-(--fg-tertiary)">{fmtUsd(child.usd)}</td>
                            <td>
                              <ShareBar share={child.share} provider={child.provider} />
                            </td>
                            <td aria-hidden="true" />
                          </tr>
                        ))}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="font-medium text-(--fg-secondary)">
                  Total por serviço
                </td>
                <td className="text-right font-semibold tabular-nums text-(--fg-primary)">
                  {brl(detailTotal)}
                </td>
                <td className="text-right font-medium tabular-nums text-(--fg-secondary)">
                  {fmtUsd(detailUsdTotal)}
                </td>
                <td colSpan={2} aria-hidden="true" />
              </tr>
            </tfoot>
          </AwTable>
          )}
        </div>
      )}

      <AgentDetailModal
        agent={agentDetail}
        periodLabel={periodLabel}
        open={agentDetail !== null}
        onClose={() => setAgentDetail(null)}
      />
    </WidgetShell>
  );
}

/** Nível 2 (pagador) + nível 3 (disparos) da subárvore Meta / WhatsApp. */
function MetaPayerRows({
  node,
  expanded,
  onToggle,
}: {
  node: MetaPayerNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none"
        aria-label={expanded ? `Recolher ${node.label}` : `Expandir ${node.label}`}
        aria-expanded={expanded}
      >
        <td>
          <span className="inline-flex items-center gap-3 pl-8">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-(--fg-tertiary)"
            >
              <Icon
                name="keyboard_arrow_down"
                size={18}
                className={cn(
                  "transition-transform duration-aw-fast ease-aw-out",
                  !expanded && "-rotate-90",
                )}
              />
            </button>
            {node.payer === "meta" ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--bg-muted)">
                <AwBrandLogo brand="meta" size={16} markOnly />
              </span>
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-(--fg-primary)">
                <AwLogo variant="mark" height={15} className="text-(--fg-primary)" />
              </span>
            )}
            <span className="truncate body-sm font-medium text-(--fg-primary)">{node.label}</span>
          </span>
        </td>
        <td>
          <ProviderTag provider={node.payer} />
        </td>
        <td className="text-right tabular-nums text-(--fg-tertiary)">—</td>
        <td className="tabular-nums text-(--fg-tertiary)">—</td>
        <td className="text-right tabular-nums text-(--fg-secondary)">{brl(node.total)}</td>
        <td className="text-right tabular-nums text-(--fg-tertiary)">{fmtUsd(node.usd)}</td>
        <td>
          <ShareBar share={node.share} provider={node.payer} />
        </td>
        <td aria-hidden="true" />
      </tr>
      {expanded &&
        node.children.map((child) => (
          <tr
            key={child.id}
            className="animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none"
          >
            <td>
              <span className="inline-flex items-center gap-3 pl-20">
                <Icon name="subdirectory_arrow_right" size={16} className="text-(--fg-muted)" />
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-(--fg-tertiary)">
                  <Icon name={child.icon ?? "category"} size={16} fill={1} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate body-sm text-(--fg-secondary)">{child.label}</span>
                  {child.sub && (
                    <span className="truncate body-xs text-(--fg-tertiary)">{child.sub}</span>
                  )}
                </span>
              </span>
            </td>
            <td>
              <ProviderTag provider={child.provider} />
            </td>
            <td className="text-right tabular-nums text-(--fg-tertiary)">{child.quantity ?? "—"}</td>
            <td className="tabular-nums text-(--fg-tertiary)">{child.unitPrice ?? "—"}</td>
            <td className="text-right tabular-nums text-(--fg-secondary)">{brl(child.total)}</td>
            <td className="text-right tabular-nums text-(--fg-tertiary)">{fmtUsd(child.usd)}</td>
            <td>
              <ShareBar share={child.share} provider={child.provider} />
            </td>
            <td aria-hidden="true" />
          </tr>
        ))}
    </>
  );
}

function barColor(provider: ProviderId | "mixed"): string {
  return provider === "mixed" ? "var(--aw-slate-400)" : PROVIDERS[provider].colorVar;
}

function ProviderTag({ provider }: { provider: ProviderId | "mixed" }) {
  if (provider === "meta") {
    return (
      <span className="inline-flex items-center gap-2 body-sm text-(--fg-secondary)">
        <AwBrandLogo brand="meta" size={16} markOnly />
        Meta
      </span>
    );
  }
  if (provider === "aswork") {
    // Aswork com a própria marca (mark preto) + nome, igual ao Meta (pedido do Greg).
    return (
      <span className="inline-flex items-center gap-2 body-sm text-(--fg-secondary)">
        <AwLogo variant="mark" height={14} className="text-(--fg-primary)" />
        Aswork
      </span>
    );
  }
  // Só sobra "mixed": pagamento dividido entre Meta e Aswork (ex.: disparos —
  // o spread fica com a Aswork, o resto vai pro Meta). Mostra os DOIS selos,
  // não um "Misto" genérico (cmt-947c67f8).
  return (
    <span className="inline-flex items-center gap-2 body-sm text-(--fg-secondary)">
      <span className="inline-flex shrink-0 items-center">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--bg-raised) ring-1 ring-(--border-subtle)">
          <AwBrandLogo brand="meta" size={12} markOnly />
        </span>
        <span className="-ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--bg-raised) ring-1 ring-(--border-subtle)">
          <AwLogo variant="mark" height={11} className="text-(--fg-primary)" />
        </span>
      </span>
      Meta e Aswork
    </span>
  );
}

function ShareBar({ share, provider }: { share: number; provider: ProviderId | "mixed" }) {
  // Régua compartilhada com a tabela do Financeiro (BreakdownCells).
  return <ShareBarCell share={share} color={barColor(provider)} />;
}

function providerFilterLabel(provider: ProviderId | "mixed"): string {
  return provider === "meta" ? "Meta" : provider === "aswork" ? "Aswork" : "Meta e Aswork";
}

/* ----------------------------------------------------------------------------
 * Cabeçalho de coluna com funil (pedido do José): no hover aparece o ícone de
 * filtro; clicando, um dropdown com os valores distintos da coluna pra marcar
 * só os que quer ver. Vale pras colunas categóricas (Tipo, Status, Provedor).
 * ------------------------------------------------------------------------- */
function FilterableTh({
  label,
  columnKey,
  values,
  filter,
  align,
  onToggle,
  onReset,
}: {
  label: string;
  columnKey: string;
  values: string[];
  filter: string[] | undefined;
  align?: "right";
  onToggle: (key: string, value: string, all: string[]) => void;
  onReset: (key: string) => void;
}) {
  // Filtrado = um subconjunto está marcado (nem tudo). allowed: o que aparece.
  const active = !!filter && filter.length < values.length;
  const allowed = filter ?? values;
  const items: AwDropdownItem[] = [
    { id: "_hdr", isLabel: true, label: `Mostrar ${label.toLowerCase()}` },
    ...values.map((v) => ({
      id: v,
      label: v,
      checked: allowed.includes(v),
      closeOnSelect: false,
      onSelect: () => onToggle(columnKey, v, values),
    })),
    { id: "_sep", separator: true },
    { id: "_all", label: "Mostrar todos", icon: "done_all", disabled: !active, onSelect: () => onReset(columnKey) },
  ];
  return (
    <th className={cn(TH, align === "right" && "text-right")}>
      <span className={cn("group/col inline-flex items-center gap-1", align === "right" && "flex-row-reverse")}>
        {label}
        <AwDropdownMenu
          align={align === "right" ? "end" : "start"}
          aria-label={`Filtrar por ${label}`}
          trigger={
            <button
              type="button"
              aria-label={`Filtrar por ${label}`}
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded transition-[opacity,color] duration-aw-fast hover:text-(--fg-primary)",
                active
                  ? "text-(--accent-brand) opacity-100"
                  : "text-(--fg-tertiary) opacity-0 group-hover/col:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100",
              )}
            >
              <Icon name="filter_alt" size={14} fill={active ? 1 : 0} />
            </button>
          }
          items={items}
        />
      </span>
    </th>
  );
}
