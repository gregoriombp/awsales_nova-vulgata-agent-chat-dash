import * as React from "react"
import { cn } from "@/lib/utils"

export type AwCardVariant = "default" | "ai" | "ai-warm" | "ai-cortex"

export type AwCardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AwCardVariant
  interactive?: boolean
}

export const AwCard = React.forwardRef<HTMLDivElement, AwCardProps>(
  function AwCard(
    { variant = "default", interactive, className, children, tabIndex, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(
          "aw-card",
          `aw-card--${variant}`,
          interactive && "aw-card--interactive",
          className,
        )}
        tabIndex={interactive && tabIndex === undefined ? 0 : tabIndex}
        {...rest}
      >
        {children}
      </div>
    )
  },
)

export const AwCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function AwCardHeader({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn("aw-card__header", className)}
      {...rest}
    />
  )
})

export const AwCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function AwCardTitle({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-title"
      className={cn("aw-card__title", className)}
      {...rest}
    />
  )
})

export const AwCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function AwCardDescription({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-description"
      className={cn("aw-card__description", className)}
      {...rest}
    />
  )
})

export const AwCardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function AwCardAction({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn("aw-card__action", className)}
      {...rest}
    />
  )
})

export const AwCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function AwCardContent({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("aw-card__content", className)}
      {...rest}
    />
  )
})

export const AwCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function AwCardFooter({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn("aw-card__footer", className)}
      {...rest}
    />
  )
})
