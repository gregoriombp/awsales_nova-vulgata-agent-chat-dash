"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

export type AwProgressVariant = "default" | "success" | "warning" | "danger"

export type AwProgressProps = {
  value: number
  max?: number
  label?: React.ReactNode
  valueLabel?: React.ReactNode
  variant?: AwProgressVariant
  className?: string
}

export function AwProgress({
  value,
  max = 100,
  label,
  valueLabel,
  variant = "default",
  className,
}: AwProgressProps) {
  const clamped = Math.max(0, Math.min(value, max))
  const pct = (clamped / max) * 100

  return (
    <div className={cn("aw-progress-row", className)}>
      {(label || valueLabel !== undefined) && (
        <div className="aw-progress-row__top">
          <span>{label}</span>
          <b>{valueLabel ?? `${Math.round(pct)}%`}</b>
        </div>
      )}
      <ProgressPrimitive.Root
        value={clamped}
        max={max}
        className={cn(
          "aw-progress",
          variant !== "default" && `aw-progress--${variant}`
        )}
      >
        <ProgressPrimitive.Indicator
          className="aw-progress__fill"
          style={{ width: `${pct}%` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}
