"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import {
  CheckpointRichTextEditor,
  TokenText,
  type CheckpointRichTextHandle,
} from "@/components/agent-studio/editor/CheckpointRichText";
import { deriveHabilidades } from "@/components/agent-studio/editor/checkpointTokens";
import type {
  AgentEditorData,
  AgentVariable,
  Checkpoint,
  HabilidadeConfigurada,
} from "@/lib/agentStudio";

/**
 * Prompt e Checkpoint — personalidade do agente (prompt) + guia de execução
 * (checkpoints ordenados).
 *
 * O estado de prompt e checkpoints vive na página (/agent-studio/[id]) e
 * chega por props — editar aqui reflete imediatamente na Visualização
 * modular ao trocar de seção.
 *
 * O corpo do checkpoint é texto livre estilo Notion: `@` insere chips de
 * habilidade, `{{` insere chips de variável (CheckpointRichTextEditor).
 * As habilidades do card são derivadas das menções `@` presentes no texto.
 */

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function renumber(list: Checkpoint[]): Checkpoint[] {
  return list.map((cp, i) => ({ ...cp, numero: i + 1 }));
}

/** Ids locais para checkpoints novos/duplicados (estado de protótipo). */
let checkpointIdSeq = 0;
function nextCheckpointId(prefix: string): string {
  checkpointIdSeq += 1;
  return `${prefix}-${checkpointIdSeq}`;
}

