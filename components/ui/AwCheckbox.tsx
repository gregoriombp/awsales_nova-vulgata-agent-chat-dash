"use client"

import * as React from "react"
import * as CheckboxPrimitives from "@radix-ui/react-checkbox"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/Icon"

export type AwCheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitives.Root>,
  "checked" | "onCheckedChange" | "asChild" | "onChange"
> & {
  checked: boolean | "indeterminate"
  onChange?: (next: boolean) => void
  label?: string
}

export const AwCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitives.Root>,
  AwCheckboxProps
>(function AwCheckbox(
  { checked, onChange, label, className, disabled, ...rest },
  ref
) {
  return (
    <CheckboxPrimitives.Root
      ref={ref}
      checked={checked}
      onCheckedChange={(v) => onChange?.(v === true)}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "peer inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-raised)] outline-none transition-colors duration-aw-fast",
        "hover:border-[var(--fg-primary)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--fg-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-raised)]",
        "data-[state=checked]:border-[var(--fg-primary)] data-[state=checked]:bg-[var(--fg-primary)] data-[state=checked]:text-[var(--bg-raised)]",
        "data-[state=indeterminate]:border-[var(--fg-primary)] data-[state=indeterminate]:bg-[var(--fg-primary)] data-[state=indeterminate]:text-[var(--bg-raised)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...rest}
    >
      <CheckboxPrimitives.Indicator className="flex items-center justify-center text-current">
        {checked === "indeterminate" ? (
          <Icon name="remove" size={12} />
        ) : (
          <Icon name="check" size={12} />
        )}
      </CheckboxPrimitives.Indicator>
    </CheckboxPrimitives.Root>
  )
})
