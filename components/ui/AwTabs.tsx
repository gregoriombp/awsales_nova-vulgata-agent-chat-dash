"use client"

import * as React from "react"

export type AwTabsVariant = "segmented" | "standalone"

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
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={[
        "aw-tabs",
        `aw-tabs--${variant}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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
            <span className="aw-tabs__label">{it.label}</span>
            {typeof it.count === "number" && (
              <span className="aw-tabs__count">{it.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