function splitItens(text: string): string[] {
  return text
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

/** Registro do editor ativo — o painel de habilidades insere o @ por aqui. */
type InsertMentionFn = (habilidadeId: string) => void;

/* ─── Bloco A — Prompt do agente ───────────────────────────────────────── */

function PromptCard({
  prompt,
  onPromptChange,
  variaveis,
  onCreateVariable,
}: {
  prompt: string;
  onPromptChange: (next: string) => void;
  variaveis: AgentVariable[];
  onCreateVariable: (nome: string) => void;
}) {
  const [draft, setDraft] = React.useState(prompt);
  const [editing, setEditing] = React.useState(false);

  return (
    <section className="rounded-xl border border-(--border-subtle) bg-(--bg-surface) transition-colors duration-aw-fast hover:border-(--border-default)">
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
                onPromptChange(draft);
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
          <div className="space-y-2">
            <CheckpointRichTextEditor
              value={draft}
              onChange={setDraft}
              habilidades={[]}
              allowMentions={false}
              variaveis={variaveis}
              onCreateVariable={onCreateVariable}
              placeholder="Descreva a personalidade e o tom do agente…"
              aria-label="Prompt do agente"
              className="min-h-40"
            />
            <p className="flex items-center gap-1.5 text-xs text-(--fg-tertiary)">
              <Icon name="data_object" size={13} />
              {"Digite {{ para inserir uma variável."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-sm leading-relaxed text-(--fg-secondary)">
            {prompt.split(/\n\n+/).map((paragraph, i) => (
              <p key={i}>
                <TokenText text={paragraph} habilidades={[]} />
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
  /** Itens serializados — uma linha por item, tokens inline. */
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
  habilidades,
  variaveis,
  onCreateVariable,
  registerActiveEditor,
  onStartEdit,
  onSave,
  onCancel,
  onDuplicate,
  onRequestDelete,
}: {
  checkpoint: Checkpoint;
  editing: boolean;
  habilidades: HabilidadeConfigurada[];
  variaveis: AgentVariable[];
  onCreateVariable: (nome: string) => void;
  registerActiveEditor: (fn: InsertMentionFn) => void;
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

  const objetivoRef = React.useRef<CheckpointRichTextHandle>(null);
  const itensRef = React.useRef<CheckpointRichTextHandle>(null);

  // Re-sincroniza o rascunho sempre que o card entra em edição.
  React.useEffect(() => {
    if (editing) {
      setDraft({
        titulo: checkpoint.titulo,
        objetivo: checkpoint.objetivo,
        itens: checkpoint.itens.join("\n"),
      });
      // O editor de orientações nasce como alvo do painel de habilidades.
      registerActiveEditor((id) => itensRef.current?.insertMention(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const derivadasView = React.useMemo(
    () =>
      deriveHabilidades(
        [checkpoint.objetivo, ...checkpoint.itens],
        habilidades,
      ),
    [checkpoint.objetivo, checkpoint.itens, habilidades],
  );

  const derivadasDraft = React.useMemo(
    () =>
      deriveHabilidades(
        [draft.objetivo, ...splitItens(draft.itens)],
        habilidades,
      ),
    [draft.objetivo, draft.itens, habilidades],
  );

  return (
    <article
      className={`rounded-xl border bg-(--bg-surface) transition-[border-color,box-shadow] duration-aw-fast ${
        editing
          ? "border-(--border-strong) shadow-sm"
          : "border-(--border-subtle) hover:border-(--border-default)"
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
            <div className="min-w-0 flex-1">
              <CheckpointRichTextEditor
                ref={objetivoRef}
                value={draft.objetivo}
                onChange={(v) => setDraft((d) => ({ ...d, objetivo: v }))}
                habilidades={habilidades}
                variaveis={variaveis}
                onCreateVariable={onCreateVariable}
                multiline={false}
                placeholder="O que este checkpoint precisa alcançar…"
                aria-label="Objetivo do checkpoint"
                onFocus={() =>
                  registerActiveEditor((id) =>
                    objetivoRef.current?.insertMention(id),
                  )
                }
              />
            </div>
          ) : (
            <p className="pt-0.5 text-sm leading-relaxed text-(--fg-secondary)">
              <TokenText
                text={checkpoint.objetivo}
                habilidades={habilidades}
              />
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
              id={`itens-label-${checkpoint.id}`}
              className="mb-1.5 block text-xs font-medium text-(--fg-secondary)"
            >
              Orientações — um item por linha
            </label>
            <CheckpointRichTextEditor
              ref={itensRef}
              value={draft.itens}
              onChange={(v) => setDraft((d) => ({ ...d, itens: v }))}
              habilidades={habilidades}
              variaveis={variaveis}
              onCreateVariable={onCreateVariable}
              placeholder="Escreva as orientações do agente…"
              aria-label="Orientações do checkpoint"
              className="min-h-28"
              onFocus={() =>
                registerActiveEditor((id) =>
                  itensRef.current?.insertMention(id),
                )
              }
            />
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-(--fg-tertiary)">
              <Icon name="alternate_email" size={13} />
              {"Digite @ para habilidades e {{ para variáveis."}
            </p>
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
                    <TokenText text={item} habilidades={habilidades} />
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

        {/* Habilidades derivadas das menções @ no texto */}
        {(editing ? derivadasDraft : derivadasView).length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-(--border-subtle) pt-3.5">
            <span className="text-xs text-(--fg-tertiary)">
              Habilidades neste checkpoint
            </span>
            {(editing ? derivadasDraft : derivadasView).map((hab) => (
              <HabilidadeChip key={hab.id}>{hab.nome}</HabilidadeChip>
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
  onInsert,
}: {
  habilidades: HabilidadeConfigurada[];
  onInsert: (habilidadeId: string) => void;
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
          Habilidades que já estão configuradas para este agente. Para
          utilizar no checkpoint, digite @ ou insira por aqui.
        </p>

        <ul className="mt-4 space-y-1.5">
          {habilidades.map((hab) => {
            const expanded = expandedId === hab.id;
            return (
              <li
                key={hab.id}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) transition-colors duration-aw-fast hover:border-(--border-default)"
              >
                <div className="flex items-center gap-1 pr-1.5">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpandedId(expanded ? null : hab.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-aw-fast hover:bg-(--bg-hover)"
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
                  <AwButton
                    variant="ghost"
                    size="sm"
                    iconOnly="alternate_email"
                    aria-label={`Inserir @${hab.nome} no editor`}
                    onClick={() => onInsert(hab.id)}
                  />
                </div>
                {expanded && (
                  <div className="space-y-2.5 border-t border-(--border-subtle) px-3 py-2.5">
                    <p className="text-xs leading-relaxed text-(--fg-secondary)">
                      Para utilizar no checkpoint, digite{" "}
                      <span className="inline-flex items-center rounded bg-(--bg-hover) px-1.5 text-xs font-medium text-(--fg-secondary)">
                        @{hab.nome}
                      </span>
                    </p>
                    <AwButton
                      variant="secondary"
                      size="sm"
                      block
                      iconLeft="alternate_email"
                      onClick={() => onInsert(hab.id)}
                    >
                      Inserir no editor
                    </AwButton>
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

export function PromptCheckpointTab({
  data,
  checkpoints,
  onCheckpointsChange,
  prompt,
  onPromptChange,
}: {
  data: AgentEditorData;
  checkpoints: Checkpoint[];
  onCheckpointsChange: (next: Checkpoint[]) => void;
  prompt: string;
  onPromptChange: (next: string) => void;
}) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  /* Variáveis criadas pelo menu {{ — somam-se às do agente nos menus. */
  const [variaveisCriadas, setVariaveisCriadas] = React.useState<
    AgentVariable[]
  >([]);
  const variaveis = React.useMemo(
    () => [...data.variaveis, ...variaveisCriadas],
    [data.variaveis, variaveisCriadas],
  );
  const createVariable = React.useCallback((nome: string) => {
    setVariaveisCriadas((prev) =>
      prev.some((v) => v.nome === `{{${nome}}}`)
        ? prev
        : [
            ...prev,
            {
              nome: `{{${nome}}}`,
              tipo: "Texto",
              descricao: "Variável criada no editor de checkpoints.",
            },
          ],
    );
  }, []);

  /* Editor ativo — alvo do "Inserir no editor" do painel de habilidades. */
  const activeEditorInsert = React.useRef<InsertMentionFn | null>(null);
  const registerActiveEditor = React.useCallback((fn: InsertMentionFn) => {
    activeEditorInsert.current = fn;
  }, []);

  const deleteTarget = checkpoints.find((cp) => cp.id === deleteId) ?? null;
  const panelVisible = editingId !== null;

  const addCheckpoint = () => {
    const id = nextCheckpointId("cp-novo");
    onCheckpointsChange(
      renumber([
        ...checkpoints,
        {
          id,
          numero: checkpoints.length + 1,
          titulo: "",
          objetivo: "",
          itens: [],
        },
      ]),
    );
    setEditingId(id);
  };

  const saveCheckpoint = (id: string, draft: CheckpointDraft) => {
    onCheckpointsChange(
      checkpoints.map((cp) =>
        cp.id === id
          ? {
              ...cp,
              titulo: draft.titulo.trim() || "Checkpoint sem título",
              objetivo: draft.objetivo.trim(),
              itens: splitItens(draft.itens),
            }
          : cp,
      ),
    );
    setEditingId(null);
  };

  const cancelEdit = (id: string) => {
    // Checkpoint recém-criado e nunca salvo é descartado no cancelamento.
    const cp = checkpoints.find((c) => c.id === id);
    if (cp && cp.titulo === "" && cp.objetivo === "" && cp.itens.length === 0) {
      onCheckpointsChange(renumber(checkpoints.filter((c) => c.id !== id)));
    }
    setEditingId(null);
  };

  const duplicateCheckpoint = (id: string) => {
    const index = checkpoints.findIndex((cp) => cp.id === id);
    if (index === -1) return;
    const original = checkpoints[index];
    const copy: Checkpoint = {
      ...original,
      id: nextCheckpointId(`${original.id}-copia`),
      titulo: `${original.titulo} (cópia)`,
      analises: original.analises ? [...original.analises] : undefined,
      itens: [...original.itens],
      marque: original.marque
        ? { ...original.marque, opcoes: [...original.marque.opcoes] }
        : undefined,
    };
    const next = [...checkpoints];
    next.splice(index + 1, 0, copy);
    onCheckpointsChange(renumber(next));
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    onCheckpointsChange(
      renumber(checkpoints.filter((cp) => cp.id !== deleteId)),
    );
    if (editingId === deleteId) setEditingId(null);
    setDeleteId(null);
  };

  return (
    <div className="flex items-start gap-8">
      <div
        className={`min-w-0 flex-1 space-y-10 ${
          panelVisible ? "" : "mx-auto max-w-[840px]"
        }`}
      >
        {/* Bloco A — personalidade */}
        <PromptCard
          prompt={prompt}
          onPromptChange={onPromptChange}
          variaveis={variaveis}
          onCreateVariable={createVariable}
        />

        {/* Bloco B — checkpoints */}
        <section>
          <header className="mb-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h2 className="font-heading text-base font-medium text-(--fg-primary)">
                  Checkpoints
                </h2>
                <span className="text-sm text-(--fg-tertiary)">
                  {checkpoints.length}{" "}
                  {checkpoints.length === 1 ? "etapa" : "etapas"}
                </span>
              </div>
              <p className="mt-1 text-xs text-(--fg-tertiary)">
                {
                  "Etapas que guiam a conversa. No texto, digite @ para habilidades e {{ para variáveis."
                }
              </p>
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
                habilidades={data.habilidadesConfiguradas}
                variaveis={variaveis}
                onCreateVariable={createVariable}
                registerActiveEditor={registerActiveEditor}
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
        <HabilidadesPanel
          habilidades={data.habilidadesConfiguradas}
          onInsert={(id) => activeEditorInsert.current?.(id)}
        />
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
