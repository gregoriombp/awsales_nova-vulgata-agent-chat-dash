"use client"

import * as React from "react"
import Link from "next/link"
import { AwButton } from "@/components/ui/AwButton"
import { Icon } from "@/components/ui/Icon"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../../_data"

const BOLETO_LINHA = "23793.38128 60079.811604 41005.396305 1 99230000001200000"

function parseBRL(s: string): number {
  return Number(s.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", "."))
}

function fmtBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const TOTAL_IMPLEMENTACAO = parseBRL(ONBOARDING_ORG.valorImplementacao)
const MAX_PARCELAS = ONBOARDING_ORG.parcelamentoMaxImplementacao

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
  const [parcelas, setParcelas] = React.useState(1)
  const [generated, setGenerated] = React.useState(false)
  const [emailStatus, setEmailStatus] = React.useState<EmailStatus>("idle")

  const valorParcela = TOTAL_IMPLEMENTACAO / parcelas
  const valorMostrado =
    parcelas === 1 ? ONBOARDING_ORG.valorImplementacao : fmtBRL(valorParcela)

  const sendEmail = () => {
    if (emailStatus !== "idle") return
    setEmailStatus("sending")
    setTimeout(() => {
      setEmailStatus("sent")
      setTimeout(() => setEmailStatus("idle"), 4000)
    }, 900)
  }

  return (
    <AwOnboardingShell currentStep={6} org={ONBOARDING_ORG}>
      <section>
        <div className="mb-5 flex items-center gap-3">
          <AwBrandLogo brand="boleto" size="md" />
          <span className="aw-eyebrow text-fg-tertiary">
            Pagamento via boleto
          </span>
        </div>

        {!generated ? (
          <BoletoOptions
            parcelas={parcelas}
            onSelectParcelas={setParcelas}
            valorMostrado={valorMostrado}
            onGenerate={() => setGenerated(true)}
          />
        ) : (
          <BoletoGerado
            parcelas={parcelas}
            valorMostrado={valorMostrado}
            emailStatus={emailStatus}
            onSendEmail={sendEmail}
          />
        )}
      </section>
    </AwOnboardingShell>
  )
}

