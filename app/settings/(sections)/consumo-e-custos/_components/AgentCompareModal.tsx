"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import {
  agentType,
  brl,
  fmtUsdLabel,
  getAgentFeeBreakdown,
  type AgentBreakdownRow,
} from "../../financeiro/_components/data";

/* ----------------------------------------------------------------------------
 * X-Ray — comparação lado a lado de 2+ agentes. Espelha o "Onde foi o gasto" do
 * AgentDetailModal, mas em matriz (categorias × agentes) + barras de total, pra
 * responder "quem consumiu mais e em quê". Reusa getAgentFeeBreakdown, então
 * cada coluna fecha com a linha da tabela.
 * ------------------------------------------------------------------------- */

const AGENT_PALETTE = [
  "var(--aw-blue-500)",
  "var(--aw-purple-500)",
  "var(--aw-amber-500)",
  "var(--aw-emerald-500)",
];

function statusVariant(status: AgentBreakdownRow["status"]): AwPillVariant {
  switch (status) {
    case "Ativo":
      return "live";
    case "Pausado":
      return "draft";
    case "Treinando":
      return "beta";
  }
}

/** Seed estável a partir do id — mantém o breakdown determinístico (igual ao modal de 1). */
function seedFromId(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) % 100000;
  return s + 1;
}

type AgentColumn = {
  agent: AgentBreakdownRow;
  color: string;
  /** Total por categoria de taxa (id → R$). */
  byCategory: Map<string, number>;
};

export function AgentCompareModal({
  agents,
  periodLabel,
  open,
  onClose,
}: {
  agents: AgentBreakdownRow[];
  periodLabel: string;
  open: boolean;
  onClose: () => void;
}) {
  // Colunas + categorias derivadas do breakdown de cada agente. Todos seguem o
  // mesmo template, então a lista de categorias é estável entre as colunas.
  const { columns, categories } = React.useMemo(() => {
    const cols: AgentColumn[] = agents.map((agent, i) => {
      const groups = getAgentFeeBreakdown(agent.total, seedFromId(agent.id));
      const byCategory = new Map<string, number>();
      groups.forEach((g) =>
        byCategory.set(g.id, g.lines.reduce((s, l) => s + l.total, 0)),
      );
      return { agent, color: AGENT_PALETTE[i % AGENT_PALETTE.length], byCategory };
    });
    const first = agents[0]
      ? getAgentFeeBreakdown(agents[0].total, seedFromId(agents[0].id))
      : [];
    const cats = first.map((g) => ({ id: g.id, label: g.label, icon: g.icon }));
    return { columns: cols, categories: cats };
  }, [agents]);

  if (agents.length === 0) return null;

  const maxTotal = Math.max(...columns.map((c) => c.agent.total), 1);
  const sortedByTotal = [...columns].sort((a, b) => b.agent.total - a.agent.total);

  return (
    <AwModal
      open={open}
      onClose={onClose}
      size="cockpit"
      title="Comparar agentes"
      titleAdornment={
        <AwPill variant="neutral">
          {agents.length} agentes · {periodLabel}
        </AwPill>
      }
      footer={
        <div className="flex w-full justify-end">
          <AwButton variant="primary" onClick={onClose}>
            Fechar
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Total no período — barra por agente, quem gastou mais primeiro */}
        <section className="flex flex-col gap-3">
          <h6 className="m-0 text-(--fg-primary)">Total no período</h6>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {sortedByTotal.map(({ agent, color }) => (
              <li key={agent.id} className="flex items-center gap-3">
                <span className="inline-flex w-44 shrink-0 items-center gap-2">
                  <AwAvatar size="sm" src={agent.avatar} alt={agent.label} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate body-sm font-medium text-(--fg-primary)">
                      {agent.label}
                    </span>
                    <span className="truncate body-xs text-(--fg-tertiary)">{agentType(agent.id)}</span>
                  </span>
                </span>
                <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-(--bg-muted)">
                  <span
                    className="block h-full rounded-full transition-[width] duration-aw-base ease-aw-out"
                    style={{ width: `${Math.max(3, (agent.total / maxTotal) * 100)}%`, background: color }}
                  />
                </span>
                <span className="w-32 shrink-0 text-right">
                  <span className="block body-sm font-medium tabular-nums text-(--fg-primary)">
                    {brl(agent.total)}
                  </span>
                  <span className="block body-xs tabular-nums text-(--fg-tertiary)">
                    {fmtUsdLabel(agent.total)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Onde foi o gasto — matriz categoria × agente */}
        <section className="flex flex-col gap-3 border-t border-(--border-subtle) pt-5">
          <h6 className="m-0 text-(--fg-primary)">Onde foi o gasto</h6>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-2 pb-2 text-left aw-eyebrow font-medium text-(--fg-tertiary)">
                    Categoria
                  </th>
                  {columns.map(({ agent, color }) => (
                    <th key={agent.id} className="px-2 pb-2 text-right">
                      <span className="inline-flex items-center justify-end gap-2">
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: color }}
                        />
                        <span className="truncate body-xs font-medium text-(--fg-primary)">
                          {agent.label}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const rowMax = Math.max(
                    ...columns.map((c) => c.byCategory.get(cat.id) ?? 0),
                    0,
                  );
                  return (
                    <tr key={cat.id} className="border-t border-(--border-subtle)">
                      <td className="px-2 py-2.5">
                        <span className="inline-flex items-center gap-2">
                          <Icon name={cat.icon} size={15} className="text-(--fg-tertiary)" />
                          <span className="body-sm text-(--fg-secondary)">{cat.label}</span>
                        </span>
                      </td>
                      {columns.map(({ agent, byCategory }) => {
                        const v = byCategory.get(cat.id) ?? 0;
                        // Destaca quem mais gastou nesta categoria.
                        const isMax = rowMax > 0 && v === rowMax;
                        return (
                          <td
                            key={agent.id}
                            className={cn(
                              "px-2 py-2.5 text-right tabular-nums",
                              isMax ? "font-medium text-(--fg-primary)" : "text-(--fg-secondary)",
                            )}
                          >
                            {brl(v)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-(--border-default)">
                  <td className="px-2 pt-2.5 font-medium text-(--fg-secondary)">Total</td>
                  {columns.map(({ agent }) => (
                    <td
                      key={agent.id}
                      className="px-2 pt-2.5 text-right font-semibold tabular-nums text-(--fg-primary)"
                    >
                      {brl(agent.total)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Identidade rápida (status por agente) */}
        <section className="flex flex-wrap gap-2 border-t border-(--border-subtle) pt-5">
          {columns.map(({ agent, color }) => (
            <span
              key={agent.id}
              className="inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--bg-muted) py-1 pl-1.5 pr-3"
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
              <AwAvatar size="sm" src={agent.avatar} alt={agent.label} />
              <span className="body-xs font-medium text-(--fg-primary)">{agent.label}</span>
              <AwPill variant={statusVariant(agent.status)}>{agent.status}</AwPill>
            </span>
          ))}
        </section>
      </div>
    </AwModal>
  );
}
