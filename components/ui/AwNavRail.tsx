"use client"

import * as React from "react"
import { Icon } from "./Icon"
import { AwLogo } from "./AwLogo"

export type AwNavRailTheme = "light" | "dark"

/* ============================================================
 * AwNavRail — container with optional top + bottom slots.
 * ============================================================ */

export type AwNavRailProps = React.HTMLAttributes<HTMLElement> & {
  collapsed?: boolean
  theme?: AwNavRailTheme
  /**
   * Liquid-glass finish — translucent background + backdrop blur.
   * Pair with `theme` to tint for light or dark canvases.
   */
  translucent?: boolean
  onToggleCollapsed?: () => void
  top?: React.ReactNode
  bottom?: React.ReactNode
  children: React.ReactNode
}

export function AwNavRail({
  collapsed,
  theme = "light",
  translucent,
  onToggleCollapsed,
  top,
  bottom,
  className,
  children,
  ...rest
}: AwNavRailProps) {
  const classes = [
    "aw-nav-rail",
    collapsed ? "aw-nav-rail--collapsed" : "aw-nav-rail--expanded",
    theme === "dark" && "aw-nav-rail--dark",
    translucent && "aw-nav-rail--translucent",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const hasToggle = typeof onToggleCollapsed === "function"
  const hasTop = Boolean(top) || hasToggle

  return (
    <nav className={classes} {...rest}>
      {hasTop && (
        <div className="aw-nav-rail__top">
          {hasToggle && (
            <div className="aw-nav-rail__toolbar">
              {!collapsed && (
                <AwLogo
                  variant="wordmark"
                  height={16}
                  className="aw-nav-rail__logo"
                  aria-label="AwSales"
                />
              )}
              <button
                type="button"
                className="aw-nav-rail__toggle"
                onClick={onToggleCollapsed}
                aria-label={
                  collapsed ? "Expandir navegação" : "Recolher navegação"
                }
                aria-expanded={!collapsed}
              >
                <Icon
                  name={collapsed ? "menu_open" : "menu"}
                  size={18}
                />
              </button>
            </div>
          )}
          {top}
        </div>
      )}
      <div className="aw-nav-rail__body">{children}</div>
      {bottom && <div className="aw-nav-rail__bottom">{bottom}</div>}
    </nav>
  )
}

/* ============================================================
 * AwNavRailGroup — a section with optional uppercase label.
 * ============================================================ */

export type AwNavRailGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: string
  children: React.ReactNode
}

export function AwNavRailGroup({
  label,
  className,
  children,
  ...rest
}: AwNavRailGroupProps) {
  const classes = ["aw-nav-rail__group", className].filter(Boolean).join(" ")
  return (
    <div className={classes} {...rest}>
      {label && <div className="aw-nav-rail__group-label">{label}</div>}
      <div className="aw-nav-rail__items">{children}</div>
    </div>
  )
}

/* ============================================================
 * AwNavRailItem.
 * ============================================================ */

export type AwNavRailItemProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "children"
> & {
  icon: string
  iconFill?: 0 | 1
  active?: boolean
  count?: number | string
  as?: "a" | "button"
  children: React.ReactNode
}

export function AwNavRailItem({
  icon,
  iconFill,
  active,
  count,
  children,
  className,
  as = "a",
  ...rest
}: AwNavRailItemProps) {
  const classes = [
    "aw-nav-rail__item",
    active && "aw-nav-rail__item--active",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const label = typeof children === "string" ? children : undefined

  const content = (
    <>
      <Icon name={icon} size={20} fill={iconFill ?? (active ? 1 : 0)} />
      <span className="aw-nav-rail__item-label">{children}</span>
      {count !== undefined && (
        <span className="aw-nav-rail__count">{count}</span>
      )}
    </>
  )

  if (as === "button") {
    return (
      <button
        type="button"
        aria-current={active ? "page" : undefined}
        aria-label={label}
        className={classes}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    )
  }
  return (
    <a
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={classes}
      {...rest}
    >
      {content}
    </a>
  )
}

/* ============================================================
 * Shared hook — click-outside + Esc to close a popover.
 * ============================================================ */

function useClosable(open: boolean, close: () => void) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, close])
  return ref
}

/* ============================================================
 * AwNavRailOrgSwitcher — organization selector.
 * ============================================================ */

export type AwNavRailOrgOption = {
  id: string
  name: string
  subtitle?: string
  icon?: string
}

export type AwNavRailOrgSwitcherProps = {
  organization: AwNavRailOrgOption
  organizations?: AwNavRailOrgOption[]
  onSelect?: (id: string) => void
  manageHref?: string
  manageLabel?: string
  className?: string
}

