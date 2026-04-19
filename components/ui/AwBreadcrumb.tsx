import * as React from "react"

export type AwBreadcrumbItem = {
  label: React.ReactNode
  href?: string
  current?: boolean
}

export type AwBreadcrumbProps = React.HTMLAttributes<HTMLElement> & {
  items: AwBreadcrumbItem[]
  separator?: React.ReactNode
}

export function AwBreadcrumb({
  items,
  separator = "/",
  className,
  ...rest
}: AwBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={["aw-crumbs", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {items.map((it, i) => {
        const isLast = i === items.length - 1
        const current = it.current ?? isLast
        return (
          <React.Fragment key={i}>
            {current || !it.href ? (
              <span
                className={current ? "aw-crumbs__current" : undefined}
                aria-current={current ? "page" : undefined}
              >
                {it.label}
              </span>
            ) : (
              <a href={it.href}>{it.label}</a>
            )}
            {!isLast && (
              <span className="aw-crumbs__sep" aria-hidden="true">
                {separator}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
