import * as React from "react"

export type AwPillVariant =
  | "live"
  | "draft"
  | "beta"
  | "warning"
  | "error"
  | "neutral"
  | "info"
  | "ai"

export type AwPillProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: AwPillVariant
  dot?: boolean
}

export function AwPill({
  variant = "neutral",
  dot = true,
  children,
  className,
  ...rest
}: AwPillProps) {
  const classes = ["aw-pill", `aw-pill--${variant}`, className]
    .filter(Boolean)
    .join(" ")
  return (
    <span className={classes} {...rest}>
      {dot && <span className="aw-pill__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
