"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG } from "../../_data"

const fmtCard = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ")
const fmtExp = (v: string) => {
  const n = v.replace(/\D/g, "").slice(0, 4)
  return n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n
}

export default function CheckoutCartaoPage() {
  const router = useRouter()
  const [number, setNumber] = React.useState("")
  const [name, setName] = React.useState("")
  const [exp, setExp] = React.useState("")
  const [cvv, setCvv] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const valid =
    number.replace(/\s/g, "").length >= 13 &&
    name.length > 3 &&
    exp.length === 5 &&
    cvv.length >= 3

  const submit = () => {
    setLoading(true)
    setTimeout(
      () => router.push("/primeiro-acesso/confirmado"),
      1800,
    )
  }

  return (
    <AwOnboardingShell currentStep={4} org={ONBOARDING_ORG}>
      <section>
        <div
          className="mb-3.5 font-mono uppercase text-fg-tertiary"
          style={{ fontSize: 10, letterSpacing: "0.08em" }}
        >
          etapa 3 de 4 · cartão de crédito · {ONBOARDING_ORG.valorImplementacao}
        </div>

        <h1
          className="mb-2 font-display font-medium text-fg-primary text-balance"
          style={{
            fontSize: "var(--h3-size)",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
          }}
        >
          Pague no cartão.
        </h1>

        <p
          className="mb-7 text-fg-secondary text-pretty"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          Aprovação imediata. Você verá uma cobrança de{" "}
          <b>{ONBOARDING_ORG.valorImplementacao}</b> na fatura da bandeira
          escolhida.
        </p>

        <div className="grid gap-3.5">
          <FieldText label="Número do cartão" iconLeft="credit_card">
            <input
              placeholder="0000 0000 0000 0000"
              value={number}
              onChange={(e) => setNumber(fmtCard(e.target.value))}
              className="flex-1 border-0 bg-transparent font-sans outline-0"
              style={{ fontSize: 14 }}
            />
          </FieldText>
          <FieldText label="Nome impresso no cartão">
            <input
              placeholder="Como está no cartão"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="flex-1 border-0 bg-transparent font-sans outline-0"
              style={{ fontSize: 14 }}
            />
          </FieldText>
          <div className="grid grid-cols-2 gap-3">
            <FieldText label="Validade">
              <input
                placeholder="MM/AA"
                value={exp}
                onChange={(e) => setExp(fmtExp(e.target.value))}
                className="flex-1 border-0 bg-transparent font-sans outline-0"
                style={{ fontSize: 14 }}
              />
            </FieldText>
            <FieldText label="CVV">
              <input
                placeholder="000"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="flex-1 border-0 bg-transparent font-sans outline-0"
                style={{ fontSize: 14 }}
              />
            </FieldText>
          </div>
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
            <span className="relative h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand">
              <span className="absolute -inset-1 animate-ping rounded-full border-2 border-brand opacity-60" />
            </span>
            <div>
              <div
                className="font-medium text-fg-primary"
                style={{ fontSize: 13 }}
              >
                Processando cobrança…
              </div>
              <div
                className="text-fg-tertiary"
                style={{ fontSize: 12 }}
              >
                Estamos confirmando com a operadora.
              </div>
            </div>
          </div>
        )}

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <Link
            href="/primeiro-acesso/pagamento"
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="arrow_back" size={16} />
            <span className="aw-btn__label">Voltar</span>
          </Link>
          <span className="flex-1" />
          <button
            type="button"
            disabled={!valid || loading}
            onClick={submit}
            className="aw-btn aw-btn--primary aw-btn--md"
          >
            <span className="aw-btn__label">
              {loading ? "Processando…" : `Pagar ${ONBOARDING_ORG.valorImplementacao}`}
            </span>
            <Icon name="arrow_forward" size={16} />
          </button>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}

function FieldText({
  label,
  iconLeft,
  children,
}: {
  label: string
  iconLeft?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="font-medium text-fg-secondary"
        style={{ fontSize: 12 }}
      >
        {label}
      </span>
      <span className="flex h-11 items-center gap-2 rounded-md border border-border bg-bg-raised px-3.5 focus-within:border-fg-primary">
        {iconLeft && <Icon name={iconLeft} size={18} className="text-fg-tertiary" />}
        {children}
      </span>
    </label>
  )
}
