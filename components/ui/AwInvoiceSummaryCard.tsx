import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/Icon"
import { AwCard } from "@/components/ui/AwCard"

const defaultFormatValue = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n)

export type AwInvoiceSummaryCardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> & {
  /** Total da fatura atual — renderizado grande no corpo do card. */
  total: number
  /** Data da próxima cobrança (já formatada, ex.: "19/06/2026"). */
  dueAt: string
  /** Dias até a cobrança. Só é exibido quando > 0. */
  daysUntil?: number
  /** Nome do plano (ex.: "Pro"). */
  planName: string
  /** Mensalidade do plano. */
  planMonthly: number
  /** Variáveis acumuladas até agora no ciclo. */
  accumulated: number
  /** Desconto do ciclo. A linha de desconto só aparece quando > 0. */
  discount?: number
  /** Slot no canto superior direito do header (ex.: chip de método de pagamento). */
  headerAction?: React.ReactNode
  /** Slot do rodapé (ex.: botão "Adiantar pagamento"). */
  actions?: React.ReactNode
  /** Formata valores monetários. Default: Intl pt-BR BRL. */
  formatValue?: (n: number) => string
}

export const AwInvoiceSummaryCard = React.forwardRef<
  HTMLDivElement,
  AwInvoiceSummaryCardProps
>(function AwInvoiceSummaryCard(
  {
    total,
    dueAt,
    daysUntil,
    planName,
    planMonthly,
    accumulated,
    discount = 0,
    headerAction,
    actions,
    formatValue = defaultFormatValue,
    className,
    ...rest
  },
  ref,
) {
  const hasDays = typeof daysUntil === "number" && daysUntil > 0

  return (
    <AwCard ref={ref} className={cn("flex flex-col gap-5 p-6!", className)} {...rest}>
      <div className="flex items-center justify-between gap-3">
        <h6 className="m-0 body-md font-medium text-(--fg-primary)">
          Fatura atual
        </h6>
        {headerAction}
      </div>

      <div className="flex flex-col gap-1">
        <p className="m-0 display-sm tabular-nums text-(--fg-primary)">
          <span className="mr-1 text-[0.45em] font-normal text-(--fg-tertiary)">
            R$
          </span>
          {formatValue(total).replace(/^R\$\s*/, "")}
        </p>
        <span className="aw-eyebrow text-(--fg-tertiary)">
          Próxima cobrança · {dueAt}
          {hasDays && ` · em ${daysUntil} dia${daysUntil !== 1 ? "s" : ""}`}
        </span>
        <p className="m-0 mt-1 body-sm text-(--fg-secondary)">
          {planName} {formatValue(planMonthly)} + variáveis até agora{" "}
          <strong className="font-medium tabular-nums text-(--fg-primary)">
            {formatValue(accumulated)}
          </strong>
        </p>
        {discount > 0 && (
          <p className="m-0 inline-flex items-center gap-1.5 body-sm text-(--accent-success)">
            <Icon name="local_offer" size={14} />
            Descontos neste ciclo{" "}
            <strong className="font-medium tabular-nums">
              −{formatValue(discount)}
            </strong>
          </p>
        )}
      </div>

      {actions && (
        <div className="mt-auto flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </AwCard>
  )
})
