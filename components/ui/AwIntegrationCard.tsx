"use client"

import * as React from "react"
import { AwBrandLogo } from "./AwBrandLogo"
import { AwButton, type AwButtonVariant } from "./AwButton"
import { AwCard } from "./AwCard"
import { AwStatusDot } from "./AwStatusDot"
import { Icon } from "./Icon"

export type AwIntegrationCardState =
  | "connected"
  | "available"
  | "attention"
  | "disabled"

export type AwIntegrationCardProps = {
  /** Brand id from AwBrandLogo registry — fallback monogram if unknown. */
  brand: string
  /** Display name (e.g. "WhatsApp"). */
  name: string
  /** Domain shown under the name (e.g. "whatsapp.com"). */
  domain: string
  /** Two-line description. Clamped at 2 lines. */
  description: string
  /** Connection state. Drives pill + footer + dot rendering. */
  state: AwIntegrationCardState
  /** Number of connected accounts when state="connected". Renders only if > 1. */
  instances?: number
  /** Footer-left meta override. Defaults to a state-based label. */
  meta?: React.ReactNode
  /** Footer-right CTA override. Defaults to a state-based label. */
  cta?: React.ReactNode
  /** Click handler. Card is interactive when set. */
  onClick?: () => void
  className?: string
}

const DEFAULT_META: Record<AwIntegrationCardState, React.ReactNode> = {
  connected: (
    <>
      <Icon name="sync" size={12} />
      Sincronizado há 2 min
    </>
  ),
  attention: (
    <>
      <Icon name="warning" size={12} />
      Token expira em 3 dias
    </>
  ),
  available: "Disponível",
  disabled: "Indisponível",
}

const CTA_LABEL: Record<AwIntegrationCardState, string> = {
  connected: "Gerenciar",
  attention: "Reconectar",
  available: "Conectar",
  disabled: "Em breve",
}

const CTA_VARIANT: Record<AwIntegrationCardState, AwButtonVariant> = {
  connected: "secondary",
  attention: "primary",
  available: "primary",
  disabled: "secondary",
}

export function AwIntegrationCard({
  brand,
  name,
  domain,
  description,
  state,
  meta,
  cta,
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

  const metaIsWarn = state === "attention"

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
      <div className="aw-integration-card__top">
        <div className="aw-integration-card__logo-wrap">
          <AwBrandLogo brand={brand} size="md" />
          {state === "connected" && (
            <AwStatusDot variant="live" size="md" ring absolute />
          )}
        </div>
      </div>

      <div>
        <h3 className="aw-integration-card__name">{name}</h3>
        <p className="aw-integration-card__domain">{domain}</p>
      </div>

      <p className="aw-integration-card__desc">{description}</p>

      <div className="aw-integration-card__foot">
        <span
          className={
            "aw-integration-card__meta" +
            (metaIsWarn ? " aw-integration-card__meta--warn" : "")
          }
        >
          {meta ?? DEFAULT_META[state]}
        </span>
        {cta ?? (
          <AwButton
            variant={CTA_VARIANT[state]}
            size="sm"
            disabled={state === "disabled"}
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            {CTA_LABEL[state]}
          </AwButton>
        )}
      </div>
    </AwCard>
  )
}
