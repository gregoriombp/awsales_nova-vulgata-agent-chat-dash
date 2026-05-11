"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwButton } from "@/components/ui/AwButton"
import { Icon } from "@/components/ui/Icon"

export type AwSpecialistRole = {
  name: string
  role: string
  /** Optional Material Symbol shown next to the role label. */
  roleIcon?: string
  avatarSrc?: string
  initials?: string
  description: string
  ctaLabel: string
  ctaIcon?: string
  onCtaClick?: () => void
}

export type AwSpecialistsPairProps = {
  title?: string
  description?: string
  human: AwSpecialistRole
  ai: AwSpecialistRole
  className?: string
}

export function AwSpecialistsPair({
  title,
  description,
  human,
  ai,
  className,
}: AwSpecialistsPairProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {(title || description) && (
        <header>
          {title && (
            <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
              {title}
            </h2>
          )}
          {description && (
            <p className="m-0 mt-2 max-w-[760px] text-[12.5px] leading-[1.55] text-[var(--fg-secondary)]">
              {description}
            </p>
          )}
        </header>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SpecialistCard data={human} kind="human" />
        <SpecialistCard data={ai} kind="ai" />
      </div>
    </section>
  )
}

function SpecialistCard({
  data,
  kind,
}: {
  data: AwSpecialistRole
  kind: "human" | "ai"
}) {
  const isAi = kind === "ai"
  return (
    <div
      className={cn(
        "aw-card",
        isAi ? "aw-card--ai-cortex" : "aw-card--ai-warm",
        "!rounded-full !px-4 !py-3 flex items-center gap-4",
      )}
    >
      {isAi ? (
        <img
          src={data.avatarSrc}
          alt={data.name}
          className="h-14 w-14 shrink-0 rounded-2xl object-cover"
        />
      ) : (
        <AwAvatar
          size="lg"
          src={data.avatarSrc}
          alt={data.name}
          initials={data.initials}
          className="!h-14 !w-14 !text-[18px]"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-[var(--fg-primary)]">
            {data.name}
          </span>
          {data.roleIcon && (
            <Icon
              name={data.roleIcon}
              size={14}
              className="shrink-0 text-[var(--fg-tertiary)]"
            />
          )}
          <span className="truncate text-[12.5px] text-[var(--fg-secondary)]">
            {data.role}
          </span>
        </div>
        <p className="m-0 mt-0.5 truncate text-[12.5px] leading-[1.5] text-[var(--fg-secondary)]">
          {data.description}
        </p>
      </div>

      <AwButton
        size="md"
        variant={isAi ? "primary" : "secondary"}
        iconLeft={data.ctaIcon}
        onClick={data.onCtaClick}
        className="!rounded-full shrink-0"
      >
        {data.ctaLabel}
      </AwButton>
    </div>
  )
}
