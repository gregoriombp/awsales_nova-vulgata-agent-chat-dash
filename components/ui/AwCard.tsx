import * as React from "react"

/**
 * AwCard — surface primitive whose anatomy mirrors shadcn/ui's Card.
 *
 * Slots, in order: Header (Title + Description + optional Action) → Content
 * → Footer. All slots are optional — the root still accepts arbitrary
 * children, so existing call sites that drop nodes directly inside
 * <AwCard> keep working untouched.
 */

export type AwCardVariant = "default" | "ai"

export type AwCardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AwCardVariant
  interactive?: boolean
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

export const AwCard = React.forwardRef<HTMLDivElement, AwCardProps>(
  function AwCard(
    { variant = "default", interactive, className, children, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cx(
          "aw-card",
          `aw-card--${variant}`,
          interactive && "aw-card--interactive",
          className,
        )}
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
      className={cx("aw-card__header", className)}
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
      className={cx("aw-card__title", className)}
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
      className={cx("aw-card__description", className)}
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
      className={cx("aw-card__action", className)}
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
      className={cx("aw-card__content", className)}
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
      className={cx("aw-card__footer", className)}
      {...rest}
    />
  )
})
