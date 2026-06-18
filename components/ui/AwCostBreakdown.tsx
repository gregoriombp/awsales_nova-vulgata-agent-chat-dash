import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./Icon"

export type AwCostBreakdownKind = "base" | "add" | "subtract"

export type AwCostBreakdownItem = {
  label: string
  value: number
  /** "subtract" pinta o valor de verde e prefixa "−". "base"/"add" são neutros. */
  kind?: AwCostBreakdownKind
  /** Material Symbol mostrado antes do rótulo. */
  icon?: string
}

export type AwCostBreakdownProps = React.HTMLAttributes<HTMLDivElement> & {
  items: AwCostBreakdownItem[]
  /** Formata cada valor. Default: Intl pt-BR / BRL. */
  formatValue?: (n: number) => string
}

const defaultFormatValue = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n)

/**
 * AwCostBreakdown — composição de um valor (assinatura, variável, cupom…).
 * Cada item é autocontido — ícone opcional + rótulo + valor — e os itens são
 * lidos como uma lista, não como uma equação (sem operadores "+"/"−" soltos
 * entre eles). Um item `subtract` mostra o valor em verde com "−".
 */
export function AwCostBreakdown({
  items,
  formatValue = defaultFormatValue,
  className,
  ...rest
}: AwCostBreakdownProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 body-sm text-(--fg-secondary)",
        className,
      )}
      {...rest}
    >
      {items.map((item, i) => {
        const kind: AwCostBreakdownKind = item.kind ?? (i === 0 ? "base" : "add")
        const isDiscount = kind === "subtract"
        return (
          <span key={i} className="inline-flex items-center gap-1.5">
            {item.icon && (
              <Icon
                name={item.icon}
                size={15}
                className="shrink-0 text-(--fg-tertiary)"
              />
            )}
            <span>{item.label}</span>
            <span
              className={cn(
                "font-medium tabular-nums",
                isDiscount ? "text-(--accent-success)" : "text-(--fg-primary)",
              )}
            >
              {isDiscount ? "−" : ""}
              {formatValue(Math.abs(item.value))}
            </span>
          </span>
        )
      })}
    </div>
  )
}
