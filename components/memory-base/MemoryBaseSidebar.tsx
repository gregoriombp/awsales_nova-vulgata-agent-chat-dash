"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * MemoryBaseSidebar — rail lateral da página de uma base de conhecimento
 * (/memory-base/[id]). Componente de FEATURE (módulo memory-base, fora do
 * escopo do design system).
 *
 * Versão mínima (2026-06-10): bloco de navegação no topo — Insights e
 * **Configurações** (que saiu do header) — e duas métricas, nº de arquivos e
 * nº de Knowledge Layers. A árvore de pastas/arquivos (ramificação) e os
 * filtros ficaram para uma próxima iteração.
 */

type NavItem = {
  label: string;
  icon: string;
  onClick: () => void;
};

function NavRow({ label, icon, onClick }: NavItem) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
    >
      <Icon name={icon} size={18} weight={300} className="shrink-0 text-(--fg-tertiary)" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-(--fg-secondary)">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-(--fg-secondary)">{label}</span>
      <span className="shrink-0 text-[13px] font-medium tabular-nums text-(--fg-primary)">
        {value}
      </span>
    </div>
  );
}

export function MemoryBaseSidebar({
  fileCount,
  layersCount,
  onInsights,
  onSettings,
}: {
  /** Nº de arquivos/fontes da base. */
  fileCount: number;
  /** Nº de Knowledge Layers extraídas. */
  layersCount: number;
  onInsights: () => void;
  onSettings: () => void;
}) {
  return (
    <aside className="hidden w-[248px] shrink-0 self-stretch border-r border-(--border-subtle) bg-(--bg-surface) lg:block">
      <div className="sticky top-0 flex flex-col gap-5 px-3 py-6">
        {/* Navegação */}
        <nav className="space-y-0.5">
          <NavRow label="Insights" icon="bolt" onClick={onInsights} />
          <NavRow label="Configurações" icon="settings" onClick={onSettings} />
        </nav>

        <div className="h-px bg-(--border-subtle)" />

        {/* Métricas */}
        <div>
          <p className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-(--fg-tertiary)">
            Resumo
          </p>
          <StatRow
            icon={<Icon name="description" size={16} weight={300} />}
            label="Arquivos"
            value={fileCount}
          />
          <StatRow
            icon={
              <img
                src="/assets/icons/knowledge-layers_icon.svg"
                alt=""
                width={16}
                height={16}
                className="opacity-80"
              />
            }
            label="Knowledge Layers"
            value={layersCount}
          />
        </div>
      </div>
    </aside>
  );
}
