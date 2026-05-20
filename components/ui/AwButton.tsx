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
    const iconSize = iconOnly
      ? size === "sm"
        ? 20
        : size === "lg"
          ? 24
          : 22
      : size === "sm"
        ? 16
        : size === "lg"
          ? 22
          : 20
    const className_ = cn(
      "aw-btn",
      `aw-btn--${variant}`,
      `aw-btn--${size}`,
      iconOnly && "aw-btn--icon",
      block && "aw-btn--block",
      loading && "aw-btn--loading",
      className,
    )

    if (asChild) {
      // Slot precisa de um único child. Clonamos o elemento passado
      // (geralmente um <Link>) e injetamos o label dele DENTRO,
      // cercado pelos ícones — assim o markup final tem 1 root só.
      const child = React.Children.only(
        children as React.ReactElement<{ children?: React.ReactNode }>,
      )
      const childLabel = child.props.children
      const newChild = React.cloneElement(
        child,
        {},
        iconOnly ? (
          <Icon name={iconOnly} size={iconSize} />
        ) : (
          <>
            {iconLeft && <Icon name={iconLeft} size={iconSize} />}
            <span className="aw-btn__label">{childLabel}</span>
            {iconRight && <Icon name={iconRight} size={iconSize} />}
            {loading && <span aria-hidden="true" className="aw-btn__spinner" />}
          </>
        ),
      )
      return (
        <Slot
          ref={ref}
          aria-busy={loading || undefined}
          className={className_}
          {...rest}
        >
          {newChild}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={className_}
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
      </button>
    )
  }
)

