"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export interface AwCapabilityTileProps {
  /**
   * Ícone/logo da capacidade — um nó de ~40px. Para Habilidades passe um
   * <AwBrandLogo>; para AOPs, uma caixa com <Icon> Material Symbol.
   */
  icon: React.ReactNode;
  /** Nome da capacidade. Renderiza como link → abre o preview (onPreview). */
  name: string;
  /** Descrição curta — domínio da integração ou resumo do processo. */
  description?: string;
  /** Se a permissão está concedida ao agente. */
  selected?: boolean;
  /** Concede/remove a permissão. Disparado ao clicar no corpo do card. */
  onToggle?: () => void;
  /** Abre a pré-visualização. Disparado ao clicar no NOME (link). */
  onPreview?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Tile selecionável para conceder a um agente o acesso a uma capacidade —
 * uma Habilidade (integração) ou um AOP (processo). Clicar no card concede a
 * permissão (fica marcado em escuro); clicar no nome (link) abre o preview.
 */
export function AwCapabilityTile({
  icon,
  name,
  description,
  selected = false,
  onToggle,
  onPreview,
  disabled = false,
  className,
}: AwCapabilityTileProps) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      onClick={() => {
        if (!disabled) onToggle?.();
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onToggle?.();
        }
      }}
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-aw-fast",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-primary)] focus-visible:ring-offset-2",
        selected
          ? "border-aw-gray-1200 bg-aw-gray-1200"
          : "border-border bg-white hover:border-aw-gray-400 hover:bg-bg-surface",
        className,
      )}
    >
      <div className="flex-shrink-0">{icon}</div>

      <div className="min-w-0 flex-1">
        {onPreview ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className={cn(
              "block max-w-full truncate text-left body-sm font-medium underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none",
              selected ? "text-white" : "text-fg-primary",
            )}
          >
            {name}
          </button>
        ) : (
          <div
            className={cn(
              "truncate body-sm font-medium",
              selected ? "text-white" : "text-fg-primary",
            )}
          >
            {name}
          </div>
        )}
        {description ? (
          <div
            className={cn(
              "truncate body-xs",
              selected ? "text-white/70" : "text-fg-tertiary",
            )}
          >
            {description}
          </div>
        ) : null}
      </div>

      <span
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-white bg-white" : "border-aw-gray-400",
        )}
      >
        {selected && <Icon name="check" size={12} className="text-aw-gray-1200" />}
      </span>
    </div>
  );
}
