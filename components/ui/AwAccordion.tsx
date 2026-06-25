"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { cn } from "@/lib/utils"
import { Icon } from "./Icon"

/**
 * AwAccordion — disclosure (accordion) da AwSales sobre o primitivo Radix
 * (`@radix-ui/react-accordion`). Já carrega a transição de expand/collapse via
 * `data-[state]:animate-accordion-down|up` (keyframes em globals.css) + tokens —
 * o chevron gira com o estado. Nunca faça um disclosure na mão: use este
 * componente e a animação vem de graça.
 *
 * API orientada a dados (como AwDropdownMenu): passe `items`. Para controle fino,
 * `value`/`onValueChange` são repassados ao Root.
 */
export type AwAccordionItemData = {
  /** Identificador único do item (controla aberto/fechado). */
  value: string
  title: React.ReactNode
  /** Texto/elemento secundário à direita do título (opcional). */
  meta?: React.ReactNode
  /** Material Symbol opcional à esquerda do título. */
  icon?: string
  content: React.ReactNode
  disabled?: boolean
}

export type AwAccordionProps = {
  items: AwAccordionItemData[]
  /** "single" (default) abre um item por vez; "multiple" abre vários. */
  type?: "single" | "multiple"
  /** Em "single", permite fechar o item aberto clicando de novo. Default true. */
  collapsible?: boolean
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  className?: string
}

export function AwAccordion({
  items,
  type = "single",
  collapsible = true,
  defaultValue,
  value,
  onValueChange,
  className,
}: AwAccordionProps) {
  // Radix discrimina single/multiple no nível de tipos; o wrapper unifica a API
  // de dados e repassa as props certas por variante.
  const rootProps =
    type === "multiple"
      ? ({
          type: "multiple",
          defaultValue: defaultValue as string[] | undefined,
          value: value as string[] | undefined,
          onValueChange: onValueChange as ((v: string[]) => void) | undefined,
        } as const)
      : ({
          type: "single",
          collapsible,
          defaultValue: defaultValue as string | undefined,
          value: value as string | undefined,
          onValueChange: onValueChange as ((v: string) => void) | undefined,
        } as const)

  return (
    <AccordionPrimitive.Root
      {...rootProps}
      className={cn("flex flex-col", className)}
    >
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className="border-b border-(--border-subtle) last:border-b-0"
        >
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
              className={cn(
                "group flex flex-1 items-center gap-3 py-4 text-left",
                "text-(--fg-primary) outline-hidden rounded-sm",
                "focus-visible:ring-2 focus-visible:ring-(--fg-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-raised)",
                "disabled:opacity-50 disabled:pointer-events-none"
              )}
            >
              {item.icon && (
                <Icon
                  name={item.icon}
                  size={20}
                  className="shrink-0 text-(--fg-secondary)"
                />
              )}
              <span className="flex-1 body-md font-medium">{item.title}</span>
              {item.meta && (
                <span className="body-sm text-(--fg-tertiary)">{item.meta}</span>
              )}
              <Icon
                name="expand_more"
                size={20}
                className="shrink-0 text-(--fg-tertiary) transition-transform duration-200 ease-out group-data-[state=open]:rotate-180"
              />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="pb-4 pr-8 body-sm text-(--fg-secondary)">
              {item.content}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  )
}
