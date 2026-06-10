"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckpointChip } from "@/components/ui/AwCheckpointChip";
import {
  CheckpointRichTextEditor,
  MentionChip,
  TokenText,
} from "@/components/agent-studio/editor/CheckpointRichText";
import {
  checkpointTexts,
  deriveHabilidades,
} from "@/components/agent-studio/editor/checkpointTokens";
import type {
  AgentEditorData,
  AgentVariable,
  Checkpoint,
  HabilidadeConfigurada,
} from "@/lib/agentStudio";

/**
 * Prompt e Checkpoint — personalidade do agente (prompt) + guia de execução
 * (checkpoints em linguagem natural).
 *
 * O prompt edita aqui mesmo; os checkpoints são leitura — a edição acontece
 * no documento dedicado (/agent-studio/[id]/checkpoints). As duas seções
 * compartilham o mesmo layout: header de seção + conteúdo, sem card no
 * prompt.
 */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/* ─── Seção A — Prompt do agente ───────────────────────────────────────── */

function PromptSection({
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
    <section>
      <header className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="font-heading text-base font-medium text-(--fg-primary)">
              Prompt do agente
            </h2>
            <AwCheckpointChip tone="neutral" icon="person">
              Personalidade
            </AwCheckpointChip>
          </div>
          <p className="mt-1 text-xs text-(--fg-tertiary)">
            Como o agente se apresenta e conversa — vale para todos os
            checkpoints.
          </p>
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
    </section>
  );
}

/* ─── Seção B — card de checkpoint (leitura) ───────────────────────────── */

