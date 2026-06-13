"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { AwPill } from "@/components/ui/AwPill"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { fmtBRL } from "@/app/primeiro-acesso/_data"

/** Status de uma cobrança no resumo lateral. Espelha o `stage` da cobrança:
 *  config/exec → "open", paga → "paid", boleto em compensação → "pending". */
export type ResumoStatus = "open" | "paid" | "pending"

export type ResumoItem = {
  title: string
  total: number
  status: ResumoStatus
  /** Linha de apoio: método + parcelamento da cobrança ativa, ou "via Pix"
   *  quando já paga. Some quando não há nada a dizer. */
  detail?: string
}

export type ResumoProximo = { quando: string; valor: number }

/**
 * Resumo das cobranças — painel lateral do pagamento. Reflete o estado ao vivo
 * das duas cobranças (valor, status, método escolhido), soma o total de hoje e
 * lista as próximas mensalidades. É um componente de produto (feature), não do
 * design system: vive ao lado do PagamentoBody e consome só tokens + primitivos.
 */
export function PagamentoResumo({
  items,
  totalHoje,
  proximos,
  recorrencia,
}: {
  items: ResumoItem[]
  totalHoje: number
  proximos: ResumoProximo[]
  /** Valor e dia da mensalidade cheia, depois da prorrata. */
  recorrencia: { valor: number; dia: number }
}) {
  // A primeira cobrança ainda em aberto é a ativa — recebe o marcador
  // preenchido; as demais em aberto ficam pendentes (contorno).
  const firstOpenIndex = items.findIndex((it) => it.status === "open")
  return (
    <aside className="lg:sticky lg:top-10 rounded-2xl border border-border-subtle bg-bg-surface">
      <header className="flex items-center gap-2 border-b border-border-subtle px-5 py-3.5">
        <Icon name="receipt_long" size={15} className="text-fg-tertiary" />
        <span className="body-sm font-medium text-fg-primary">
          Resumo das cobranças
        </span>
      </header>

      <div className="flex flex-col gap-3.5 px-5 py-4">
        {items.map((item, i) => (
          <ResumoLine
            key={i}
            index={i}
            item={item}
            current={item.status === "open" && i === firstOpenIndex}
            isLast={i === items.length - 1}
          />
        ))}
      </div>

      <div className="mx-5 border-t border-border-subtle" />

      <div className="flex items-baseline justify-between px-5 py-4">
        <span className="body-sm text-fg-secondary">Total a pagar hoje</span>
        <span className="body-lg font-medium tabular-nums text-fg-primary">
          {fmtBRL(totalHoje)}
        </span>
      </div>

      {proximos.length > 0 && (
        <Collapsible className="rounded-b-2xl bg-bg-canvas">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="group flex w-full cursor-pointer items-center gap-2 px-5 py-3.5 text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-(--aw-blue-400)"
            >
              <span className="body-sm font-medium text-fg-secondary">
                Ver próximas mensalidades
              </span>
              <span className="flex-1" />
              <Icon
                name="expand_more"
                size={16}
                className="text-fg-tertiary transition-transform duration-aw-base ease-aw-out group-data-[state=open]:rotate-180"
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="aw-sg-collapsible-content overflow-hidden">
            <div className="px-5 pb-4">
              <div className="flex flex-col gap-1.5">
                {proximos.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between body-xs text-fg-secondary"
                  >
                    <span className="tabular-nums">{p.quando}</span>
                    <span className="tabular-nums">{fmtBRL(p.valor)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 body-xs text-fg-tertiary text-pretty">
                Depois,{" "}
                <span className="tabular-nums">
                  {fmtBRL(recorrencia.valor)}
                </span>
                /mês — vence todo dia {recorrencia.dia}.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </aside>
  )
}

function ResumoLine({
  index,
  item,
  current,
  isLast,
}: {
  index: number
  item: ResumoItem
  current: boolean
  isLast: boolean
}) {
  return (
    <div className="relative flex items-start gap-3 transition-opacity duration-aw-base ease-aw-out">
      {/* Conector vertical da timeline — liga este marcador ao próximo. */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-3 top-6 bottom-[-0.875rem] w-px -translate-x-1/2 bg-border-subtle"
        />
      )}
      <ResumoMarker status={item.status} current={current} index={index} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cn("body-sm", current || item.status !== "open" ? "text-fg-primary" : "text-fg-tertiary")}>
            {item.title}
          </span>
          <span
            className={cn(
              "shrink-0 body-sm font-medium tabular-nums",
              current || item.status !== "open" ? "text-fg-primary" : "text-fg-tertiary"
            )}
          >
            {fmtBRL(item.total)}
          </span>
        </div>
        <div className="mt-1.5">
          <ResumoStatusPill status={item.status} />
        </div>
      </div>
    </div>
  )
}

/** Marcador numerado da timeline — espelha o StepMarker do AwOnboardingTimeline:
 *  paga = círculo verde com check; ativa = círculo escuro com número;
 *  pendente = contorno com número apagado. */
function ResumoMarker({
  status,
  current,
  index,
}: {
  status: ResumoStatus
  current: boolean
  index: number
}) {
  return (
    <span
      className={cn(
        "relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full text-2xs font-medium tabular-nums shadow-[0_0_0_3px_var(--bg-surface)] transition-colors duration-aw-base",
        status === "paid"
          ? "bg-aw-emerald-600 text-aw-white"
          : current
            ? "bg-(--bg-inverse) text-(--fg-on-inverse)"
            : "border border-border bg-bg-raised text-fg-tertiary"
      )}
    >
      {status === "paid" ? <Icon name="check" size={13} weight={500} /> : index + 1}
    </span>
  )
}

function ResumoStatusPill({ status }: { status: ResumoStatus }) {
  const label =
    status === "paid" ? "Pago" : status === "pending" ? "Em análise" : "Em aberto"
  const variant = status === "paid" ? "live" : status === "pending" ? "warning" : "neutral"
  return (
    <AwPill
      key={status}
      variant={variant}
      dot={status !== "open"}
      className="animate-fadeInUp"
    >
      {label}
    </AwPill>
  )
}
