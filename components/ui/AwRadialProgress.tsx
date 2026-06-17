import * as React from "react"
import { cn } from "@/lib/utils"

export interface AwRadialProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Valor atual do progresso. É clampado entre 0 e `max`. */
  value: number
  /** Valor máximo (teto) do progresso. */
  max: number
  /** Diâmetro do anel em px. */
  size?: number
  /** Espessura do anel (stroke) em px. */
  thickness?: number
  /** Conteúdo renderizado abaixo do percentual, no centro. */
  caption?: React.ReactNode
  /** Mostra o percentual grande no centro. */
  showPercent?: boolean
  /** Cor do arco preenchido. Use um token via var(--...). */
  arcColor?: string
  /** Cor do trilho de fundo. Use um token via var(--...). */
  trackColor?: string
}

export function AwRadialProgress({
  value,
  max,
  size = 120,
  thickness = 10,
  caption,
  showPercent = true,
  arcColor = "var(--accent-brand)",
  trackColor = "var(--bg-muted)",
  className,
  ...rest
}: AwRadialProgressProps) {
  const safeMax = max <= 0 ? 1 : max
  const clamped = Math.min(Math.max(value, 0), safeMax)
  const ratio = clamped / safeMax
  const percent = Math.round(ratio * 100)

  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - ratio)
  const center = size / 2

  return (
    <div
      role="img"
      aria-label={`Progresso: ${percent}% de ${max}`}
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      {...rest}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        {showPercent && (
          <span className="tabular-nums font-semibold leading-none text-(--fg-primary) text-2xl">
            {percent}%
          </span>
        )}
        {caption != null && (
          <span className="body-xs text-(--fg-tertiary) text-center mt-1">
            {caption}
          </span>
        )}
      </div>
    </div>
  )
}
