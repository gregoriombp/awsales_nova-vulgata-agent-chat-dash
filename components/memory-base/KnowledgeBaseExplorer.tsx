"use client";

import { useMemo, useState } from "react";
import { AwInput } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwTabs } from "@/components/ui/AwTabs";
import { Icon } from "@/components/ui/Icon";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { KnowledgeBaseCard } from "./KnowledgeBaseCard";
import { KnowledgeBaseTable } from "./KnowledgeBaseTable";
import {
  type KnowledgeBase,
  distinctValues,
  statusLabel,
} from "./knowledgeBases";

type View = "cards" | "list";

/* ─────────────────────────────────────────────────────────────────────────
 * Explorer — busca + filtros + alternância Cards/Lista.
 *
 * O Figma trazia 5 dropdowns (Status, Objetivo, Segmento, Tipo de dados, Data)
 * + busca. Filtrar ~6 bases por 5 dimensões é overspec — as referências do
 * padrão (HubSpot, Front) param em 2-3 filtros + busca. Ficamos com Status +
 * Objetivo (os dois que importam pra uma base de conhecimento de vendas); o
 * resto volta quando a contagem de bases justificar.
 * ───────────────────────────────────────────────────────────────────────── */

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

/** Trigger de filtro multi-seleção sobre um campo. */
function FilterPopover({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <AwSelect aria-label={label}>
          {label}
          {selected.length > 0 ? ` · ${selected.length}` : ""}
        </AwSelect>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 rounded-[var(--radius-lg)] border-[var(--border-subtle)] p-1"
      >
        {options.length === 0 ? (
          <p className="px-2.5 py-2 text-[13px] text-[var(--fg-tertiary)]">
            Sem opções
          </p>
        ) : (
          options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(toggle(selected, opt))}
                className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-[13px] text-[var(--fg-primary)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                <span className="truncate">{opt}</span>
                {active && (
                  <Icon
                    name="check"
                    size={16}
                    className="flex-shrink-0 text-[var(--accent-brand)]"
                  />
                )}
              </button>
            );
          })
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Remove uma base criada do localStorage (no-op pras mock). */
function removeCreatedBase(id: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("memory-bases-list");
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return;
    window.localStorage.setItem(
      "memory-bases-list",
      JSON.stringify(arr.filter((b) => b?.id !== id)),
    );
  } catch {
    /* ignore */
  }
}

export function KnowledgeBaseExplorer({ bases }: { bases: KnowledgeBase[] }) {
  const [view, setView] = useState<View>("cards");
  const [query, setQuery] = useState("");
  const [statusSel, setStatusSel] = useState<string[]>([]);
  const [objSel, setObjSel] = useState<string[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const objOptions = useMemo(() => distinctValues(bases, "objetivo"), [bases]);

  const handleDelete = (id: string) => {
    setRemovedIds((prev) => [...prev, id]);
    removeCreatedBase(id);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bases.filter(
      (b) =>
        !removedIds.includes(b.id) &&
        (q === "" || b.name.toLowerCase().includes(q)) &&
        (statusSel.length === 0 || statusSel.includes(statusLabel(b.status))) &&
        (objSel.length === 0 || objSel.includes(b.objetivo)),
    );
  }, [bases, query, statusSel, objSel, removedIds]);

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* Toolbar: busca à esquerda, filtros + toggle à direita */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] flex-1 sm:max-w-[420px]">
          <AwInput
            iconLeft="search"
            placeholder="Pesquisar por nome da base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <FilterPopover
            label="Status"
            options={["Ativo", "Inativo"]}
            selected={statusSel}
            onChange={setStatusSel}
          />
          <FilterPopover
            label="Objetivo"
            options={objOptions}
            selected={objSel}
            onChange={setObjSel}
          />

          <AwTabs
            aria-label="Visualização"
            variant="segmented"
            value={view}
            onChange={(v) => setView(v as View)}
            items={[
              {
                value: "cards",
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="grid_view" size={16} weight={400} />
                    Cards
                  </span>
                ),
              },
              {
                value: "list",
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="view_list" size={16} weight={400} />
                    Lista
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Resultado */}
      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-subtle)] py-16 text-center text-[13px] text-[var(--fg-tertiary)]">
          Nenhuma base encontrada para os filtros atuais.
        </div>
      ) : view === "cards" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((base) => (
            <KnowledgeBaseCard key={base.id} base={base} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <KnowledgeBaseTable bases={filtered} onDelete={handleDelete} />
      )}
    </div>
  );
}
