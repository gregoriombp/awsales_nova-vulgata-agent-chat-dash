"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwButton } from "@/components/ui/AwButton"
import AstralFlow from "@/components/astral-flow"

const HEX_CLIP =
  "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)"

export type AwSpecialistRole = {
  name: string
  role: string
  avatarSrc?: string
  initials?: string
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
        isAi && "aw-card--ai-cortex",
        "!rounded-full !px-4 !py-3 flex items-center gap-4",
      )}
    >
      {isAi ? (
        <div
          role="img"
          aria-label={data.name}
          className="relative h-12 w-12 shrink-0 overflow-hidden"
          style={{ clipPath: HEX_CLIP }}
        >
          <AstralFlow
            speed={0.35}
            color1="#141416"
            color2="#6B6E74"
            color3="#DDE0E4"
            className="!bg-[#141416]"
          />
        </div>
      ) : (
        <AwAvatar
          size="lg"
          src={data.avatarSrc}
          alt={data.name}
          initials={data.initials}
          className="!h-12 !w-12 !text-[16px]"
        />
      )}

      <div className="min-w-0 flex-1 flex items-baseline gap-2">
        <span className="truncate text-[14px] font-semibold text-[var(--fg-primary)]">
          {data.name}
        </span>
        <span className="truncate text-[12.5px] text-[var(--fg-secondary)]">
          {data.role}
        </span>
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
