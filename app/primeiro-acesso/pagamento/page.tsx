"use client"

import * as React from "react"
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG } from "../_data"

type Method = {
  id: "pix" | "cartao" | "boleto"
  icon: string
  title: string
  description: string
}

const METHODS: Method[] = [
  {
    id: "pix",
    icon: "qr_code_2",
    title: "Pix",
    description: "Aprovação imediata · liberação automática",
  },
  {
    id: "cartao",
    icon: "credit_card",
    title: "Cartão de crédito",
    description: "Aprovação imediata · em até 1 parcela",
  },
  {
    id: "boleto",
    icon: "receipt_long",
    title: "Boleto bancário",
    description: "Compensação em 2 a 3 dias úteis",
  },
]

export default function PagamentoPage() {
  const [selected, setSelected] = React.useState<Method["id"] | null>("pix")
  const nextHref = selected
    ? `/primeiro-acesso/checkout/${selected}`
    : "#"

  return (
    <AwOnboardingShell currentStep={3} org={ONBOARDING_ORG}>
      <section>
        <div
          className="mb-3.5 font-mono uppercase text-fg-tertiary"
          style={{ fontSize: 10, letterSpacing: "0.08em" }}
        >
          etapa 3 de 4 · forma de pagamento
        </div>

        <h1
          className="mb-2 font-display font-medium text-fg-primary text-balance"
          style={{
            fontSize: "var(--h3-size)",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
          }}
        >
          Como você quer pagar a implementação?
        </h1>

        <p
          className="mb-7 text-fg-secondary text-pretty"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          Sua conta libera o acesso assim que o pagamento for confirmado. Pix
          e cartão liberam na hora; boleto pode levar até 3 dias úteis.
        </p>

        <ul className="m-0 mb-6 flex flex-col gap-2.5 list-none p-0">
          {METHODS.map((method) => {
            const isSelected = selected === method.id
            return (
              <li key={method.id}>
                <button
                  type="button"
                  onClick={() => setSelected(method.id)}
                  className={[
                    "flex w-full items-center gap-3.5 rounded-lg border bg-bg-raised px-4 py-4 text-left transition-colors duration-aw-fast",
                    isSelected
                      ? "border-fg-primary shadow-[0_0_0_1px_var(--fg-primary)_inset]"
                      : "border-border hover:border-border-strong hover:bg-bg-surface",
                  ].join(" ")}
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-bg-muted text-fg-primary">
                    <Icon name={method.icon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block font-medium text-fg-primary"
                      style={{ fontSize: 14 }}
                    >
                      {method.title}
                    </span>
                    <span
                      className="block text-fg-tertiary"
                      style={{ fontSize: 12 }}
                    >
                      {method.description}
                    </span>
                  </span>
                  <span
                    className={[
                      "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px]",
                      isSelected
                        ? "border-fg-primary"
                        : "border-border-strong",
                    ].join(" ")}
                  >
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-fg-primary" />
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mb-2 flex items-start gap-2.5 rounded-md border border-border-subtle bg-bg-surface px-3.5 py-3">
          <Icon name="info" size={16} className="mt-0.5 text-fg-tertiary" />
          <p
            className="m-0 text-fg-secondary"
            style={{ fontSize: 12, lineHeight: 1.55 }}
          >
            Você pagará <b>{ONBOARDING_ORG.valorImplementacao}</b> referentes
            à implementação. A primeira mensalidade (
            {ONBOARDING_ORG.valorMensal}) será cobrada apenas após 30 dias.
          </p>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <Link
            href="/primeiro-acesso/revisao"
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="arrow_back" size={16} />
            <span className="aw-btn__label">Voltar</span>
          </Link>
          <span className="flex-1" />
          {selected ? (
            <Link
              href={nextHref}
              className="aw-btn aw-btn--primary aw-btn--md"
            >
              <span className="aw-btn__label">Continuar</span>
              <Icon name="arrow_forward" size={16} />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="aw-btn aw-btn--primary aw-btn--md"
            >
              <span className="aw-btn__label">Continuar</span>
              <Icon name="arrow_forward" size={16} />
            </button>
          )}
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
