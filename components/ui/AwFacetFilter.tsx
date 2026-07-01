"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { AwInput } from "./AwInput";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

/* ===================================================================== *
 * AwFacetFilter — filtro multi-seleção pesquisável, agrupado por categoria.
 *
 * Um só controle para "afunilar por faceta": trigger no mesmo estilo dos
 * filtros da toolbar → popover com busca, grupos (ícone/emoji + rótulo +
 * contagem + checkbox de grupo com estado indeterminado) e opções com
 * checkbox e uma tag técnica opcional (mono). Semântica SUBTRATIVA: com
 * tudo marcado não há filtro; o gatilho só ganha o badge "· N" quando o
 * conjunto é afunilado — igual aos demais filtros da página.
 *
 * O Radix DropdownMenu não serve aqui: digitar num Item briga com a
 * navegação por teclado. O Popover deixa o campo de busca focável.
 * ===================================================================== */

export type AwFacetOption = {
  id: string;
  /** Rótulo exibido. Se `searchText` faltar e isto for string, vira a busca. */
  label: React.ReactNode;
  /** Texto usado no match da busca (quando `label` não é string). */
  searchText?: string;
  /** Tag técnica em mono, à esquerda do rótulo (ex.: `fatura`, `membro`). */
  tag?: string;
};

export type AwFacetGroup = {
  id: string;
  label: string;
  /** Ícone Material Symbols (quando não houver emoji). */
  icon?: string;
  /** Emoji do cabeçalho do grupo — tem prioridade visual sobre `icon`. */
  emoji?: string;
  options: AwFacetOption[];
};

export type AwFacetFilterProps = {
  triggerIcon: string;
  triggerLabel: string;
  groups: AwFacetGroup[];
  /** Ids selecionados. Subtrativo: todos selecionados = sem filtro. */
  selected: string[];
  onChange: (next: string[]) => void;
  searchPlaceholder?: string;
  align?: "start" | "end";
  /** Rótulo do estado vazio da busca. */
  emptyLabel?: string;
  "aria-label"?: string;
};

const TRIGGER_CLASS =
  "inline-flex h-10 items-center gap-2 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-3 body-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:border-(--border-default) hover:text-(--fg-primary) data-[state=open]:border-(--border-default) data-[state=open]:text-(--fg-primary)";

/** Indicador visual (não interativo) — o próprio botão da linha faz o toggle,
 *  então a caixa é só um <span> decorativo. Isso evita <button> aninhado
 *  dentro de <button> (HTML inválido) sem abrir mão do visual do AwCheckbox. */
function FacetCheck({ state }: { state: boolean | "indeterminate" }) {
  const active = state !== false;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm border transition-colors duration-aw-fast",
        active
          ? "border-(--fg-primary) bg-(--fg-primary) text-(--bg-raised)"
          : "border-(--border-default) bg-(--bg-raised) text-transparent",
      )}
    >
      {state === "indeterminate" ? (
        <Icon name="remove" size={14} weight={700} />
      ) : state === true ? (
        <Icon name="check" size={14} weight={700} />
      ) : null}
    </span>
  );
}

function optionSearchText(o: AwFacetOption): string {
  const base =
    o.searchText ?? (typeof o.label === "string" ? o.label : o.id);
  return `${base} ${o.tag ?? ""}`.toLowerCase();
}

