"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import type { AgentVariable, HabilidadeConfigurada } from "@/lib/agentStudio";
import {
  parseTokenSegments,
  sanitizeVariableName,
  stripVariableBraces,
} from "./checkpointTokens";

/**
 * Editor de texto livre estilo Notion para o corpo do checkpoint.
 *
 * - `@` abre o menu de habilidades configuradas; selecionar insere um chip
 *   inline serializado como `@[id]`.
 * - `{{` abre o menu de variáveis (com a opção de criar uma nova); selecionar
 *   insere um chip serializado como `{{nome}}`.
 * - Os chips são spans `contenteditable=false` — apagam como um caractere só.
 * - O valor trafega sempre como string serializada (tokens inline), então o
 *   estado da página continua um `Checkpoint` simples.
 *
 * Resgatado do padrão VariableChipEditor do wizard antigo (parse → HTML com
 * chips → serialize do DOM), com menus ancorados no caret e navegação por
 * teclado (setas + Enter, Esc fecha).
 */

/* ─── Visual dos chips ─────────────────────────────────────────────────── */

const MENTION_CHIP_CLASS =
  "inline-flex items-center gap-1 rounded-md bg-(--aw-purple-100) px-1.5 text-xs font-medium text-(--aw-purple-800) align-baseline select-none";
const VARIABLE_CHIP_CLASS =
  "inline-flex items-center gap-1 rounded bg-(--bg-hover) px-1.5 text-xs font-medium text-(--fg-secondary) align-baseline select-none";

/** Réplica inline do <Icon /> para uso dentro de strings de HTML do editor. */
const CHIP_ICON_STYLE =
  "font-size:12px;line-height:1;font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 12";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chipIconHtml(name: string): string {
  return `<span class="material-symbols-rounded" style="${CHIP_ICON_STYLE}" aria-hidden="true">${name}</span>`;
}

function mentionChipHtml(id: string, nome: string): string {
  return `<span contenteditable="false" data-token="@[${escapeHtml(id)}]" class="${MENTION_CHIP_CLASS}">${chipIconHtml("alternate_email")}${escapeHtml(nome)}</span>`;
}

function variableChipHtml(name: string): string {
  return `<span contenteditable="false" data-token="{{${escapeHtml(name)}}}" class="${VARIABLE_CHIP_CLASS}">${chipIconHtml("data_object")}${escapeHtml(name)}</span>`;
}

