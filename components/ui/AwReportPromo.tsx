"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AwCard } from "./AwCard"
import { AwButton } from "./AwButton"

/**
 * AwReportPromo — faixa de destaque que convida o usuário a abrir um relatório
 * (ou seção mais densa) sem despejar os números ali na overview. Tile de marca
 * com gradiente à esquerda, título + apoio no meio, CTA escuro à direita.
 *
 * Estreou na Visão geral do Financeiro como atalho pro dashboard de
 * "Consumo e custos". Genérica de propósito: passe título, descrição e href.
 *
 * Anatomia:
 *   [tile gradiente] · título (h4)
 *                      descrição (apoio, opcional)            [CTA]
 */

const REPORT_PROMO_ART = {
  /** Cartões arredondados empilhados + arco (o tile do mock original). */
  arcs: "/assets/illustrations/report-tile-arcs.svg",
  /** Glifo de blocos — leitura mais "ícone". */
  blocks: "/assets/illustrations/report-tile-blocks.svg",
} as const

export type AwReportPromoArt = keyof typeof REPORT_PROMO_ART

export type AwReportPromoProps = {
  /** Título — em geral o nome do relatório/feature. */
  title: React.ReactNode
  /** Linha de apoio. Mantenha curta (1–2 linhas). */
  description?: React.ReactNode
  /** Destino do CTA (link direto). Ignorado quando `onCtaClick` é passado. */
  href?: string
  /** Intercepta o CTA: vira `<button>` e chama isto em vez de navegar — útil
   *  pra abrir uma confirmação antes de levar o usuário pra fora da página.
   *  Tem prioridade sobre `href`. */
  onCtaClick?: () => void
  /** Rótulo do botão. */
  ctaLabel?: string
  /** Arte do tile de marca. Default "arcs". */
  art?: AwReportPromoArt
  /** Sobrescreve a arte por uma imagem custom (ignora `art`). */
  illustrationSrc?: string
  className?: string
  /** Estilo inline no card (ex.: um gradiente de fundo sobreposto ao
   *  `--bg-raised`). Como o `.aw-card` define o `background` fora de @layer,
   *  um fundo custom precisa vir por aqui pra ganhar do default. */
  style?: React.CSSProperties
}

export function AwReportPromo({
  title,
  description,
  href,
  onCtaClick,
  ctaLabel = "Acessar relatório",
  art = "arcs",
  illustrationSrc,
  className,
  style,
}: AwReportPromoProps) {
  const src = illustrationSrc ?? REPORT_PROMO_ART[art]

  return (
    <AwCard className={cn("flex items-center gap-6", className)} style={style}>
      <span
        aria-hidden="true"
        className="flex h-28 w-28 shrink-0 overflow-hidden rounded-xl"
      >
        <img src={src} alt="" className="h-full w-full object-cover" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="m-0 text-(--fg-primary)">{title}</h4>
        {description && (
          <p className="m-0 mt-1.5 max-w-xl body-sm text-(--fg-secondary)">
            {description}
          </p>
        )}
      </div>
      {onCtaClick ? (
        <AwButton
          variant="primary"
          size="lg"
          className="shrink-0"
          onClick={onCtaClick}
        >
          {ctaLabel}
        </AwButton>
      ) : (
        <AwButton asChild variant="primary" size="lg" className="shrink-0">
          <Link href={href ?? "#"}>{ctaLabel}</Link>
        </AwButton>
      )}
    </AwCard>
  )
}
