import * as React from "react"
import { cn } from "@/lib/utils"

export type AwCostBreakdownKind = "base" | "add" | "subtract"

export type AwCostBreakdownItem = {
  label: string
  value: number
  /** "base" → sem operador · "add" → "+" · "subtract" → "−". Default: "base" no 1º, "add" nos demais. */
  kind?: AwCostBreakdownKind
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

/** Operador real exibido antes do item (o sinal nunca vem do valor). */
const OPERATOR: Record<Exclude<AwCostBreakdownKind, "base">, string> = {
  add: "+",
  subtract: "−", // minus sign real, não hífen
}

export function AwCostBreakdown({
  items,
  formatValue = defaultFormatValue,
  className,
  ...rest
}: AwCostBreakdownProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-1.5 gap-y-1 body-sm text-(--fg-secondary)",
        className,
      )}
      {...rest}
    >
      {items.map((item, i) => {
        const kind: AwCostBreakdownKind = item.kind ?? (i === 0 ? "base" : "add")
        const operator = kind === "base" ? null : OPERATOR[kind]
        const isDiscount = kind === "subtract"
        return (
          <React.Fragment key={i}>
            {operator && (
              <span className="text-(--fg-tertiary)" aria-hidden="true">
                {operator}
              </span>
            )}
            <span>
              {item.label}{" "}
              <span
                className={cn(
                  "font-medium tabular-nums",
                  isDiscount ? "text-(--accent-success)" : "text-(--fg-primary)",
                )}
              >
                {formatValue(Math.abs(item.value))}
              </span>
            </span>
          </React.Fragment>
        )
      })}
    </div>
  )
}
