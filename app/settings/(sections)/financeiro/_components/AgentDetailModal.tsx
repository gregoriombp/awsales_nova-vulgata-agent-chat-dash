"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import {
  agentType,
  brl,
  fmtUsdLabel,
  formatQuantity,
  getAgentFeeBreakdown,
  OPERATIONAL_FX,
  type AgentBreakdownRow,
} from "./data";

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

/** Seed estável a partir do id do agente — mantém o breakdown determinístico. */
function seedFromId(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) % 100000;
  return s + 1;
}

/**
 * Modal "Ver detalhes" de um agente — quebra o gasto do período por tipo de
 * cobrança (disparos, leads, mensagens, tokens de IA). O total sempre confere
 * com a linha da tabela. O agente já chega com o total escalado pelo período.
 */
export function AgentDetailModal({
  agent,
  periodLabel,
  open,
  onClose,
}: {
  agent: AgentBreakdownRow | null;
  periodLabel: string;
  open: boolean;
  onClose: () => void;
}) {
  const groups = React.useMemo(
    () => (agent ? getAgentFeeBreakdown(agent.total, seedFromId(agent.id)) : []),
    [agent],
  );

  if (!agent) return null;

  return (
    <AwModal
      open={open}
      onClose={onClose}
      size="cockpit"
      title={agent.label}
      footer={
        <div className="flex w-full justify-end">
          <AwButton variant="primary" onClick={onClose}>
            Fechar
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Identidade + período */}
        <div className="flex items-center gap-3">
          <AwAvatar size="md" src={agent.avatar} alt={agent.label} />
          <div className="flex flex-col gap-1">
            <span className="inline-flex flex-wrap items-center gap-2 body-xs text-(--fg-secondary)">
              {agentType(agent.id)}
              <span className="text-(--fg-muted)">·</span>
              <AwPill variant={statusVariant(agent.status)}>{agent.status}</AwPill>
              <span className="text-(--fg-muted)">·</span>
              {periodLabel}
            </span>
          </div>
        </div>

        {/* Total do período */}
        <div className="flex flex-col gap-1 border-t border-(--border-subtle) pt-4">
          <span className="aw-eyebrow text-(--fg-tertiary)">
            Total gasto no período
          </span>
          <span className="inline-flex flex-wrap items-baseline gap-2">
            <strong className="text-2xl font-semibold tabular-nums text-(--fg-primary)">
              {brl(agent.total)}
            </strong>
            <span className="body-xs tabular-nums text-(--fg-tertiary)">
              {fmtUsdLabel(agent.total)} · câmbio operacional R${" "}
              {OPERATIONAL_FX.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </span>
        </div>

        {/* Onde foi o gasto */}
        <div className="flex flex-col gap-4 border-t border-(--border-subtle) pt-4">
          <h6 className="m-0 text-(--fg-primary)">Onde foi o gasto</h6>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {groups.map((g) => {
              const single = g.lines.length === 1;
              const groupTotal = g.lines.reduce((s, l) => s + l.total, 0);
              return (
                <li key={g.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <Icon
                        name={g.icon}
                        size={16}
                        className="text-(--fg-tertiary)"
                      />
                      <span className="body-sm font-medium text-(--fg-primary)">
                        {g.label}
                      </span>
                    </span>
                    {!single && (
                      <span className="body-sm tabular-nums text-(--fg-secondary)">
                        {brl(groupTotal)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 pl-6">
                    {g.lines.map((l) => (
                      <div
                        key={l.label}
                        className="flex items-baseline justify-between gap-3"
                      >
                        <span className="body-xs text-(--fg-secondary)">
                          {!single && (
                            <span className="font-medium text-(--fg-primary)">
                              {l.label} ·{" "}
                            </span>
                          )}
                          {formatQuantity(l.qty, l.quantityFormat)} {l.unitNoun} ×{" "}
                          {l.rateLabel}
                        </span>
                        <span className="shrink-0 body-xs font-medium tabular-nums text-(--fg-primary)">
                          {brl(l.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Reconciliação */}
        <div className="flex items-center justify-between gap-3 rounded-md bg-(--bg-muted) px-4 py-3">
          <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
            <Icon name="check_circle" size={15} className="text-(--accent-success)" />
            Confere com a linha da tabela
          </span>
          <strong className="body-sm tabular-nums text-(--fg-primary)">
            {brl(agent.total)}
          </strong>
        </div>
      </div>
    </AwModal>
  );
}
