"use client"

import * as React from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

/**
 * AwCollapsible — disclosure leve: um gatilho + conteúdo animado. Wrapper do
 * primitivo Radix `collapsible`, com chevron que gira no estado e animação de
 * altura via tokens (`.aw-collapsible-content`, que lê
 * `--radix-collapsible-content-height`).
 *
 * É o lar DS das "linhas expansíveis" e dos "ver mais / histórico": mais leve
 * que o `AwAccordion` (multi-item, com borda, chevron à direita) e que o
 * `AwListGroup` (grupo com media + título grande + ações). Nunca monte um
 * disclosure na mão (`{open && …}`): use este componente e a transição vem de
 * graça.
 */
export type AwCollapsibleProps = {
  /** Conteúdo do gatilho, à esquerda (junto do chevron). */
  trigger: React.ReactNode
  /** Conteúdo alinhado à direita do gatilho — tag, valor, contagem. */
  meta?: React.ReactNode
  /** Lado do chevron. Default "left". */
  chevronSide?: "left" | "right"
  /** Densidade do gatilho. Default "md". */
  size?: "sm" | "md"
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Classe extra no botão de gatilho (sobrescreve cor/tipo do texto). */
  triggerClassName?: string
  /** Conteúdo revelado (animado). */
  children: React.ReactNode
  className?: string
}

const TRIGGER_TEXT: Record<"sm" | "md", string> = {
  sm: "py-1 body-xs text-(--fg-tertiary)",
  md: "py-2 body-sm text-(--fg-secondary)",
}
const CHEVRON_SIZE: Record<"sm" | "md", number> = { sm: 16, md: 18 }

export function AwCollapsible({
  trigger,
  meta,
  chevronSide = "left",
  size = "md",
  defaultOpen = false,
  open,
  onOpenChange,
  triggerClassName,
  children,
  className,
}: AwCollapsibleProps) {
  const hasMeta = meta != null
  const chevron = (
    <Icon
      name="expand_more"
      size={CHEVRON_SIZE[size]}
      className="shrink-0 text-(--fg-tertiary) transition-transform duration-200 ease-out group-data-[state=open]:rotate-180"
    />
  )

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("flex flex-col", className)}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center gap-1.5 text-left outline-hidden rounded-sm",
            "transition-colors hover:text-(--fg-primary)",
            "focus-visible:ring-2 focus-visible:ring-(--fg-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-raised)",
            hasMeta ? "w-full justify-between" : "w-fit",
            TRIGGER_TEXT[size],
            triggerClassName,
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-1.5">
            {chevronSide === "left" && chevron}
            <span className="truncate">{trigger}</span>
          </span>
          {hasMeta && <span className="shrink-0">{meta}</span>}
          {chevronSide === "right" && chevron}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="aw-collapsible-content">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
