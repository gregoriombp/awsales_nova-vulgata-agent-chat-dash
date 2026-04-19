import * as React from "react"
import { Icon } from "./Icon"

export type AwNavListProps = React.HTMLAttributes<HTMLElement>

export function AwNavList({
  className,
  children,
  ...rest
}: AwNavListProps) {
  return (
    <nav
      className={["aw-nav-list", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </nav>
  )
}

export type AwNavItemProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "children"
> & {
  icon?: string
  count?: number | string
  active?: boolean
  children: React.ReactNode
  as?: "a" | "button"
}

export function AwNavItem({
  icon,
  count,
  active,
  children,
  className,
  as = "a",
  ...rest
}: AwNavItemProps) {
  const classes = [
    "aw-nav-list__item",
    active && "aw-nav-list__item--active",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const content = (
    <>
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
      {count !== undefined && (
        <span className="aw-nav-list__count">{count}</span>
      )}
    </>
  )

  if (as === "button") {
    return (
      <button
        type="button"
        className={classes}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    )
  }
  return (
    <a className={classes} {...rest}>
      {content}
    </a>
  )
}
