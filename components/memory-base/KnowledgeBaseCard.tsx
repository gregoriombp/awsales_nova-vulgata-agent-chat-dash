"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AwPill } from "@/components/ui/AwPill";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar";
import { getOrbForAgent } from "@/lib/agentOrbs";
import {
  type KnowledgeBase,
  agentUsageLabel,
  statusLabel,
} from "./knowledgeBases";

/* Ícones são placeholders (o usuário define os definitivos):
 *   base de conhecimento → instituição · fontes · knowledge layers · produtos. */
const ICON = {
  base: "account_balance",
  fontes: "account_tree",
  layers: "layers",
  produtos: "inventory_2",
} as const;

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <Icon name={icon} size={16} weight={300} className="text-[var(--fg-tertiary)]" />
      {label}
    </span>
  );
}

export function KnowledgeBaseCard({ base }: { base: KnowledgeBase }) {
  const ativo = base.status === "ativo";

  return (
    <Link
      href={`/memory-base/${base.id}`}
      className="group block rounded-[var(--radius-xl)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]"
    >
      <article className="flex h-full flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 transition-colors group-hover:border-[var(--border-default)] group-hover:bg-[var(--bg-hover)]">
        {/* Topo: ícone da base + atalho de abrir */}
        <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--bg-surface)] text-[var(--fg-primary)]">
            <Icon name={ICON.base} size={22} weight={300} />
          </span>
          <Icon
            name="open_in_new"
            size={18}
            className="text-[var(--fg-tertiary)] transition-colors group-hover:text-[var(--fg-secondary)]"
          />
        </div>

        {/* Nome + tags (segmento / tipo de dados) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <h3 className="text-[16px] font-medium leading-tight text-[var(--fg-primary)]">
            {base.name}
          </h3>
          <AwPill variant="neutral" dot={false}>
            {base.segmento}
          </AwPill>
          <AwPill variant="neutral" dot={false}>
            {base.tipoDados}
          </AwPill>
        </div>

        {/* Métricas */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[var(--fg-secondary)]">
          <Stat icon={ICON.fontes} label={`${base.fontes} fontes de conhecimento`} />
          <Stat icon={ICON.layers} label={`${base.knowledgeLayers} Knowledge Layers`} />
          <Stat icon={ICON.produtos} label={`${base.produtos} produtos`} />
        </div>

        {/* Rodapé: uso por agentes + status */}
        <div className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
          <div className="flex min-w-0 items-center gap-2">
            {base.agents.length > 0 && (
              <AwAvatarGroup>
                {base.agents.slice(0, 3).map((agentId) => (
                  <AwAvatar key={agentId} size="sm" src={getOrbForAgent(agentId)} />
                ))}
              </AwAvatarGroup>
            )}
            <span className="truncate text-[12.5px] text-[var(--fg-tertiary)]">
              {agentUsageLabel(base.agents.length)}
            </span>
          </div>
          <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-[12.5px] text-[var(--fg-secondary)]">
            <AwStatusDot variant={ativo ? "live" : "offline"} />
            {statusLabel(base.status)}
          </span>
        </div>
      </article>
    </Link>
  );
}
