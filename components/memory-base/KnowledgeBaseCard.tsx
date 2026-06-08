"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { AwPill } from "@/components/ui/AwPill";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { getOrbForAgent } from "@/lib/agentOrbs";
import {
  type KnowledgeBase,
  agentUsageLabel,
  statusLabel,
} from "./knowledgeBases";

/* Ícones são placeholders (o usuário define os definitivos):
 *   base de conhecimento → instituição · fontes · knowledge layers. */
const ICON = {
  base: "account_balance",
  fontes: "account_tree",
  layers: "layers",
} as const;

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <Icon name={icon} size={16} weight={300} className="text-(--fg-tertiary)" />
      {label}
    </span>
  );
}

export function KnowledgeBaseCard({
  base,
  onDelete,
}: {
  base: KnowledgeBase;
  onDelete?: (id: string) => void;
}) {
  const router = useRouter();
  const ativo = base.status === "ativo";
  const tags = [base.objetivo, base.segmento].filter(Boolean);

  // Stretched-link: o <Link> cobre o card todo (z-[1]); o menu ⋯ fica acima
  // (z-[2]) — assim clicar em qualquer lugar abre a base, e o menu tem controle
  // próprio sem aninhar <button> dentro de <a>.
  return (
    <article className="group relative flex h-full flex-col gap-4 rounded-xl border border-(--border-subtle) bg-(--bg-raised) p-5 transition-colors hover:border-(--border-default) hover:bg-(--bg-hover)">
      <Link
        href={`/memory-base/${base.id}`}
        aria-label={`Abrir ${base.name}`}
        className="absolute inset-0 z-1 rounded-xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-(--accent-brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-canvas)"
      />

      {/* Topo: ícone da base + menu de ações */}
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--bg-surface) text-(--fg-primary)">
          <Icon name={ICON.base} size={22} weight={300} />
        </span>
        <div className="relative z-2">
          <AwDropdownMenu
            align="end"
            aria-label={`Ações de ${base.name}`}
            trigger={
              <button
                type="button"
                aria-label={`Ações de ${base.name}`}
                className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-md text-(--fg-tertiary) opacity-0 transition-opacity hover:bg-(--bg-muted) hover:text-(--fg-primary) focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
              >
                <Icon name="more_vert" size={18} weight={400} />
              </button>
            }
            items={[
              {
                id: "view",
                label: "Ver",
                icon: "visibility",
                onSelect: () => router.push(`/memory-base/${base.id}`),
              },
              { id: "sep", separator: true },
              {
                id: "delete",
                label: "Excluir",
                icon: "delete",
                danger: true,
                onSelect: () => onDelete?.(base.id),
              },
            ]}
          />
        </div>
      </div>

      {/* Nome + objetivo · segmento (tipo de dados / produtos vivem no detalhe).
          Base recém-criada (sem objetivo/segmento) ganha um selo "Nova". */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <h3 className="text-[16px] font-medium leading-tight text-(--fg-primary)">
          {base.name}
        </h3>
        {tags.length > 0 ? (
          tags.map((tag) => (
            <AwPill key={tag} variant="neutral" dot={false}>
              {tag}
            </AwPill>
          ))
        ) : (
          <AwPill variant="draft" dot={false}>
            Nova
          </AwPill>
        )}
      </div>

      {/* Métricas */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-(--fg-secondary)">
        <Stat icon={ICON.fontes} label={`${base.fontes} fontes`} />
        <Stat icon={ICON.layers} label={`${base.knowledgeLayers} Knowledge Layers`} />
      </div>

      {/* Rodapé: uso por agentes + status */}
      <div className="mt-auto flex items-center justify-between border-t border-(--border-subtle) pt-4">
        <div className="flex min-w-0 items-center gap-2">
          {base.agents.length > 0 && (
            <AwAvatarGroup>
              {base.agents.slice(0, 3).map((agentId) => (
                <AwAvatar key={agentId} size="sm" src={getOrbForAgent(agentId)} />
              ))}
            </AwAvatarGroup>
          )}
          <span className="truncate text-[12.5px] text-(--fg-tertiary)">
            {agentUsageLabel(base.agents.length)}
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[12.5px] text-(--fg-secondary)">
          <AwStatusDot variant={ativo ? "live" : "offline"} />
          {statusLabel(base.status)}
        </span>
      </div>
    </article>
  );
}
