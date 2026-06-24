"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwLogo } from "@/components/ui/AwLogo";
import { AwPill } from "@/components/ui/AwPill";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import { AgentDetailModal } from "../../financeiro/_components/AgentDetailModal";
import {
  brl,
  type AgentBreakdownRow,
  type SpendingPeriod,
} from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";
import { PROVIDERS, scaledAgentRows, type ExplorerRow, type ProviderId } from "./explorer-model";
import { WidgetShell, type WidgetChrome } from "./WidgetBoard";

/* ----------------------------------------------------------------------------
 * Widget "Detalhamento" — tabela drill-aware. Clicar numa linha estreita o
 * escopo (gráfico/composição/KPIs re-escopam) e empilha o breadcrumb; na lente
 * Agente, "Ver detalhes" abre o modal. Colunas: Item · Provedor · BRL · USD ·
 * Participação.
 * ------------------------------------------------------------------------- */

const TH = "aw-eyebrow font-medium text-(--fg-tertiary)";

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

  const agentRows = React.useMemo(() => {
    const period: SpendingPeriod | null = selection.kind === "preset" ? selection.id : null;
    return scaledAgentRows(period, customDays);
  }, [selection, customDays]);

  const allTotals = React.useMemo(() => detailRows.map((r) => r.total), [detailRows]);

  const openAgent = (row: ExplorerRow) =>
    setAgentDetail(agentRows.find((a) => a.id === row.agentId) ?? null);

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
        <AwTable>
          <thead>
            <tr>
              <th className={TH}>Item</th>
              <th className={TH}>Provedor</th>
              <th className={cn(TH, "text-right")}>Quantidade</th>
              <th className={TH}>Unitário</th>
              <th className={cn(TH, "text-right")}>Total BRL</th>
              <th className={cn(TH, "text-right")}>Total USD</th>
              <th className={cn(TH, "w-[150px]")}>Participação</th>
              <th className="w-20" aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {detailRows.map((row) => {
              const isAgent = Boolean(row.agentId);
              const clickable = isAgent || row.drillable;
              return (
                <tr
                  key={row.id}
                  onClick={clickable ? () => drillInto(row) : undefined}
                  className={cn(clickable && "cursor-pointer")}
                  aria-label={clickable ? `Explorar ${row.label}` : undefined}
                >
                  <td>
                    <span className="inline-flex items-center gap-3">
                      {row.avatar ? (
                        <AwAvatar size="sm" src={row.avatar} alt={row.label} />
                      ) : row.provider === "meta" ? (
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
                    {isAgent ? (
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
                    ) : (
                      row.drillable && <Icon name="chevron_right" size={18} className="text-(--fg-tertiary)" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AwTable>
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
    return (
      <span className="inline-flex items-center gap-2 body-sm text-(--fg-secondary)">
        <AwLogo variant="mark" height={13} className="text-(--aw-blue-500)" />
        Aswork
      </span>
    );
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
