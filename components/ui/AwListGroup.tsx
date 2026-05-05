"use client"

import * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

export type AwListGroupIndent = "none" | "sm" | "md" | "lg"

const INDENT_CLASS: Record<AwListGroupIndent, string> = {
  none: "pl-0",
  sm: "pl-4",
  md: "pl-8",
  lg: "pl-14",
}

export type AwListGroupProps = {
  /** Leading visual — typically `<AwBrandLogo />` or `<AwAvatar />`. */
  media?: React.ReactNode
  title: React.ReactNode
  /** Secondary text under the title. */
  subtitle?: React.ReactNode
  /** Inline content next to the title — counts, status pills, alert badges. */
  meta?: React.ReactNode
  /** Right-aligned actions (buttons, links). Clicks here don't toggle. */
  actions?: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Tree-style left padding applied to children. Defaults to "md". */
  indent?: AwListGroupIndent
  children?: React.ReactNode
  className?: string
}

export function AwListGroup({
  media,
  title,
  subtitle,
  meta,
  actions,
  defaultOpen = true,
  open,
  onOpenChange,
  indent = "md",
  children,
  className,
}: AwListGroupProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("aw-list-group", className)}
    >
      <div className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-[var(--bg-surface)]">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aw-blue-400)] focus-visible:ring-offset-2"
          >
            {media && <span className="flex-shrink-0">{media}</span>}
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
                  {title}
                </span>
                {meta && (
                  <span className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--fg-tertiary)]">
                    {meta}
                  </span>
                )}
              </span>
              {subtitle && (
                <span className="mt-0.5 block truncate text-[13px] text-[var(--fg-tertiary)]">
                  {subtitle}
                </span>
              )}
            </span>
          </button>
        </CollapsibleTrigger>
        {actions && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {actions}
          </div>
        )}
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-label="Recolher ou expandir"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[var(--fg-secondary)] transition-transform hover:bg-[var(--bg-canvas)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aw-blue-400)] data-[state=open]:rotate-180"
          >
            <Icon name="expand_more" size={18} />
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="border-t border-[var(--border-subtle)]">
          <div
            className={cn(
              "divide-y divide-[var(--border-subtle)]",
              INDENT_CLASS[indent],
            )}
          >
            {children}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
