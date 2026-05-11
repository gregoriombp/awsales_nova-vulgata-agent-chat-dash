import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Icon } from "./Icon"

export type AwButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "subtle"
  | "danger"
  | "ai"

export type AwButtonSize = "sm" | "md" | "lg"

export type AwButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "size"
> & {
  variant?: AwButtonVariant
  size?: AwButtonSize
  iconLeft?: string
  iconRight?: string
  iconOnly?: string
  loading?: boolean
  block?: boolean
  asChild?: boolean
}

export const AwButton = React.forwardRef<HTMLButtonElement, AwButtonProps>(
  function AwButton(
    {
      variant = "secondary",
      size = "md",
      iconLeft,
      iconRight,
      iconOnly,
      loading,
      block,
      disabled,
      asChild,
      children,
      className,
      ...rest
    },
    ref
  ) {
    const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "aw-btn",
          `aw-btn--${variant}`,
          `aw-btn--${size}`,
          iconOnly && "aw-btn--icon",
          block && "aw-btn--block",
          loading && "aw-btn--loading",
          className
        )}
        {...rest}
      >
        {iconOnly ? (
          <Icon name={iconOnly} size={iconSize} />
        ) : (
          <>
            {iconLeft && <Icon name={iconLeft} size={iconSize} />}
            <span className="aw-btn__label">{children}</span>
            {iconRight && <Icon name={iconRight} size={iconSize} />}
          </>
        )}
        {loading && <span aria-hidden="true" className="aw-btn__spinner" />}
      </Comp>
    )
  }
)
