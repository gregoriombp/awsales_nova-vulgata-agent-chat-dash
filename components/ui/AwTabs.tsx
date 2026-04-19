"use client"

import * as React from "react"

export type AwTabsItem = {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export type AwTabsProps = {
  items: AwTabsItem[]
  value: string
  onChange: (value: string) => void
  className?: string
  "aria-label"?: string
}

export function AwTabs({
  items,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: AwTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={["aw-tabs", className].filter(Boolean).join(" ")}
    >
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            role="tab"
            type="button"
            aria-selected={active}
            disabled={it.disabled}
            className={[
              "aw-tabs__tab",
              active && "aw-tabs__tab--active",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(it.value)}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
