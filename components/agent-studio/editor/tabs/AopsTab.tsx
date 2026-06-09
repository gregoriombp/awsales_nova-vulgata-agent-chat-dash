"use client";

import * as React from "react";
import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import {
  AwEmpty,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
  AwEmptyDescription,
  AwEmptyContent,
} from "@/components/ui/AwEmpty";
import {
  AwMembersTable,
  AwMembersTableTextCell,
} from "@/components/ui/AwMembersTable";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import type { AgentAop, AgentEditorData } from "@/lib/agentStudio";

const AOP_STATUS_META = {
  ativo: { label: "Ativo", variant: "live" as const },
  desativado: { label: "Desativado", variant: "neutral" as const },
};

/**
 * AOPs — seção do editor de agente.
 *
 * Tabela na mesma receita da listagem do Agent Studio (AwMembersTable +
 * AwPill + AwDropdownMenu). Ativar/desativar e excluir agem só no estado
 * local; "Adicionar AOP" leva à página global de AOPs do produto.
 */
export function AopsTab({ data }: { data: AgentEditorData }) {
  const [aops, setAops] = React.useState<AgentAop[]>(data.aops);
  const [detalhe, setDetalhe] = React.useState<AgentAop | null>(null);
  const [excluindo, setExcluindo] = React.useState<AgentAop | null>(null);

  const toggleStatus = (id: string) => {
    setAops((prev) =>
      prev.map((aop) =>
        aop.id === id
          ? {
              ...aop,
              status: aop.status === "ativo" ? "desativado" : "ativo",
            }
          : aop,
      ),
    );
  };

  const confirmarExclusao = () => {
    if (!excluindo) return;
    setAops((prev) => prev.filter((aop) => aop.id !== excluindo.id));
    setExcluindo(null);
  };

  return (
    <div>
      {/* ── Header da seção ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-medium text-(--fg-primary)">
            AOPs conectados ao agente
          </h2>
          <span className="text-xs text-(--fg-tertiary)">
            {aops.length}{" "}
            {aops.length === 1 ? "procedimento" : "procedimentos"}
          </span>
        </div>
        <AwButton asChild variant="secondary" size="sm" iconLeft="add">
          <Link href="/aops">Adicionar AOP</Link>
        </AwButton>
      </div>

      {/* ── Tabela / estado vazio ──────────────────────────────────── */}
      {aops.length === 0 ? (
        <div className="mt-6 rounded-xl border border-(--border-subtle) bg-(--bg-canvas)">
          <AwEmpty>
            <AwEmptyHeader>
              <AwEmptyMedia variant="icon">
                <Icon name="description" size={24} />
              </AwEmptyMedia>
              <AwEmptyTitle>Nenhum AOP conectado</AwEmptyTitle>
              <AwEmptyDescription>
                Conecte procedimentos operacionais para orientar as decisões e
                ações deste agente.
              </AwEmptyDescription>
            </AwEmptyHeader>
            <AwEmptyContent>
              <AwButton asChild variant="primary" iconLeft="add">
                <Link href="/aops">Adicionar AOP</Link>
              </AwButton>
            </AwEmptyContent>
          </AwEmpty>
        </div>
      ) : (
        <div className="mt-6">
          <AwMembersTable
            columns={[
              { label: "AOP", icon: "description" },
              { label: "Status" },
              { label: "Criado por", icon: "person" },
              { label: "Última atualização", icon: "schedule" },
              { label: "", width: 52 },
            ]}
          >
            {aops.map((aop) => {
              const status = AOP_STATUS_META[aop.status];
              return (
                <tr key={aop.id}>
                  <td>
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-surface) text-(--fg-secondary)">
                        <Icon name="description" size={18} />
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-(length:--body-sm-size) font-medium text-(--fg-primary)">
                          {aop.nome}
                        </span>
                        <span className="truncate text-xs text-(--fg-tertiary)">
                          {aop.descricao}
                        </span>
                      </span>
                    </span>
                  </td>

                  <td>
                    <AwPill variant={status.variant}>{status.label}</AwPill>
                  </td>

                  <AwMembersTableTextCell muted className="whitespace-nowrap">
                    {aop.criadoPor}
                  </AwMembersTableTextCell>

                  <AwMembersTableTextCell muted className="whitespace-nowrap">
                    {aop.atualizadoEm}
                  </AwMembersTableTextCell>

                  <td>
                    <div className="flex items-center justify-end">
                      <AwDropdownMenu
                        align="end"
                        trigger={
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
                            aria-label={`Ações de ${aop.nome}`}
                          >
                            <Icon name="more_vert" size={20} />
                          </button>
                        }
                        items={[
                          {
                            id: "details",
                            label: "Ver detalhes",
                            icon: "open_in_new",
                            onSelect: () => setDetalhe(aop),
                          },
                          {
                            id: "toggle",
                            label:
                              aop.status === "ativo" ? "Desativar" : "Ativar",
                            icon:
                              aop.status === "ativo"
                                ? "toggle_off"
                                : "toggle_on",
                            onSelect: () => toggleStatus(aop.id),
                          },
                          { id: "sep", separator: true },
                          {
                            id: "delete",
                            label: "Excluir",
                            icon: "delete",
                            danger: true,
                            onSelect: () => setExcluindo(aop),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </AwMembersTable>
        </div>
      )}

      {/* ── Modal: detalhes ────────────────────────────────────────── */}
      <AwModal
        open={detalhe !== null}
        onClose={() => setDetalhe(null)}
        title={detalhe?.nome ?? "Detalhes do AOP"}
        footer={
          <AwButton variant="secondary" onClick={() => setDetalhe(null)}>
            Fechar
          </AwButton>
        }
      >
        {detalhe && (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-(--fg-secondary)">
              {detalhe.descricao}
            </p>
            <dl className="space-y-3 border-t border-(--border-subtle) pt-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-xs text-(--fg-tertiary)">Status</dt>
                <dd>
                  <AwPill variant={AOP_STATUS_META[detalhe.status].variant}>
                    {AOP_STATUS_META[detalhe.status].label}
                  </AwPill>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-xs text-(--fg-tertiary)">Criado por</dt>
                <dd className="text-sm text-(--fg-primary)">
                  {detalhe.criadoPor}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-xs text-(--fg-tertiary)">
                  Última atualização
                </dt>
                <dd className="text-sm text-(--fg-primary)">
                  {detalhe.atualizadoEm}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </AwModal>

      {/* ── Modal: confirmação de exclusão ─────────────────────────── */}
      <AwModal
        open={excluindo !== null}
        onClose={() => setExcluindo(null)}
        title="Excluir AOP"
        footer={
          <>
            <AwButton variant="secondary" onClick={() => setExcluindo(null)}>
              Cancelar
            </AwButton>
            <AwButton variant="danger" onClick={confirmarExclusao}>
              Excluir AOP
            </AwButton>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-(--fg-secondary)">
          O AOP{" "}
          <span className="font-medium text-(--fg-primary)">
            {excluindo?.nome}
          </span>{" "}
          deixa de orientar as decisões deste agente. Essa ação não exclui o
          procedimento da sua organização.
        </p>
      </AwModal>
    </div>
  );
}
