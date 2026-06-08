"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Icon } from "./Icon"

/**
 * AwShortcutTile — clickable icon + title + description row.
 *
 * Used to surface secondary pages on overview screens (Billing/Financeiro
 * landing, Settings hubs, etc.) without resorting to dense KPI cards.
 * Inspired by the OpenAI Platform billing overview shortcut grid.
 *
 * Anatomy:
 *   [icon container] · title (medium)
 *                      description (muted, optional)
 */

export type AwShortcutTileProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "title"
> & {
  /** Material Symbol icon name. */
  icon: string
  /** Tile heading. */
  title: React.ReactNode
  /** Optional secondary line under the title. */
  description?: React.ReactNode
  /** Destination route. */
  href: string
}

export const AwShortcutTile = React.forwardRef<
  HTMLAnchorElement,
  AwShortcutTileProps
>(function AwShortcutTile(
  { icon, title, description, href, className, ...rest },
  ref,
) {
  return (
    <Link
      ref={ref}
      href={href}
      data-slot="shortcut-tile"
      className={cn(
        "aw-shortcut-tile",
        "group flex items-start gap-3 rounded-md px-3 py-3 transition-colors duration-aw-fast",
        "hover:bg-(--bg-muted)",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--accent-brand) focus-visible:ring-offset-2",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-(--bg-inverse) text-(--fg-on-inverse) transition-colors"
      >
        <Icon name={icon} size={22} />
      </span>
      <span className="min-w-0 flex-1 pt-1">
        <span className="block body-sm font-medium text-(--fg-primary)">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block body-xs text-(--fg-secondary)">
            {description}
          </span>
        )}
      </span>
    </Link>
  )
})