export function AwNavRailOrgSwitcher({
  organization,
  organizations,
  onSelect,
  manageHref,
  manageLabel = "Gerenciar organizações",
  className,
}: AwNavRailOrgSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const ref = useClosable(open, () => setOpen(false))

  return (
    <div
      ref={ref}
      className={["aw-nav-rail__switcher", className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        className="aw-nav-rail__switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Organização: ${organization.name}`}
      >
        <OrgIcon src={organization.icon} name={organization.name} />
        <div className="aw-nav-rail__switcher-text">
          <div className="aw-nav-rail__switcher-title">{organization.name}</div>
          {organization.subtitle && (
            <div className="aw-nav-rail__switcher-sub">
              {organization.subtitle}
            </div>
          )}
        </div>
        <Caret className="aw-nav-rail__switcher-caret" />
      </button>

      {open && (
        <div className="aw-nav-rail__menu aw-nav-rail__menu--bottom" role="menu">
          {organizations?.map((org) => {
            const active = org.id === organization.id
            return (
              <button
                key={org.id}
                type="button"
                role="menuitem"
                className={[
                  "aw-nav-rail__menu-item",
                  active && "aw-nav-rail__menu-item--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  onSelect?.(org.id)
                  setOpen(false)
                }}
              >
                <OrgIcon src={org.icon} name={org.name} compact />
                <div className="aw-nav-rail__menu-item-body">
                  <div className="aw-nav-rail__menu-item-title">{org.name}</div>
                  {org.subtitle && (
                    <div className="aw-nav-rail__menu-item-sub">
                      {org.subtitle}
                    </div>
                  )}
                </div>
              </button>
            )
          })}

          {manageHref && (
            <div className="aw-nav-rail__menu-footer">
              <a
                href={manageHref}
                role="menuitem"
                className="aw-nav-rail__menu-item"
                onClick={() => setOpen(false)}
              >
                <span className="aw-nav-rail__menu-item-body">
                  <span className="aw-nav-rail__menu-item-title">
                    {manageLabel}
                  </span>
                </span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function OrgIcon({
  src,
  name,
  compact,
}: {
  src?: string
  name: string
  compact?: boolean
}) {
  const size = compact ? 24 : 32
  return (
    <span
      className="aw-nav-rail__switcher-avatar"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="" />
      ) : (
        name.substring(0, 1).toUpperCase()
      )}
    </span>
  )
}

/* ============================================================
 * AwNavRailUserSwitcher — user selector at the bottom.
 * ============================================================ */

export type AwNavRailUserOption = {
  id: string
  name: string
  title?: string
  avatar?: string
  initials?: string
}

export type AwNavRailUserSwitcherProps = {
  user: AwNavRailUserOption
  users?: AwNavRailUserOption[]
  onSelect?: (id: string) => void
  signOutHref?: string
  signOutLabel?: string
  className?: string
}

export function AwNavRailUserSwitcher({
  user,
  users,
  onSelect,
  signOutHref,
  signOutLabel = "Sair / trocar conta",
  className,
}: AwNavRailUserSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const ref = useClosable(open, () => setOpen(false))

  return (
    <div
      ref={ref}
      className={["aw-nav-rail__switcher", className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        className="aw-nav-rail__switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Usuário: ${user.name}`}
      >
        <UserAvatar user={user} />
        <div className="aw-nav-rail__switcher-text">
          <div className="aw-nav-rail__switcher-title">{user.name}</div>
          {user.title && (
            <div className="aw-nav-rail__switcher-sub">{user.title}</div>
          )}
        </div>
        <Caret className="aw-nav-rail__switcher-caret" />
      </button>

      {open && (
        <div className="aw-nav-rail__menu aw-nav-rail__menu--top" role="menu">
          {users?.map((u) => {
            const active = u.id === user.id
            return (
              <button
                key={u.id}
                type="button"
                role="menuitem"
                className={[
                  "aw-nav-rail__menu-item",
                  active && "aw-nav-rail__menu-item--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  onSelect?.(u.id)
                  setOpen(false)
                }}
              >
                <UserAvatar user={u} compact />
                <div className="aw-nav-rail__menu-item-body">
                  <div className="aw-nav-rail__menu-item-title">{u.name}</div>
                  {u.title && (
                    <div className="aw-nav-rail__menu-item-sub">{u.title}</div>
                  )}
                </div>
              </button>
            )
          })}

          {signOutHref && (
            <div className="aw-nav-rail__menu-footer">
              <a
                href={signOutHref}
                role="menuitem"
                className="aw-nav-rail__menu-item aw-nav-rail__menu-item--danger"
                onClick={() => setOpen(false)}
              >
                <span className="aw-nav-rail__menu-item-body">
                  <span className="aw-nav-rail__menu-item-title">
                    {signOutLabel}
                  </span>
                </span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function UserAvatar({
  user,
  compact,
}: {
  user: AwNavRailUserOption
  compact?: boolean
}) {
  const size = compact ? 28 : 32
  return (
    <span
      className="aw-nav-rail__switcher-avatar aw-nav-rail__switcher-avatar--round"
      style={{ width: size, height: size }}
    >
      {user.avatar ? (
        <img src={user.avatar} alt="" />
      ) : (
        user.initials ?? user.name.substring(0, 2).toUpperCase()
      )}
    </span>
  )
}

/* ============================================================
 * Caret — shared SVG.
 * ============================================================ */

function Caret({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  )
}
