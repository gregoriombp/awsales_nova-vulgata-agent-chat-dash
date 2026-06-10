"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwButton } from "@/components/ui/AwButton"
import { AwCortexSynthesis } from "@/components/ui/AwCortexSynthesis"

// Flat-top regular hex inscribed in a 1:1 box (height ≈ 86.6%) with
// quadratic-Bézier rounded vertices. Encoded as an SVG mask so it scales
// with any container size.
const CORTEX_HEX_MASK = (() => {
  const path =
    "M5 41.34 L20 15.36 Q25 6.7 35 6.7 L65 6.7 Q75 6.7 80 15.36 L95 41.34 Q100 50 95 58.66 L80 84.64 Q75 93.3 65 93.3 L35 93.3 Q25 93.3 20 84.64 L5 58.66 Q0 50 5 41.34 Z"
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${path}' fill='black'/></svg>`
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
})()

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
  /** Um único especialista humano (uso clássico, par humano + IA). */
  human?: AwSpecialistRole
  /** Vários especialistas humanos — quando presente, supersede `human`. */
  humans?: AwSpecialistRole[]
  ai: AwSpecialistRole
  className?: string
}

export function AwSpecialistsPair({
  title,
  description,
  human,
  humans,
  ai,
  className,
}: AwSpecialistsPairProps) {
  const humanList = humans ?? (human ? [human] : [])
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {(title || description) && (
        <header>
          {title && (
            <h2 className="m-0 text-(length:--body-sm-size) font-semibold text-(--fg-primary)">
              {title}
            </h2>
          )}
          {description && (
            <p className="m-0 mt-2 max-w-[760px] text-[12.5px] leading-[1.55] text-(--fg-secondary)">
              {description}
            </p>
          )}
        </header>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {humanList.map((person) => (
          <SpecialistCard key={person.name} data={person} kind="human" />
        ))}
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
        "rounded-full! px-4! py-3! flex items-center gap-4",
      )}
    >
      {isAi ? (
        <div
          role="img"
          aria-label={data.name}
          className="relative h-12 w-12 shrink-0 overflow-hidden"
          style={{
            maskImage: CORTEX_HEX_MASK,
            WebkitMaskImage: CORTEX_HEX_MASK,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskMode: "alpha",
          }}
        >
          <AwCortexSynthesis backgroundColor="var(--bg-inverse)" />
        </div>
      ) : (
        <AwAvatar
          size="lg"
          src={data.avatarSrc}
          alt={data.name}
          initials={data.initials}
          className="h-12! w-12! text-(length:--body-md-size)!"
        />
      )}

      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="truncate text-(length:--body-sm-size) font-semibold text-(--fg-primary)">
          {data.name}
        </span>
        <span className="truncate text-[12.5px] text-(--fg-secondary)">
          {data.role}
        </span>
      </div>

      <AwButton
        size="md"
        variant={isAi ? "primary" : "secondary"}
        iconLeft={data.ctaIcon}
        onClick={data.onCtaClick}
        className="rounded-full! shrink-0"
      >
        {data.ctaLabel}
      </AwButton>
    </div>
  )
}
