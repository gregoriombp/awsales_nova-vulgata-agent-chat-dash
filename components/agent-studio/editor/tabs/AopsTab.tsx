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
import { AwSheet, AwSheetRow } from "@/components/ui/AwSheet";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import type { AgentAop, AgentEditorData } from "@/lib/agentStudio";

const AOP_STATUS_META = {
  ativo: { label: "Ativo", variant: "live" as const },
  desativado: { label: "Desativado", variant: "neutral" as const },
};

/** Passos mock do protocolo — exibidos no drawer de detalhes. */
const AOP_PASSOS: Record<string, string[]> = {
  "aop-risco": [
    "Carregue o histórico de transações e sinalizações do usuário.",
    "Classifique o risco em baixo, médio ou alto conforme a política vigente.",
    "Risco alto: não avance — transfira para o time de segurança.",
    "Registre a classificação na conversa para os próximos checkpoints.",
  ],
  "aop-cases": [
    "Identifique o segmento e a dor principal verbalizada pelo lead.",
    "Selecione até 2 cases do mesmo segmento na biblioteca aprovada.",
    "Apresente resultado concreto (número) antes da história completa.",
    "Nunca cite clientes sem autorização pública de uso.",
  ],
  "aop-cadastro": [
    "Confirme a identidade do usuário antes de alterar qualquer dado.",
    "Atualize apenas os campos solicitados, um por vez.",
    "Releia o dado atualizado para o usuário confirmar.",
    "Registre a alteração no CRM conectado.",
  ],
};

const AOP_PASSOS_DEFAULT = [
  "Leia o contexto da conversa antes de iniciar o procedimento.",
  "Siga as instruções do protocolo na ordem definida.",
  "Em situação fora do escopo, transfira para atendimento humano.",
];

/**
 * AOPs — seção do editor de agente.
 *
 * Tabela na mesma receita da listagem do Agent Studio; clicar numa linha
 * abre o DRAWER de detalhes do protocolo (passos, status, meta). Ativar/
 * desativar e excluir agem só no estado local; "Adicionar AOP" leva à
 * página global de AOPs do produto.
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
                <tr
                  key={aop.id}
                  className="aw-row-clickable"
                  onClick={() => setDetalhe(aop)}
                >
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
                    <div
                      className="flex items-center justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
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

      {/* ── Drawer: detalhes do protocolo ──────────────────────────── */}
      <AwSheet
        open={detalhe !== null}
        onClose={() => setDetalhe(null)}
        title={
          <span className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--aw-pink-100) text-(--aw-pink-800)">
              <Icon name="description" size={18} />
            </span>
            {detalhe?.nome ?? "Detalhes do AOP"}
          </span>
        }
        meta={
          detalhe && (
            <AwPill variant={AOP_STATUS_META[detalhe.status].variant}>
              {AOP_STATUS_META[detalhe.status].label}
            </AwPill>
          )
        }
        footer={
          detalhe && (
            <div className="flex w-full items-center justify-between gap-3">
              <AwButton
                variant="ghost"
                size="md"
                iconLeft={
                  detalhe.status === "ativo" ? "toggle_off" : "toggle_on"
                }
                onClick={() => {
                  toggleStatus(detalhe.id);
                  setDetalhe((prev) =>
                    prev
                      ? {
                          ...prev,
                          status:
                            prev.status === "ativo" ? "desativado" : "ativo",
                        }
                      : prev,
                  );
                }}
              >
                {detalhe.status === "ativo" ? "Desativar" : "Ativar"}
              </AwButton>
              <AwButton asChild variant="secondary" size="md" iconLeft="edit">
                <Link href="/aops">Editar na página de AOPs</Link>
              </AwButton>
            </div>
          )
        }
      >
        {detalhe && (
          <div className="space-y-6">
            <p className="text-sm leading-relaxed text-(--fg-secondary)">
              {detalhe.descricao}
            </p>

            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-(--fg-tertiary)">
                Instruções do protocolo
              </h3>
              <ol className="mt-3 space-y-2.5">
                {(AOP_PASSOS[detalhe.id] ?? AOP_PASSOS_DEFAULT).map(
                  (passo, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-(--bg-hover) text-[11px] font-medium text-(--fg-secondary)">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-(--fg-secondary)">
                        {passo}
                      </span>
                    </li>
                  ),
                )}
              </ol>
            </div>

            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-(--fg-tertiary)">
                Sobre
              </h3>
              <div className="mt-2">
                <AwSheetRow label="Criado por">{detalhe.criadoPor}</AwSheetRow>
                <AwSheetRow label="Última atualização">
                  {detalhe.atualizadoEm}
                </AwSheetRow>
                <AwSheetRow label="Menção no editor">
                  <span className="text-(--aw-blue-600)">
                    @aop.{detalhe.id.replace(/^aop-/, "")}
                  </span>
                </AwSheetRow>
              </div>
            </div>
          </div>
        )}
      </AwSheet>

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
