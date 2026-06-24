"use client";

import * as React from "react";
import {
  AwCheckpointChip,
  AW_CHECKPOINT_CHIP_BASE_CLASS,
  AW_CHECKPOINT_CHIP_INTERACTIVE_CLASS,
  AW_CHECKPOINT_CHIP_TONE_CLASS,
  GOOGLE_CALENDAR_BRAND,
  GOOGLE_CALENDAR_ICON_SRC,
  type AwCheckpointChipTone,
} from "@/components/ui/AwCheckpointChip";
import { AwMentionMenu } from "@/components/ui/AwMentionMenu";
import {
  skillTone,
  type AgentVariable,
  type HabilidadeConfigurada,
  type SkillGroup,
} from "@/lib/agentStudio";
import {
  parseTokenSegments,
  sanitizeVariableName,
  stripVariableBraces,
} from "./checkpointTokens";

/**
 * Editor de texto livre estilo Notion para o corpo do checkpoint.
 *
 * - `@` abre o menu de habilidades do catálogo; selecionar insere um chip
 *   inline serializado como `@[id]`.
 * - `{{` abre o menu de variáveis (com a opção de criar uma nova); selecionar
 *   insere um chip serializado como `{{nome}}`.
 * - Cards do painel de habilidades podem ser ARRASTADOS para o texto — o chip
 *   entra na posição do cursor de drop (drag and drop nativo).
 * - Negrito/itálico (toolbar ou ⌘B/⌘I) serializam como `**…**` / `*…*`.
 * - Os chips são spans `contenteditable=false` — apagam como um caractere só.
 * - O valor trafega sempre como string serializada (tokens inline), então o
 *   estado da página continua um `Checkpoint` simples.
 */

/* ─── Visual dos chips ─────────────────────────────────────────────────── */

/** MIME do drag de habilidade (painel → editor). */
export const SKILL_DRAG_MIME = "application/x-aw-skill";

/** Variáveis são dados, não ações — chip cinza neutro. */
const VARIABLE_CHIP_CLASS = `${AW_CHECKPOINT_CHIP_BASE_CLASS} ${AW_CHECKPOINT_CHIP_TONE_CLASS.neutral}`;

function skillChipTone(hab: HabilidadeConfigurada | undefined): AwCheckpointChipTone {
  return skillTone(hab) as AwCheckpointChipTone;
}

function skillBrand(hab: HabilidadeConfigurada | undefined): string | undefined {
  if (hab?.grupo === "google-calendar" || hab?.id.startsWith("googlecal.")) {
    return GOOGLE_CALENDAR_BRAND;
  }
  return undefined;
}

function mentionChipClass(hab: HabilidadeConfigurada | undefined): string {
  const tone = skillChipTone(hab);
  return `${AW_CHECKPOINT_CHIP_BASE_CLASS} ${AW_CHECKPOINT_CHIP_TONE_CLASS[tone]}`;
}

/** Réplica inline do <Icon /> para uso dentro de strings de HTML do editor. */
const CHIP_ICON_STYLE =
  "font-size:14px;line-height:1;font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 200,'opsz' 20";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chipIconHtml(name: string, brand?: string): string {
  if (brand === GOOGLE_CALENDAR_BRAND) {
    return `<span class="inline-flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-(--border-subtle) bg-white" aria-hidden="true"><img src="${GOOGLE_CALENDAR_ICON_SRC}" alt="" class="block h-full w-full object-cover" /></span>`;
  }
  return `<span class="material-symbols-rounded" style="${CHIP_ICON_STYLE}" aria-hidden="true">${name}</span>`;
}

function mentionChipHtml(
  id: string,
  hab: HabilidadeConfigurada | undefined,
): string {
  const nome = hab?.nome ?? id;
  const icon = hab?.icon ?? "alternate_email";
  const brand = skillBrand(hab);
  return `<span contenteditable="false" data-token="@[${escapeHtml(id)}]" title="Clique para ver as propriedades" class="${mentionChipClass(hab)} ${AW_CHECKPOINT_CHIP_INTERACTIVE_CLASS}">${chipIconHtml(icon, brand)}${escapeHtml(nome)}</span>`;
}

