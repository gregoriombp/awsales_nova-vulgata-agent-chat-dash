"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { BASE_PRODUCTS } from "@/components/memory-base/knowledgeLayers";

/**
 * Aba "Produtos" do detalhe da base — lista os produtos vinculados à base (Tela 10
 * do flow do Figma, aba Produtos). Toggle Lista/Card + busca. Conteúdo real da aba
 * que antes era placeholder no detalhe da base.
 */

const ROW_GRID = "grid-cols-[2fr_1fr_1.2fr_1.6fr_0.8fr]";

export function ProductsTab() {
  const [view, setView] = React.useState<"lista" | "card">("lista");
  const [search, setSearch] = React.useState("");

  const filtered = BASE_PRODUCTS.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-sm">
          <AwInput
            iconLeft="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome de produto"
          />
        </div>
        <div className="inline-flex rounded-full border border-(--border-default) p-1">
          <ViewToggle active={view === "lista"} onClick={() => setView("lista")} icon="view_list" label="Lista" />
          <ViewToggle active={view === "card"} onClick={() => setView("card")} icon="grid_view" label="Card" />
        </div>
      </div>

      <div className="mt-5">
        {view === "lista" ? (
          <div className="overflow-hidden rounded-2xl border border-(--border-default)">
            <div className={cn("grid gap-3 border-b border-(--border-subtle) bg-(--bg-surface) px-4 py-2.5 text-2xs font-medium uppercase tracking-wide text-(--fg-tertiary)", ROW_GRID)}>
              <span>Produto</span>
              <span>ID</span>
              <span>Categoria</span>
              <span>Arquivos</span>
              <span>Preço</span>
            </div>
            {filtered.map((p) => (
              <div key={p.id} className={cn("grid items-center gap-3 border-b border-(--border-subtle) px-4 py-3 last:border-0 hover:bg-(--bg-hover)", ROW_GRID)}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.nome}</p>
                  <p className="text-2xs text-(--fg-tertiary)">{p.sub}</p>
                </div>
                <span className="text-xs text-(--fg-secondary)">{p.id}</span>
                <span className="text-xs text-(--fg-secondary)">{p.cat}</span>
                <span className="inline-flex items-center gap-1.5 truncate text-xs text-(--fg-secondary)">
                  <Icon name="picture_as_pdf" size={14} /> {p.arq}
                </span>
                <span className="text-xs text-(--fg-secondary)">{p.preco}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-(--fg-tertiary)">
                Nenhum produto encontrado.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <div key={p.id} className="flex flex-col gap-2 rounded-2xl border border-(--border-default) bg-(--bg-raised) p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{p.nome}</p>
                  <AwPill variant="neutral">{p.sub}</AwPill>
                </div>
                <p className="text-xs text-(--fg-tertiary)">Categoria: {p.cat}</p>
                <span className="inline-flex items-center gap-1.5 text-2xs text-(--fg-tertiary)">
                  <Icon name="picture_as_pdf" size={13} /> {p.arq}
                </span>
                <div className="mt-1 flex items-center justify-between border-t border-(--border-subtle) pt-2 text-2xs text-(--fg-tertiary)">
                  <span>{p.id}</span>
                  <span>{p.preco}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full px-4 py-10 text-center text-sm text-(--fg-tertiary)">
                Nenhum produto encontrado.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ViewToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full bg-(--bg-inverse) px-3 py-1.5 text-xs font-medium text-(--fg-on-inverse)"
          : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-(--fg-secondary) hover:text-(--fg-primary)"
      }
    >
      <Icon name={icon} size={15} />
      {label}
    </button>
  );
}
