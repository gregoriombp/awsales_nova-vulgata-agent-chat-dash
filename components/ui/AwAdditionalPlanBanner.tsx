"use client"

import * as React from "react"
import Link from "next/link"
import { Icon } from "./Icon"

export type AwAdditionalPlanBannerProps = {
  /** Quantidade de planos comprados sem org configurada. Default 1. */
  count?: number
  /** Nome da org sugerida — quando há só 1 pendente, fica mais natural mostrar. */
  orgName?: string
  /** href do CTA primário. */
  configureHref?: string
  /** Callback quando o usuário dispensa o banner (preview-only). */
  onDismiss?: () => void
  className?: string
}

export function AwAdditionalPlanBanner({
  count = 1,
  orgName,
  configureHref = "/organizacao-adicional",
  onDismiss,
  className,
}: AwAdditionalPlanBannerProps) {
  const isPlural = count > 1
  const title = isPlural
    ? `Você tem ${count} planos sem organização configurada`
    : orgName
      ? `${orgName} ainda não foi configurada`
      : "Você tem 1 plano sem organização configurada"

  const description = isPlural
    ? "Configure cada uma para começar a usar — leva poucos minutos."
    : "Aceite o contrato e finalize o pagamento para começar a usar — leva poucos minutos."

  return (
    <div
      role="status"
      className={[
        "flex items-start gap-3 rounded-xl border px-4 py-3.5 sm:items-center",
        className ?? "",
      ].join(" ")}
      style={{
        background: "var(--aw-amber-100)",
        borderColor: "var(--aw-amber-300)",
      }}
    >
      <span
        aria-hidden
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--aw-amber-200)", color: "var(--aw-amber-900)" }}
      >
        <Icon name="schedule" size={18} fill={1} />
      </span>

      <div className="min-w-0 flex-1">
        <div
          className="body-sm font-medium"
          style={{ color: "var(--aw-amber-900)" }}
        >
          {title}
        </div>
        <div
          className="mt-0.5 body-xs"
          style={{ color: "var(--aw-amber-800)" }}
        >
          {description}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <Link href={configureHref} className="aw-btn aw-btn--primary aw-btn--sm">
          <span className="aw-btn__label">Configurar agora</span>
          <Icon name="arrow_forward" size={14} />
        </Link>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dispensar"
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-aw-fast hover:bg-aw-amber-200"
            style={{ color: "var(--aw-amber-900)" }}
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
