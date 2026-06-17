import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwCardBrand, type AwCardBrandId } from "@/components/ui/AwCardBrand"
import { AwDropdownMenu, type AwDropdownItem } from "@/components/ui/AwDropdownMenu"
import { AwPill } from "@/components/ui/AwPill"
import { cn } from "@/lib/utils"

/**
 * AwPaymentMethodRow — linha desacoplada de um método de pagamento.
 *
 * Bandeira (AwCardBrand) + rótulo "{brand} •••• {last4}", pills de estado
 * (Padrão / Expira em breve / Expirado) e um menu de ações (AwDropdownMenu)
 * com "Definir como padrão", "Editar dados" e "Remover método".
 *
 * Sem dependência de fixtures de financeiro: o consumidor passa os dados e os
 * callbacks. Renderiza apenas a linha flex — o wrapper de lista/separadores
 * é responsabilidade de quem compõe.
 */

/** Estado de expiração que controla o pill extra à direita do rótulo. */
export type AwPaymentMethodExpiry = "ok" | "expiring" | "expired"

export type AwPaymentMethodRowProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Bandeira do cartão — registry do AwCardBrand. */
  brand: AwCardBrandId
  /** Últimos 4 dígitos. */
  last4: string
  /** Marca a linha como método padrão (pill "Padrão"). */
  isDefault?: boolean
  /** Validade exibida no subtexto. MM/AAAA. */
  expiresAt: string
  /** Estado de expiração. "ok" sem pill extra; "expiring" → warning; "expired" → error. */
  expiry?: AwPaymentMethodExpiry
  /** Habilita a ação "Remover método". */
  canRemove?: boolean
  onSetDefault?: () => void
  onEdit?: () => void
  onRemoveRequest?: () => void
}

export function AwPaymentMethodRow({
  brand,
  last4,
  isDefault = false,
  expiresAt,
  expiry = "ok",
  canRemove = false,
  onSetDefault,
  onEdit,
  onRemoveRequest,
  className,
  ...rest
}: AwPaymentMethodRowProps) {
  const label = `${brand} •••• ${last4}`

  const items: AwDropdownItem[] = [
    {
      id: "default",
      label: "Definir como padrão",
      icon: "check_circle",
      disabled: isDefault,
      onSelect: onSetDefault,
    },
    {
      id: "edit",
      label: "Editar dados",
      icon: "edit",
      onSelect: onEdit,
    },
    { id: "sep", separator: true },
    {
      id: "remove",
      label: "Remover método",
      icon: "delete",
      danger: true,
      disabled: !canRemove,
      onSelect: onRemoveRequest,
    },
  ]

  return (
    <div className={cn("flex items-center gap-4 py-4", className)} {...rest}>
      <AwCardBrand brand={brand} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 body-sm font-medium tabular-nums text-(--fg-primary)">
            {label}
          </p>
          {isDefault && (
            <AwPill variant="live" dot={false}>
              Padrão
            </AwPill>
          )}
          {expiry === "expired" ? (
            <AwPill variant="error" dot={false}>
              Expirado
            </AwPill>
          ) : expiry === "expiring" ? (
            <AwPill variant="warning" dot={false}>
              Expira em breve
            </AwPill>
          ) : null}
        </div>
        <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
          Expira em {expiresAt}
        </p>
      </div>

      <AwDropdownMenu
        align="end"
        trigger={
          <AwButton
            size="sm"
            variant="ghost"
            iconOnly="more_horiz"
            aria-label={`Opções de ${label}`}
          />
        }
        items={items}
      />
    </div>
  )
}
