import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/Icon"
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill"

/** Os estados de fatura suportados pela linha. */
export type AwInvoiceStatus =
  | "Paga"
  | "Em aberto"
  | "Em atraso"
  | "Falha no Pagamento"
  | "Disputada"

/** Mapeia cada status para o variant do AwPill que melhor o representa. */
const STATUS_VARIANT: Record<AwInvoiceStatus, AwPillVariant> = {
  Paga: "live",
  "Em aberto": "draft",
  "Em atraso": "warning",
  "Falha no Pagamento": "warning",
  Disputada: "beta",
}

/** Status que tratamos como "vencidos" — muda o rótulo de data para "Venceu em". */
const OVERDUE_STATUSES: ReadonlySet<AwInvoiceStatus> = new Set([
  "Em atraso",
  "Falha no Pagamento",
])

const defaultFormatValue = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)

export type AwInvoiceRowProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "children" | "onClick"
> & {
  /** Descrição principal da fatura (ex.: "Plano Pro — Junho 2026"). */
  description: string
  /** Estado atual da fatura; define o variant do pill e o rótulo de data. */
  status: AwInvoiceStatus
  /** Identificador exibido no subtexto (ex.: "INV-2026-0612"). */
  id: string
  /** Forma de pagamento exibida no subtexto (ex.: "Visa •• 4242"). */
  paymentMethod: string
  /** Data de vencimento já formatada (ex.: "12/06/2026"). */
  dueAt: string
  /** Data de pagamento já formatada; quando presente, o rótulo vira "Paga em". */
  paidAt?: string
  /** Valor líquido da fatura, em número — formatado por `formatValue`. */
  net: number
  /** Disparado ao acionar a linha (click ou Enter/Espaço). */
  onOpen?: () => void
  /** Formata o valor exibido. Default: Intl pt-BR / BRL. */
  formatValue?: (value: number) => string
}

/**
 * AwInvoiceRow — linha clicável de fatura: descrição + pill de status,
 * subtexto com id · forma de pagamento · data, valor à direita e chevron.
 *
 * Renderiza um `<button>` puro (sem `<li>` em volta) — o consumidor coloca
 * numa lista. Totalmente desacoplado do módulo de Financeiro.
 */
export function AwInvoiceRow({
  description,
  status,
  id,
  paymentMethod,
  dueAt,
  paidAt,
  net,
  onOpen,
  formatValue = defaultFormatValue,
  className,
  type = "button",
  ...rest
}: AwInvoiceRowProps) {
  const dateLabel = paidAt
    ? `Paga em ${paidAt}`
    : OVERDUE_STATUSES.has(status)
      ? `Venceu em ${dueAt}`
      : `Vence em ${dueAt}`

  return (
    <button
      type={type}
      onClick={onOpen}
      className={cn(
        "group grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 rounded-md px-3 py-3 text-left transition-colors hover:bg-(--bg-hover) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--accent-brand)",
        className,
      )}
      {...rest}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="body-sm font-medium text-(--fg-primary)">
            {description}
          </span>
          <AwPill variant={STATUS_VARIANT[status]}>{status}</AwPill>
        </div>
        <p className="m-0 mt-0.5 body-xs tabular-nums text-(--fg-tertiary)">
          {id} · {paymentMethod} · {dateLabel}
        </p>
      </div>
      <span className="body-sm font-medium tabular-nums text-(--fg-primary)">
        {formatValue(net)}
      </span>
      <Icon
        name="chevron_right"
        size={18}
        className="text-(--fg-tertiary) transition-transform group-hover:translate-x-0.5"
      />
    </button>
  )
}
