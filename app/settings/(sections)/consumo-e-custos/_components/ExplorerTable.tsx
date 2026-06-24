"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import { AgentDetailModal } from "../../financeiro/_components/AgentDetailModal";
import {
  brl,
  type AgentBreakdownRow,
  type SpendingPeriod,
} from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";
import {
  leafRows,
  PROVIDERS,
  scaledAgentRows,
  scaledServiceRows,
  type ExplorerRow,
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
const AGENT_STATUS_VARIANT: Record<NonNullable<ExplorerRow["status"]>, AwPillVariant> = {
  Ativo: "live",
  Pausado: "neutral",
  Treinando: "warning",
};

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

export function DetalhamentoWidget({ dragHandle, resizeButton }: WidgetChrome) {
  const { detailRows, grouping, drillInto, selection, customDays, periodLabel } = useConsumo();
  const [agentDetail, setAgentDetail] = React.useState<AgentBreakdownRow | null>(null);
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(
    () => new Set(["tokens"]),
  );

  const agentRows = React.useMemo(() => {
    const period: SpendingPeriod | null = selection.kind === "preset" ? selection.id : null;
    return scaledAgentRows(period, customDays);
  }, [selection, customDays]);
  const serviceRows = React.useMemo(() => {
    const period: SpendingPeriod | null = selection.kind === "preset" ? selection.id : null;
    return scaledServiceRows(period, customDays);
  }, [selection, customDays]);
  const serviceChildren = React.useMemo(() => {
    const byId = new Map(serviceRows.map((row) => [row.id, row]));
    return new Map(
      detailRows
        .filter((row) => row.rowIds.length > 1)
        .map((row) => [row.id, leafRows(row.rowIds, byId)]),
    );
  }, [detailRows, serviceRows]);

  const allTotals = React.useMemo(() => detailRows.map((r) => r.total), [detailRows]);
  const detailTotal = React.useMemo(
    () => detailRows.reduce((sum, row) => sum + row.total, 0),
    [detailRows],
  );
  const detailUsdTotal = React.useMemo(
    () => detailRows.reduce((sum, row) => sum + row.usd, 0),
    [detailRows],
  );

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
          ? "Cada serviço e taxa do período, em BRL e USD"
          : "Consumo por agente no período, em BRL e USD"
      }
      dragHandle={dragHandle}
      resizeButton={resizeButton}
    >
      {detailRows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Icon name="search_off" size={22} className="text-(--fg-tertiary)" />
          <p className="m-0 body-sm text-(--fg-tertiary)">
            Nenhum item de custo bate com a busca.
          </p>
        </div>
      ) : (
        grouping === "agent" ? (
          <AwTable>
            <thead>
              <tr>
                <th className={TH}>Nome</th>
                <th className={TH}>Tipo</th>
                <th className={TH}>Status</th>
                <th className={cn(TH, "text-right")}>Total BRL</th>
                <th className={cn(TH, "text-right")}>Total USD</th>
                <th className="w-28" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {detailRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={row.drillable ? () => drillInto(row) : undefined}
                  className={cn(row.drillable && "cursor-pointer")}
                  aria-label={row.drillable ? `Explorar ${row.label}` : undefined}
                >
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
                <td colSpan={3} className="font-medium text-(--fg-secondary)">
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
          <AwTable>
            <thead>
              <tr>
                <th className={TH}>Item</th>
                <th className={TH}>Provedor</th>
                <th className={cn(TH, "text-right")}>Quantidade</th>
                <th className={TH}>Unitário</th>
                <th className={cn(TH, "text-right")}>Total BRL</th>
                <th className={cn(TH, "text-right")}>Total USD</th>
                <th className={cn(TH, "w-36")}>Participação</th>
                <th className="w-20" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {detailRows.map((row) => {
                const clickable = row.drillable;
                const children = serviceChildren.get(row.id) ?? [];
                const hasChildren = children.length > 0;
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
                              <Icon name={expanded ? "keyboard_arrow_down" : "keyboard_arrow_right"} size={18} />
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
                    {expanded &&
                      children.map((child) => (
                        <tr key={`${row.id}-${child.id}`}>
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
          </AwTable>
        )
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
    // Serviços da própria plataforma não têm fornecedor externo — traço, não "Aswork".
    return <span className="text-(--fg-tertiary)">—</span>;
  }
  // Só sobra "mixed" (meta/aswork retornaram acima).
  return (
    <span className="inline-flex items-center gap-2 body-sm text-(--fg-secondary)">
      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ background: barColor(provider) }} />
      Misto
    </span>
  );
}

function ShareBar({ share, provider }: { share: number; provider: ProviderId | "mixed" }) {
  return (
    <span className="flex items-center gap-3">
      <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-(--bg-muted)">
        <span
          className="block h-full rounded-full transition-[width] duration-aw-base ease-aw-out"
          style={{ width: `${Math.max(2, share)}%`, background: barColor(provider) }}
        />
      </span>
      <span className="w-9 shrink-0 text-right body-xs tabular-nums text-(--fg-tertiary)">{share.toFixed(0)}%</span>
    </span>
  );
}

function OutlierBadge() {
  return (
    <AwPill variant="warning" dot={false}>
      <Icon name="warning" size={11} />
      Outlier
    </AwPill>
  );
}
