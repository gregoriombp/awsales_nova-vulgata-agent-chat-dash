"use client"

import * as React from "react"
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../../_data"

const BOLETO_LINHA = "23793.38128 60079.811604 41005.396305 1 99230000001200000"

function Barcode() {
  const bars = React.useMemo(() => {
    let s = 11
    const out: { w: number; space: number }[] = []
    for (let i = 0; i < 88; i++) {
      s = (s * 9301 + 49297) % 233280
      const w = 1 + Math.floor((s / 233280) * 3)
      const space = 1 + Math.floor(((s * 7) % 5000) / 1700)
      out.push({ w, space })
    }
    return out
  }, [])
  return (
    <div className="flex h-14 items-stretch gap-px rounded-md border border-border-subtle bg-white p-2">
      {bars.map((b, i) => (
        <React.Fragment key={i}>
          <i className="block bg-aw-gray-1200" style={{ width: b.w }} />
          <div style={{ width: b.space }} />
        </React.Fragment>
      ))}
    </div>
  )
}

type EmailStatus = "idle" | "sending" | "sent"

export default function CheckoutBoletoPage() {
  const [emailStatus, setEmailStatus] = React.useState<EmailStatus>("idle")

  const sendEmail = () => {
    if (emailStatus !== "idle") return
    setEmailStatus("sending")
    setTimeout(() => {
      setEmailStatus("sent")
      setTimeout(() => setEmailStatus("idle"), 4000)
    }, 900)
  }

  return (
    <AwOnboardingShell currentStep={4} org={ONBOARDING_ORG}>
      <section>
        <div className="mb-5 flex items-center gap-3">
          <AwBrandLogo brand="boleto" size="md" />
          <span
            className="uppercase text-fg-tertiary"
            style={{ fontSize: 11, letterSpacing: "0.06em" }}
          >
            Pagamento via boleto
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
          Seu boleto está pronto.
        </h1>

        <p
          className="mb-7 text-fg-secondary text-pretty"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          Pague no app do seu banco. Sua conta é liberada automaticamente
          assim que o pagamento for compensado — em geral, 2 a 3 dias úteis.
        </p>

        <div className="rounded-xl border border-border-subtle bg-bg-raised p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div
                className="mb-1 uppercase text-fg-tertiary"
                style={{ fontSize: 10, letterSpacing: "0.06em" }}
              >
                Valor
              </div>
              <div
                className="font-medium"
                style={{ fontSize: 24, letterSpacing: "-0.01em" }}
              >
                {ONBOARDING_ORG.valorImplementacao}
              </div>
            </div>
            <div className="text-right">
              <div
                className="mb-1 uppercase text-fg-tertiary"
                style={{ fontSize: 10, letterSpacing: "0.06em" }}
              >
                Vencimento
              </div>
              <div className="font-medium" style={{ fontSize: 14 }}>
                14/05/2026
              </div>
            </div>
          </div>

          <Barcode />

          <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-bg-canvas py-1.5 pl-3 pr-1.5">
            <code
              className="flex-1 self-center overflow-hidden text-fg-secondary"
              style={{
                fontSize: 11,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {BOLETO_LINHA}
            </code>
            <button
              type="button"
              className="h-8 rounded-sm border border-border bg-bg-raised px-3 font-medium text-fg-primary hover:bg-bg-muted"
              style={{ fontSize: 12 }}
            >
              Copiar
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="aw-btn aw-btn--primary aw-btn--md flex-1"
            >
              <Icon name="picture_as_pdf" size={16} />
              <span className="aw-btn__label">Baixar PDF</span>
            </button>
            <button
              type="button"
              onClick={sendEmail}
              disabled={emailStatus !== "idle"}
              className="aw-btn aw-btn--primary aw-btn--md flex-1"
            >
              {emailStatus === "idle" && (
                <>
                  <Icon name="mail" size={16} />
                  <span className="aw-btn__label">Enviar por e-mail</span>
                </>
              )}
              {emailStatus === "sending" && (
                <>
                  <span
                    aria-hidden="true"
                    className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-r-transparent"
                  />
                  <span className="aw-btn__label">Enviando…</span>
                </>
              )}
              {emailStatus === "sent" && (
                <>
                  <Icon name="check" size={16} />
                  <span className="aw-btn__label">Enviado</span>
                </>
              )}
            </button>
          </div>
          {emailStatus === "sent" && (
            <div
              className="mt-3 text-fg-tertiary"
              style={{ fontSize: 12 }}
            >
              Boleto enviado para{" "}
              <span className="font-medium text-fg-secondary">
                {ONBOARDING_USER.email}
              </span>
              .
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3.5 rounded-lg bg-aw-amber-100 px-4 py-3.5 text-aw-amber-800">
          <Icon name="schedule" size={18} />
          <div className="flex-1">
            <div className="font-medium" style={{ fontSize: 13 }}>
              Aguardando compensação bancária
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              Te notificaremos por e-mail em até 3 dias úteis após o pagamento.
            </div>
          </div>
          <Link
            href="/primeiro-acesso/confirmado?via=boleto"
            className="aw-btn aw-btn--secondary aw-btn--sm"
          >
            <span className="aw-btn__label">Já paguei</span>
          </Link>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <Link
            href="/primeiro-acesso/pagamento"
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="arrow_back" size={16} />
            <span className="aw-btn__label">Voltar</span>
          </Link>
          <span className="flex-1" />
          <span
            className="text-fg-tertiary"
            style={{ fontSize: 10, letterSpacing: "0.04em" }}
          >
            você pode fechar e voltar pelo e-mail
          </span>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
