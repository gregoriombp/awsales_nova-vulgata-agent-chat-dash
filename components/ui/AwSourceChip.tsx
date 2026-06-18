import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { cn } from "@/lib/utils"

/**
 * AwSourceChip — citação/grounding: de onde o agente tirou a resposta
 * (documento, Q&A, Knowledge Layer da Memory Base, web ou integração). Sinal de
 * confiança, exibido inline na resposta ou agrupado no rodapé da mensagem.
 * Sem border stroke (tinta suave de fundo), ícone em fill, índice em dark tile.
 * Compõe Icon + AwBrandLogo; cores por token.
 */

export type AwSourceKind =
  | "document"
  | "qa"
  | "knowledge"
  | "web"
  | "integration"

const KIND_ICON: Record<AwSourceKind, string> = {
  document: "description",
  qa: "forum",
  knowledge: "auto_stories",
  web: "language",
  integration: "extension",
}

export type AwSourceChipProps = {
  /** Nome da fonte (ex.: "sales-playbook.pdf", "FAQ de reembolso"). */
  label: string
  /** Tipo da fonte — define o ícone. Default: "document". */
  kind?: AwSourceKind
  /** Detalhe curto — página, trecho, layer (ex.: "p. 12", "Q&A"). */
  detail?: string
  /** Número da citação ([1], [2]…), exibido num dark tile à esquerda. */
  index?: number
  /** Id de brand (AwBrandLogo) quando a fonte é uma integração. */
  brand?: string
  /** Torna o chip um link (abre em nova aba). */
  href?: string
  onClick?: () => void
  className?: string
}

export function AwSourceChip({
  label,
  kind = "document",
  detail,
  index,
  brand,
  href,
  onClick,
  className,
}: AwSourceChipProps) {
  const interactive = !!href || !!onClick

  const inner = (
    <>
      {index != null && (
        <span className="grid size-4 shrink-0 place-items-center rounded-full bg-(--bg-inverse) text-3xs font-semibold text-(--fg-on-inverse)">
          {index}
        </span>
      )}
      {brand ? (
        <AwBrandLogo
          brand={brand}
          size="sm"
          bare
          style={{ width: 14, height: 14, borderRadius: 3 }}
        />
      ) : (
        <Icon
          name={KIND_ICON[kind]}
          size={14}
          fill={1}
          className="shrink-0 text-(--fg-tertiary)"
        />
      )}
      <span className="truncate font-medium text-(--fg-secondary)">{label}</span>
      {detail && (
        <span className="shrink-0 text-(--fg-tertiary)">· {detail}</span>
      )}
      {interactive && (
        <Icon
          name="arrow_outward"
          size={13}
          className="shrink-0 text-(--fg-tertiary)"
        />
      )}
    </>
  )

  const base = cn(
    "inline-flex max-w-full items-center gap-1.5 rounded-full bg-(--bg-muted) px-2.5 py-1 text-xs leading-none",
    interactive &&
      "cursor-pointer hover:bg-(--bg-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-brand)",
    className,
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={base}>
        {inner}
      </a>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={base}>
        {inner}
      </button>
    )
  }
  return <span className={base}>{inner}</span>
}