function CheckpointCard({
  checkpoint,
  habilidades,
  editorHref,
}: {
  checkpoint: Checkpoint;
  habilidades: HabilidadeConfigurada[];
  editorHref: string;
}) {
  const derivadas = React.useMemo(
    () => deriveHabilidades(checkpointTexts(checkpoint), habilidades),
    [checkpoint, habilidades],
  );

  return (
    <article className="group/card rounded-xl border border-(--border-subtle) bg-(--bg-surface) transition-[border-color,box-shadow] duration-aw-fast hover:border-(--border-default) hover:shadow-xs">
      {/* Linha de título + ação */}
      <header className="flex items-center justify-between gap-4 px-6 pt-5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-(--bg-hover) text-xs font-medium text-(--fg-secondary)">
            {pad(checkpoint.numero)}
          </span>
          <h3 className="truncate text-sm font-medium text-(--fg-primary)">
            {checkpoint.titulo}
          </h3>
        </div>
        <AwButton
          asChild
          variant="ghost"
          size="sm"
          iconLeft="edit"
          className="shrink-0 opacity-0 transition-opacity duration-aw-fast focus-visible:opacity-100 group-hover/card:opacity-100"
        >
          <Link href={editorHref}>Editar</Link>
        </AwButton>
      </header>

      <div className="space-y-4 px-6 pb-6 pt-3.5">
        {/* Objetivo */}
        <div className="flex items-start gap-2.5">
          <AwCheckpointChip tone="inverse" icon="target" className="shrink-0">
            Objetivo
          </AwCheckpointChip>
          <p className="pt-0.5 text-sm leading-relaxed text-(--fg-secondary)">
            <TokenText text={checkpoint.objetivo} habilidades={habilidades} />
          </p>
        </div>

        {/* Instruções em linguagem natural */}
        {checkpoint.corpo && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-(--fg-secondary)">
            <TokenText text={checkpoint.corpo} habilidades={habilidades} />
          </p>
        )}

        {/* Bloco Marque */}
        {checkpoint.marque && (
          <div className="rounded-xl border border-(--border-subtle) p-4">
            <div className="flex items-center gap-2">
              <AwCheckpointChip tone="amber" icon="checklist">
                {checkpoint.marque.verbo ?? "Marque"}
              </AwCheckpointChip>
              <span className="text-sm font-medium text-(--fg-primary)">
                <TokenText
                  text={checkpoint.marque.rotulo}
                  habilidades={habilidades}
                />
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {checkpoint.marque.opcoes.map((opcao, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Icon
                    name="radio_button_unchecked"
                    size={15}
                    className="mt-[3px] shrink-0 text-(--border-strong)"
                  />
                  <span className="min-w-0">
                    <span className="leading-relaxed text-(--fg-secondary)">
                      <TokenText
                        text={opcao.texto}
                        habilidades={habilidades}
                      />
                    </span>
                    {opcao.acoes && (
                      <span className="mt-0.5 flex flex-wrap items-center gap-1 leading-relaxed text-(--fg-secondary)">
                        <Icon
                          name="arrow_forward"
                          size={13}
                          className="text-(--fg-tertiary)"
                        />
                        <TokenText
                          text={opcao.acoes}
                          habilidades={habilidades}
                        />
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-(--fg-tertiary)">
              Classificação registrada pelo agente durante a conversa — não é
              um campo preenchido por você.
            </p>
          </div>
        )}

        {/* Regras */}
        {checkpoint.regras && checkpoint.regras.length > 0 && (
          <div className="space-y-1.5">
            {checkpoint.regras.map((regra) => (
              <p
                key={regra.id}
                className="flex flex-wrap items-center gap-1.5 text-sm leading-relaxed text-(--fg-secondary)"
              >
                <AwCheckpointChip tone="purple" icon="alt_route">
                  Se
                </AwCheckpointChip>
                <TokenText text={regra.se} habilidades={habilidades} />
                <span className="text-(--fg-tertiary)">então</span>
                <TokenText text={regra.entao} habilidades={habilidades} />
              </p>
            ))}
          </div>
        )}

        {/* Habilidades derivadas das menções @ no texto */}
        {derivadas.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-(--border-subtle) pt-3.5">
            <span className="text-xs text-(--fg-tertiary)">
              Tools neste checkpoint
            </span>
            {derivadas.map((hab) => (
              <MentionChip key={hab.id} id={hab.id} hab={hab} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ─── Tab ──────────────────────────────────────────────────────────────── */

export function PromptCheckpointTab({
  data,
  checkpoints,
  prompt,
  onPromptChange,
}: {
  data: AgentEditorData;
  checkpoints: Checkpoint[];
  /** Mantido na assinatura por compatibilidade — edição vive no documento. */
  onCheckpointsChange?: (next: Checkpoint[]) => void;
  prompt: string;
  onPromptChange: (next: string) => void;
}) {
  /* Variáveis criadas pelo menu {{ do prompt — somam-se às do agente. */
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
              grupo: "Personalizadas",
            },
          ],
    );
  }, []);

  const editorBase = `/agent-studio/${data.agent.id}/checkpoints`;

  return (
    <div className="mx-auto max-w-[840px] space-y-12">
      {/* Seção A — personalidade */}
      <PromptSection
        prompt={prompt}
        onPromptChange={onPromptChange}
        variaveis={variaveis}
        onCreateVariable={createVariable}
      />

      <div className="border-t border-(--border-subtle)" />

      {/* Seção B — checkpoints */}
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
              Instruções em linguagem natural com tools, AOPs e variáveis —
              edite tudo no documento.
            </p>
          </div>
          <AwButton
            asChild
            variant="secondary"
            size="sm"
            iconLeft="edit_note"
            className="shrink-0"
          >
            <Link href={editorBase}>Editar checkpoints</Link>
          </AwButton>
        </header>

        <div className="space-y-4">
          {checkpoints.map((cp) => (
            <CheckpointCard
              key={cp.id}
              checkpoint={cp}
              habilidades={data.habilidadesConfiguradas}
              editorHref={`${editorBase}#cp-${cp.id}`}
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
              <AwButton
                asChild
                variant="secondary"
                size="sm"
                iconLeft="add"
                className="mt-4"
              >
                <Link href={editorBase}>Adicionar checkpoint</Link>
              </AwButton>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
