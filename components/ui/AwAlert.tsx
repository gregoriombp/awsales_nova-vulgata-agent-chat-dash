import * as React from "react"
import { Icon } from "./Icon"

export type AwAlertVariant = "info" | "success" | "warning" | "danger"

export type AwAlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AwAlertVariant
  title?: React.ReactNode
  icon?: string
  children?: React.ReactNode
}

const DEFAULT_ICON: Record<AwAlertVariant, string> = {
  info: "info",
  success: "check_circle",
  warning: "warning",
  danger: "error",
}

export function AwAlert({
  variant = "info",
  title,
  icon,
  children,
  className,
  ...rest
}: AwAlertProps) {
  const glyph = icon ?? DEFAULT_ICON[variant]
  const classes = ["aw-alert", `aw-alert--${variant}`, className]
    .filter(Boolean)
    .join(" ")
  return (
    <div role="status" className={classes} {...rest}>
      <span className="aw-alert__icon">
        <Icon name={glyph} size={20} />
      </span>
      <div className="aw-alert__body">
        {title && <strong className="aw-alert__title">{title}</strong>}
        {children}
      </div>
    </div>
  )
}
