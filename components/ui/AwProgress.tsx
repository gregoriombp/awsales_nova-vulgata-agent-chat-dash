import * as React from "react"

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
  const fillClass = [
    "aw-progress",
    variant !== "default" && `aw-progress--${variant}`,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={["aw-progress-row", className].filter(Boolean).join(" ")}
    >
      {(label || valueLabel !== undefined) && (
        <div className="aw-progress-row__top">
          <span>{label}</span>
          <b>{valueLabel ?? `${Math.round(pct)}%`}</b>
        </div>
      )}
      <div
        className={fillClass}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className="aw-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
