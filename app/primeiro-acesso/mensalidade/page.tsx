"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG } from "../_data"

type Method = {
  id: "pix" | "cartao" | "boleto"
  brand: "pix" | "card" | "boleto"
  title: string
  description: string
}

const METHODS: Method[] = [
  {
    id: "pix",
    brand: "pix",
    title: "Pix",
    description: "Aprovação imediata · liberação automática",
  },
  {
    id: "cartao",
    brand: "card",
    title: "Cartão de crédito",
    description: "Cobrança recorrente automática nos próximos meses",
  },
  {
    id: "boleto",
    brand: "boleto",
    title: "Boleto bancário",
    description: "Envio mensal por e-mail · vencimento no dia "
      + ONBOARDING_ORG.diaVencimento.toString().padStart(2, "0"),
  },
]

export default function MensalidadePage() {
  const router = useRouter()
  const [selected, setSelected] = React.useState<Method["id"] | null>("pix")
  const [submitting, setSubmitting] = React.useState(false)

  const submit = () => {
    if (!selected || submitting) return
    setSubmitting(true)
    setTimeout(() => router.push("/primeiro-acesso/acesso"), 1100)
  }

  return (
    <AwOnboardingShell currentStep={6} org={ONBOARDING_ORG}>
      <section>
        <h1
          className="mb-2 font-display font-medium text-fg-primary text-balance"
          style={{
            fontSize: "var(--h3-size)",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
          }}
        >
          Configure a primeira mensalidade.
        </h1>

        <p
          className="mb-6 text-fg-secondary text-pretty"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          A implementação já foi paga. Falta só definir o método e quitar a
          mensalidade do mês corrente — cobrada na prorrata. As próximas
          seguem o ciclo regular do plano.
        </p>

        <article className="mb-5 overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
          <header className="flex items-center justify-between gap-4 px-5 py-5">
            <div className="min-w-0">
              <div
                className="uppercase text-fg-tertiary"
                style={{ fontSize: 10, letterSpacing: "0.1em", fontWeight: 500 }}
              >
                A pagar agora
              </div>
              <div
                className="mt-2 text-fg-secondary"
                style={{ fontSize: 13, lineHeight: 1.4 }}
              >
                Plano <span className="font-medium text-fg-primary">{ONBOARDING_ORG.plan}</span>
                <span className="text-fg-tertiary">
                  {" "}— prorrata de {ONBOARDING_ORG.diasRestantesMesAtual} dias
                </span>
              </div>
            </div>
            <div
              className="font-display text-fg-primary"
              style={{
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {ONBOARDING_ORG.valorMensalProrrata}
            </div>
          </header>
          <dl className="m-0 grid grid-cols-2 border-t border-border-subtle">
            <div className="px-5 py-3.5">
              <dt
                className="text-fg-tertiary"
                style={{ fontSize: 11, letterSpacing: "0.005em" }}
              >
                Mensalidade cheia
              </dt>
              <dd
                className="m-0 mt-1 text-fg-primary"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {ONBOARDING_ORG.valorMensal}
                <span
                  className="ml-0.5 text-fg-tertiary"
                  style={{ fontSize: 12, fontWeight: 400 }}
                >
                  /mês
                </span>
              </dd>
            </div>
            <div className="border-l border-border-subtle px-5 py-3.5">
              <dt
                className="text-fg-tertiary"
                style={{ fontSize: 11, letterSpacing: "0.005em" }}
              >
                Próximo vencimento
              </dt>
              <dd
                className="m-0 mt-1 text-fg-primary"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {ONBOARDING_ORG.dataPrimeiroVencimento}
              </dd>
            </div>
          </dl>
        </article>

        <div
          className="mb-3 uppercase text-fg-tertiary"
          style={{ fontSize: 10, letterSpacing: "0.08em" }}
        >
          Método de pagamento
        </div>

        <ul className="m-0 mb-5 flex flex-col gap-2.5 list-none p-0">
          {METHODS.map((method) => {
            const isSelected = selected === method.id
            return (
              <li key={method.id}>
                <button
                  type="button"
                  onClick={() => setSelected(method.id)}
                  disabled={submitting}
                  className={[
                    "flex w-full items-center gap-3.5 rounded-lg border px-4 py-4 text-left transition-colors duration-aw-fast",
                    isSelected
                      ? "border-fg-primary bg-fg-primary text-white"
                      : "border-border bg-bg-raised hover:border-border-strong hover:bg-bg-surface",
                  ].join(" ")}
                >
                  <AwBrandLogo brand={method.brand} size="md" />

                  <span className="min-w-0 flex-1">
                    <span
                      className={[
                        "block font-medium",
                        isSelected ? "text-white" : "text-fg-primary",
                      ].join(" ")}
                      style={{ fontSize: 14 }}
                    >
                      {method.title}
                    </span>
                    <span
                      className={[
                        "block",
                        isSelected ? "text-white/70" : "text-fg-tertiary",
                      ].join(" ")}
                      style={{ fontSize: 12 }}
                    >
                      {method.description}
                    </span>
                  </span>
                  <span
                    className={[
                      "flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px]",
                      isSelected
                        ? "border-white bg-white text-fg-primary"
                        : "border-border-strong bg-transparent text-transparent",
                    ].join(" ")}
                  >
                    <Icon name="check" size={14} weight={700} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {submitting && (
          <div className="mb-3 flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
            <span
              aria-hidden="true"
              className="inline-block h-4 w-4 flex-shrink-0 animate-spin rounded-full border-[1.5px] border-brand border-r-transparent"
            />
            <div
              className="font-medium text-fg-primary"
              style={{ fontSize: 13 }}
            >
              Processando mensalidade…
            </div>
          </div>
        )}

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <Link
            href="/primeiro-acesso/confirmado"
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="arrow_back" size={16} />
            <span className="aw-btn__label">Voltar</span>
          </Link>
          <span className="flex-1" />
          <button
            type="button"
            onClick={submit}
            disabled={!selected || submitting}
            className="aw-btn aw-btn--primary aw-btn--md"
          >
            <span className="aw-btn__label">
              {submitting ? "Processando…" : "Pagar mensalidade"}
            </span>
            <Icon name="arrow_forward" size={16} />
          </button>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