/* ─── Render read-only (React) ─────────────────────────────────────────── */

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
        if (seg.type === "mention") {
          return (
            <span key={i} className={MENTION_CHIP_CLASS}>
              <Icon name="alternate_email" size={12} />
              {byId.get(seg.id)?.nome ?? seg.id}
            </span>
          );
        }
        return (
          <span key={i} className={VARIABLE_CHIP_CLASS}>
            <Icon name="data_object" size={12} />
            {seg.name}
          </span>
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
      if (seg.type === "mention") {
        return mentionChipHtml(seg.id, habById.get(seg.id)?.nome ?? seg.id);
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
  // Browsers às vezes embrulham linhas em <div> — vira quebra de linha.
  if (node.tagName === "DIV" || node.tagName === "P") out = `\n${out}`;
  return out;
}

function serializeEditorDom(root: HTMLElement): string {
  let out = "";
  root.childNodes.forEach((child) => {
    out += serializeNode(child);
  });
  return out.replace(/\u00a0/g, " ");
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
  kind: "mention" | "variable" | "create";
  /** id da habilidade ou nome (sem chaves) da variável. */
  value: string;
  label: string;
  descricao: string;
  icon: string;
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
  focus: () => void;
};

export type CheckpointRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  habilidades: HabilidadeConfigurada[];
  variaveis: AgentVariable[];
  /** Disparado quando o usuário cria uma variável nova pelo menu `{{`. */
  onCreateVariable?: (nome: string) => void;
  /** Desliga o menu `@` (ex.: prompt de personalidade). */
  allowMentions?: boolean;
  /** Permite quebras de linha com Enter. */
  multiline?: boolean;
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
    onCreateVariable,
    allowMentions = true,
    multiline = true,
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

  const [menu, setMenuState] = React.useState<MenuState | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  /* Espelho síncrono do menu — permite comparar kind/query fora do updater. */
  const menuRef = React.useRef<MenuState | null>(null);
  const setMenu = React.useCallback((next: MenuState | null) => {
    menuRef.current = next;
    setMenuState(next);
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

    const atMatch = allowMentions ? /(?:^|[^\w@])@([\w-]*)$/.exec(before) : null;
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
      Math.min(rect.left - wrapRect.left, wrapper.clientWidth - 296),
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
    }
    setMenu(next);
  }, [getTriggerContext, setMenu]);

  /* ── Itens do menu (filtrados pela query) ── */

  const items = React.useMemo<SuggestionItem[]>(() => {
    if (!menu) return [];
    const q = menu.query.trim().toLowerCase();
    if (menu.kind === "mention") {
      return habilidades
        .filter(
          (h) =>
            h.nome.toLowerCase().includes(q) || h.id.toLowerCase().includes(q),
        )
        .map((h) => ({
          key: `hab-${h.id}`,
          kind: "mention" as const,
          value: h.id,
          label: h.nome,
          descricao: h.descricao,
          icon: h.grupo === "integracao" ? "cable" : "smart_toy",
        }));
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
        icon: "add",
      });
    }
    return list;
  }, [menu, habilidades, variaveis]);

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
      const space = document.createTextNode("\u00a0");
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
          ? mentionChipHtml(item.value, habById.get(item.value)?.nome ?? item.value)
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
      commitChange,
      setMenu,
    ],
  );

  React.useImperativeHandle(
    ref,
    () => ({
      insertMention: (habilidadeId: string) => {
        const div = divRef.current;
        if (!div) return;
        div.focus();
        const saved = savedRangeRef.current;
        const range = document.createRange();
        if (saved && div.contains(saved.startContainer)) {
          range.setStart(saved.startContainer, saved.startOffset);
          range.collapse(true);
        } else {
          range.selectNodeContents(div);
          range.collapse(false);
        }
        insertChipAtRange(
          range,
          mentionChipHtml(
            habilidadeId,
            habById.get(habilidadeId)?.nome ?? habilidadeId,
          ),
        );
        commitChange();
      },
      focus: () => divRef.current?.focus(),
    }),
    [habById, insertChipAtRange, commitChange],
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
        }
      }
    },
    [menu, items, clampedIndex, selectItem, multiline, handleInput, setMenu],
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
      document.execCommand("insertText", false, multiline ? text : text.replace(/\n+/g, " "));
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
        className={`w-full whitespace-pre-wrap break-words rounded-lg border border-(--border-default) bg-(--bg-raised) px-3.5 py-3 text-sm leading-relaxed text-(--fg-primary) outline-none transition-colors duration-aw-fast focus:border-(--border-strong) empty:before:text-(--fg-tertiary) empty:before:content-[attr(data-placeholder)] ${className ?? ""}`}
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
      />

      {menu && items.length > 0 && (
        <div
          role="listbox"
          aria-label={`Sugestões de ${menuTitle.toLowerCase()}`}
          className="absolute z-30 w-72 overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised) shadow-lg"
          style={{ top: menu.top, left: menu.left }}
        >
          <p className="border-b border-(--border-subtle) px-3 py-1.5 text-xs font-medium text-(--fg-tertiary)">
            {menuTitle}
          </p>
          <ul className="max-h-56 overflow-y-auto p-1">
            {items.map((item, i) => (
              <li key={item.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === clampedIndex}
                  tabIndex={-1}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-aw-fast ${
                    i === clampedIndex ? "bg-(--bg-hover)" : "hover:bg-(--bg-hover)"
                  }`}
                  onMouseDown={(e) => {
                    // Mantém o foco/caret no editor durante o clique.
                    e.preventDefault();
                    selectItem(item);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <Icon
                    name={item.icon}
                    size={16}
                    className="shrink-0 text-(--fg-tertiary)"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-(--fg-primary)">
                      {item.label}
                    </span>
                    <span className="block truncate text-xs text-(--fg-tertiary)">
                      {item.descricao}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
