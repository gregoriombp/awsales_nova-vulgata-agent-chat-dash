import * as React from "react"

export type AwCardVariant = "default" | "ai"

export type AwCardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AwCardVariant
  interactive?: boolean
}

export const AwCard = React.forwardRef<HTMLDivElement, AwCardProps>(
  function AwCard(
    { variant = "default", interactive, className, children, ...rest },
    ref
  ) {
    const classes = [
      "aw-card",
      `aw-card--${variant}`,
      interactive && "aw-card--interactive",
      className,
    ]
      .filter(Boolean)
      .join(" ")
    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    )
  }
)
