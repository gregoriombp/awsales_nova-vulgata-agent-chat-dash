"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * MemoryBaseSidebar — rail lateral da página de uma base de conhecimento
 * (/memory-base/[id]). Componente de FEATURE (módulo memory-base, fora do
 * escopo do design system).
 */

const COLLAPSED_STORAGE_KEY = "awsales:memory-base-sidebar:collapsed";

type TabId = "documentos" | "playbook" | "produtos";

type NavItem = {
  label: string;
  icon: string;
  onClick: () => void;
  active?: boolean;
  badge?: number;
};

function NavRow({
  label,
  icon,
  onClick,
  collapsed,
  active,
  badge,
}: NavItem & { collapsed: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center rounded-lg text-left text-[13px] font-medium transition-colors duration-aw-fast ${
        collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-2.5 py-2"
      } ${
        active
          ? "bg-(--bg-muted) text-(--fg-primary)"
          : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
      }`}
    >
      <Icon
        name={icon}
        size={18}
        weight={300}
        className={`shrink-0 ${active ? "text-(--fg-primary)" : "text-(--fg-tertiary)"}`}
      />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {badge != null && (
            <span className="shrink-0 rounded-full bg-(--bg-muted) px-1.5 text-2xs tabular-nums text-(--fg-tertiary)">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

function StatRow({
  icon,
  label,
  value,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  collapsed: boolean;
}) {
  if (collapsed) {
    return (
      <div
        className="flex items-center justify-center py-2"
        title={`${label}: ${value}`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-(--fg-secondary)">
          {icon}
        </span>
      </div>
    );
  }

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
  title,
  fileCount,
  layersCount,
  activeTab,
  onTabChange,
  onSemanticSearch,
  onInsights,
  onSettings,
}: {
  /** Nome da base exibido no topo da sidebar. */
  title: string;
  /** Nº de arquivos/fontes da base. */
  fileCount: number;
  /** Nº de Knowledge Layers extraídas. */
  layersCount: number;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSemanticSearch: () => void;
  onInsights: () => void;
  onSettings: () => void;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSED_STORAGE_KEY);
      if (raw === "1") setCollapsed(true);
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* noop */
      }
      return next;
    });
  };

  return (
    <aside
      aria-label="Navegação da base de conhecimento"
      data-collapsed={collapsed ? "true" : "false"}
      className={`hidden h-full shrink-0 flex-col border-r border-(--border-subtle) bg-(--bg-surface) transition-[width] duration-aw-base ease-out lg:flex ${
        collapsed ? "w-[68px]" : "w-[248px]"
      }`}
      style={hydrated ? undefined : { visibility: "hidden" }}
    >
      <div
        className={`flex shrink-0 items-center border-b border-(--border-subtle) ${
          collapsed ? "justify-center px-3 py-4" : "justify-between gap-2 px-4 py-4"
        }`}
      >
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="m-0 mb-0.5 aw-eyebrow text-(--fg-tertiary)">Memory Base</p>
            <h6 className="m-0 truncate text-(--fg-primary)" title={title}>
              {title}
            </h6>
          </div>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expandir navegação" : "Recolher navegação"}
          aria-expanded={!collapsed}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-muted) hover:text-(--fg-primary)"
        >
          <Icon
            name={collapsed ? "left_panel_open" : "left_panel_close"}
            size={18}
          />
        </button>
      </div>

      <div className={`flex flex-1 flex-col gap-5 overflow-y-auto ${collapsed ? "px-2 py-4" : "px-3 py-5"}`}>
        <nav className="space-y-0.5" aria-label="Seções da base">
          <NavRow
            label="Documentos"
            icon="description"
            onClick={() => onTabChange("documentos")}
            active={activeTab === "documentos"}
            badge={fileCount}
            collapsed={collapsed}
          />
          <NavRow
            label="Playbook"
            icon="menu_book"
            onClick={() => onTabChange("playbook")}
            active={activeTab === "playbook"}
            collapsed={collapsed}
          />
          <NavRow
            label="Produtos"
            icon="inventory_2"
            onClick={() => onTabChange("produtos")}
            active={activeTab === "produtos"}
            collapsed={collapsed}
          />
          <NavRow
            label="Busca semântica"
            icon="search"
            onClick={onSemanticSearch}
            collapsed={collapsed}
          />
        </nav>

        <div className="h-px bg-(--border-subtle)" />

        <nav className="space-y-0.5" aria-label="Ações da base">
          <NavRow label="Insights" icon="bolt" onClick={onInsights} collapsed={collapsed} />
          <NavRow label="Configurações" icon="settings" onClick={onSettings} collapsed={collapsed} />
        </nav>

        <div className="h-px bg-(--border-subtle)" />

        <div>
          {!collapsed && (
            <p className="px-2.5 pb-1 text-2xs font-medium uppercase tracking-[0.08em] text-(--fg-tertiary)">
              Resumo
            </p>
          )}
          <StatRow
            icon={<Icon name="description" size={16} weight={300} />}
            label="Arquivos"
            value={fileCount}
            collapsed={collapsed}
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
            collapsed={collapsed}
          />
        </div>
      </div>
    </aside>
  );
}
