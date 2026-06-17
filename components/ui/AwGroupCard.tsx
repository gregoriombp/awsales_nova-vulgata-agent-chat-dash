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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  /** Opens a "ver todos" modal — wired to the +N overflow chip. */
  onOpenMembers?: () => void
  /** Threshold above which the +N chip becomes a clickable "ver todos" entry point. Default 3. */
  openMembersThreshold?: number
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
      onOpenMembers,
      openMembersThreshold = 3,
      className,
      ...rest
    },
    ref,
  ) {
    const visible = members.slice(0, maxAvatars)
    const overflow = Math.max(memberCount - visible.length, 0)
    const overflowClickable =
      onOpenMembers !== undefined && memberCount > openMembersThreshold

    return (
      <article
        ref={ref}
        onClick={onManage}
        className={cn(
          "flex flex-col overflow-hidden rounded-xl",
          "border border-(--border-subtle) bg-(--aw-gray-100)",
          "transition-colors duration-aw-fast hover:border-(--border-default)",
          onManage && "cursor-pointer",
          className,
        )}
        {...rest}
      >
        <div
          className="relative h-[180px] w-full bg-(--aw-gray-100)"
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
          <div className="absolute inset-0 flex items-center justify-center">
            <TooltipProvider delayDuration={120}>
              <div className="flex items-center">
                {visible.map((m, i) => (
                  <Tooltip key={`${m.name}-${i}`}>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "inline-block",
                          i > 0 && "-ml-3",
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AwAvatar
                          size="lg"
                          src={m.avatar}
                          initials={m.initials}
                          alt={m.name}
                          className={cn(
                            "h-10! w-10! text-(length:--body-sm-size)!",
                            "ring-1 ring-(--bg-raised)",
                          )}
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <span className="body-xs">{m.name}</span>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {overflow > 0 && (
                  overflowClickable ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenMembers?.()
                      }}
                      aria-label="Ver todos os membros"
                      className={cn(
                        "aw-avatar -ml-3 h-10! w-10! text-(length:--body-xs-size)!",
                        "ring-1 ring-(--bg-raised)",
                        "bg-(--bg-muted)! text-(--fg-secondary)!",
                        "transition-colors hover:bg-(--bg-hover)! hover:text-(--fg-primary)!",
                      )}
                    >
                      +{overflow}
                    </button>
                  ) : (
                    <span
                      className={cn(
                        "aw-avatar -ml-3 h-10! w-10! text-(length:--body-xs-size)!",
                        "ring-1 ring-(--bg-raised)",
                        "bg-(--bg-muted)! text-(--fg-secondary)!",
                      )}
                    >
                      +{overflow}
                    </span>
                  )
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-5">
          <header className="flex items-center gap-3">
            <h3 className="m-0 flex-1 truncate text-(length:--body-lg-size) font-semibold leading-tight tracking-heading text-(--fg-primary)">
              {name}
            </h3>
            <span className="text-[12.5px] text-(--fg-secondary)">
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

          <p className="m-0 line-clamp-2 text-sm leading-[1.55] text-(--fg-secondary)">
            {description}
          </p>

        </div>
      </article>
    )
  },
)
