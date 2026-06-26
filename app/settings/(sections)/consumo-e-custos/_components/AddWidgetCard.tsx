"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";

/* ----------------------------------------------------------------------------
 * Card "Adicionar gráfico" — sempre o último item do board.
 *
 * É uma casca/placeholder (borda tracejada, ícone "add" centralizado) com o mesmo
 * footprint de um widget. Clicar abre um modal (AwModal) com a lista dos gráficos
 * DISPONÍVEIS pra adicionar — que são os widgets escondidos desta visualização.
 * Escolher um chama `onAdd(id)` (no provider, `toggleWidgetHidden`), que o re-exibe.
 *
 * É código de feature (consome Aw*, mas não é um componente do DS), então mora
 * aqui em _components junto dos outros widgets do explorador.
 * ------------------------------------------------------------------------- */

/** Gráfico que pode ser adicionado de volta ao board (um widget escondido). */
export type AddableWidget = {
  id: string;
  /** Nome amigável (bate com o título do card). */
  label: string;
  /** Ícone Material Symbols (bate com o ícone do card). */
  icon: string;
};

export function AddWidgetCard({
  available,
  onAdd,
}: {
  available: AddableWidget[];
  onAdd: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const hasAvailable = available.length > 0;

  const add = (id: string) => {
    onAdd(id);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Adicionar gráfico ao painel"
        className={cn(
          "group/add flex h-full min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl",
          "border-2 border-dashed border-(--border-default) bg-transparent px-5 py-8 text-center",
          "transition-colors duration-aw-fast",
          "hover:border-(--accent-brand) hover:bg-(--bg-hover)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring-focus)",
        )}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-raised) text-(--fg-tertiary) transition-colors duration-aw-fast group-hover/add:border-(--accent-brand) group-hover/add:text-(--accent-brand)">
          <Icon name="add" size={24} />
        </span>
        <span className="flex flex-col items-center gap-1">
          <span className="body-sm font-medium text-(--fg-secondary) transition-colors duration-aw-fast group-hover/add:text-(--fg-primary)">
            Adicionar gráfico
          </span>
          <span className="body-xs text-(--fg-tertiary)">
            {hasAvailable
              ? available.length === 1
                ? "1 gráfico disponível"
                : `${available.length} gráficos disponíveis`
              : "Todos já estão no painel"}
          </span>
        </span>
      </button>

      <AwModal open={open} onClose={() => setOpen(false)} title="Adicionar gráfico">
        {hasAvailable ? (
          <div className="flex flex-col gap-3">
            <p className="m-0 body-sm text-(--fg-secondary)">
              Escolha um gráfico para adicionar ao painel.
            </p>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {available.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => add(w.id)}
                    className="group/opt flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-aw-fast hover:bg-(--bg-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring-focus)"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary) transition-colors duration-aw-fast group-hover/opt:text-(--fg-primary)">
                      <Icon name={w.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1 truncate body-sm font-medium text-(--fg-primary)">
                      {w.label}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 body-xs font-medium text-(--fg-tertiary) transition-colors duration-aw-fast group-hover/opt:text-(--accent-brand)">
                      <Icon name="add" size={18} />
                      Adicionar
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-muted) text-(--fg-tertiary)">
              <Icon name="done_all" size={24} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                Todos os gráficos já estão no painel
              </p>
              <p className="m-0 body-xs text-(--fg-tertiary)">
                Remova um gráfico pelo modo de edição para liberá-lo aqui.
              </p>
            </div>
          </div>
        )}
      </AwModal>
    </>
  );
}
