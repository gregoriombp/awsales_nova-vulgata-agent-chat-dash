"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export interface AwCapabilityTileProps {
  /**
   * Logo ou ícone da capacidade. Aceita qualquer ReactNode — um SVG de marca
   * (Habilidades/integrações) ou um <Icon> Material Symbol (AOPs).
   */
  icon: React.ReactNode;
  /** Nome da capacidade (ex.: "Stripe", "Reembolso de cartão"). */
  name: string;
  /** Descrição curta — domínio da integração ou resumo do processo. */
  description?: string;
  /** Se a permissão está concedida ao agente. */
  selected?: boolean;
  /** Concede/remove a permissão (botão de toggle à direita). */
  onToggle?: () => void;
  /**
   * Abre a pré-visualização da capacidade. Disparado ao clicar no corpo do
   * tile (não no toggle) — o usuário inspeciona antes de habilitar.
   */
  onPreview?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Tile selecionável para conceder a um agente o acesso a uma capacidade —
 * uma Habilidade (integração de terceiro) ou um AOP (processo operacional).
 * As capacidades já existem a nível de conta/organização; aqui só se dá
 * permissão. Clicar no corpo abre o preview; o botão à direita concede/remove.
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
  const previewable = !disabled && !!onPreview;

  return (
    <div
      role={previewable ? "button" : undefined}
      tabIndex={previewable ? 0 : undefined}
      aria-label={previewable ? `Pré-visualizar ${name}` : undefined}
      onClick={previewable ? () => onPreview?.() : undefined}
      onKeyDown={
        previewable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPreview?.();
              }
            }
          : undefined
      }
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-bg-raised p-4 text-left transition-colors duration-aw-fast",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg-primary)] focus-visible:ring-offset-2",
        selected
          ? "border-fg-primary"
          : "border-border hover:border-aw-gray-400 hover:bg-bg-surface",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg transition-colors duration-aw-fast",
          selected ? "bg-fg-primary text-white" : "bg-bg-muted text-fg-secondary",
        )}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate body-sm font-medium text-fg-primary">{name}</div>
        {description ? (
          <div className="truncate body-xs text-fg-tertiary">{description}</div>
        ) : null}
      </div>

      <button
        type="button"
        aria-pressed={selected}
        aria-label={selected ? `Remover ${name}` : `Adicionar ${name}`}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onToggle?.();
        }}
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition-colors duration-aw-fast",
          disabled && "cursor-not-allowed",
          selected
            ? "border-fg-primary bg-fg-primary text-white"
            : "border-border text-fg-tertiary hover:border-fg-primary hover:text-fg-primary",
        )}
      >
        <Icon name={selected ? "check" : "add"} size={16} />
      </button>
    </div>
  );
}
