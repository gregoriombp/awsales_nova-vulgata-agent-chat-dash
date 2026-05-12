"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwCardBrand, detectCardBrand } from "@/components/ui/AwCardBrand"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG } from "../../_data"

const fmtCard = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ")
const fmtExp = (v: string) => {
  const n = v.replace(/\D/g, "").slice(0, 4)
  return n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n
}

const parseBRL = (s: string) =>
  Number(s.replace(/[^\d,]/g, "").replace(/\./g, "").replace(",", "."))

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function CheckoutCartaoPage() {
  const router = useRouter()
  const [number, setNumber] = React.useState("")
  const [name, setName] = React.useState("")
  const [exp, setExp] = React.useState("")
  const [cvv, setCvv] = React.useState("")
  const [installments, setInstallments] = React.useState(1)
  const [loading, setLoading] = React.useState(false)

  const total = parseBRL(ONBOARDING_ORG.valorImplementacao)
  const maxInstallments = ONBOARDING_ORG.parcelamentoMaxImplementacao
  const installmentValue = total / installments
  const summaryLabel =
    installments === 1
      ? `Pagar ${fmtBRL(total)}`
      : `Pagar em ${installments}x de ${fmtBRL(installmentValue)}`

  const brand = detectCardBrand(number)
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
        <div className="mb-5 flex items-center gap-2.5">
          <AwBrandLogo brand="card" size="sm" />
          <span
            className="uppercase text-fg-tertiary"
            style={{ fontSize: 11, letterSpacing: "0.06em" }}
          >
            Pagamento no cartão
          </span>
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
          Aprovação imediata. O total de{" "}
          <b>{ONBOARDING_ORG.valorImplementacao}</b> pode ser parcelado em até{" "}
          {maxInstallments}x sem juros na fatura da bandeira escolhida.
        </p>

        <div className="grid gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span
              className="font-medium text-fg-secondary"
              style={{ fontSize: 12 }}
            >
              Número do cartão
            </span>
            <span className="flex h-11 items-center gap-2.5 rounded-md border border-border bg-bg-raised pl-2.5 pr-3.5 focus-within:border-fg-primary">
              <AwCardBrand pan={number} size="md" />
              <input
                placeholder="0000 0000 0000 0000"
                value={number}
                onChange={(e) => setNumber(fmtCard(e.target.value))}
                inputMode="numeric"
                autoComplete="cc-number"
                className="flex-1 border-0 bg-transparent font-sans outline-0"
                style={{
                  fontSize: 14,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "0.02em",
                }}
              />
              {brand !== "unknown" && (
                <span
                  className="uppercase text-fg-tertiary"
                  style={{ fontSize: 10, letterSpacing: "0.06em" }}
                >
                  {brand === "amex" ? "Amex" : brand === "diners" ? "Diners" : brand}
                </span>
              )}
            </span>
          </label>
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

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span
                className="font-medium text-fg-secondary"
                style={{ fontSize: 12 }}
              >
                Parcelamento
              </span>
              <span
                className="text-fg-tertiary"
                style={{ fontSize: 11 }}
              >
                até {maxInstallments}x sem juros · entrada à vista
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label="Número de parcelas"
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${maxInstallments}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: maxInstallments }, (_, i) => i + 1).map(
                (n) => {
                  const isSelected = installments === n
                  const value = total / n
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setInstallments(n)}
                      className={[
                        "flex flex-col items-start gap-0.5 rounded-md border bg-bg-raised px-3 py-2.5 text-left transition-colors duration-aw-fast",
                        isSelected
                          ? "border-fg-primary shadow-[0_0_0_1px_var(--fg-primary)_inset]"
                          : "border-border hover:border-border-strong hover:bg-bg-surface",
                      ].join(" ")}
                    >
                      <span
                        className="font-medium text-fg-primary"
                        style={{
                          fontSize: 13,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {n}x
                      </span>
                      <span
                        className="text-fg-tertiary"
                        style={{
                          fontSize: 11,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {n === 1 ? "à vista" : fmtBRL(value)}
                      </span>
                    </button>
                  )
                },
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
            <span
              aria-hidden="true"
              className="inline-block h-4 w-4 flex-shrink-0 animate-spin rounded-full border-[1.5px] border-brand border-r-transparent"
            />
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
              {loading ? "Processando…" : summaryLabel}
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
