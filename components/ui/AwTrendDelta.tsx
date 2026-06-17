import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

/** Para onde a seta aponta. */
export type AwTrendDirection = "up" | "down" | "flat"

/** Significado da variação — controla a COR, independente da direção.
 *  good = positivo (verde), bad = negativo (vermelho), neutral = cinza. */
export type AwTrendTone = "good" | "bad" | "neutral"

/** Ícone da seta por direção (Material Symbols). */
const DIRECTION_ICON: Record<AwTrendDirection, string> = {
  up: "trending_up",
  down: "trending_down",
  flat: "trending_flat",
}

/** Cor por tone — apenas tokens existentes, nada hardcoded. */
const TONE_CLASS: Record<AwTrendTone, string> = {
  good: "text-(--accent-success)",
  bad: "text-(--accent-danger)",
  neutral: "text-(--fg-secondary)",
}

/** Direção derivada do sinal de `value` quando não passada explicitamente. */
function directionFromValue(value: number): AwTrendDirection {
  if (value > 0) return "up"
  if (value < 0) return "down"
  return "flat"
}

/** Formatação padrão: percentual com sinal, pt-BR (ex. "+4,8%", "-2,1%"). */
const formatPercent = (n: number) =>
  (n > 0 ? "+" : "") +
  n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) +
  "%"

export type AwTrendDeltaProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  /** Valor da variação. O sinal deriva a `direction` quando ela não é passada. */
  value: number
  /** Direção da seta. Default: derivada do sinal de `value`. */
  direction?: AwTrendDirection
  /** Significado da variação — controla a cor. Default `"neutral"`. */
  tone?: AwTrendTone
  /** Formata o número exibido. Default: percentual com sinal pt-BR. */
  format?: (n: number) => string
  /** Mostra a seta antes do valor. Default `true`. */
  showArrow?: boolean
}

/**
 * Chip inline de variação — seta + valor (ex. "↗ +4,8%) — que aparece ao lado
 * de um valor grande sinalizando tendência. A SETA segue a `direction`; a COR
 * segue o `tone`, não a direção. Assim "custo subindo" = seta pra cima com
 * tone `bad` (vermelho).
 */
export const AwTrendDelta = React.forwardRef<HTMLSpanElement, AwTrendDeltaProps>(
  function AwTrendDelta(
    {
      value,
      direction,
      tone = "neutral",
      format = formatPercent,
      showArrow = true,
      className,
      ...rest
    },
    ref,
  ) {
    const resolvedDirection = direction ?? directionFromValue(value)
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 body-xs font-medium tabular-nums",
          TONE_CLASS[tone],
          className,
        )}
        {...rest}
      >
        {showArrow && <Icon name={DIRECTION_ICON[resolvedDirection]} size={15} />}
        {format(value)}
      </span>
    )
  },
)
