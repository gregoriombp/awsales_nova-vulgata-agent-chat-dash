"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Icon } from "@/components/ui/Icon";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { getOrbForAgent } from "@/lib/agentOrbs";
import {
  type KnowledgeBase,
  agentUsageLabel,
  statusLabel,
} from "./knowledgeBases";

/* ─────────────────────────────────────────────────────────────────────────
 * Lista densa — versão enxuta (6 colunas).
 *
 * O Figma trazia 11 colunas + scroll horizontal. Referências do mesmo padrão
 * (Slite, HubSpot, Front no Mobbin) param em ~4-6 colunas. Cortamos as colunas
 * de negócio que só servem pra leitura rápida (Objetivo, Segmento, Tipo de
 * dados, Produtos): Objetivo · Segmento descem pro subtítulo da base; Tipo de
 * dados e Produtos vivem na tela de detalhe. Sem scroll horizontal — a tabela
 * respira na largura do painel.
 * ───────────────────────────────────────────────────────────────────────── */

const headClass =
  "h-11 px-4 text-left align-middle text-[12.5px] font-medium text-(--fg-tertiary) whitespace-nowrap";
const cellClass = "px-4 py-3.5 align-middle text-sm text-(--fg-secondary)";
const numClass = `${cellClass} text-right tabular-nums`;

export function KnowledgeBaseTable({
  bases,
  onDelete,
}: {
  bases: KnowledgeBase[];
  onDelete?: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-raised)">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-(--border-subtle) hover:bg-transparent">
            <TableHead className={headClass}>Base de conhecimento</TableHead>
            <TableHead className={headClass}>Status</TableHead>
            <TableHead className={`${headClass} text-right`}>Fontes</TableHead>
            <TableHead className={`${headClass} text-right`}>Knowledge Layers</TableHead>
            <TableHead className={headClass}>Uso</TableHead>
            <TableHead className={headClass}>Última modificação</TableHead>
            <TableHead className={`${headClass} w-px`} aria-label="Ações" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {bases.map((base) => {
            const ativo = base.status === "ativo";
            return (
              <TableRow
                key={base.id}
                onClick={() => router.push(`/memory-base/${base.id}`)}
                className="cursor-pointer border-b border-(--border-subtle) transition-colors last:border-b-0 hover:bg-(--bg-hover)"
              >
                <TableCell className={`${cellClass} text-(--fg-primary)`}>
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--bg-surface) text-(--fg-secondary)">
                      <Icon name="account_balance" size={18} weight={300} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{base.name}</span>
                      <span className="truncate text-[12px] text-(--fg-tertiary)">
                        {[base.objetivo, base.segmento].filter(Boolean).join(" · ") ||
                          "Base recém-criada"}
                      </span>
                    </span>
                  </span>
                </TableCell>
                <TableCell className={cellClass}>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <AwStatusDot variant={ativo ? "live" : "offline"} />
                    {statusLabel(base.status)}
                  </span>
                </TableCell>
                <TableCell className={numClass}>{base.fontes}</TableCell>
                <TableCell className={numClass}>{base.knowledgeLayers}</TableCell>
                <TableCell className={cellClass}>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    {base.agents.length > 0 && (
                      <AwAvatarGroup>
                        {base.agents.slice(0, 3).map((agentId) => (
                          <AwAvatar key={agentId} size="sm" src={getOrbForAgent(agentId)} />
                        ))}
                      </AwAvatarGroup>
                    )}
                    {agentUsageLabel(base.agents.length)}
                  </span>
                </TableCell>
                <TableCell className={`${cellClass} whitespace-nowrap text-(--fg-tertiary)`}>
                  {base.updatedAt}
                </TableCell>
                <TableCell className={cellClass} onClick={(e) => e.stopPropagation()}>
                  <AwDropdownMenu
                    align="end"
                    aria-label={`Ações de ${base.name}`}
                    trigger={
                      <button
                        type="button"
                        aria-label={`Ações de ${base.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-(--fg-tertiary) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-primary)"
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