function variableChipHtml(name: string): string {
  return `<span contenteditable="false" data-token="{{${escapeHtml(name)}}}" title="Clique para ver as propriedades" class="${VARIABLE_CHIP_CLASS} ${AW_CHECKPOINT_CHIP_INTERACTIVE_CLASS}">${chipIconHtml("data_object")}${escapeHtml(name)}</span>`;
}

/* ─── Render read-only (React) ─────────────────────────────────────────── */

/** Chip de menção standalone — mesmas cores do editor, para usos em React. */
export function MentionChip({
  hab,
  id,
}: {
  hab: HabilidadeConfigurada | undefined;
  id: string;
}) {
  return (
    <AwCheckpointChip
      tone={skillChipTone(hab)}
      brand={skillBrand(hab)}
      icon={hab?.icon ?? "alternate_email"}
    >
      {hab?.nome ?? id}
    </AwCheckpointChip>
  );
}

/** Texto com tokens renderizados como chips — para os cards fora de edição. */
export function TokenText({
  text,
  habilidades,
}: {
  text: string;
  habilidades: HabilidadeConfigurada[];
}) {
  const byId = React.useMemo(
    () => new Map(habilidades.map((h) => [h.id, h])),
    [habilidades],
  );
  return (
    <>
      {parseTokenSegments(text).map((seg, i) => {
        if (seg.type === "text") {
          return <React.Fragment key={i}>{seg.content}</React.Fragment>;
        }
        if (seg.type === "bold") {
          return (
            <strong key={i} className="font-medium text-(--fg-primary)">
              {seg.content}
            </strong>
          );
        }
        if (seg.type === "italic") {
          return <em key={i}>{seg.content}</em>;
        }
        if (seg.type === "mention") {
          return <MentionChip key={i} id={seg.id} hab={byId.get(seg.id)} />;
        }
        return (
          <AwCheckpointChip key={i} tone="neutral" icon="data_object">
            {seg.name}
          </AwCheckpointChip>
        );
      })}
    </>
  );
}

/* ─── Serialização DOM ↔ valor ─────────────────────────────────────────── */

function valueToHtml(
  value: string,
  habById: Map<string, HabilidadeConfigurada>,
): string {
  return parseTokenSegments(value)
    .map((seg) => {
      if (seg.type === "text") {
        return escapeHtml(seg.content).replace(/\n/g, "<br>");
      }
      if (seg.type === "bold") return `<b>${escapeHtml(seg.content)}</b>`;
      if (seg.type === "italic") return `<i>${escapeHtml(seg.content)}</i>`;
      if (seg.type === "mention") {
        return mentionChipHtml(seg.id, habById.get(seg.id));
      }
      return variableChipHtml(seg.name);
    })
    .join("");
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";
  if (node.dataset.token) return node.dataset.token;
  if (node.tagName === "BR") return "\n";
  let out = "";
  node.childNodes.forEach((child) => {
    out += serializeNode(child);
  });
  // Formatação aplicada pelo execCommand vira marcação leve no valor.
  if (node.tagName === "B" || node.tagName === "STRONG") {
    return out.trim() ? `**${out}**` : out;
  }
  if (node.tagName === "I" || node.tagName === "EM") {
    return out.trim() ? `*${out}*` : out;
  }
  // Browsers às vezes embrulham linhas em <div> — vira quebra de linha.
  if (node.tagName === "DIV" || node.tagName === "P") out = `\n${out}`;
  return out;
}

function serializeEditorDom(root: HTMLElement): string {
  let out = "";
  root.childNodes.forEach((child) => {
    out += serializeNode(child);
  });
  return out.replace(/ /g, " ");
}

/* ─── Menu de sugestões ────────────────────────────────────────────────── */

type MenuKind = "mention" | "variable";

type MenuState = {
  kind: MenuKind;
  query: string;
  top: number;
  left: number;
};

type SuggestionItem = {
  key: string;
  kind: "mention" | "variable" | "create" | "integration" | "new-integration";
  /** id da habilidade, nome (sem chaves) da variável ou id do grupo. */
  value: string;
  label: string;
  descricao: string;
  icon: string;
  brand?: string;
};

