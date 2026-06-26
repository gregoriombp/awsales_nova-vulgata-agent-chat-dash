"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AwSegmentedOption<T extends string> {
  value: T
  label: string
  /** Visual node rendered before the label. Accepts an ARBITRARY node — a
   *  Material Symbol `<Icon/>`, a brand mark (`<AwBrandLogo/>` / `<AwLogo/>`),
   *  or several side by side. Rendered verbatim; not an icon-name string. */
  leading?: React.ReactNode
  disabled?: boolean
}

export interface AwSegmentedProps<T extends string> {
  options: AwSegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible name for the tablist. */
  ariaLabel: string
  /** Density. `md` (default) → h-8 / body-sm. `sm` → h-7 / body-xs. */
  size?: "sm" | "md"
  className?: string
}

const SIZE: Record<"sm" | "md", { track: string; seg: string }> = {
  sm: {
    track: "gap-0.5 rounded-lg p-0.5",
    seg: "h-7 gap-1.5 rounded-md px-2.5 body-xs",
  },
  md: {
    track: "gap-0.5 rounded-xl p-1",
    seg: "h-8 gap-1.5 rounded-lg px-3 body-sm",
  },
}

/**
 * Single-select segmented control / toggle-group, generic over the option
 * value. The selected segment carries the DS **primary** treatment (solid
 * `--fg-primary` fill on `--bg-canvas` text — identical to `AwButton`
 * variant primary). Segments are variable-width (labels + logos differ), so
 * the active state is a per-segment background, not a sliding pill.
 *
 * a11y: `role="tablist"`/`tab` with roving `tabindex` + Arrow/Home/End keys.
 */
export function AwSegmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  className,
}: AwSegmentedProps<T>): React.JSX.Element {
  const sz = SIZE[size]
  const refs = React.useRef<Map<T, HTMLButtonElement | null>>(new Map())

  // Roving focus owner: the selected segment when enabled, else the first
  // enabled one — so Tab always lands on a focusable, meaningful segment.
  const selectedEnabled = options.some((o) => o.value === value && !o.disabled)
  const firstEnabled = options.find((o) => !o.disabled)?.value
  const tabStop = selectedEnabled ? value : firstEnabled

  const focusValue = (v: T) => {
    onChange(v)
    refs.current.get(v)?.focus()
  }

  const move = (from: T, dir: 1 | -1) => {
    const enabled = options.filter((o) => !o.disabled)
    if (enabled.length === 0) return
    const idx = enabled.findIndex((o) => o.value === from)
    const start = idx === -1 ? (dir === 1 ? -1 : 0) : idx
    const next = enabled[(start + dir + enabled.length) % enabled.length]
    if (next) focusValue(next.value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, v: T) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault()
        move(v, 1)
        break
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault()
        move(v, -1)
        break
      case "Home": {
        e.preventDefault()
        const first = options.find((o) => !o.disabled)
        if (first) focusValue(first.value)
        break
      }
      case "End": {
        e.preventDefault()
        const last = [...options].reverse().find((o) => !o.disabled)
        if (last) focusValue(last.value)
        break
      }
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center border border-(--border-subtle) bg-(--bg-muted)",
        sz.track,
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            ref={(node) => {
              refs.current.set(opt.value, node)
            }}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={opt.disabled}
            tabIndex={opt.value === tabStop ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, opt.value)}
            className={cn(
              "relative inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap",
              "transition-colors duration-aw-fast",
              "focus-visible:z-10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ring-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-muted)",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
              sz.seg,
              active
                ? "bg-(--fg-primary) text-(--bg-canvas)"
                : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
            )}
          >
            {opt.leading && (
              <span className="inline-flex shrink-0 items-center">
                {opt.leading}
              </span>
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
