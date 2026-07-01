"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import {
  AGENT_DEPARTMENTS,
  agentDepartment,
  brl,
} from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";
import { WidgetShell, type WidgetChrome } from "./WidgetBoard";

/* ----------------------------------------------------------------------------
 * "Gasto por tipo de agente" — os silos de departamento (Vendas, Atendimento e
 * suporte, Operações) e quanto cada um consumiu no período (cmt-f014416f).
 * Clicar num silo abre o recorte: lente Agente + drill no grupo — dá pra ver
 * o gasto por fee de cada departamento no Detalhamento.
 * ------------------------------------------------------------------------- */

export function AgentTypeWidget({ dragHandle, menu }: WidgetChrome) {
  const { agentRows, drillAgentDepartment } = useConsumo();

  const rows = React.useMemo(() => {
    const byDept = new Map<string, { total: number; agentIds: string[] }>();
    agentRows.forEach((r) => {
      const dept = agentDepartment(r.id);
      const cur = byDept.get(dept) ?? { total: 0, agentIds: [] };
      cur.total += r.total;
      cur.agentIds.push(r.id);
      byDept.set(dept, cur);
    });
    const grand = [...byDept.values()].reduce((s, d) => s + d.total, 0) || 1;
    return AGENT_DEPARTMENTS.map((dept) => {
      const d = byDept.get(dept.id) ?? { total: 0, agentIds: [] };
      return {
        ...dept,
        total: Math.round(d.total * 100) / 100,
        share: (d.total / grand) * 100,
        agentIds: d.agentIds,
      };
    }).sort((a, b) => b.total - a.total);
  }, [agentRows]);

  const max = rows[0]?.total || 1;

  return (
    <WidgetShell
      title="Gasto por tipo de agente"
      icon="diversity_3"
      description="Por silo de departamento — clique pra abrir o recorte por fee."
      dragHandle={dragHandle}
      menu={menu}
    >
      <ul className="m-0 flex h-full list-none flex-col justify-center gap-1 p-0">
        {rows.map((r, i) => (
          <li key={r.id} className={cn(i > 0 && "border-t border-(--border-subtle)")}>
            <button
              type="button"
              onClick={() => drillAgentDepartment(r.label, r.agentIds)}
              disabled={r.agentIds.length === 0}
              title={`Ver o gasto de ${r.label} por agente e por fee`}
              className="group flex w-full flex-col gap-1.5 py-3 text-left"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `color-mix(in srgb, ${r.colorVar} 14%, transparent)` }}
                >
                  <Icon name={r.icon} size={16} style={{ color: r.colorVar }} />
                </span>
                <span className="min-w-0 flex-1 truncate body-sm font-medium text-(--fg-primary)">
                  {r.label}
                </span>
                <span className="shrink-0 body-xs text-(--fg-tertiary)">
                  {r.agentIds.length}{" "}
                  {r.agentIds.length === 1 ? "agente" : "agentes"}
                </span>
                <span className="w-24 shrink-0 text-right body-sm font-medium tabular-nums text-(--fg-primary)">
                  {brl(r.total)}
                </span>
                <Icon
                  name="chevron_right"
                  size={16}
                  className="shrink-0 text-(--fg-muted) transition-colors duration-aw-fast group-hover:text-(--fg-secondary)"
                />
              </span>
              <span className="ml-[42px] flex items-center gap-3">
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-(--bg-muted)">
                  <span
                    className="block h-full rounded-full transition-[width] duration-aw-base ease-aw-out"
                    style={{
                      width: `${Math.max(2, (r.total / max) * 100)}%`,
                      background: r.colorVar,
                    }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right body-xs tabular-nums text-(--fg-tertiary)">
                  {r.share.toFixed(0)}%
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}