type TriggerContext = {
  kind: MenuKind;
  query: string;
  node: Text;
  /** Offset onde o gatilho começa (inclui `@` / `{{`). */
  start: number;
  /** Offset do caret. */
  end: number;
};

/* ─── Editor ───────────────────────────────────────────────────────────── */

export type CheckpointRichTextHandle = {
  /** Insere uma menção `@[id]` na posição atual do caret (ou no fim). */
  insertMention: (habilidadeId: string) => void;
  /** Insere uma variável `{{nome}}` na posição atual do caret (ou no fim). */
  insertVariable: (nome: string) => void;
  focus: () => void;
};

/** Token clicado dentro do editor — abre o modal de propriedades. */
export type TokenClick =
  | { kind: "mention"; id: string }
  | { kind: "variable"; name: string };

export function parseTokenAttr(token: string): TokenClick | null {
  const mention = /^@\[([\w.-]+)\]$/.exec(token);
  if (mention) return { kind: "mention", id: mention[1] };
  const variable = /^\{\{([^{}]+)\}\}$/.exec(token);
  if (variable) return { kind: "variable", name: variable[1].trim() };
  return null;
}

export type CheckpointRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  habilidades: HabilidadeConfigurada[];
  variaveis: AgentVariable[];
  /**
   * Grupos da DSL — separa tools nativas de integrações no menu `@`
   * (integrações viram drill-in com o logo da marca). Sem isso, o menu
   * mostra a lista corrida de habilidades.
   */
  grupos?: SkillGroup[];
  /** Disparado quando o usuário cria uma variável nova pelo menu `{{`. */
  onCreateVariable?: (nome: string) => void;
  /** "+ Nova Integração" no rodapé do menu `@` — abre o catálogo. */
  onRequestNewIntegration?: () => void;
  /** Desliga o menu `@` (ex.: prompt de personalidade). */
  allowMentions?: boolean;
  /** Permite quebras de linha com Enter. */
  multiline?: boolean;
  /**
   * Visual do campo: `field` é o input com borda; `bare` é edição inline no
   * documento (sem chrome — o bloco ao redor dá o contexto).
   */
  chrome?: "field" | "bare";
  /** Enter num editor single-line (ex.: cria o próximo item da lista). */
  onEnterKey?: () => void;
  /** Backspace com o editor vazio (ex.: remove o item e foca o anterior). */
  onBackspaceEmpty?: () => void;
  /** Clique num chip dentro do texto (abre propriedades). */
  onTokenClick?: (token: TokenClick) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
  onFocus?: () => void;
};

export const CheckpointRichTextEditor = React.forwardRef<
  CheckpointRichTextHandle,
  CheckpointRichTextEditorProps
