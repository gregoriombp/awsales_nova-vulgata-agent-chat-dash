"use client"

import * as React from "react"

export type AwToggleProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "type"
> & {
  checked: boolean
  onChange?: (next: boolean) => void
  ai?: boolean
  label?: string
}

export const AwToggle = React.forwardRef<HTMLButtonElement, AwToggleProps>(
  function AwToggle(
    { checked, onChange, ai, label, className, disabled, ...rest },
    ref
  ) {
    const classes = [
      "aw-toggle",
      checked && "aw-toggle--on",
      ai && "aw-toggle--ai",
      className,
    ]
      .filter(Boolean)
      .join(" ")
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={classes}
        onClick={() => onChange?.(!checked)}
        {...rest}
      />
    )
  }
)

export type AwToggleRowProps = {
  title: React.ReactNode
  description?: React.ReactNode
  checked: boolean
  onChange?: (next: boolean) => void
  ai?: boolean
  disabled?: boolean
  className?: string
}

export function AwToggleRow({
  title,
  description,
  checked,
  onChange,
  ai,
  disabled,
  className,
}: AwToggleRowProps) {
  return (
    <div
      className={["aw-toggle-row", className].filter(Boolean).join(" ")}
    >
      <div className="aw-toggle-row__copy">
        <div className="aw-toggle-row__copy-title">{title}</div>
        {description && (
          <div className="aw-toggle-row__copy-desc">{description}</div>
        )}
      </div>
      <AwToggle
        checked={checked}
        onChange={onChange}
        ai={ai}
        disabled={disabled}
        label={typeof title === "string" ? title : undefined}
      />
    </div>
  )
}
