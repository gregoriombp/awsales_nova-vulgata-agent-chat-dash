import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/Icon"
import { AwCardBrand, type AwCardBrandId } from "@/components/ui/AwCardBrand"

/**
 * Chip compacto que identifica um método de pagamento — bandeira (via
 * `AwCardBrand`) + "{brand} •••• {last4}". Quando `href` é passado, vira um
 * link com a seta `arrow_forward` que desliza no hover; sem `href`, é um
 * `<span>` estático sem seta.
 *
 * Desacoplado de qualquer feature: a brand é o `AwCardBrandId` do DS, não o
 * tipo local do Financeiro. O texto default pode ser sobrescrito por `label`.
 */

const BRAND_LABEL: Record<AwCardBrandId, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  elo: "Elo",
  hipercard: "Hipercard",
  diners: "Diners",
  discover: "Discover",
  unknown: "Cartão",
}

type BaseProps = {
  /** Bandeira aceita pelo `AwCardBrand` (registry key). */
  brand: AwCardBrandId
  /** Últimos 4 dígitos do cartão. */
  last4: string
  /** Quando presente, o chip vira link (com seta no hover). */
  href?: string
  /** Sobrescreve o texto default "{brand} •••• {last4}". */
  label?: React.ReactNode
}

export type AwPaymentMethodChipProps = BaseProps &
  Omit<React.HTMLAttributes<HTMLElement>, "color">

const CHIP_CLASS =
  "group inline-flex items-center gap-2 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-2.5 py-1.5 transition-colors no-underline hover:border-(--border-default) hover:bg-(--bg-hover)"

export function AwPaymentMethodChip({
  brand,
  last4,
  href,
  label,
  className,
  ...rest
}: AwPaymentMethodChipProps) {
  const text = label ?? `${BRAND_LABEL[brand]} •••• ${last4}`

  const inner = (
    <>
      <AwCardBrand brand={brand} size="sm" />
      <span className="body-xs tabular-nums text-(--fg-secondary)">{text}</span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(CHIP_CLASS, className)}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {inner}
        <Icon
          name="arrow_forward"
          size={12}
          className="text-(--fg-tertiary) transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    )
  }

  return (
    <span
      className={cn(CHIP_CLASS, className)}
      {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
    >
      {inner}
    </span>
  )
}