>(function CheckpointRichTextEditor(
  {
    value,
    onChange,
    habilidades,
    variaveis,
    grupos,
    onCreateVariable,
    onRequestNewIntegration,
    allowMentions = true,
    multiline = true,
    chrome = "field",
    onEnterKey,
    onBackspaceEmpty,
    onTokenClick,
    placeholder,
    className,
    "aria-label": ariaLabel,
    onFocus,
  },
  ref,
) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const divRef = React.useRef<HTMLDivElement>(null);
  const savedRangeRef = React.useRef<Range | null>(null);
  const [dropActive, setDropActive] = React.useState(false);

  const [menu, setMenuState] = React.useState<MenuState | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  /* Drill-in de integração no menu @ (id do grupo aberto). */
  const [submenu, setSubmenu] = React.useState<string | null>(null);
  /* Espelho síncrono do menu — permite comparar kind/query fora do updater. */
  const menuRef = React.useRef<MenuState | null>(null);
  const setMenu = React.useCallback((next: MenuState | null) => {
    menuRef.current = next;
    setMenuState(next);
    if (!next) setSubmenu(null);
  }, []);

  const habById = React.useMemo(
    () => new Map(habilidades.map((h) => [h.id, h])),
    [habilidades],
  );

  /* Sincroniza o DOM quando o valor externo muda (e só nesse caso —
   * comparar com o serialize preserva o caret durante a digitação). */
  React.useEffect(() => {
    const div = divRef.current;
    if (!div) return;
    if (serializeEditorDom(div) === value) return;
    div.innerHTML = value ? valueToHtml(value, habById) : "";
    savedRangeRef.current = null;
  }, [value, habById]);

  const saveSelection = React.useCallback(() => {
    const sel = window.getSelection();
    const div = divRef.current;
    if (!sel || sel.rangeCount === 0 || !div) return;
    const range = sel.getRangeAt(0);
    if (div.contains(range.startContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }, []);

  /* ── Detecção do gatilho @ / {{ antes do caret ── */

  const getTriggerContext = React.useCallback((): TriggerContext | null => {
    const sel = window.getSelection();
    const div = divRef.current;
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed || !div) return null;
    const node = sel.anchorNode;
    if (!node || node.nodeType !== Node.TEXT_NODE || !div.contains(node)) {
      return null;
    }
    const offset = sel.anchorOffset;
    const before = (node.textContent ?? "").slice(0, offset);

    const atMatch = allowMentions
      ? /(?:^|[^\w@])@([\w.-]*)$/.exec(before)
      : null;
    const varMatch = /\{\{([^{}]*)$/.exec(before);

    const atStart = atMatch ? before.lastIndexOf("@", offset) : -1;
    const varStart = varMatch ? before.lastIndexOf("{{") : -1;

    if (atMatch && atStart >= varStart) {
      return {
        kind: "mention",
        query: atMatch[1],
        node: node as Text,
        start: offset - atMatch[1].length - 1,
        end: offset,
      };
    }
    if (varMatch && varStart >= 0) {
      return {
        kind: "variable",
        query: varMatch[1],
        node: node as Text,
        start: offset - varMatch[1].length - 2,
        end: offset,
      };
    }
    return null;
  }, [allowMentions]);

  const updateMenu = React.useCallback(() => {
    const ctx = getTriggerContext();
    const wrapper = wrapperRef.current;
    if (!ctx || !wrapper) {
      setMenu(null);
      return;
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setMenu(null);
      return;
    }
    const caret = sel.getRangeAt(0).cloneRange();
    caret.collapse(true);
    let rect = caret.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0 && rect.top === 0) {
      rect = (divRef.current as HTMLElement).getBoundingClientRect();
    }
    const wrapRect = wrapper.getBoundingClientRect();
    const left = Math.max(
      0,
      Math.min(rect.left - wrapRect.left, wrapper.clientWidth - 264),
    );
    const prev = menuRef.current;
    const next: MenuState = {
      kind: ctx.kind,
      query: ctx.query,
      top: rect.bottom - wrapRect.top + 6,
      left,
    };
    if (!prev || prev.kind !== next.kind || prev.query !== next.query) {
      setActiveIndex(0);
      // Digitar uma busca sai do drill-in — a query varre tudo.
      if (next.query) setSubmenu(null);
    }
    setMenu(next);
  }, [getTriggerContext, setMenu]);

  /* ── Itens do menu (filtrados pela query) ── */

  const integracaoGrupos = React.useMemo(
    () => (grupos ?? []).filter((g) => Boolean(g.brand)),
    [grupos],
  );
  const integracaoIds = React.useMemo(
    () => new Set(integracaoGrupos.map((g) => g.id)),
    [integracaoGrupos],
  );

  const skillItem = React.useCallback(
    (h: HabilidadeConfigurada): SuggestionItem => ({
      key: `hab-${h.id}`,
      kind: "mention",
      value: h.id,
      label: h.nome,
      descricao: `@${h.id}`,
      icon: h.icon ?? "alternate_email",
      brand: skillBrand(h),
    }),
    [],
  );

  const items = React.useMemo<SuggestionItem[]>(() => {
    if (!menu) return [];
    const q = menu.query.trim().toLowerCase();
    if (menu.kind === "mention") {
      // Digitando: busca corrida em TODAS as habilidades (inclusive de
      // integrações) — o drill-in só organiza o modo de navegação.
      if (q) {
        return habilidades
          .filter(
            (h) =>
              h.nome.toLowerCase().includes(q) ||
              h.id.toLowerCase().includes(q),
          )
          .slice(0, 12)
          .map(skillItem);
      }
      // Drill-in: habilidades da integração aberta.
      if (submenu) {
        return habilidades.filter((h) => h.grupo === submenu).map(skillItem);
      }
      // Navegação: nativas no topo, integrações como drill-in, ação no fim.
      const nativas = habilidades
        .filter((h) => !integracaoIds.has(h.grupo))
        .map(skillItem);
      const integracoes: SuggestionItem[] = integracaoGrupos.map((g) => ({
        key: `int-${g.id}`,
        kind: "integration",
        value: g.id,
        label: g.nome,
        descricao: g.descricao,
        icon: g.icon,
        brand: g.brand,
      }));
      const acao: SuggestionItem[] = onRequestNewIntegration
        ? [
            {
              key: "new-integration",
              kind: "new-integration",
              value: "",
              label: "Nova Integração",
              descricao: "Conectar uma nova plataforma.",
              icon: "add",
            },
          ]
        : [];
      return [...nativas, ...integracoes, ...acao];
    }
    const list: SuggestionItem[] = variaveis
      .filter((v) => {
        const nome = stripVariableBraces(v.nome).toLowerCase();
        return nome.includes(q) || v.descricao.toLowerCase().includes(q);
      })
      .map((v) => {
        const nome = stripVariableBraces(v.nome);
        return {
          key: `var-${nome}`,
          kind: "variable" as const,
          value: nome,
          label: `{{${nome}}}`,
          descricao: v.descricao,
          icon: "data_object",
        };
      });
    const created = sanitizeVariableName(menu.query);
    if (
      created &&
      !variaveis.some((v) => stripVariableBraces(v.nome) === created)
    ) {
      list.push({
        key: `create-${created}`,
        kind: "create",
        value: created,
        label: `Criar variável "{{${created}}}"`,
        descricao: "Fica disponível para este agente.",
        icon: "auto_awesome",
      });
    }
    return list;
  }, [
    menu,
    submenu,
    habilidades,
    variaveis,
    integracaoGrupos,
    integracaoIds,
    skillItem,
    onRequestNewIntegration,
  ]);

  const clampedIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));

  /* ── Inserção de chips ── */

  const placeCaretAfter = React.useCallback((node: Node) => {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    savedRangeRef.current = range.cloneRange();
  }, []);

  const insertChipAtRange = React.useCallback(
    (range: Range, html: string) => {
      const template = document.createElement("template");
      template.innerHTML = html;
      const chip = template.content.firstChild as HTMLElement;
      range.deleteContents();
      range.insertNode(chip);
      // Espaço NBSP depois do chip mantém o caret visível e a digitação fluida.
      const space = document.createTextNode(" ");
      chip.after(space);
      placeCaretAfter(space);
    },
    [placeCaretAfter],
  );

  const commitChange = React.useCallback(() => {
    const div = divRef.current;
    if (!div) return;
    onChange(serializeEditorDom(div));
  }, [onChange]);

  const selectItem = React.useCallback(
    (item: SuggestionItem) => {
      // Itens de navegação não inserem nada no texto.
      if (item.kind === "integration") {
        setSubmenu(item.value);
        setActiveIndex(0);
        return;
      }
      if (item.kind === "new-integration") {
        setMenu(null);
        onRequestNewIntegration?.();
        return;
      }
      const div = divRef.current;
      if (!div) return;
      const ctx = getTriggerContext();
      const range = document.createRange();
      if (ctx) {
        range.setStart(ctx.node, ctx.start);
        range.setEnd(ctx.node, ctx.end);
      } else if (savedRangeRef.current) {
        range.setStart(
          savedRangeRef.current.startContainer,
          savedRangeRef.current.startOffset,
        );
        range.collapse(true);
      } else {
        range.selectNodeContents(div);
        range.collapse(false);
      }
      const html =
        item.kind === "mention"
          ? mentionChipHtml(item.value, habById.get(item.value))
          : variableChipHtml(item.value);
      insertChipAtRange(range, html);
      if (item.kind === "create") onCreateVariable?.(item.value);
      commitChange();
      setMenu(null);
    },
    [
      getTriggerContext,
      habById,
      insertChipAtRange,
      onCreateVariable,
      onRequestNewIntegration,
      commitChange,
      setMenu,
    ],
  );

  /** Range no fim do conteúdo ou no caret salvo — alvo de inserções externas. */
  const fallbackRange = React.useCallback((): Range => {
    const div = divRef.current as HTMLDivElement;
    const saved = savedRangeRef.current;
    const range = document.createRange();
    if (saved && div.contains(saved.startContainer)) {
      range.setStart(saved.startContainer, saved.startOffset);
      range.collapse(true);
    } else {
      range.selectNodeContents(div);
      range.collapse(false);
    }
    return range;
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      insertMention: (habilidadeId: string) => {
        const div = divRef.current;
        if (!div) return;
        div.focus();
        insertChipAtRange(
          fallbackRange(),
          mentionChipHtml(habilidadeId, habById.get(habilidadeId)),
        );
        commitChange();
      },
      insertVariable: (nome: string) => {
        const div = divRef.current;
        if (!div) return;
        div.focus();
        insertChipAtRange(fallbackRange(), variableChipHtml(nome));
        commitChange();
      },
      focus: () => divRef.current?.focus(),
    }),
    [habById, insertChipAtRange, commitChange, fallbackRange],
  );

  /* ── Drag and drop do painel de habilidades ── */

  const rangeFromPoint = React.useCallback(
    (x: number, y: number): Range | null => {
      type CaretDoc = Document & {
        caretRangeFromPoint?: (x: number, y: number) => Range | null;
        caretPositionFromPoint?: (
          x: number,
          y: number,
        ) => { offsetNode: Node; offset: number } | null;
      };
      const doc = document as CaretDoc;
      if (doc.caretRangeFromPoint) return doc.caretRangeFromPoint(x, y);
      const pos = doc.caretPositionFromPoint?.(x, y);
      if (!pos) return null;
      const range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.collapse(true);
      return range;
    },
    [],
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!allowMentions) return;
      if (!e.dataTransfer.types.includes(SKILL_DRAG_MIME)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setDropActive(true);
    },
    [allowMentions],
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      setDropActive(false);
      const skillId = e.dataTransfer.getData(SKILL_DRAG_MIME);
      if (!skillId) return;
      e.preventDefault();
      const div = divRef.current;
      if (!div) return;
      div.focus();
      let range = rangeFromPoint(e.clientX, e.clientY);
      if (!range || !div.contains(range.startContainer)) {
        range = fallbackRange();
      }
      insertChipAtRange(range, mentionChipHtml(skillId, habById.get(skillId)));
      commitChange();
    },
    [rangeFromPoint, fallbackRange, insertChipAtRange, habById, commitChange],
  );

  /* ── Eventos do editor ── */

  const handleInput = React.useCallback(() => {
    commitChange();
    updateMenu();
  }, [commitChange, updateMenu]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (menu && items.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIndex((i) => (i + 1) % items.length);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((i) => (i - 1 + items.length) % items.length);
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          selectItem(items[clampedIndex]);
          return;
        }
        if (e.key === "ArrowRight" && items[clampedIndex]?.kind === "integration") {
          e.preventDefault();
          selectItem(items[clampedIndex]);
          return;
        }
        if (e.key === "ArrowLeft" && submenu) {
          e.preventDefault();
          setSubmenu(null);
          setActiveIndex(0);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setMenu(null);
          return;
        }
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (multiline) {
          // <br> em vez do <div> default — serialização previsível.
          document.execCommand("insertLineBreak");
          handleInput();
        } else {
          onEnterKey?.();
        }
        return;
      }
      if (e.key === "Backspace" && value === "") {
        e.preventDefault();
        onBackspaceEmpty?.();
      }
    },
    [
      menu,
      items,
      clampedIndex,
      selectItem,
      submenu,
      multiline,
      handleInput,
      setMenu,
      onEnterKey,
      onBackspaceEmpty,
      value,
    ],
  );

  const handleKeyUp = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      saveSelection();
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
        updateMenu();
      }
    },
    [saveSelection, updateMenu],
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      // Cola sempre como texto puro — markup externo quebraria a serialização.
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand(
        "insertText",
        false,
        multiline ? text : text.replace(/\n+/g, " "),
      );
      handleInput();
    },
    [multiline, handleInput],
  );

  const menuTitle = menu?.kind === "mention" ? "Habilidades" : "Variáveis";

  return (
    <div ref={wrapperRef} className="relative">
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline={multiline}
        aria-label={ariaLabel}
        data-placeholder={placeholder ?? ""}
        spellCheck={false}
        className={`w-full whitespace-pre-wrap break-words text-sm leading-relaxed text-(--fg-primary) outline-none transition-colors duration-aw-fast empty:before:text-(--fg-tertiary) empty:before:content-[attr(data-placeholder)] ${
          chrome === "field"
            ? `rounded-lg border bg-(--bg-raised) px-3.5 py-3 focus:border-(--border-strong) ${
                dropActive
                  ? "border-(--accent-brand) bg-(--aw-slate-100)"
                  : "border-(--border-default)"
              }`
            : `-mx-1.5 rounded-md border px-1.5 py-0.5 ${
                dropActive
                  ? "border-(--accent-brand) bg-(--aw-slate-100)"
                  : "border-transparent"
              }`
        } ${className ?? ""}`}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onMouseUp={() => {
          saveSelection();
          updateMenu();
        }}
        onPaste={handlePaste}
        onFocus={onFocus}
        onBlur={() => {
          saveSelection();
          setMenu(null);
        }}
        onClick={(e) => {
          if (!onTokenClick) return;
          const chip = (e.target as HTMLElement).closest?.("[data-token]");
          if (!chip) return;
          const parsed = parseTokenAttr(
            (chip as HTMLElement).dataset.token ?? "",
          );
          if (parsed) onTokenClick(parsed);
        }}
        onDragOver={handleDragOver}
        onDragLeave={() => setDropActive(false)}
        onDrop={handleDrop}
      />

      {menu && items.length > 0 && (
        <AwMentionMenu
          aria-label={`Sugestões de ${menuTitle.toLowerCase()}`}
          className="absolute z-30"
          style={{ top: menu.top, left: menu.left }}
          activeKey={items[clampedIndex]?.key}
          onHover={(key) => {
            const i = items.findIndex((item) => item.key === key);
            if (i >= 0) setActiveIndex(i);
          }}
          onPick={(key) => {
            const item = items.find((it) => it.key === key);
            if (item) selectItem(item);
          }}
          header={
            submenu
              ? {
                  label:
                    integracaoGrupos.find((g) => g.id === submenu)?.nome ??
                    "Integração",
                  onBack: () => {
                    setSubmenu(null);
                    setActiveIndex(0);
                  },
                }
              : undefined
          }
          sections={[
            {
              entries: items
                .filter((it) => it.kind !== "integration" && it.kind !== "new-integration")
                .map((it) => ({
                  key: it.key,
                  label: it.label,
                  icon: it.icon,
                  brand: it.brand,
                  accent: it.kind === "create" ? ("purple" as const) : undefined,
                })),
            },
            {
              label: "Integrações",
              entries: [
                ...items
                  .filter((it) => it.kind === "integration")
                  .map((it) => ({
                    key: it.key,
                    label: it.label,
                    icon: it.icon,
                    brand: it.brand,
                    chevron: true,
                  })),
                // "Nova integração" desce pra última opção da seção — é mais um
                // item, não uma ação fixa no rodapé.
                ...items
                  .filter((it) => it.kind === "new-integration")
                  .map((it) => ({
                    key: it.key,
                    label: it.label,
                    icon: it.icon,
                    accent: "purple" as const,
                  })),
              ],
            },
          ]}
        />
      )}
    </div>
  );
});
