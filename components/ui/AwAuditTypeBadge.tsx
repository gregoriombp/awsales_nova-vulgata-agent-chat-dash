import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

/** Tipos de evento que um badge de auditoria pode representar. */
export type AwAuditType = "Plano" | "Cartão" | "Fatura" | "Cupom" | "Voucher"

/** Identidade visual por tipo. Cupom e voucher ganham ícone e cor próprios
 *  para saltarem aos olhos; o resto fica neutro. Apenas tokens existentes. */
const TYPE_META: Record<AwAuditType, { icon: string; badgeClass: string }> = {
  Plano: {
    icon: "workspace_premium",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  Cartão: {
    icon: "credit_card",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  Fatura: {
    icon: "receipt_long",
    badgeClass:
      "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
  },
  Cupom: {
    icon: "local_offer",
    badgeClass:
      "border-(--aw-emerald-300) bg-(--aw-emerald-100) text-(--aw-emerald-800)",
  },
  Voucher: {
    icon: "card_giftcard",
    badgeClass:
      "border-(--aw-purple-300) bg-(--aw-purple-150) text-(--aw-purple-800)",
  },
}

export type AwAuditTypeBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  type: AwAuditType
}

/**
 * Badge pill que identifica o tipo de um evento de auditoria — borda + fundo +
 * ícone + label, mapeados por `type`. Desacoplado de qualquer feature: recebe
 * só o tipo e renderiza a identidade visual correspondente.
 */
export function AwAuditTypeBadge({
  type,
  className,
  ...rest
}: AwAuditTypeBadgeProps) {
  const meta = TYPE_META[type]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 body-xs font-medium",
        meta.badgeClass,
        className,
      )}
      {...rest}
    >
      <Icon name={meta.icon} size={13} />
      {type}
    </span>
  )
}
