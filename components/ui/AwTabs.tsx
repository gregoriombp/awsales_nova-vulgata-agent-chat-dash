"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

export type AwTabsVariant = "segmented" | "standalone" | "underline"

export type AwTabsItem = {
  value: string
  label: React.ReactNode
  count?: number
  disabled?: boolean
}

export type AwTabsProps = {
  items: AwTabsItem[]
  value: string
  onChange: (value: string) => void
  variant?: AwTabsVariant
  className?: string
  "aria-label"?: string
}

export function AwTabs({
  items,
  value,
  onChange,
  variant = "segmented",
  className,
  "aria-label": ariaLabel,
}: AwTabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onChange}>
      <TabsPrimitive.List
        aria-label={ariaLabel}
        className={cn("aw-tabs", `aw-tabs--${variant}`, className)}
      >
        {items.map((it) => {
          const active = it.value === value
          return (
            <TabsPrimitive.Trigger
              key={it.value}
              value={it.value}
              disabled={it.disabled}
              className={cn(
                "aw-tabs__tab",
                active && "aw-tabs__tab--active"
              )}
            >
              <span className="aw-tabs__label">{it.label}</span>
              {typeof it.count === "number" && (
                <span className="aw-tabs__count">{it.count}</span>
              )}
            </TabsPrimitive.Trigger>
          )
        })}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  )
}
