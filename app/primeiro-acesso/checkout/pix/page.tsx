"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG } from "../../_data"

const PIX_CODE =
  "00020126360014BR.GOV.BCB.PIX0114+5511987654321520400005303986540512000.005802BR5925AWSALES TECNOLOGIA LTDA6009SAO PAULO62070503***6304B19F"

function FakeQR() {
  const size = 21
  const cells = React.useMemo(() => {
    const arr: boolean[] = []
    let s = 7
    for (let i = 0; i < size * size; i++) {
      s = (s * 9301 + 49297) % 233280
      arr.push(s / 233280 > 0.5)
    }
    return arr
  }, [])
  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) ||
    (x >= size - 7 && y < 7) ||
    (x < 7 && y >= size - 7)
  return (
    <div
      className="grid h-[200px] w-[200px] rounded-md border border-border-subtle bg-white p-2.5"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {cells.map((on, i) => {
        const x = i % size
        const y = Math.floor(i / size)
        const finder = isFinder(x, y)
        let fill: string
        if (finder) {
          const fx = x < 7 ? x : x - (size - 7)
          const fy = y < 7 ? y : y - (size - 7)
          const onOuter = fx === 0 || fx === 6 || fy === 0 || fy === 6
          const onInner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4
          fill = onOuter || onInner ? "#0D0D0D" : "#FFFFFF"
        } else {
          fill = on ? "#0D0D0D" : "#FFFFFF"
        }
        return (
          <div
            key={i}
            style={{ background: fill, aspectRatio: "1 / 1" }}
          />
        )
      })}
    </div>
  )
}

export default function CheckoutPixPage() {
  const router = useRouter()
  const [paid, setPaid] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setPaid(true), 6000)
    return () => clearTimeout(t)
  }, [])
  React.useEffect(() => {
    if (paid) {
      const t = setTimeout(
        () => router.push("/primeiro-acesso/confirmado"),
        1400,
      )
      return () => clearTimeout(t)
    }
  }, [paid, router])

  return (
    <AwOnboardingShell currentStep={4} org={ONBOARDING_ORG}>
      <section>
        <div className="mb-5 flex items-center gap-3">
          <AwBrandLogo brand="pix" size="md" />
          <span
            className="uppercase text-fg-tertiary"
            style={{ fontSize: 11, letterSpacing: "0.06em" }}
          >
            Pagamento via Pix
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
          Escaneie o QR ou copie o código.
        </h1>

        <p
          className="mb-5 text-fg-secondary text-pretty"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          Após pagar, sua conta é liberada automaticamente. Você pode fechar
          esta tela; o link do e-mail continua válido.
        </p>

        <div className="mb-3 flex items-baseline justify-between rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
          <div>
            <div
              className="uppercase text-fg-tertiary"
              style={{ fontSize: 10, letterSpacing: "0.08em" }}
            >
              Valor desta cobrança
            </div>
            <div
              className="text-fg-tertiary"
              style={{ fontSize: 11, marginTop: 2 }}
            >
              Implementação · pagamento à vista
            </div>
          </div>
          <div
            className="font-display font-medium text-fg-primary"
            style={{
              fontSize: 22,
              letterSpacing: "-0.01em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {ONBOARDING_ORG.valorImplementacao}
          </div>
        </div>

        <details className="mb-5 group overflow-hidden rounded-lg border border-border-subtle bg-bg-raised">
          <summary
            className="flex cursor-pointer items-center gap-2 px-4 py-3 hover:bg-bg-surface"
            style={{ fontSize: 12 }}
          >
            <Icon
              name="event_repeat"
              size={16}
              className="text-fg-tertiary"
            />
            <span className="font-medium text-fg-primary">
              Próximas cobranças (mensalidade)
            </span>
            <span className="ml-1 text-fg-tertiary">
              · 1ª no dia {ONBOARDING_ORG.diaVencimento.toString().padStart(2, "0")}/06,
              prorrateada
            </span>
            <Icon
              name="expand_more"
              size={16}
              className="ml-auto text-fg-tertiary transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="border-t border-border-subtle">
            {ONBOARDING_ORG.proximosVencimentos.map((parcela, i) => {
              const isProrata = i === 0
              return (
                <div
                  key={parcela.mes}
                  className={[
                    "grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5",
                    i < ONBOARDING_ORG.proximosVencimentos.length - 1
                      ? "border-b border-border-subtle"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ fontSize: 12 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-fg-secondary">{parcela.mes}</span>
                    {isProrata && (
                      <span
                        className="rounded-xs bg-bg-muted px-1.5 py-0.5 text-fg-tertiary"
                        style={{ fontSize: 10, letterSpacing: "0.02em" }}
                      >
                        prorrata
                      </span>
                    )}
                  </div>
                  <span
                    className="text-fg-tertiary"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    venc. {parcela.vencimento}
                  </span>
                  <span
                    className="font-medium text-fg-primary"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {parcela.valor}
                  </span>
                </div>
              )
            })}
            <div
              className="border-t border-border-subtle bg-bg-surface px-4 py-2.5 text-fg-tertiary text-pretty"
              style={{ fontSize: 11, lineHeight: 1.5 }}
            >
              A primeira mensalidade é cobrada na prorrata
              (proporcional aos {ONBOARDING_ORG.diasRestantesMesAtual} dias
              restantes do mês corrente). As próximas vencem todo dia{" "}
              {ONBOARDING_ORG.diaVencimento}.
            </div>
          </div>
        </details>

        <div className="mb-5 flex flex-col items-center gap-4 rounded-xl border border-border-subtle bg-bg-raised p-6">
          <FakeQR />
          <div className="flex w-full items-center gap-2 rounded-md border border-border bg-bg-canvas py-1.5 pl-3 pr-1.5">
            <code
              className="flex-1 self-center overflow-hidden text-fg-secondary"
              style={{
                fontSize: 11,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {PIX_CODE}
            </code>
            <button
              type="button"
              className="h-8 rounded-sm border border-border bg-bg-raised px-3 font-medium text-fg-primary hover:bg-bg-muted"
              style={{ fontSize: 12 }}
            >
              Copiar
            </button>
          </div>
          <div
            className="flex items-center gap-2 text-fg-tertiary"
            style={{ fontSize: 12 }}
          >
            <Icon name="schedule" size={14} />
            Expira em 30:00
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
          {paid ? (
            <>
              <span className="flex h-5 w-5 items-center justify-center text-aw-emerald-700">
                <Icon name="check_circle" size={20} fill={1} />
              </span>
              <div>
                <div
                  className="font-medium text-fg-primary"
                  style={{ fontSize: 13 }}
                >
                  Pagamento recebido
                </div>
                <div
                  className="text-fg-tertiary"
                  style={{ fontSize: 12 }}
                >
                  Liberando sua conta…
                </div>
              </div>
            </>
          ) : (
            <>
              <span
                aria-hidden="true"
                className="inline-block h-4 w-4 flex-shrink-0 animate-spin rounded-full border-[1.5px] border-brand border-r-transparent"
              />
              <div>
                <div
                  className="font-medium text-fg-primary"
                  style={{ fontSize: 13 }}
                >
                  Aguardando pagamento via Pix…
                </div>
                <div
                  className="text-fg-tertiary"
                  style={{ fontSize: 12 }}
                >
                  Detecção automática. Não é preciso confirmar manualmente.
                </div>
              </div>
            </>
          )}
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
            (simulação automática)
          </span>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
