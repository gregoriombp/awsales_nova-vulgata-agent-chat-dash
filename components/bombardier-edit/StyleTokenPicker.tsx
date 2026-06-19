"use client"

import * as React from "react"
import type { StyleProperty } from "@/lib/bombardier-edit/token-manifest"

// One retoken-able CSS property → a row of token swatches. The ONLY values it
// can emit are design-system tokens (the row is built from the manifest), so
// "tokens são sagrados" holds by construction.

export function StyleTokenPicker({
  property,
  activeValue,
  onPick,
  onClear,
}: {
  property: StyleProperty
  /** `var(--token)` currently applied to this property on the selection, if any. */
  activeValue?: string
  onPick: (prop: string, cssValue: string) => void
  onClear: (prop: string) => void
}) {
  const isColor = property.prop.includes("color")
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-(--body-xs-size) font-medium text-(--fg-secondary)">
          {property.label}
        </span>
        {activeValue && (
          <button
            type="button"
            onClick={() => onClear(property.prop)}
            className="text-(--body-xs-size) text-(--fg-tertiary) hover:text-(--fg-primary)"
          >
            limpar
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {property.tokens.map((t) => {
          const active = activeValue === t.cssValue
          return (
            <button
              key={t.token}
              type="button"
              title={`${t.label} · ${t.token}`}
              onClick={() => onPick(property.prop, t.cssValue)}
              className="group relative flex items-center justify-center rounded-(--radius-sm) outline-hidden transition-transform hover:scale-105"
              style={{
                boxShadow: active
                  ? "0 0 0 2px var(--bg-raised), 0 0 0 4px var(--accent-brand)"
                  : undefined,
              }}
            >
              {isColor ? (
                <span
                  aria-hidden
                  className="h-6 w-6 rounded-(--radius-sm) border border-(--border-default)"
                  style={{ background: t.cssValue }}
                />
              ) : (
                <span
                  className="rounded-(--radius-sm) border border-(--border-default) bg-(--bg-muted) px-2 py-1 text-(--body-xs-size) text-(--fg-secondary)"
                  style={
                    property.prop === "border-radius"
                      ? { borderRadius: t.cssValue }
                      : property.prop === "box-shadow"
                        ? { boxShadow: t.cssValue }
                        : undefined
                  }
                >
                  {t.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
