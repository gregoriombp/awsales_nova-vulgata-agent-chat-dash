"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwCardBrand, type AwCardBrandId } from "@/components/ui/AwCardBrand"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

const BRAND_LABEL: Record<AwCardBrandId, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  elo: "Elo",
  hipercard: "Hipercard",
  diners: "Diners",
  discover: "Discover",
  unknown: "Card",
}

export type PaymentMethodCardProps = {
  /** Card brand. Drives the flag tile and the "<Brand> Card" subtitle. */
  brand: AwCardBrandId
  /** Last 4 digits of the PAN. Rendered emphasized after the mask. */
  last4: string
  /** Shows the dark "Default" pill at the top-right when true. */
  isDefault?: boolean
  onEdit?: () => void
  onRemove?: () => void
  /** Disables the remove action (e.g. when it's the only method on file). */
  removeDisabled?: boolean
  /** Override the "<Brand> Card" subtitle. */
  subtitle?: React.ReactNode
  className?: string
}

/**
 * Payment method card (default/primary variant).
 *
 * Adapted from the Creative Tim payment-method-01 block: prominent brand tile
 * (88×88) on the left, masked PAN with the last four emphasized to the right,
 * a thin "<Brand> Card" subtitle below, and a quiet edit/delete row at the
 * bottom. The "Default" pill sits at the top-right corner. No shadow.
 *
 * Variants beyond "default" (extra cards / fallback rows) are intentionally
 * out of scope here — this card replaces the principal payment method block
 * only. Other rows on the page use a flatter list layout.
 */
export function PaymentMethodCard({
  brand,
  last4,
  isDefault = false,
  onEdit,
  onRemove,
  removeDisabled = false,
  subtitle,
  className,
}: PaymentMethodCardProps) {
  const brandLabel = BRAND_LABEL[brand]
  return (
    <article
      className={cn(
        "relative flex flex-col gap-5 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6",
        className
      )}
      aria-label={`${brandLabel} •••• ${last4}`}
    >
      {isDefault && (
        <span
          className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--bg-inverse)] px-3 py-1.5 body-xs font-medium text-[var(--fg-on-inverse)]"
          aria-label="Método padrão"
        >
          <Icon name="check" size={14} weight={500} />
          Default
        </span>
      )}

      <div className="flex items-center gap-5">
        <AwCardBrand brand={brand} size="xl" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2 tabular-nums">
            <span className="body-md font-medium tracking-[0.18em] text-[var(--fg-tertiary)]">
              ••••&nbsp;••••&nbsp;••••
            </span>
            <span className="text-[24px] font-semibold leading-none text-[var(--fg-primary)]">
              {last4}
            </span>
          </div>
          <p className="m-0 mt-1.5 body-sm text-[var(--fg-secondary)]">
            {subtitle ?? `${brandLabel} Card`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onEdit && (
          <AwButton
            size="sm"
            variant="ghost"
            iconOnly="edit"
            onClick={onEdit}
            aria-label={`Editar ${brandLabel} •••• ${last4}`}
          />
        )}
        {onRemove && (
          <AwButton
            size="sm"
            variant="ghost"
            iconOnly="delete"
            onClick={onRemove}
            disabled={removeDisabled}
            aria-label={`Remover ${brandLabel} •••• ${last4}`}
            className="text-[var(--accent-danger)] hover:!bg-[var(--aw-red-100)] disabled:!text-[var(--fg-muted)]"
          />
        )}
      </div>
    </article>
  )
}
