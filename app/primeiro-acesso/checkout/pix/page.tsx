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

function parseBRL(s: string): number {
  return Number(s.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", "."))
}

function fmtBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const TOTAL_IMPLEMENTACAO = parseBRL(ONBOARDING_ORG.valorImplementacao)
const MAX_PARCELAS = ONBOARDING_ORG.parcelamentoMaxImplementacao

export default function CheckoutPixPage() {
  const router = useRouter()
  const [paid, setPaid] = React.useState(false)
  const [parcelas, setParcelas] = React.useState(1)

  const valorParcela = TOTAL_IMPLEMENTACAO / parcelas
  const valorMostrado =
    parcelas === 1 ? ONBOARDING_ORG.valorImplementacao : fmtBRL(valorParcela)
  const subtitulo =
    parcelas === 1
      ? "Implementação · pagamento à vista"
      : `Implementação · 1ª de ${parcelas} Pix mensais`

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
    <AwOnboardingShell currentStep={6} org={ONBOARDING_ORG}>
      <section>
        <div className="mb-5 flex items-center gap-3">
          <AwBrandLogo brand="pix" size="md" />
          <span className="aw-eyebrow text-fg-tertiary">
            Pagamento via Pix
          </span>
        </div>
        <h3 className="mb-2 text-fg-primary text-balance">
          Escaneie o QR ou copie o código.
        </h3>

        <p className="mb-5 body-sm text-fg-secondary text-pretty">
          Após pagar, sua conta é liberada automaticamente. Você pode fechar
          esta tela; o link do e-mail continua válido.
        </p>

        <div
          role="tablist"
          aria-label="Forma de pagamento"
          className="mb-3 grid grid-cols-2 gap-2"
        >
          {Array.from({ length: MAX_PARCELAS }, (_, i) => i + 1).map((n) => {
            const selected = parcelas === n
            return (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setParcelas(n)}
                className={[
                  "flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors duration-aw-fast",
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
              </button>
            )
          })}
        </div>

        <div className="mb-3 flex items-baseline justify-between rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
          <div>
            <div className="aw-eyebrow text-fg-tertiary">
              Valor desta cobrança
            </div>
            <div className="mt-0.5 body-xs text-fg-tertiary">{subtitulo}</div>
          </div>
          <div
            className="body-xl font-medium text-fg-primary"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {valorMostrado}
          </div>
        </div>

        <details className="mb-5 group overflow-hidden rounded-lg border border-border-subtle bg-bg-raised">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 body-xs hover:bg-bg-surface">
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
                    "grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 body-xs",
                    i < ONBOARDING_ORG.proximosVencimentos.length - 1
                      ? "border-b border-border-subtle"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-fg-secondary">{parcela.mes}</span>
                    {isProrata && (
                      <span className="rounded-xs bg-bg-muted px-1.5 py-0.5 body-xs text-fg-tertiary">
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
            <div className="border-t border-border-subtle bg-bg-surface px-4 py-2.5 body-xs text-fg-tertiary text-pretty">
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
              className="flex-1 self-center overflow-hidden body-xs text-fg-secondary"
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {PIX_CODE}
            </code>
            <button
              type="button"
              className="h-8 rounded-sm border border-border bg-bg-raised px-3 body-xs font-medium text-fg-primary hover:bg-bg-muted"
            >
              Copiar
            </button>
          </div>
          <div className="flex items-center gap-2 body-xs text-fg-tertiary">
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
                <div className="body-xs font-medium text-fg-primary">
                  Pagamento recebido
                </div>
                <div className="body-xs text-fg-tertiary">
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
                <div className="body-xs font-medium text-fg-primary">
                  Aguardando pagamento via Pix…
                </div>
                <div className="body-xs text-fg-tertiary">
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
          <span className="body-xs text-fg-tertiary">
            (simulação automática)
          </span>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