function BoletoOptions({
  parcelas,
  onSelectParcelas,
  valorMostrado,
  onGenerate,
}: {
  parcelas: number
  onSelectParcelas: (n: number) => void
  valorMostrado: string
  onGenerate: () => void
}) {
  return (
    <>
      <h3 className="mb-2 text-fg-primary text-balance">
        Como você quer pagar?
      </h3>
      <p className="mb-7 body-sm text-fg-secondary text-pretty">
        Escolha como dividir o pagamento. O boleto é gerado depois com o valor
        e vencimento corretos.
      </p>

      <div
        role="radiogroup"
        aria-label="Condição de pagamento"
        className="mb-5 grid grid-cols-2 gap-2"
      >
        {Array.from({ length: MAX_PARCELAS }, (_, i) => i + 1).map((n) => {
          const selected = parcelas === n
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelectParcelas(n)}
              className={[
                "flex flex-col items-start gap-1 rounded-lg border px-4 py-4 text-left transition-colors duration-aw-fast",
                selected
                  ? "border-fg-primary bg-fg-primary text-white"
                  : "border-border bg-bg-raised hover:bg-bg-surface",
              ].join(" ")}
            >
              <span className="aw-eyebrow opacity-70">
                {n === 1 ? "À vista" : `${n}x sem juros`}
              </span>
              <span
                className="body-md font-medium"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {n === 1 ? (
                  ONBOARDING_ORG.valorImplementacao
                ) : (
                  <>
                    {fmtBRL(TOTAL_IMPLEMENTACAO / n)}
                    <span className="ml-1 body-xs opacity-70">/mês</span>
                  </>
                )}
              </span>
              <span className="body-xs opacity-70">
                {n === 1
                  ? "1 boleto · paga agora"
                  : `${n} boletos · 1 por mês`}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mb-5 flex items-baseline justify-between rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
        <div>
          <div className="aw-eyebrow text-fg-tertiary">
            {parcelas === 1 ? "Valor do boleto" : "Valor da 1ª parcela"}
          </div>
          <div className="mt-0.5 body-xs text-fg-tertiary">
            {parcelas === 1
              ? "Implementação · pagamento à vista"
              : `Implementação · 1ª de ${parcelas} parcelas mensais`}
          </div>
        </div>
        <div
          className="body-xl font-medium text-fg-primary"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {valorMostrado}
        </div>
      </div>

      <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
        <AwButton
          asChild
          size="md"
          variant="ghost"
          iconLeft="arrow_back"
        >
          <Link href="/primeiro-acesso/pagamento">Voltar</Link>
        </AwButton>
        <span className="flex-1" />
        <AwButton
          size="md"
          variant="primary"
          iconRight="arrow_forward"
          onClick={onGenerate}
        >
          Gerar boleto
        </AwButton>
      </footer>
    </>
  )
}

function BoletoGerado({
  parcelas,
  valorMostrado,
  emailStatus,
  onSendEmail,
}: {
  parcelas: number
  valorMostrado: string
  emailStatus: EmailStatus
  onSendEmail: () => void
}) {
  return (
    <>
      <h3 className="mb-2 text-fg-primary text-balance">
        Seu boleto está pronto.
      </h3>

      <p className="mb-7 body-sm text-fg-secondary text-pretty">
        Pague no app do seu banco. Sua conta é liberada automaticamente
        assim que o pagamento for compensado — em geral, 2 a 3 dias úteis.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-raised p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-1 aw-eyebrow text-fg-tertiary">
              {parcelas === 1 ? "Valor" : "1ª de " + parcelas + " parcelas"}
            </div>
            <h4 className="m-0">{valorMostrado}</h4>
          </div>
          <div className="text-right">
            <div className="mb-1 aw-eyebrow text-fg-tertiary">Vencimento</div>
            <div className="body-sm font-medium">14/05/2026</div>
          </div>
        </div>

        <Barcode />

        <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-bg-canvas py-1.5 pl-3 pr-1.5">
          <code
            className="flex-1 self-center overflow-hidden body-xs text-fg-secondary"
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {BOLETO_LINHA}
          </code>
          <AwButton size="sm" variant="secondary">
            Copiar
          </AwButton>
        </div>

        <div className="mt-3 flex gap-2">
          <AwButton
            size="md"
            variant="primary"
            iconLeft="picture_as_pdf"
            className="flex-1"
          >
            Baixar PDF
          </AwButton>
          <AwButton
            size="md"
            variant="primary"
            iconLeft={
              emailStatus === "idle"
                ? "mail"
                : emailStatus === "sent"
                  ? "check"
                  : undefined
            }
            loading={emailStatus === "sending"}
            disabled={emailStatus !== "idle"}
            onClick={onSendEmail}
            className="flex-1"
          >
            {emailStatus === "idle"
              ? "Enviar por e-mail"
              : emailStatus === "sending"
                ? "Enviando…"
                : "Enviado"}
          </AwButton>
        </div>
        {emailStatus === "sent" && (
          <div className="mt-3 body-xs text-fg-tertiary">
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
          <div className="body-xs font-medium">
            Aguardando compensação bancária
          </div>
          <div className="body-xs" style={{ opacity: 0.85 }}>
            Te notificaremos por e-mail em até 3 dias úteis após o pagamento.
          </div>
        </div>
        <AwButton asChild size="sm" variant="secondary">
          <Link href="/primeiro-acesso/confirmado?via=boleto">Já paguei</Link>
        </AwButton>
      </div>

      <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
        <AwButton
          asChild
          size="md"
          variant="ghost"
          iconLeft="arrow_back"
        >
          <Link href="/primeiro-acesso/pagamento">Voltar</Link>
        </AwButton>
      </footer>
    </>
  )
}
