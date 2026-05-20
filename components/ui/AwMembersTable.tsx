"use client"

import * as React from "react"
import { AwAvatar, type AwAvatarSize } from "@/components/ui/AwAvatar"
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill"
import { AwSelect } from "@/components/ui/AwSelect"
import { AwTable } from "@/components/ui/AwTable"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------
 * AwMembersTable — Mobbin-style "people" table.
 *
 * Composes AwTable (airy variant) + AwAvatar + AwPill + AwSelect.
 * Provides the column-header / person-cell / select-cell recipes
 * so feature pages don't re-implement the pattern.
 * ----------------------------------------------------------------- */

export type AwMembersTableSortDir = "asc" | "desc"

export type AwMembersTableSort = {
  by: string
  dir: AwMembersTableSortDir
}

export type AwMembersTableColumn = {
  label: React.ReactNode
  /** Material icon name rendered to the left of the column label (e.g. "person"). */
  icon?: string
  /** Tooltip-style hint shown via a help (?) glyph after the label. */
  help?: string
  /** Fixed pixel width for the column. */
  width?: number
  align?: "left" | "right"
  /**
   * Make this column sortable. Pair with the `sort` + `onSort` props on
   * `AwMembersTable` to receive click events.
   */
  sortKey?: string
}

export type AwMembersTableProps = React.HTMLAttributes<HTMLTableElement> & {
  columns: AwMembersTableColumn[]
  /** Active sort state. When omitted, no column shows an active sort. */
  sort?: AwMembersTableSort
  /** Fires when a sortable header is clicked. Toggle dir externally. */
  onSort?: (key: string) => void
  children?: React.ReactNode
}

function SortGlyph({
  active,
  dir,
}: {
  active: boolean
  dir: AwMembersTableSortDir
}) {
  if (!active) {
    return <Icon name="unfold_more" size={14} aria-hidden="true" />
  }
  return (
    <Icon
      name={dir === "asc" ? "arrow_upward" : "arrow_downward"}
      size={14}
      aria-hidden="true"
    />
  )
}

export function AwMembersTable({
  columns,
  sort,
  onSort,
  children,
  className,
  ...rest
}: AwMembersTableProps) {
  return (
    <AwTable className={cn("aw-table--airy", className)} {...rest}>
      <thead>
        <tr>
          {columns.map((col, i) => {
            const sortable = !!col.sortKey
            const active = sortable && sort?.by === col.sortKey
            const ariaSort: React.AriaAttributes["aria-sort"] = active
              ? sort?.dir === "asc"
                ? "ascending"
                : "descending"
              : sortable
                ? "none"
                : undefined

            const inner = (
              <>
                {col.icon && (
                  <span className="inline-flex h-5 w-5 items-center justify-center text-[var(--fg-tertiary)]">
                    <Icon name={col.icon} size={16} />
                  </span>
                )}
                <span>{col.label}</span>
                {col.help && (
                  <span
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--fg-tertiary)]"
                    title={col.help}
                    aria-label={col.help}
                  >
                    <Icon name="help" size={13} />
                  </span>
                )}
                {sortable && (
                  <SortGlyph
                    active={!!active}
                    dir={sort?.dir ?? "asc"}
                  />
                )}
              </>
            )

            return (
              <th
                key={i}
                style={{ width: col.width, textAlign: col.align ?? "left" }}
                aria-sort={ariaSort}
              >
                {sortable ? (
                  <button
                    type="button"
                    className="aw-th-sort"
                    onClick={() => onSort?.(col.sortKey!)}
                  >
                    {inner}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    {inner}
                  </span>
                )}
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </AwTable>
  )
}

/* -----------------------------------------------------------------
 * Person cell — avatar + name + optional tag + email subtitle.
 * ----------------------------------------------------------------- */

export type AwMembersTablePersonCellProps =
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    /** Rendered name. ReactNode supported — pass e.g. <>Greg <span>(você)</span></>. */
    name: React.ReactNode
    email?: string
    /** Optional third line below email (e.g. organization name). */
    subtitle?: string
    avatarSrc?: string
    /** Required when `name` is not a string. */
    initials?: string
    avatarSize?: AwAvatarSize
    /** Pill content rendered inline next to the name (e.g. "ADMIN"). */
    tag?: React.ReactNode
    tagVariant?: AwPillVariant
  }

export function AwMembersTablePersonCell({
  name,
  email,
  subtitle,
  avatarSrc,
  initials,
  avatarSize = "md",
  tag,
  tagVariant = "neutral",
  className,
  ...rest
}: AwMembersTablePersonCellProps) {
  const fallbackInitials =
    initials ??
    (typeof name === "string"
      ? name
          .split(" ")
          .map((p) => p.charAt(0))
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?")

  return (
    <td className={className} {...rest}>
      <span className="flex items-center gap-3">
        <AwAvatar
          size={avatarSize}
          src={avatarSrc}
          initials={fallbackInitials}
          alt={typeof name === "string" ? name : undefined}
        />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-[14px] font-medium text-[var(--fg-primary)]">
              {name}
            </span>
            {tag && (
              <AwPill variant={tagVariant} dot={false}>
                {tag}
              </AwPill>
            )}
          </span>
          {email && (
            <span className="truncate text-[12.5px] text-[var(--fg-secondary)]">
              {email}
            </span>
          )}
          {subtitle && (
            <span className="truncate text-[11.5px] text-[var(--fg-tertiary)]">
              {subtitle}
            </span>
          )}
        </span>
      </span>
    </td>
  )
}

/* -----------------------------------------------------------------
 * Select cell — clickable dropdown trigger inside a table cell.
 * onClick is exposed so feature pages can wire AwDropdownMenu, etc.
 * ----------------------------------------------------------------- */

export type AwMembersTableSelectCellProps =
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    value: React.ReactNode
    onSelectClick?: React.MouseEventHandler<HTMLButtonElement>
    selectAriaLabel?: string
  }

export function AwMembersTableSelectCell({
  value,
  onSelectClick,
  selectAriaLabel,
  className,
  ...rest
}: AwMembersTableSelectCellProps) {
  return (
    <td className={className} {...rest}>
      <AwSelect onClick={onSelectClick} aria-label={selectAriaLabel}>
        {value}
      </AwSelect>
    </td>
  )
}

/* -----------------------------------------------------------------
 * Plain text cell — utility helper for read-only columns
 * (e.g. "Last viewed a map", "Editor" without dropdown).
 * ----------------------------------------------------------------- */

export type AwMembersTableTextCellProps =
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    children: React.ReactNode
    muted?: boolean
  }

export function AwMembersTableTextCell({
  children,
  muted,
  className,
  ...rest
}: AwMembersTableTextCellProps) {
  return (
    <td
      className={cn(
        muted ? "text-[var(--fg-secondary)]" : "text-[var(--fg-primary)]",
        className
      )}
      {...rest}
    >
      {children}
    </td>
  )
}
