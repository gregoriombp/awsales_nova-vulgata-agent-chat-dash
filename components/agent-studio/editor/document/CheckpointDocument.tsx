"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckpointChip } from "@/components/ui/AwCheckpointChip";
import { AwModal } from "@/components/ui/AwModal";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import {
  CheckpointRichTextEditor,
  type CheckpointRichTextHandle,
  type TokenClick,
} from "@/components/agent-studio/editor/CheckpointRichText";
import type {
  AgentVariable,
  Checkpoint,
  CheckpointRegra,
  HabilidadeConfigurada,
} from "@/lib/agentStudio";

/**
 * Documento de checkpoints — o corpo do editor /agent-studio/[id]/checkpoints.
 *
 * Cada checkpoint é uma seção de INSTRUÇÕES EM LINGUAGEM NATURAL: um campo
 * branco contínuo onde o usuário escreve livremente e menciona tools (@),
 * variáveis ({{) e AOPs no meio do texto. Estruturas emergem do texto:
 *
 *   - o editor detecta frases condicionais ("se …, …") e sugere converter
 *     em uma regra estruturada;
 *   - marcações e regras existem como blocos discretos abaixo do texto;
 *   - clicar em qualquer chip abre as propriedades dele (modal).
 */

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

function renumber(list: Checkpoint[]): Checkpoint[] {
  return list.map((cp, i) => ({ ...cp, numero: i + 1 }));
}

export type ActiveEditorHandle = Pick<
  CheckpointRichTextHandle,
  "insertMention" | "insertVariable"
>;

type EditorCommonProps = {
  habilidades: HabilidadeConfigurada[];
  variaveis: AgentVariable[];
  onCreateVariable: (nome: string) => void;
  onEditorFocus: (handle: ActiveEditorHandle | null) => void;
  onTokenClick: (token: TokenClick) => void;
};

/** Editor rich inline já ligado ao registro de foco e ao clique em chips. */
function InlineEditor({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
  multiline = false,
  onEnterKey,
  onBackspaceEmpty,
  editorRef,
  habilidades,
  variaveis,
  onCreateVariable,
  onEditorFocus,
  onTokenClick,
}: EditorCommonProps & {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  multiline?: boolean;
  onEnterKey?: () => void;
  onBackspaceEmpty?: () => void;
  editorRef?: React.RefObject<CheckpointRichTextHandle | null>;
}) {
  const innerRef = React.useRef<CheckpointRichTextHandle>(null);
  const ref = editorRef ?? innerRef;
  const registerFocus = () => {
    const handle = ref.current;
    if (handle) {
      onEditorFocus({
        insertMention: (id) => handle.insertMention(id),
        insertVariable: (nome) => handle.insertVariable(nome),
      });
    }
  };

  return (
    <CheckpointRichTextEditor
      ref={ref}
      value={value}
      onChange={onChange}
      habilidades={habilidades}
      variaveis={variaveis}
      onCreateVariable={onCreateVariable}
      chrome="bare"
      multiline={multiline}
      onEnterKey={onEnterKey}
      onBackspaceEmpty={onBackspaceEmpty}
      onTokenClick={onTokenClick}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={className}
      onFocus={registerFocus}
    />
  );
}

/* ─── Autosugestão de regra ────────────────────────────────────────────── */

type RuleSuggestion = { frase: string; se: string; entao: string };

/** Remove tokens/formatação para comparar frases de forma estável. */
function plainText(text: string): string {
  return text
    .replace(/@\[[\w.-]+\]/g, " ")
    .replace(/\{\{[^{}]+\}\}/g, " ")
    .replace(/\*\*?/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Detecta a primeira frase condicional do corpo que ainda não virou regra:
 * "Se <condição>, <consequência>." (ou "Quando …"). Heurística leve — o
 * objetivo é o gesto do produto, não um parser de PT.
 */
export function detectRuleSuggestion(
  corpo: string,
  regras: CheckpointRegra[] | undefined,
  dismissed: ReadonlySet<string>,
): RuleSuggestion | null {
  const re =
    /(?:^|[.!?]\s+|\n)\s*(?:se|quando|caso)\s+([^,.\n]{6,90}),\s*([^.\n]{6,140})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(corpo)) !== null) {
    const se = m[1].trim();
    const entao = m[2].trim();
    const frase = plainText(`${se} ${entao}`);
    if (dismissed.has(frase)) continue;
    const exists = (regras ?? []).some(
      (r) =>
        plainText(r.se).includes(plainText(se).slice(0, 24)) ||
        plainText(se).includes(plainText(r.se).slice(0, 24)),
    );
    if (exists) continue;
    return { frase, se, entao };
  }
  return null;
}

function RuleSuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: {
  suggestion: RuleSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-linear-to-r from-(--aw-purple-100) to-(--aw-blue-100) py-2.5 pl-3.5 pr-2">
      <Icon
        name="auto_awesome"
        size={16}
        className="shrink-0 text-(--aw-purple-700)"
      />
      <p className="min-w-0 flex-1 truncate text-[13px] text-(--aw-purple-900)">
        Encontrei uma condição: <em>“se {suggestion.se}…”</em> — quer
        transformar em regra?
      </p>
      <button
        type="button"
        onClick={onAccept}
        className="shrink-0 rounded-md bg-(--bg-inverse) px-2.5 py-1 text-xs font-medium text-(--fg-on-inverse) transition-opacity duration-aw-fast hover:opacity-90"
      >
        Criar regra
      </button>
      <button
        type="button"
        aria-label="Dispensar sugestão"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-(--aw-purple-800) transition-colors duration-aw-fast hover:bg-(--aw-purple-100)"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}

/* ─── Bloco Marque ─────────────────────────────────────────────────────── */

function MarqueBlock({
  marque,
  onChange,
  onRemove,
  ...editor
}: EditorCommonProps & {
  marque: NonNullable<Checkpoint["marque"]>;
  onChange: (next: NonNullable<Checkpoint["marque"]>) => void;
  onRemove: () => void;
}) {
  const refs = React.useRef(new Map<number, CheckpointRichTextHandle | null>());
  const [pendingFocus, setPendingFocus] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (pendingFocus === null) return;
    refs.current.get(pendingFocus)?.focus();
    setPendingFocus(null);
  }, [pendingFocus]);

  const verbo = marque.verbo ?? "Marque";

  const setOpcao = (i: number, texto: string) => {
    onChange({
      ...marque,
      opcoes: marque.opcoes.map((o, j) => (j === i ? { ...o, texto } : o)),
    });
  };

  const addOpcao = (after?: number) => {
    const opcoes = [...marque.opcoes];
    const at = after === undefined ? opcoes.length : after + 1;
    opcoes.splice(at, 0, { texto: "" });
    onChange({ ...marque, opcoes });
    setPendingFocus(at);
  };

  const removeOpcao = (i: number) => {
    onChange({ ...marque, opcoes: marque.opcoes.filter((_, j) => j !== i) });
    if (i > 0) setPendingFocus(i - 1);
  };

  return (
    <div className="group/marque relative rounded-xl border border-(--border-subtle) p-4 transition-colors duration-aw-fast hover:border-(--border-default)">
      <div className="flex items-center gap-2.5 pr-8">
        <AwCheckpointChip tone="amber" icon="checklist" className="shrink-0">
          {verbo}
        </AwCheckpointChip>
        <div className="min-w-0 flex-1 text-sm font-medium text-(--fg-primary)">
          <InlineEditor
            value={marque.rotulo}
            onChange={(v) => onChange({ ...marque, rotulo: v })}
            ariaLabel="Rótulo da marcação"
            placeholder="o que o agente deve registrar…"
            {...editor}
          />
        </div>
      </div>

      <ul className="mt-3 space-y-0.5">
        {marque.opcoes.map((opcao, i) => (
          <li key={i} className="group/opcao flex items-start gap-2.5">
            <Icon
              name="radio_button_unchecked"
              size={15}
              className="mt-[7px] shrink-0 text-(--border-strong)"
            />
            <div className="min-w-0 flex-1">
              <InlineEditor
                value={opcao.texto}
                onChange={(v) => setOpcao(i, v)}
                ariaLabel={`Opção ${i + 1} da marcação`}
                placeholder="Texto da opção…"
                editorRef={{
                  get current() {
                    return refs.current.get(i) ?? null;
                  },
                  set current(value) {
                    refs.current.set(i, value);
                  },
                }}
                onEnterKey={() => addOpcao(i)}
                onBackspaceEmpty={() => removeOpcao(i)}
                {...editor}
              />
              {opcao.acoes !== undefined && (
                <div className="flex items-start gap-1.5 pl-1.5 text-sm text-(--fg-secondary)">
                  <Icon
                    name="arrow_forward"
                    size={14}
                    className="mt-[5px] shrink-0 text-(--fg-tertiary)"
                  />
                  <div className="min-w-0 flex-1">
                    <InlineEditor
                      value={opcao.acoes}
                      onChange={(v) =>
                        onChange({
                          ...marque,
                          opcoes: marque.opcoes.map((o, j) =>
                            j === i ? { ...o, acoes: v } : o,
                          ),
                        })
                      }
                      ariaLabel={`Ações da opção ${i + 1}`}
                      placeholder="@ ação encadeada…"
                      {...editor}
                    />
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label={`Remover opção ${i + 1}`}
              onClick={() => removeOpcao(i)}
              className="mt-1 rounded-md p-0.5 text-(--fg-tertiary) opacity-0 transition-opacity duration-aw-fast hover:bg-(--bg-hover) group-hover/opcao:opacity-100 focus-visible:opacity-100"
            >
              <Icon name="close" size={14} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => addOpcao()}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-secondary)"
        >
          <Icon name="add" size={14} />
          Adicionar opção
        </button>
        <p className="text-xs text-(--fg-tertiary)">
          Registrada pelo agente durante a conversa.
        </p>
      </div>

      <button
        type="button"
        aria-label="Remover bloco de marcação"
        onClick={onRemove}
        className="absolute right-2.5 top-2.5 rounded-md p-1 text-(--fg-tertiary) opacity-0 transition-opacity duration-aw-fast hover:bg-(--bg-hover) group-hover/marque:opacity-100 focus-visible:opacity-100"
      >
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}

/* ─── Regras (Se … então …) ────────────────────────────────────────────── */

function RuleRow({
  regra,
  onChange,
  onRemove,
  ...editor
}: EditorCommonProps & {
  regra: CheckpointRegra;
  onChange: (next: CheckpointRegra) => void;
  onRemove: () => void;
}) {
  return (
    <div className="group/regra -mx-2 flex items-start gap-2 rounded-lg px-2 py-1 transition-colors duration-aw-fast hover:bg-(--bg-hover)/50">
      <AwCheckpointChip tone="purple" icon="alt_route" className="mt-px shrink-0">
        Se
      </AwCheckpointChip>
      <div className="min-w-0 flex-[1.2] text-(--fg-secondary)">
        <InlineEditor
          value={regra.se}
          onChange={(v) => onChange({ ...regra, se: v })}
          ariaLabel="Condição da regra"
          placeholder="a condição, em linguagem natural…"
          {...editor}
        />
      </div>
      <span className="mt-1 shrink-0 text-sm text-(--fg-tertiary)">então</span>
      <div className="min-w-0 flex-1 text-(--fg-secondary)">
        <InlineEditor
          value={regra.entao}
          onChange={(v) => onChange({ ...regra, entao: v })}
          ariaLabel="Ação da regra"
          placeholder="@ ação…"
          {...editor}
        />
      </div>
      <button
        type="button"
        aria-label="Remover regra"
        onClick={onRemove}
        className="mt-1 shrink-0 rounded-md p-0.5 text-(--fg-tertiary) opacity-0 transition-opacity duration-aw-fast hover:bg-(--bg-hover) group-hover/regra:opacity-100 focus-visible:opacity-100"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}

/* ─── Seção de checkpoint ──────────────────────────────────────────────── */

function CheckpointSection({
  cp,
  isFirst,
  isLast,
  onPatch,
  onDuplicate,
  onAddBelow,
  onMove,
  onRequestDelete,
  ...editor
}: EditorCommonProps & {
  cp: Checkpoint;
  isFirst: boolean;
  isLast: boolean;
  onPatch: (patch: Partial<Checkpoint>) => void;
  onDuplicate: () => void;
  onAddBelow: () => void;
  onMove: (dir: -1 | 1) => void;
  onRequestDelete: () => void;
}) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(
    () => new Set(),
  );

  const suggestion = React.useMemo(
    () => detectRuleSuggestion(cp.corpo, cp.regras, dismissed),
    [cp.corpo, cp.regras, dismissed],
  );

  const acceptSuggestion = () => {
    if (!suggestion) return;
    onPatch({
      regras: [
        ...(cp.regras ?? []),
        { id: nextId("regra"), se: suggestion.se, entao: suggestion.entao },
      ],
    });
    setDismissed((prev) => new Set(prev).add(suggestion.frase));
  };

  const menuItems = [
    {
      id: "add-below",
      label: "Adicionar checkpoint abaixo",
      icon: "add",
      onSelect: onAddBelow,
    },
    {
      id: "duplicar",
      label: "Duplicar",
      icon: "content_copy",
      onSelect: onDuplicate,
    },
    ...(!isFirst
      ? [
          {
            id: "subir",
            label: "Mover para cima",
            icon: "arrow_upward",
            onSelect: () => onMove(-1),
          },
        ]
      : []),
    ...(!isLast
      ? [
          {
            id: "descer",
            label: "Mover para baixo",
            icon: "arrow_downward",
            onSelect: () => onMove(1),
          },
        ]
      : []),
    { id: "sep", separator: true as const },
    {
      id: "excluir",
      label: "Excluir",
      icon: "delete",
      danger: true,
      onSelect: onRequestDelete,
    },
  ];

  return (
    <section
      id={`cp-${cp.id}`}
      className="group/cp scroll-mt-32 px-9 py-8 first:pt-9 last:pb-10"
    >
      {/* Header da seção */}
      <header className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--bg-hover) font-heading text-[13px] font-medium text-(--fg-secondary)">
          {pad(cp.numero)}
        </span>
        <input
          value={cp.titulo}
          onChange={(e) => onPatch({ titulo: e.target.value })}
          placeholder="Título do checkpoint"
          aria-label={`Título do checkpoint ${pad(cp.numero)}`}
          className="-mx-1.5 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 font-heading text-[17px] font-medium tracking-tight text-(--fg-primary) outline-none transition-colors duration-aw-fast placeholder:text-(--fg-tertiary) hover:bg-(--bg-hover)/60 focus:bg-transparent"
        />
        <div className="shrink-0 opacity-0 transition-opacity duration-aw-fast focus-within:opacity-100 group-hover/cp:opacity-100">
          <AwDropdownMenu
            aria-label={`Ações do checkpoint ${pad(cp.numero)}`}
            trigger={
              <AwButton
                variant="ghost"
                size="sm"
                iconOnly="more_horiz"
                aria-label="Mais ações"
              />
            }
            items={menuItems}
          />
        </div>
      </header>

      <div className="mt-4 space-y-4 pl-10">
        {/* Objetivo */}
        <div className="flex items-start gap-2.5">
          <AwCheckpointChip tone="inverse" icon="target" className="mt-px shrink-0">
            Objetivo
          </AwCheckpointChip>
          <div className="min-w-0 flex-1 text-(--fg-secondary)">
            <InlineEditor
              value={cp.objetivo}
              onChange={(v) => onPatch({ objetivo: v })}
              ariaLabel={`Objetivo do checkpoint ${pad(cp.numero)}`}
              placeholder="O que este checkpoint precisa alcançar…"
              {...editor}
            />
          </div>
        </div>

        {/* Corpo — instruções em linguagem natural */}
        <div className="text-[15px] leading-7 text-(--fg-primary)">
          <InlineEditor
            value={cp.corpo}
            onChange={(v) => onPatch({ corpo: v })}
            multiline
            ariaLabel={`Instruções do checkpoint ${pad(cp.numero)}`}
            placeholder={
              "Escreva as instruções em linguagem natural — @ para tools e AOPs, {{ para variáveis…"
            }
            className="min-h-14 text-[15px] leading-7"
            {...editor}
          />
        </div>

        {/* Autosugestão de regra */}
        {suggestion && (
          <RuleSuggestionCard
            suggestion={suggestion}
            onAccept={acceptSuggestion}
            onDismiss={() =>
              setDismissed((prev) => new Set(prev).add(suggestion.frase))
            }
          />
        )}

        {/* Marque */}
        {cp.marque && (
          <MarqueBlock
            marque={cp.marque}
            onChange={(next) => onPatch({ marque: next })}
            onRemove={() => onPatch({ marque: undefined })}
            {...editor}
          />
        )}

        {/* Regras */}
        {cp.regras && cp.regras.length > 0 && (
          <div className="space-y-1">
            {cp.regras.map((regra) => (
              <RuleRow
                key={regra.id}
                regra={regra}
                onChange={(next) =>
                  onPatch({
                    regras: cp.regras!.map((r) =>
                      r.id === regra.id ? next : r,
                    ),
                  })
                }
                onRemove={() =>
                  onPatch({
                    regras: cp.regras!.filter((r) => r.id !== regra.id),
                  })
                }
                {...editor}
              />
            ))}
          </div>
        )}

        {/* Adicionar blocos */}
        <div className="flex flex-wrap items-center gap-1 pt-0.5 opacity-0 transition-opacity duration-aw-base focus-within:opacity-100 group-hover/cp:opacity-100">
          {!cp.marque && (
            <BlockAdder
              icon="checklist"
              label="Marcação"
              onClick={() =>
                onPatch({
                  marque: {
                    rotulo: "a resposta do lead",
                    opcoes: [{ texto: "" }],
                  },
                })
              }
            />
          )}
          <BlockAdder
            icon="alt_route"
            label="Regra"
            onClick={() =>
              onPatch({
                regras: [
                  ...(cp.regras ?? []),
                  { id: nextId("regra"), se: "", entao: "" },
                ],
              })
            }
          />
        </div>
      </div>
    </section>
  );
}

function BlockAdder({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <AwCheckpointChip
      as="button"
      onClick={onClick}
      tone="neutral"
      icon={icon}
      interactive
    >
      {label}
    </AwCheckpointChip>
  );
}

/* ─── Documento ────────────────────────────────────────────────────────── */

export function CheckpointDocument({
  checkpoints,
  onChange,
  ...editor
}: EditorCommonProps & {
  checkpoints: Checkpoint[];
  onChange: (next: Checkpoint[]) => void;
}) {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const deleteTarget = checkpoints.find((cp) => cp.id === deleteId) ?? null;

  const patchCp = (id: string, patch: Partial<Checkpoint>) => {
    onChange(
      checkpoints.map((cp) => (cp.id === id ? { ...cp, ...patch } : cp)),
    );
  };

  const duplicateCp = (id: string) => {
    const index = checkpoints.findIndex((cp) => cp.id === id);
    if (index === -1) return;
    const original = checkpoints[index];
    const copy: Checkpoint = JSON.parse(JSON.stringify(original));
    copy.id = nextId(`${original.id}-copia`);
    copy.titulo = `${original.titulo} (cópia)`;
    copy.regras = copy.regras?.map((r) => ({ ...r, id: nextId("regra") }));
    const next = [...checkpoints];
    next.splice(index + 1, 0, copy);
    onChange(renumber(next));
  };

  const moveCp = (id: string, dir: -1 | 1) => {
    const index = checkpoints.findIndex((cp) => cp.id === id);
    const target = index + dir;
    if (index === -1 || target < 0 || target >= checkpoints.length) return;
    const next = [...checkpoints];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(renumber(next));
  };

  const removeCp = () => {
    if (!deleteId) return;
    onChange(renumber(checkpoints.filter((cp) => cp.id !== deleteId)));
    setDeleteId(null);
  };

  const addCheckpoint = (afterId?: string) => {
    const id = nextId("cp-novo");
    const novo: Checkpoint = {
      id,
      numero: 0,
      titulo: "",
      objetivo: "",
      corpo: "",
    };
    const next = [...checkpoints];
    const at = afterId
      ? next.findIndex((cp) => cp.id === afterId) + 1
      : next.length;
    next.splice(at === 0 ? next.length : at, 0, novo);
    onChange(renumber(next));
    requestAnimationFrame(() => {
      document
        .getElementById(`cp-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <div className="aw-sheen-border rounded-2xl border border-(--border-subtle) bg-(--bg-surface) shadow-xs">
      {/* Anel em gradiente MEGA sutil circulando a borda (tratamento Gemini).
          O ::before desenha só o anel de 1px via mask composite; o sweep
          azul→roxo gira devagar por cima da borda estática do container.
          Vive aqui (e não no globals) por ser um efeito exclusivo do
          documento de checkpoints. */}
      <style>{`
        @property --aw-sheen-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes aw-sheen-spin {
          to { --aw-sheen-angle: 360deg; }
        }
        .aw-sheen-border { position: relative; }
        .aw-sheen-border::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          pointer-events: none;
          background: conic-gradient(
            from var(--aw-sheen-angle),
            transparent 0deg,
            var(--aw-blue-300) 40deg,
            var(--aw-purple-300) 80deg,
            var(--aw-blue-200) 120deg,
            transparent 160deg,
            transparent 360deg
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0.65;
          animation: aw-sheen-spin 9s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .aw-sheen-border::before { animation: none; }
        }
      `}</style>
      <div className="divide-y divide-(--border-subtle)">
        {checkpoints.map((cp, i) => (
          <CheckpointSection
            key={cp.id}
            cp={cp}
            isFirst={i === 0}
            isLast={i === checkpoints.length - 1}
            onPatch={(patch) => patchCp(cp.id, patch)}
            onDuplicate={() => duplicateCp(cp.id)}
            onAddBelow={() => addCheckpoint(cp.id)}
            onMove={(dir) => moveCp(cp.id, dir)}
            onRequestDelete={() => setDeleteId(cp.id)}
            {...editor}
          />
        ))}
      </div>

      <div className="px-9 pb-8">
        <button
          type="button"
          onClick={() => addCheckpoint()}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-(--border-default) px-4 py-3 text-sm font-medium text-(--fg-tertiary) transition-colors duration-aw-fast hover:border-(--border-strong) hover:bg-(--bg-hover) hover:text-(--fg-secondary)"
        >
          <Icon name="add" size={16} />
          Adicionar checkpoint
        </button>
      </div>

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
            <AwButton variant="danger" size="md" onClick={removeCp}>
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
