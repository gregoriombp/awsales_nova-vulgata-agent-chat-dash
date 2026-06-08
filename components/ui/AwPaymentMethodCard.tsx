"use client"

import * as React from "react"
import { AwCardBrand, type AwCardBrandId } from "@/components/ui/AwCardBrand"
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

export type AwPaymentMethodCardProps = {
  brand: AwCardBrandId
  last4: string
  /** Toggles the small "Pagamento principal" badge in the corner. */
  isDefault?: boolean
  /** Background cover image (e.g. the user's profile cover). Drives the
   *  glassmorphism look. Without it, falls back to a soft tinted gradient. */
  coverImage?: string
  /** Optional cardholder name printed at the bottom of the card. */
  holderName?: string
  /** Expiry in MM/YYYY (or MM/YY) — shown next to the brand logo. */
  expiresAt?: string
  className?: string
}

/**
 * Glassmorphism-style payment method card.
 *
 * Built to look like a real credit card: ~1.586:1 aspect, masked PAN in
 * the middle, brand logo + expiry on the right, optional holder name at
 * the bottom. The background is the caller-provided cover image with a
 * translucent dark wash + backdrop blur on top.
 *
 * Actions (edit / delete / set-default) live *outside* this component —
 * compose them alongside the card on the page.
 */
export function AwPaymentMethodCard({
  brand,
  last4,
  isDefault = false,
  coverImage,
  holderName,
  expiresAt,
  className,
}: AwPaymentMethodCardProps) {
  const brandLabel = BRAND_LABEL[brand]
  return (
    <article
      className={cn(
        "relative isolate aspect-[1.586/1] w-full max-w-[440px] overflow-hidden rounded-xl text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]",
        className
      )}
      aria-label={`${brandLabel} •••• ${last4}`}
      style={
        coverImage
          ? {
              backgroundImage: `url(${coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10",
          coverImage
            ? "bg-linear-to-br from-black/45 via-black/30 to-black/55 backdrop-blur-[2px]"
            : "bg-linear-to-br from-(--aw-blue-700) via-(--aw-purple-700) to-(--aw-blue-1100)"
        )}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-xl ring-1 ring-inset ring-white/20"
      />

      <div className="flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          {isDefault ? (
            <span
              className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-normal text-white/70 backdrop-blur-xs"
              aria-label="Pagamento principal"
            >
              Pagamento principal
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          <AwCardBrand brand={brand} size="md" />
        </div>

        <div className="flex flex-col gap-1">
          <p className="m-0 font-medium tabular-nums tracking-[0.16em] text-white drop-shadow-xs">
            <span className="text-white/55">••••&nbsp;••••&nbsp;••••</span>
            <span className="ml-2 text-[18px]">{last4}</span>
          </p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <div className="min-w-0">
              {holderName && (
                <>
                  <p className="m-0 text-[9px] font-medium uppercase tracking-widest text-white/55">
                    Titular
                  </p>
                  <p className="m-0 truncate body-xs font-medium text-white">
                    {holderName}
                  </p>
                </>
              )}
            </div>
            <div className="text-right">
              {expiresAt && (
                <>
                  <p className="m-0 text-[9px] font-medium uppercase tracking-widest text-white/55">
                    Validade
                  </p>
                  <p className="m-0 body-xs font-medium tabular-nums text-white">
                    {expiresAt}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