export function AwFacetFilter({
  triggerIcon,
  triggerLabel,
  groups,
  selected,
  onChange,
  searchPlaceholder = "Buscar…",
  align = "start",
  emptyLabel = "Nada encontrado.",
  "aria-label": ariaLabel,
}: AwFacetFilterProps) {
  const [query, setQuery] = React.useState("");

  const allIds = React.useMemo(
    () => groups.flatMap((g) => g.options.map((o) => o.id)),
    [groups],
  );
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const activeCount = allIds.filter((id) => !selectedSet.has(id)).length;

  const q = query.trim().toLowerCase();
  const visibleGroups = React.useMemo(() => {
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        options: g.options.filter((o) => optionSearchText(o).includes(q)),
      }))
      .filter((g) => g.options.length > 0);
  }, [groups, q]);

  const toggle = (id: string) => {
    onChange(
      selectedSet.has(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  };

  const toggleGroup = (group: AwFacetGroup) => {
    const ids = group.options.map((o) => o.id);
    const allOn = ids.every((id) => selectedSet.has(id));
    if (allOn) {
      onChange(selected.filter((x) => !ids.includes(x)));
    } else {
      const merged = new Set(selected);
      ids.forEach((id) => merged.add(id));
      onChange(Array.from(merged));
    }
  };

  const groupState = (group: AwFacetGroup): boolean | "indeterminate" => {
    const ids = group.options.map((o) => o.id);
    const on = ids.filter((id) => selectedSet.has(id)).length;
    if (on === 0) return false;
    if (on === ids.length) return true;
    return "indeterminate";
  };

  return (
    <Popover onOpenChange={(open) => !open && setQuery("")}>
      <PopoverTrigger asChild>
        <button type="button" className={TRIGGER_CLASS} aria-label={ariaLabel}>
          <Icon name={triggerIcon} size={16} />
          <span>
            {triggerLabel}
            {activeCount > 0 ? ` · ${allIds.length - activeCount}` : ""}
          </span>
          <Icon name="expand_more" size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={6}
        className="w-[300px] rounded-lg border-(--border-subtle) bg-(--bg-raised) p-0 text-(--fg-primary) shadow-(--shadow-lg)"
      >
        <div className="border-b border-(--border-subtle) p-2">
          <AwInput
            iconLeft="search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={searchPlaceholder}
          />
        </div>

        <div className="max-h-[320px] overflow-y-auto p-1.5">
          {visibleGroups.length === 0 ? (
            <p className="px-2 py-6 text-center body-xs text-(--fg-tertiary)">
              {emptyLabel}
            </p>
          ) : (
            visibleGroups.map((group) => (
              <div key={group.id} className="mb-1 last:mb-0">
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  aria-pressed={groupState(group) === true}
                  className="flex w-full items-center gap-2 rounded-md bg-(--bg-muted) px-2 py-1.5 text-left transition-colors hover:bg-(--bg-hover)"
                >
                  <FacetCheck state={groupState(group)} />
                  <span className="inline-flex min-w-0 flex-1 items-center gap-1.5">
                    {group.emoji ? (
                      <span aria-hidden="true" className="text-[13px] leading-none">
                        {group.emoji}
                      </span>
                    ) : group.icon ? (
                      <Icon
                        name={group.icon}
                        size={14}
                        animated={false}
                        className="text-(--fg-secondary)"
                      />
                    ) : null}
                    <span className="truncate body-xs font-semibold tracking-wide text-(--fg-secondary) uppercase">
                      {group.label}
                    </span>
                  </span>
                  <span className="body-xs tabular-nums text-(--fg-tertiary)">
                    {group.options.length}
                  </span>
                </button>

                <ul className="m-0 mt-0.5 flex list-none flex-col p-0">
                  {group.options.map((o) => (
                    <li key={o.id}>
                      <button
                        type="button"
                        onClick={() => toggle(o.id)}
                        aria-pressed={selectedSet.has(o.id)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 pl-3 text-left transition-colors hover:bg-(--bg-hover)"
                      >
                        <FacetCheck state={selectedSet.has(o.id)} />
                        {o.tag && (
                          <code className="shrink-0 rounded-sm border border-(--border-subtle) bg-(--bg-muted) px-1.5 py-0.5 font-mono text-[11px] leading-none text-(--fg-secondary)">
                            {o.tag}
                          </code>
                        )}
                        <span className="min-w-0 flex-1 truncate body-xs text-(--fg-primary)">
                          {o.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
