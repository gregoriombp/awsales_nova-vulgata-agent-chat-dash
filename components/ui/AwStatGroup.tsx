import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./Icon"

/**
 * AwStatGroup — uma faixa de KPIs com uma célula de título à esquerda.
 *
 * Diferente do {@link AwStatCard} (tile neutro, eyebrow em cima), aqui cada
 * stat é uma célula TONALIZADA: fundo tinta-50, tile de ícone colorido no
 * topo, número grande e label/hint embaixo. A primeira célula carrega o
 * título + descrição da seção — em vez de ficarem soltos acima do bloco.
 *
 * Pensado pra 2–4 stats numa linha só (grid-flow-col, colunas iguais). Só
 * tokens existentes — as tintas vêm das escalas --aw-{tone}-50/100/700.
 */

export type AwStatTone = "blue" | "purple" | "amber" | "emerald" | "teal" | "red"

export type AwStat = {
  /** Material Symbol (renderizado preenchido). */
  icon: string
  /** Número/valor grande. */
  value: React.ReactNode
  /** Rótulo abaixo do número. */
  label: string
  /** Linha de apoio opcional. */
  hint?: React.ReactNode
  /** Tom da célula — define a tinta de fundo e do tile do ícone. */
  tone?: AwStatTone
}

export type AwStatGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Célula de título: heading da seção. */
  title: string
  /** Célula de título: descrição de apoio. */
  description?: React.ReactNode
  /** Ação opcional na célula de título (ex.: um <AwButton>Configurações</AwButton>). */
  action?: React.ReactNode
  /** As células de stat, na ordem. */
  stats: AwStat[]
}

// Tinta da célula (-100, pálida) + tile do ícone uma escala acima (-200) pra
// destacar, com o glifo no -700. As escalas -50 e teal-300 não existem como
// var() em runtime — por isso ficamos em -100/-200/-700, que todos os tons têm.
const TONE: Record<AwStatTone, { cell: string; tile: string }> = {
  emerald: {
    cell: "bg-(--aw-emerald-100)",
    tile: "bg-(--aw-emerald-200) text-(--aw-emerald-700)",
  },
  teal: {
    cell: "bg-(--aw-teal-100)",
    tile: "bg-(--aw-teal-200) text-(--aw-teal-700)",
  },
  red: {
    cell: "bg-(--aw-red-100)",
    tile: "bg-(--aw-red-200) text-(--aw-red-700)",
  },
  blue: {
    cell: "bg-(--aw-blue-100)",
    tile: "bg-(--aw-blue-200) text-(--aw-blue-700)",
  },
  amber: {
    cell: "bg-(--aw-amber-100)",
    tile: "bg-(--aw-amber-200) text-(--aw-amber-700)",
  },
}

export const AwStatGroup = React.forwardRef<HTMLDivElement, AwStatGroupProps>(
  function AwStatGroup({ title, description, stats, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="stat-group"
        className={cn(
          "grid auto-cols-fr grid-flow-col gap-3",
          className,
        )}
        {...rest}
      >
        {/* Célula de título — título + descrição, no lugar de ficarem soltos acima */}
        <div className="flex min-w-0 flex-col justify-center gap-1.5 rounded-2xl border border-subtle bg-raised px-5 py-6">
          <h3 className="m-0 body-lg font-semibold leading-tight tracking-heading-tight text-fg-primary">
            {title}
          </h3>
          {description && (
            <p className="m-0 body-xs leading-relaxed text-fg-secondary">
              {description}
            </p>
          )}
        </div>

        {/* Células de stat — tonalizadas */}
        {stats.map((s, i) => {
          const tone = TONE[s.tone ?? "blue"]
          return (
            <div
              key={i}
              className={cn(
                "flex min-w-0 flex-col rounded-2xl px-5 py-6",
                tone.cell,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  tone.tile,
                )}
              >
                <Icon name={s.icon} size={20} fill={1} />
              </span>
              <div className="mt-5 text-(length:--display-sm-size) font-semibold leading-none tracking-heading-tighter text-fg-primary">
                {s.value}
              </div>
              <p className="m-0 mt-2 body-sm font-medium text-fg-primary">
                {s.label}
              </p>
              {s.hint && (
                <p className="m-0 mt-0.5 body-xs leading-snug text-fg-tertiary">
                  {s.hint}
                </p>
              )}
            </div>
          )
        })}
      </div>
    )
  },
)
