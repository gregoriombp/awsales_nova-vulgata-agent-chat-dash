"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import type {
  AgentEditorData,
  Checkpoint,
  HabilidadeConfigurada,
} from "@/lib/agentStudio";

/**
 * Prompt e Checkpoint — personalidade do agente (prompt) + guia de execução
 * (checkpoints ordenados). Quando um checkpoint entra em edição, o painel
 * lateral "Habilidades configuradas" aparece à direita, como no Figma.
 *
 * Todo o estado é local (protótipo): salvar/cancelar/duplicar/excluir
 * operam sobre cópias dos dados de `lib/agentStudio`.
 */

/* ─── Helpers ──────────────────────────────────────────────────────────── */

/** Renderiza texto com as {{variáveis}} como chips inline. */
function TextWithVariables({ text }: { text: string }) {
  const parts = text.split(/({{[^}]+}})/g);
  return (
    <>
      {parts.map((part, i) =>
        /^{{[^}]+}}$/.test(part) ? (
          <span
            key={i}
            className="inline-flex items-center rounded bg-(--bg-hover) px-1.5 text-xs font-medium text-(--fg-secondary)"
          >
            {part.replace(/[{}]/g, "")}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

const textareaClasses =
  "w-full resize-y rounded-lg border border-(--border-default) bg-(--bg-raised) px-3.5 py-3 text-sm leading-relaxed text-(--fg-primary) outline-none transition-colors duration-aw-fast placeholder:text-(--fg-tertiary) focus:border-(--border-strong)";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function renumber(list: Checkpoint[]): Checkpoint[] {
  return list.map((cp, i) => ({ ...cp, numero: i + 1 }));
}

/* ─── Bloco A — Prompt do agente ───────────────────────────────────────── */

function PromptCard({ initialPrompt }: { initialPrompt: string }) {
  const [prompt, setPrompt] = React.useState(initialPrompt);
  const [draft, setDraft] = React.useState(initialPrompt);
  const [editing, setEditing] = React.useState(false);

  return (
    <section className="rounded-xl border border-(--border-subtle) bg-(--bg-surface)">
      <header className="flex items-center justify-between gap-4 border-b border-(--border-subtle) px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="font-heading text-base font-medium text-(--fg-primary)">
            Prompt do agente
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-(--bg-hover) px-2.5 py-0.5 text-xs font-medium text-(--fg-secondary)">
            <Icon name="person" size={13} />
            Personalidade
          </span>
        </div>
        {editing ? (
          <div className="flex shrink-0 items-center gap-2">
            <AwButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft(prompt);
                setEditing(false);
              }}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="primary"
              size="sm"
              onClick={() => {
                setPrompt(draft);
                setEditing(false);
              }}
            >
              Salvar
            </AwButton>
          </div>
        ) : (
          <AwButton
            variant="ghost"
            size="sm"
            iconLeft="edit"
            className="shrink-0"
            onClick={() => {
              setDraft(prompt);
              setEditing(true);
            }}
          >
            Editar
          </AwButton>
        )}
      </header>

      <div className="px-6 py-5">
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            className={textareaClasses}
            aria-label="Prompt do agente"
          />
        ) : (
          <div className="space-y-4 text-sm leading-relaxed text-(--fg-secondary)">
            {prompt.split(/\n\n+/).map((paragraph, i) => (
              <p key={i}>
                <TextWithVariables text={paragraph} />
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Bloco B — card de checkpoint ─────────────────────────────────────── */

type CheckpointDraft = {
  titulo: string;
  objetivo: string;
  itens: string;
};

function AnaliseChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-(--aw-purple-100) px-2 py-0.5 text-xs font-medium text-(--aw-purple-800)">
      <Icon name="bolt" size={13} />
      {children}
    </span>
  );
}

function HabilidadeChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-md bg-(--bg-hover) px-2 py-0.5 text-xs font-medium text-(--fg-secondary)">
      <Icon name="alternate_email" size={13} />
      {children}
    </span>
  );
}

function CheckpointCard({
  checkpoint,
  editing,
  onStartEdit,
  onSave,
  onCancel,
  onDuplicate,
  onRequestDelete,
}: {
  checkpoint: Checkpoint;
  editing: boolean;
  onStartEdit: () => void;
  onSave: (draft: CheckpointDraft) => void;
  onCancel: () => void;
  onDuplicate: () => void;
  onRequestDelete: () => void;
}) {
  const [draft, setDraft] = React.useState<CheckpointDraft>({
    titulo: checkpoint.titulo,
    objetivo: checkpoint.objetivo,
    itens: checkpoint.itens.join("\n"),
  });

  // Re-sincroniza o rascunho sempre que o card entra em edição.
  React.useEffect(() => {
    if (editing) {
      setDraft({
        titulo: checkpoint.titulo,
        objetivo: checkpoint.objetivo,
        itens: checkpoint.itens.join("\n"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  return (
    <article
      className={`rounded-xl border bg-(--bg-surface) transition-colors duration-aw-fast ${
        editing ? "border-(--border-strong)" : "border-(--border-subtle)"
      }`}
    >
      {/* Linha de título + ações */}
      <header className="flex items-start justify-between gap-4 px-6 pt-5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Icon
            name="flag"
            size={16}
            className="shrink-0 text-(--fg-tertiary)"
          />
          <span className="shrink-0 text-sm font-medium text-(--fg-tertiary)">
            Checkpoint {pad(checkpoint.numero)}
          </span>
          <span aria-hidden="true" className="shrink-0 text-(--border-strong)">
            /
          </span>
          {editing ? (
            <AwInput
              dense
              value={draft.titulo}
              onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
              placeholder="Título do checkpoint"
              aria-label="Título do checkpoint"
              className="flex-1"
            />
          ) : (
            <h3 className="truncate text-sm font-medium text-(--fg-primary)">
              {checkpoint.titulo}
            </h3>
          )}
        </div>

        {editing ? (
          <div className="flex shrink-0 items-center gap-2">
            <AwButton variant="ghost" size="sm" onClick={onCancel}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" size="sm" onClick={() => onSave(draft)}>
              Salvar
            </AwButton>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1">
            <AwButton
              variant="ghost"
              size="sm"
              iconLeft="edit"
              onClick={onStartEdit}
            >
              Editar
            </AwButton>
            <AwDropdownMenu
              aria-label={`Ações do checkpoint ${pad(checkpoint.numero)}`}
              trigger={
                <AwButton
                  variant="ghost"
                  size="sm"
                  iconOnly="more_horiz"
                  aria-label="Mais ações"
                />
              }
              items={[
                {
                  id: "duplicar",
                  label: "Duplicar",
                  icon: "content_copy",
                  onSelect: onDuplicate,
                },
                { id: "sep", separator: true },
                {
                  id: "excluir",
                  label: "Excluir",
                  icon: "delete",
                  danger: true,
                  onSelect: onRequestDelete,
                },
              ]}
            />
          </div>
        )}
      </header>

      <div className="space-y-4 px-6 pb-6 pt-4">
        {/* Objetivo */}
        <div className="flex items-start gap-2.5">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-(--bg-inverse) px-2.5 py-0.5 text-xs font-medium text-(--fg-on-inverse)">
            <Icon name="target" size={13} />
            Objetivo
          </span>
          {editing ? (
            <textarea
              value={draft.objetivo}
              onChange={(e) => setDraft({ ...draft, objetivo: e.target.value })}
              rows={2}
              className={textareaClasses}
              aria-label="Objetivo do checkpoint"
            />
          ) : (
            <p className="pt-0.5 text-sm leading-relaxed text-(--fg-secondary)">
              {checkpoint.objetivo}
            </p>
          )}
        </div>

        {/* Chips de análise */}
        {checkpoint.analises && checkpoint.analises.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {checkpoint.analises.map((analise) => (
              <AnaliseChip key={analise}>{analise}</AnaliseChip>
            ))}
          </div>
        )}

        {/* Itens */}
        {editing ? (
          <div>
            <label
              htmlFor={`itens-${checkpoint.id}`}
              className="mb-1.5 block text-xs font-medium text-(--fg-secondary)"
            >
              Orientações — um item por linha
            </label>
            <textarea
              id={`itens-${checkpoint.id}`}
              value={draft.itens}
              onChange={(e) => setDraft({ ...draft, itens: e.target.value })}
              rows={4}
              className={textareaClasses}
            />
          </div>
        ) : (
          checkpoint.itens.length > 0 && (
            <ul className="space-y-1.5">
              {checkpoint.itens.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm leading-relaxed text-(--fg-secondary)"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-(--fg-tertiary)"
                  />
                  <span>
                    <TextWithVariables text={item} />
                  </span>
                </li>
              ))}
            </ul>
          )
        )}

        {/* Bloco "Marque" — instrução de classificação para o agente */}
        {checkpoint.marque && (
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-canvas) p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-(--bg-inverse) px-2 py-0.5 text-xs font-medium text-(--fg-on-inverse)">
                <Icon name="rule" size={13} />
                Marque
              </span>
              <span className="text-sm text-(--fg-primary)">
                {checkpoint.marque.rotulo}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {checkpoint.marque.opcoes.map((opcao) => (
                <li
                  key={opcao}
                  className="flex items-start gap-2 text-sm text-(--fg-secondary)"
                >
                  <Icon
                    name="radio_button_unchecked"
                    size={16}
                    className="mt-0.5 shrink-0 text-(--fg-tertiary)"
                  />
                  <span>{opcao}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-(--fg-tertiary)">
              Classificação registrada pelo agente durante a conversa — não é
              um campo preenchido por você.
            </p>
          </div>
        )}

        {/* Habilidades referenciadas via @ */}
        {checkpoint.habilidades && checkpoint.habilidades.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {checkpoint.habilidades.map((hab) => (
              <HabilidadeChip key={hab}>{hab}</HabilidadeChip>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ─── Painel lateral — Habilidades configuradas ────────────────────────── */

function HabilidadesPanel({
  habilidades,
}: {
  habilidades: HabilidadeConfigurada[];
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <aside className="w-[300px] shrink-0">
      <div className="sticky top-4 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-4">
        <div className="flex items-center gap-2">
          <Icon
            name="construction"
            size={16}
            className="text-(--fg-primary)"
          />
          <h3 className="text-sm font-medium text-(--fg-primary)">
            Habilidades configuradas
          </h3>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-(--fg-tertiary)">
          Habilidades que já estão configuradas para este agente. Para utilizar
          no checkpoint, digite @.
        </p>

        <ul className="mt-4 space-y-1.5">
          {habilidades.map((hab) => {
            const expanded = expandedId === hab.id;
            return (
              <li
                key={hab.id}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-raised)"
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpandedId(expanded ? null : hab.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-aw-fast hover:bg-(--bg-hover)"
                >
                  <Icon
                    name={hab.grupo === "integracao" ? "cable" : "smart_toy"}
                    size={16}
                    className="shrink-0 text-(--fg-tertiary)"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-(--fg-primary)">
                      {hab.nome}
                    </span>
                    <span className="block truncate text-xs text-(--fg-tertiary)">
                      {hab.descricao}
                    </span>
                  </span>
                  <Icon
                    name={expanded ? "expand_less" : "expand_more"}
                    size={18}
                    className="shrink-0 text-(--fg-tertiary)"
                  />
                </button>
                {expanded && (
                  <div className="border-t border-(--border-subtle) px-3 py-2.5">
                    <p className="text-xs leading-relaxed text-(--fg-secondary)">
                      Para utilizar no checkpoint, digite{" "}
                      <span className="inline-flex items-center rounded bg-(--bg-hover) px-1.5 text-xs font-medium text-(--fg-secondary)">
                        @{hab.nome}
                      </span>
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

/* ─── Tab ──────────────────────────────────────────────────────────────── */

export function PromptCheckpointTab({ data }: { data: AgentEditorData }) {
  const [checkpoints, setCheckpoints] = React.useState<Checkpoint[]>(
    data.checkpoints,
  );
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const deleteTarget = checkpoints.find((cp) => cp.id === deleteId) ?? null;
  const panelVisible = editingId !== null;

  const addCheckpoint = () => {
    const id = `cp-novo-${Date.now()}`;
    setCheckpoints((prev) =>
      renumber([
        ...prev,
        {
          id,
          numero: prev.length + 1,
          titulo: "",
          objetivo: "",
          itens: [],
        },
      ]),
    );
    setEditingId(id);
  };

  const saveCheckpoint = (id: string, draft: CheckpointDraft) => {
    setCheckpoints((prev) =>
      prev.map((cp) =>
        cp.id === id
          ? {
              ...cp,
              titulo: draft.titulo.trim() || "Checkpoint sem título",
              objetivo: draft.objetivo.trim(),
              itens: draft.itens
                .split("\n")
                .map((linha) => linha.trim())
                .filter(Boolean),
            }
          : cp,
      ),
    );
    setEditingId(null);
  };

  const cancelEdit = (id: string) => {
    // Checkpoint recém-criado e nunca salvo é descartado no cancelamento.
    setCheckpoints((prev) => {
      const cp = prev.find((c) => c.id === id);
      if (
        cp &&
        cp.titulo === "" &&
        cp.objetivo === "" &&
        cp.itens.length === 0
      ) {
        return renumber(prev.filter((c) => c.id !== id));
      }
      return prev;
    });
    setEditingId(null);
  };

  const duplicateCheckpoint = (id: string) => {
    setCheckpoints((prev) => {
      const index = prev.findIndex((cp) => cp.id === id);
      if (index === -1) return prev;
      const original = prev[index];
      const copy: Checkpoint = {
        ...original,
        id: `${original.id}-copia-${Date.now()}`,
        titulo: `${original.titulo} (cópia)`,
        analises: original.analises ? [...original.analises] : undefined,
        itens: [...original.itens],
        marque: original.marque
          ? { ...original.marque, opcoes: [...original.marque.opcoes] }
          : undefined,
        habilidades: original.habilidades
          ? [...original.habilidades]
          : undefined,
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return renumber(next);
    });
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setCheckpoints((prev) => renumber(prev.filter((cp) => cp.id !== deleteId)));
    if (editingId === deleteId) setEditingId(null);
    setDeleteId(null);
  };

  return (
    <div className="flex items-start gap-8">
      <div
        className={`min-w-0 flex-1 space-y-8 ${
          panelVisible ? "" : "mx-auto max-w-[840px]"
        }`}
      >
        {/* Bloco A — personalidade */}
        <PromptCard initialPrompt={data.prompt} />

        {/* Bloco B — checkpoints */}
        <section>
          <header className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <h2 className="font-heading text-base font-medium text-(--fg-primary)">
                Checkpoints
              </h2>
              <span className="text-sm text-(--fg-tertiary)">
                {checkpoints.length}{" "}
                {checkpoints.length === 1 ? "etapa" : "etapas"}
              </span>
            </div>
            <AwButton
              variant="secondary"
              size="sm"
              iconLeft="add"
              onClick={addCheckpoint}
            >
              Adicionar checkpoint
            </AwButton>
          </header>

          <div className="space-y-4">
            {checkpoints.map((cp) => (
              <CheckpointCard
                key={cp.id}
                checkpoint={cp}
                editing={editingId === cp.id}
                onStartEdit={() => setEditingId(cp.id)}
                onSave={(draft) => saveCheckpoint(cp.id, draft)}
                onCancel={() => cancelEdit(cp.id)}
                onDuplicate={() => duplicateCheckpoint(cp.id)}
                onRequestDelete={() => setDeleteId(cp.id)}
              />
            ))}
            {checkpoints.length === 0 && (
              <div className="rounded-xl border border-dashed border-(--border-default) px-6 py-10 text-center">
                <p className="text-sm text-(--fg-secondary)">
                  Nenhum checkpoint definido.
                </p>
                <p className="mt-1 text-xs text-(--fg-tertiary)">
                  Adicione o primeiro checkpoint para guiar a conversa do
                  agente.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Painel lateral — visível só durante a edição de um checkpoint */}
      {panelVisible && (
        <HabilidadesPanel habilidades={data.habilidadesConfiguradas} />
      )}

      {/* Confirmação de exclusão */}
      <AwModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Excluir checkpoint"
        footer={
          <>
            <AwButton
              variant="ghost"
              size="md"
              onClick={() => setDeleteId(null)}
            >
              Cancelar
            </AwButton>
            <AwButton variant="danger" size="md" onClick={confirmDelete}>
              Excluir checkpoint
            </AwButton>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-(--fg-secondary)">
          {deleteTarget
            ? `O Checkpoint ${pad(deleteTarget.numero)} — ${
                deleteTarget.titulo || "sem título"
              } — será removido do guia de execução do agente.`
            : ""}{" "}
          Esta ação não pode ser desfeita.
        </p>
      </AwModal>
    </div>
  );
}
