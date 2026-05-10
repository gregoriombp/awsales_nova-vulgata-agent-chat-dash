"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

export type AwToggleProps = Omit<
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
  "checked" | "onCheckedChange" | "asChild" | "onChange"
> & {
  checked: boolean
  onChange?: (next: boolean) => void
  label?: string
}

export const AwToggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  AwToggleProps
>(function AwToggle(
  { checked, onChange, label, className, disabled, ...rest },
  ref
) {
  return (
    <SwitchPrimitives.Root
      ref={ref}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={label}
      className={cn("aw-toggle", checked && "aw-toggle--on", className)}
      {...rest}
    />
  )
})

export type AwToggleRowProps = {
  title: React.ReactNode
  description?: React.ReactNode
  checked: boolean
  onChange?: (next: boolean) => void
  disabled?: boolean
  className?: string
}

export function AwToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled,
  className,
}: AwToggleRowProps) {
  return (
    <div className={cn("aw-toggle-row", className)}>
      <div className="aw-toggle-row__copy">
        <div className="aw-toggle-row__copy-title">{title}</div>
        {description && (
          <div className="aw-toggle-row__copy-desc">{description}</div>
        )}
      </div>
      <AwToggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        label={typeof title === "string" ? title : undefined}
      />
    </div>
  )
}
