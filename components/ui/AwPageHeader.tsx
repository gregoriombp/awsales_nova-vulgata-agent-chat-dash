import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon, type IconProps } from "./Icon"

export type AwPageHeaderSize = "hero" | "default" | "compact"

type IconConfig = {
  name: string
  size?: number
  weight?: IconProps["weight"]
  fill?: IconProps["fill"]
}

export type AwPageHeaderIcon = string | IconConfig | React.ReactNode

export type AwPageHeaderProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "title"
> & {
  size?: AwPageHeaderSize
  /** Small label, badges, or breadcrumb above the title. */
  eyebrow?: React.ReactNode
  /** Material symbol name, custom Icon config, or any ReactNode (logo, avatar...). */
  icon?: AwPageHeaderIcon
  title: React.ReactNode
  description?: React.ReactNode
  /** Right-side controls — buttons, dropdowns. */
  actions?: React.ReactNode
  /** Full-width row below header — tabs, search, filters. */
  toolbar?: React.ReactNode
  /** Bottom divider line. Defaults to true. */
  divider?: boolean
}

const ICON_SIZE: Record<AwPageHeaderSize, number> = {
  hero: 48,
  default: 28,
  compact: 22,
}

const ICON_WEIGHT: Record<AwPageHeaderSize, IconProps["weight"]> = {
  hero: 300,
  default: 400,
  compact: 400,
}

const TITLE_CLASS: Record<AwPageHeaderSize, string> = {
  hero: "text-[length:var(--h1-size)] leading-[1.1] tracking-[-0.04em]",
  default: "text-[length:var(--h3-size)] font-semibold leading-tight tracking-[-0.02em]",
  compact: "text-[length:var(--h5-size)] font-semibold leading-tight tracking-[-0.01em]",
}

const TITLE_GAP: Record<AwPageHeaderSize, string> = {
  hero: "gap-3",
  default: "gap-2.5",
  compact: "gap-2",
}

function isIconConfig(v: unknown): v is IconConfig {
  return (
    !!v &&
    typeof v === "object" &&
    !React.isValidElement(v) &&
    "name" in (v as Record<string, unknown>) &&
    typeof (v as { name: unknown }).name === "string"
  )
}

function renderIcon(
  icon: AwPageHeaderIcon | undefined,
  size: AwPageHeaderSize,
): React.ReactNode {
  if (icon == null || icon === false) return null
  if (typeof icon === "string") {
    return <Icon name={icon} size={ICON_SIZE[size]} weight={ICON_WEIGHT[size]} />
  }
  if (isIconConfig(icon)) {
    return (
      <Icon
        name={icon.name}
        size={icon.size ?? ICON_SIZE[size]}
        weight={icon.weight ?? ICON_WEIGHT[size]}
        fill={icon.fill}
      />
    )
  }
  return icon
}

export const AwPageHeader = React.forwardRef<HTMLElement, AwPageHeaderProps>(
  function AwPageHeader(
    {
      size = "hero",
      eyebrow,
      icon,
      title,
      description,
      actions,
      toolbar,
      divider = true,
      className,
      ...rest
    },
    ref,
  ) {
    const iconNode = renderIcon(icon, size)

    return (
      <header
        ref={ref}
        className={cn(
          "flex flex-col",
          toolbar ? "gap-6" : "gap-0",
          divider && "mb-10 border-b border-[var(--border-subtle)] pb-6",
          className,
        )}
        {...rest}
      >
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <div className="mb-2 flex items-center gap-2 text-[length:var(--body-xs-size)] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
                {eyebrow}
              </div>
            )}
            <h1
              className={cn(
                "m-0 flex items-center text-[var(--fg-primary)]",
                description ? "mb-1.5" : undefined,
                TITLE_GAP[size],
                TITLE_CLASS[size],
              )}
            >
              {iconNode}
              <span className="min-w-0">{title}</span>
            </h1>
            {description && (
              <p className="m-0 max-w-[560px] text-sm leading-[1.5] text-[var(--fg-secondary)]">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-shrink-0 items-center gap-2">
              {actions}
            </div>
          )}
        </div>
        {toolbar && (
          <div className="flex flex-wrap items-center gap-3">{toolbar}</div>
        )}
      </header>
    )
  },
)
