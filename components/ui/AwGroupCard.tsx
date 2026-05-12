"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwButton } from "@/components/ui/AwButton"
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu"
import { Icon } from "@/components/ui/Icon"

export type AwGroupCardMember = {
  name: string
  avatar?: string
  initials: string
}

export type AwGroupCardProps = React.HTMLAttributes<HTMLElement> & {
  name: string
  description: string
  memberCount: number
  members: AwGroupCardMember[]
  /** Material symbol rendered next to the title. Defaults to `groups`. */
  icon?: string
  /** Photo rendered on the top half of the card. */
  backgroundImage?: string
  /** Max avatars rendered in the stack before collapsing into +N. Default 5. */
  maxAvatars?: number
  /** "Gerenciar equipe" CTA. */
  onManage?: () => void
  /** Items for the overflow dropdown. When omitted, the 3-dot button is hidden. */
  menu?: AwDropdownItem[]
  manageLabel?: string
}

export const AwGroupCard = React.forwardRef<HTMLElement, AwGroupCardProps>(
  function AwGroupCard(
    {
      name,
      description,
      memberCount,
      members,
      icon = "groups",
      backgroundImage,
      maxAvatars = 5,
      onManage,
      menu,
      manageLabel = "Gerenciar equipe",
      className,
      ...rest
    },
    ref,
  ) {
    const visible = members.slice(0, maxAvatars)
    const overflow = Math.max(memberCount - visible.length, 0)

    return (
      <article
        ref={ref}
        className={cn(
          "flex flex-col overflow-hidden rounded-[var(--radius-lg)]",
          "border border-[var(--border-subtle)] bg-[var(--bg-raised)]",
          "transition-colors duration-aw-fast hover:border-[var(--border-default)]",
          className,
        )}
        {...rest}
      >
        <div
          className="relative h-[180px] w-full bg-[var(--bg-muted)]"
          style={
            backgroundImage
              ? {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
          aria-hidden="true"
        >
          <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center">
            {visible.map((m, i) => (
              <AwAvatar
                key={`${m.name}-${i}`}
                size="lg"
                src={m.avatar}
                initials={m.initials}
                alt={m.name}
                className={cn(
                  "!h-12 !w-12 !text-[14px]",
                  "ring-2 ring-[var(--bg-raised)]",
                  i > 0 && "-ml-3",
                )}
              />
            ))}
            {overflow > 0 && (
              <span
                className={cn(
                  "aw-avatar -ml-3 !h-12 !w-12 !text-[12px]",
                  "ring-2 ring-[var(--bg-raised)]",
                  "!bg-[var(--bg-muted)] !text-[var(--fg-secondary)]",
                )}
              >
                +{overflow}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-10">
          <header className="flex items-center gap-3">
            <Icon
              name={icon}
              size={22}
              className="shrink-0 text-[var(--fg-primary)]"
            />
            <h3 className="m-0 flex-1 truncate text-[18px] font-semibold leading-tight tracking-[-0.01em] text-[var(--fg-primary)]">
              {name}
            </h3>
            <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--fg-secondary)]">
              <Icon name="groups" size={16} />
              {memberCount} {memberCount === 1 ? "Membro" : "Membros"}
            </span>
            {menu && menu.length > 0 && (
              <AwDropdownMenu
                align="end"
                trigger={
                  <AwButton
                    size="sm"
                    variant="ghost"
                    iconOnly="more_vert"
                    aria-label="Mais opções"
                  />
                }
                items={menu}
              />
            )}
          </header>

          <p className="m-0 line-clamp-2 text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
            {description}
          </p>

          <div className="mt-auto flex justify-end pt-2">
            <AwButton
              size="sm"
              variant="secondary"
              iconLeft="add"
              onClick={onManage}
              className="!rounded-full"
            >
              {manageLabel}
            </AwButton>
          </div>
        </div>
      </article>
    )
  },
)
