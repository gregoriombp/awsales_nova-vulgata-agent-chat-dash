"use client"

import * as React from "react"
import { AwBrandLogo } from "./AwBrandLogo"
import { AwCard } from "./AwCard"
import { AwStatusDot } from "./AwStatusDot"

export type AwIntegrationCardState =
  | "connected"
  | "available"
  | "attention"
  | "disabled"

export type AwIntegrationCardProps = {
  brand: string
  name: string
  domain: string
  description: string
  state: AwIntegrationCardState
  instances?: number
  onClick?: () => void
  className?: string
}

export function AwIntegrationCard({
  brand,
  name,
  domain,
  description,
  state,
  onClick,
  className,
}: AwIntegrationCardProps) {
  const interactive = state !== "disabled" && !!onClick
  const handleKey: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!interactive) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <AwCard
      interactive={interactive}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `${name} — ${domain}` : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={handleKey}
      className={
        "aw-integration-card" + (className ? " " + className : "")
      }
    >
      <div className="aw-integration-card__head">
        <div className="aw-integration-card__logo-wrap">
          <AwBrandLogo
            brand={brand}
            size="lg"
            bare
            className="aw-integration-card__logo"
          />
          {state === "connected" && (
            <AwStatusDot variant="live" size="md" ring absolute />
          )}
        </div>
        <div className="aw-integration-card__heading">
          <h3 className="aw-integration-card__name">{name}</h3>
          <p className="aw-integration-card__domain">{domain}</p>
        </div>
      </div>

      <p className="aw-integration-card__desc">{description}</p>
    </AwCard>
  )
}
