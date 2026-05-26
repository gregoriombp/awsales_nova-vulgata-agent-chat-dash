"use client"

import * as React from "react"
import Link from "next/link"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

export type AwAgentTileTone =
  | "lime"
  | "amber"
  | "emerald"
  | "blue"
  | "purple"
  | "pink"
  | "neutral"

export type AwAgentTileProps = {
  /** Caminho do orb do agente. Quando presente, renderiza no lugar do ícone tonal. */
  avatarSrc?: string
  /** Material Symbol exibido no container tonal — usado quando avatarSrc está ausente. */
  icon?: string
  /** Cor do container do ícone — ignorada quando avatarSrc está presente. */
  tone?: AwAgentTileTone
  title: string
  description: string
  authorName: string
  authorAvatar?: string
  count?: number
  href?: string
  className?: string
}

const TONE_BG: Record<AwAgentTileTone, string> = {
  lime:    "bg-[var(--aw-lime-500)]",
  amber:   "bg-[var(--aw-amber-500)]",
  emerald: "bg-[var(--aw-emerald-500)]",
  blue:    "bg-[var(--aw-blue-500)]",
  purple:  "bg-[var(--aw-purple-500)]",
  pink:    "bg-[var(--aw-pink-500)]",
  neutral: "bg-[var(--bg-surface)]",
}

const TONE_FG: Record<AwAgentTileTone, string> = {
  lime:    "text-[var(--aw-lime-1200)]",
  amber:   "text-[var(--aw-amber-1200)]",
  emerald: "text-[var(--aw-emerald-1200)]",
  blue:    "text-[var(--aw-blue-1200)]",
  purple:  "text-[var(--aw-purple-1000)]",
  pink:    "text-[var(--aw-pink-1200)]",
  neutral: "text-[var(--fg-primary)]",
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function AwAgentTile({
  avatarSrc,
  icon,
  tone = "neutral",
  title,
  description,
  authorName,
  authorAvatar,
  count,
  href,
  className,
}: AwAgentTileProps) {
  const content = (
    <div
      className={cn(
        "group flex w-full items-start gap-4 rounded-[var(--radius-lg)] p-3 transition-colors",
        href && "cursor-pointer hover:bg-[var(--bg-hover)]",
        className
      )}
    >
      {avatarSrc ? (
        <div className="relative flex h-[88px] w-[88px] flex-shrink-0 items-center justify-center">
          <img
            src={avatarSrc}
            alt=""
            className="h-full w-full rounded-[var(--radius-lg)] object-cover"
            aria-hidden
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex h-[88px] w-[88px] flex-shrink-0 items-center justify-center rounded-[var(--radius-lg)]",
            TONE_BG[tone],
            TONE_FG[tone]
          )}
        >
          {icon ? <Icon name={icon} size={32} weight={400} /> : null}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
        <div className="flex flex-col gap-1">
          <h3 className="m-0 truncate text-[15px] font-medium leading-tight text-[var(--fg-primary)]">
            {title}
          </h3>
          <p className="m-0 line-clamp-2 text-[13.5px] leading-[1.45] text-[var(--fg-secondary)]">
            {description}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <AwAvatar
              size="sm"
              src={authorAvatar}
              initials={initialsOf(authorName)}
              alt={authorName}
            />
            <span className="text-[12.5px] text-[var(--fg-tertiary)]">
              {authorName}
            </span>
          </div>

          {typeof count === "number" && (
            <span className="inline-flex items-center gap-1 text-[12.5px] text-[var(--fg-tertiary)]">
              <Icon name="add_box" size={14} weight={300} />
              {count}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)] rounded-[var(--radius-lg)]"
      >
        {content}
      </Link>
    )
  }
  return content
}
