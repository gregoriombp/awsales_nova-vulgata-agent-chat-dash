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
import { getOrbForAgent } from "@/lib/agentOrbs";
import {
  type KnowledgeBase,
  agentUsageLabel,
  statusLabel,
} from "./knowledgeBases";

const headClass =
  "h-11 px-4 text-left align-middle text-[12.5px] font-medium text-[var(--fg-tertiary)] whitespace-nowrap";
const cellClass = "px-4 py-3.5 align-middle text-[13px] text-[var(--fg-secondary)]";

/** Célula com ícone + texto (placeholders de ícone — o usuário define os finais). */
function IconCell({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <Icon name={icon} size={16} weight={300} className="text-[var(--fg-tertiary)]" />
      {children}
    </span>
  );
}

export function KnowledgeBaseTable({ bases }: { bases: KnowledgeBase[] }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
      <Table className="min-w-[1100px]">
        <TableHeader>
          <TableRow className="border-b border-[var(--border-subtle)] hover:bg-transparent">
            <TableHead className={headClass}>Base de conhecimento</TableHead>
            <TableHead className={headClass}>Status</TableHead>
            <TableHead className={headClass}>Objetivo</TableHead>
            <TableHead className={headClass}>Segmento</TableHead>
            <TableHead className={headClass}>Tipo de dados</TableHead>
            <TableHead className={headClass}>Produtos</TableHead>
            <TableHead className={headClass}>Fontes de conhecimento</TableHead>
            <TableHead className={headClass}>Knowledge Layers</TableHead>
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
                className="cursor-pointer border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                <TableCell className={`${cellClass} text-[var(--fg-primary)]`}>
                  <span className="inline-flex items-center gap-2.5 whitespace-nowrap font-medium">
                    <Icon
                      name="account_balance"
                      size={18}
                      weight={300}
                      className="text-[var(--fg-secondary)]"
                    />
                    {base.name}
                  </span>
                </TableCell>
                <TableCell className={cellClass}>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <AwStatusDot variant={ativo ? "live" : "offline"} />
                    {statusLabel(base.status)}
                  </span>
                </TableCell>
                <TableCell className={cellClass}>
                  <IconCell icon="adjust">{base.objetivo}</IconCell>
                </TableCell>
                <TableCell className={cellClass}>
                  <IconCell icon="category">{base.segmento}</IconCell>
                </TableCell>
                <TableCell className={cellClass}>
                  <IconCell icon="dataset">{base.tipoDados}</IconCell>
                </TableCell>
                <TableCell className={cellClass}>
                  <IconCell icon="inventory_2">{base.produtos} produtos</IconCell>
                </TableCell>
                <TableCell className={cellClass}>
                  <IconCell icon="account_tree">{base.fontes} fontes</IconCell>
                </TableCell>
                <TableCell className={cellClass}>
                  <IconCell icon="layers">{base.knowledgeLayers} Knowledge Layers</IconCell>
                </TableCell>
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
                <TableCell className={`${cellClass} whitespace-nowrap`}>
                  {base.updatedAt}
                </TableCell>
                <TableCell className={cellClass}>
                  <button
                    type="button"
                    aria-label={`Ações de ${base.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--fg-tertiary)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--fg-primary)]"
                  >
                    <Icon name="more_vert" size={18} weight={400} />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
