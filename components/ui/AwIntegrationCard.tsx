"use client"

import * as React from "react"
import { AwBrandLogo } from "./AwBrandLogo"
import { AwButton } from "./AwButton"
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
  /** Connection state. Drives footer + dot rendering. */
  state: AwIntegrationCardState
  /** Number of connected accounts when state="connected". (Currently unused — kept for API compat.) */
  instances?: number
  /** Footer-left meta override. Defaults to a state-based label. */
  meta?: React.ReactNode
  /** Footer-right CTA override. Defaults to state-based buttons. */
  cta?: React.ReactNode
  /** Default click handler — fires on card click and on the primary CTA. */
  onClick?: () => void
  /** Connected-state action: open settings. Defaults to onClick. */
  onSettings?: () => void
  /** Connected-state action: disconnect. Defaults to onClick. */
  onDisconnect?: () => void
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

export function AwIntegrationCard({
  brand,
  name,
  domain,
  description,
  state,
  meta,
  cta,
  onClick,
  onSettings,
  onDisconnect,
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
  const isActive = state === "connected" || state === "attention"

  const stop = (cb?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    cb?.()
  }

  const renderActions = () => {
    if (cta) return cta
    if (state === "disabled") {
      return (
        <AwButton variant="secondary" size="sm" disabled>
          Em breve
        </AwButton>
      )
    }
    if (isActive) {
      return (
        <span className="aw-integration-card__actions">
          <AwButton
            variant="secondary"
            size="sm"
            iconOnly="settings"
            aria-label={`Configurar ${name}`}
            onClick={stop(onSettings ?? onClick)}
          />
          <AwButton
            variant="secondary"
            size="sm"
            iconLeft="link_off"
            aria-label={`Desativar ${name}`}
            onClick={stop(onDisconnect ?? onClick)}
          >
            Desativar
          </AwButton>
        </span>
      )
    }
    return (
      <AwButton variant="primary" size="sm" onClick={stop(onClick)}>
        Conectar
      </AwButton>
    )
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

      <div className="aw-integration-card__foot">
        <span
          className={
            "aw-integration-card__meta" +
            (metaIsWarn ? " aw-integration-card__meta--warn" : "")
          }
        >
          {meta ?? DEFAULT_META[state]}
        </span>
        {renderActions()}
      </div>
    </AwCard>
  )
}
