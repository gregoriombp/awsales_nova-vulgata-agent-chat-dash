"use client"

import * as React from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

/**
 * AwChart — a camada de identidade dos gráficos Aswork sobre o wrapper shadcn
 * de Recharts (components/ui/chart.tsx).
 *
 * Princípios: o azul é a série protagonista; grayscale e accents frios dão o
 * contexto; máximo de 6 séries; sem 3D, sem sombra, grid horizontal apenas.
 * As cores são tokens existentes — em var(), para flipar com o tema.
 */

/** Ordem oficial das séries. A primeira é sempre a protagonista (azul). */
export const AW_CHART_SERIES = [
  "var(--aw-blue-600)",
  "var(--fg-primary)",
  "var(--aw-slate-500)",
  "var(--aw-teal-600)",
  "var(--aw-purple-500)",
  "var(--aw-amber-500)",
] as const

/**
 * Monta o ChartConfig do shadcn a partir de { chave: rótulo }, aplicando a
 * paleta oficial na ordem. Ex.: awChartConfig({ receita: "Receita" }).
 */
export function awChartConfig(
  labels: Record<string, React.ReactNode>,
): ChartConfig {
  const config: ChartConfig = {}
  Object.entries(labels).forEach(([key, label], i) => {
    config[key] = {
      label,
      color: AW_CHART_SERIES[i % AW_CHART_SERIES.length],
    }
  })
  return config
}

/** Props padrão para eixos X em gráficos Aswork (sem linha, ticks discretos). */
export const AW_CHART_AXIS = {
  axisLine: false,
  tickLine: false,
  tickMargin: 10,
  tick: { fill: "var(--fg-tertiary)", fontSize: 11 },
} as const

/** Props padrão para o CartesianGrid (horizontais apenas, traço sutil). */
export const AW_CHART_GRID = {
  vertical: false,
  stroke: "var(--border-subtle)",
} as const

export type AwChartContainerProps = React.ComponentProps<typeof ChartContainer>

/** ChartContainer com a altura padrão dos cards de gráfico do produto. */
export function AwChartContainer({
  className,
  ...props
}: AwChartContainerProps) {
  return (
    <ChartContainer
      className={cn("aspect-auto h-[280px] w-full", className)}
      {...props}
    />
  )
}

export {
  ChartTooltip as AwChartTooltip,
  ChartTooltipContent as AwChartTooltipContent,
  ChartLegend as AwChartLegend,
  ChartLegendContent as AwChartLegendContent,
}
export type { ChartConfig }
