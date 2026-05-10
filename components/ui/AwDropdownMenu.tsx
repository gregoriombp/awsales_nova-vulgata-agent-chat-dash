"use client"

import * as React from "react"
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"
import { Icon } from "./Icon"

/**
 * AwDropdownMenu — declarative dropdown / action menu.
 *
 * Wraps `@radix-ui/react-dropdown-menu` with a single-component API that
 * mirrors `AwTabs` (items as data, trigger as a slot). Use it for sort
 * menus, row action menus, overflow menus, and any other "click-to-open"
 * list of commands.
 *
 * Items can be commands, separators, or labels. Commands optionally
 * carry an icon, a `checked` state (rendered as a trailing check),
 * a `danger` flag (paints the row in `--accent-danger`), and a
 * `disabled` flag.
 */

export type AwDropdownCommandItem = {
  id: string
  label: React.ReactNode
  icon?: string
  onSelect?: () => void
  /** Marks the row as the active selection — adds a trailing check. */
  checked?: boolean
  /** Renders the row in danger color. Use for destructive actions. */
  danger?: boolean
  disabled?: boolean
  separator?: false
  isLabel?: false
}

export type AwDropdownSeparatorItem = {
  id: string
  separator: true
}

export type AwDropdownLabelItem = {
  id: string
  isLabel: true
  label: React.ReactNode
}

export type AwDropdownItem =
  | AwDropdownCommandItem
  | AwDropdownSeparatorItem
  | AwDropdownLabelItem

export type AwDropdownMenuProps = {
  /** Click target. Forwarded to Radix via `asChild`, so the consumer's
   *  own button (AwButton, plain button, etc.) becomes the trigger. */
  trigger: React.ReactNode
  items: AwDropdownItem[]
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  /** Px gap between trigger and content. Default 4. */
  sideOffset?: number
  className?: string
  /** Optional aria-label for the menu surface. */
  "aria-label"?: string
}

function isSeparator(it: AwDropdownItem): it is AwDropdownSeparatorItem {
  return (it as AwDropdownSeparatorItem).separator === true
}
function isLabel(it: AwDropdownItem): it is AwDropdownLabelItem {
  return (it as AwDropdownLabelItem).isLabel === true
}

export function AwDropdownMenu({
  trigger,
  items,
  align = "end",
  side = "bottom",
  sideOffset = 4,
  className,
  "aria-label": ariaLabel,
}: AwDropdownMenuProps) {
  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          align={align}
          side={side}
          sideOffset={sideOffset}
          aria-label={ariaLabel}
          className={cn("aw-dropdown", className)}
        >
          {items.map((it) => {
            if (isSeparator(it)) {
              return (
                <DropdownPrimitive.Separator
                  key={it.id}
                  className="aw-dropdown__separator"
                />
              )
            }
            if (isLabel(it)) {
              return (
                <DropdownPrimitive.Label
                  key={it.id}
                  className="aw-dropdown__label"
                >
                  {it.label}
                </DropdownPrimitive.Label>
              )
            }
            return (
              <DropdownPrimitive.Item
                key={it.id}
                disabled={it.disabled}
                onSelect={(e) => {
                  if (!it.onSelect) return
                  /* Radix dismisses on select by default — that's the
                   * behaviour we want, so no preventDefault. */
                  it.onSelect()
                }}
                className={cn(
                  "aw-dropdown__item",
                  it.danger && "aw-dropdown__item--danger",
                  it.checked && "aw-dropdown__item--checked",
                )}
              >
                {it.icon && (
                  <Icon
                    name={it.icon}
                    size={16}
                    className="aw-dropdown__item-icon"
                  />
                )}
                <span className="aw-dropdown__item-label">{it.label}</span>
                {it.checked && (
                  <Icon
                    name="check"
                    size={14}
                    className="aw-dropdown__item-check"
                  />
                )}
              </DropdownPrimitive.Item>
            )
          })}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  )
}
