"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwCardBrand } from "@/components/ui/AwCardBrand"
import { AwCheckbox } from "@/components/ui/AwCheckbox"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import {
  ONBOARDING_ORG,
  ONBOARDING_USER,
  authMethodLabel,
  fmtBRL,
} from "../_data"

const ORG = ONBOARDING_ORG
const MAX_PARCELAS = ORG.parcelamentoMaxImplementacao

type MethodId = "pix" | "cartao" | "boleto"
type Line = { method: MethodId; parcelas: number }

const METHODS: {
  id: MethodId
  brand: "pix" | "card" | "boleto"
  title: string
  shortDesc: string
}[] = [
  { id: "pix", brand: "pix", title: "Pix", shortDesc: "imediato" },
  { id: "cartao", brand: "card", title: "Cartão de crédito", shortDesc: "imediato" },
  { id: "boleto", brand: "boleto", title: "Boleto bancário", shortDesc: "2–3 dias úteis" },
]

const methodTitle = (id: MethodId) =>
  METHODS.find((m) => m.id === id)?.title ?? id
const methodBrand = (id: MethodId) =>
  METHODS.find((m) => m.id === id)?.brand ?? "card"

function parcelaLabel(line: Line, total: number) {
  if (line.parcelas === 1) return `${methodTitle(line.method)} · à vista`
  return `${methodTitle(line.method)} · ${line.parcelas}× ${fmtBRL(
    total / line.parcelas
  )}`
}

export default function PagamentoPage() {
  return (
    <React.Suspense fallback={null}>
      <PagamentoContent />
    </React.Suspense>
  )
}

function PagamentoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const metodo = searchParams.get("metodo")

  const [phase, setPhase] = React.useState<
    "setup" | "checkout" | "processing"
  >("setup")
  const [impl, setImpl] = React.useState<Line>({ method: "pix", parcelas: 1 })
  const [mens, setMens] = React.useState<Line>({ method: "pix", parcelas: 1 })
  const [mensMethodOverridden, setMensMethodOverridden] =
    React.useState(false)
  const [mensPickerOpen, setMensPickerOpen] = React.useState(false)

  const totalImpl = ORG.valorImplementacao
  const totalMens = ORG.valorMensalProrrata
  const totalGeral = totalImpl + totalMens

  const concluidoHref =
    `/primeiro-acesso/concluido?im=${impl.method}&ip=${impl.parcelas}` +
    `&mm=${mens.method}&mp=${mens.parcelas}` +
    (metodo ? `&metodo=${metodo}` : "")

  const goProcessing = () => {
    setPhase("processing")
    setTimeout(() => router.push(concluidoHref), 1800)
  }

  return (
    <AwOnboardingShell
      currentStep={4}
      org={ORG}
      authState={{
        method: authMethodLabel(metodo),
        email: ONBOARDING_USER.email,
      }}
    >
      {phase === "processing" ? (
        <ProcessingPhase totalImpl={totalImpl} totalMens={totalMens} />
      ) : phase === "checkout" ? (
        <CheckoutPhase
          impl={impl}
          mens={mens}
          totalImpl={totalImpl}
          totalMens={totalMens}
          onBack={() => setPhase("setup")}
          onSubmit={goProcessing}
        />
      ) : (
        <section>
          <h3 className="mb-2 text-fg-primary text-balance">
            Configure seu pagamento.
          </h3>
          <p className="mb-6 body-sm text-fg-secondary text-pretty">
            Você vai pagar a{" "}
            <b className="font-medium text-fg-primary">implementação</b> e a{" "}
            <b className="font-medium text-fg-primary">1ª mensalidade</b> agora.
            Pode escolher o método e dividir cada um em até {MAX_PARCELAS}×.
          </p>

          <HeroSummary
            totalImpl={totalImpl}
            totalMens={totalMens}
            impl={impl}
            mens={mens}
          />

          <div className="mt-5 flex flex-col gap-3.5">
            <PaymentLine
              eyebrow="Item 01"
              title="Implementação"
              desc="Cobrança única · setup e onboarding"
              total={totalImpl}
              value={impl}
              accent="primary"
              onChange={(v) => {
                const methodChanged = v.method !== impl.method
                setImpl(v)
                if (methodChanged && !mensMethodOverridden) {
                  setMens((m) => ({ ...m, method: v.method }))
                }
              }}
            />
            <PaymentLine
              eyebrow="Item 02"
              title="1ª Mensalidade"
              desc={`Valor prorrata · referente aos ${ORG.diasRestantesMesAtual} dias restantes de Maio/2026`}
              total={totalMens}
              value={mens}
              accent="recurring"
              methodPickerVariant="linked"
              pickerOpen={mensPickerOpen}
              onTogglePicker={() => setMensPickerOpen((o) => !o)}
              syncedToImpl={!mensMethodOverridden}
              onResetSync={
                mensMethodOverridden
                  ? () => {
                      setMensMethodOverridden(false)
                      setMens((m) => ({ ...m, method: impl.method }))
                      setMensPickerOpen(false)
                    }
                  : undefined
              }
              onChange={(v) => {
                const methodChanged = v.method !== mens.method
                setMens(v)
                if (methodChanged) {
                  setMensMethodOverridden(true)
                  setMensPickerOpen(false)
                }
              }}
            />
          </div>

          <FutureMonths />

          <GrandTotalBar
            totalGeral={totalGeral}
            impl={impl}
            totalImpl={totalImpl}
            mens={mens}
            totalMens={totalMens}
          />

          <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
            <Link
              href={`/primeiro-acesso/contrato${
                metodo ? `?metodo=${metodo}` : ""
              }`}
              className="aw-btn aw-btn--ghost aw-btn--md"
            >
              <Icon name="arrow_back" size={16} />
              <span className="aw-btn__label">Voltar</span>
            </Link>
            <span className="flex-1" />
            <span className="inline-flex items-center gap-1.5 body-xs text-fg-tertiary">
              <Icon name="lock" size={12} />
              conexão criptografada
            </span>
            <button
              type="button"
              onClick={() => setPhase("checkout")}
              className="aw-btn aw-btn--primary aw-btn--md"
            >
              <span className="aw-btn__label">Continuar para pagamento</span>
              <Icon name="arrow_forward" size={16} />
            </button>
          </footer>
        </section>
      )}
    </AwOnboardingShell>
  )
}

/* ---------- HERO SUMMARY ---------- */

function HeroSummary({
  totalImpl,
  totalMens,
  impl,
  mens,
}: {
  totalImpl: number
  totalMens: number
  impl: Line
  mens: Line
}) {
  const total = totalImpl + totalMens
  return (
    <div className="relative overflow-hidden rounded-xl bg-aw-gray-1200 p-[22px] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 100% 0%, rgba(71,138,255,0.18), transparent 60%)",
        }}
      />
      <div className="relative">
        <div className="aw-eyebrow text-aw-gray-500">A pagar hoje</div>
        <div className="mt-1.5 text-[36px] font-medium tabular-nums tracking-tight">
          {fmtBRL(total)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <SummaryPart label="Implementação" amount={totalImpl} line={impl} />
          <SummaryPart label="1ª mensalidade" amount={totalMens} line={mens} />
        </div>
      </div>
    </div>
  )
}

function SummaryPart({
  label,
  amount,
  line,
}: {
  label: string
  amount: number
  line: Line
}) {
  return (
    <div className="border-t border-white/[0.08] pt-3.5">
      <div className="text-[11px] text-aw-gray-500">{label}</div>
      <div className="mt-1 text-[17px] font-medium tabular-nums">
        {fmtBRL(amount)}
      </div>
      <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-aw-gray-400">
        <AwBrandLogo brand={methodBrand(line.method)} size="sm" bare />
        {line.parcelas === 1
          ? "à vista"
          : `${line.parcelas}× ${fmtBRL(amount / line.parcelas)}`}
      </div>
    </div>
  )
}

/* ---------- PAYMENT LINE ---------- */

function PaymentLine({
  eyebrow,
  title,
  desc,
  total,
  value,
  onChange,
  accent,
  methodPickerVariant = "open",
  pickerOpen = true,
  onTogglePicker,
  syncedToImpl,
  onResetSync,
}: {
  eyebrow: string
  title: string
  desc: string
  total: number
  value: Line
  onChange: (v: Line) => void
  accent: "primary" | "recurring"
  methodPickerVariant?: "open" | "linked"
  pickerOpen?: boolean
  onTogglePicker?: () => void
  syncedToImpl?: boolean
  onResetSync?: () => void
}) {
  const m = METHODS.find((x) => x.id === value.method)!
  const showPicker = methodPickerVariant === "open" || pickerOpen

  return (
    <article className="overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
      <header className="flex items-center gap-3 border-b border-border-subtle px-[18px] py-3.5">
        <div className="min-w-0 flex-1">
          <div className="aw-eyebrow text-fg-tertiary">{eyebrow}</div>
          <div className="mt-0.5 body-sm font-medium text-fg-primary">
            {title}
          </div>
          <div className="mt-0.5 body-xs text-fg-tertiary">{desc}</div>
        </div>
        <div className="text-right">
          <div className="body-lg font-medium tabular-nums text-fg-primary">
            {fmtBRL(total)}
          </div>
          {accent === "recurring" && (
            <div className="mt-0.5 text-[10px] text-fg-tertiary">
              próximas {fmtBRL(ORG.valorMensal)}/mês
            </div>
          )}
        </div>
      </header>

      <div className="p-[18px]">
        {showPicker ? (
          <>
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="aw-eyebrow text-fg-tertiary">Método</span>
              {methodPickerVariant === "linked" && (
                <button
                  type="button"
                  onClick={onTogglePicker}
                  className="body-xs text-fg-tertiary hover:text-fg-secondary"
                >
                  Cancelar
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map((opt) => {
                const sel = value.method === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ ...value, method: opt.id })}
                    className={[
                      "relative rounded-lg border p-3 text-left transition-colors duration-aw-fast",
                      sel
                        ? "border-fg-primary bg-bg-surface shadow-[0_0_0_1px_var(--fg-primary)_inset]"
                        : "border-border bg-bg-raised hover:border-border-strong",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2.5">
                      <AwBrandLogo brand={opt.brand} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="body-xs font-medium text-fg-primary">
                          {opt.title}
                        </div>
                        <div className="mt-px text-[10px] text-fg-tertiary">
                          {opt.shortDesc}
                        </div>
                      </div>
                    </div>
                    {sel && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-fg-primary text-white">
                        <Icon name="check" size={10} weight={700} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {onResetSync && (
              <button
                type="button"
                onClick={onResetSync}
                className="mt-3 inline-flex items-center gap-1.5 body-xs text-fg-secondary underline decoration-dotted underline-offset-2 hover:no-underline"
              >
                <Icon name="link" size={12} />
                Voltar a usar o mesmo método da Implementação
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface px-3 py-2.5">
            <AwBrandLogo brand={m.brand} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5">
                <span className="body-xs font-medium text-fg-primary">
                  {m.title}
                </span>
                {syncedToImpl ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg-raised px-1.5 py-px text-[9px] uppercase tracking-wide text-fg-tertiary">
                    <Icon name="link" size={9} />
                    igual à implementação
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-aw-amber-200 bg-aw-amber-100 px-1.5 py-px text-[9px] uppercase tracking-wide text-aw-amber-800">
                    <Icon name="edit" size={9} />
                    personalizado
                  </span>
                )}
              </div>
              <div className="mt-0.5 body-xs text-fg-tertiary">
                {syncedToImpl
                  ? "Acompanha automaticamente a escolha da Implementação"
                  : "Método independente da Implementação"}
              </div>
            </div>
            <button
              type="button"
              onClick={onTogglePicker}
              className="inline-flex flex-shrink-0 items-center gap-1 rounded-sm border border-border bg-bg-raised px-3 py-1.5 body-xs font-medium text-fg-primary transition-colors duration-aw-fast hover:border-border-strong"
            >
              <Icon name="tune" size={12} />
              Alterar
            </button>
          </div>
        )}

        <div className="mt-4">
          <div className="aw-eyebrow mb-2.5 text-fg-tertiary">
            Parcelamento
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: MAX_PARCELAS }, (_, i) => i + 1).map((p) => {
              const sel = value.parcelas === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({ ...value, parcelas: p })}
                  className={[
                    "rounded-md border px-1 py-2.5 text-center transition-colors duration-aw-fast",
                    sel
                      ? "border-fg-primary bg-fg-primary text-white"
                      : "border-border bg-bg-raised text-fg-primary hover:border-border-strong",
                  ].join(" ")}
                >
                  <div className="body-xs font-medium">{p}×</div>
                  <div
                    className={[
                      "mt-0.5 text-[10px] tabular-nums",
                      sel ? "text-white/70" : "text-fg-tertiary",
                    ].join(" ")}
                  >
                    {fmtBRL(total / p)}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-2.5 body-xs text-fg-tertiary">
            {value.parcelas === 1
              ? `Pagamento à vista de ${fmtBRL(total)}`
              : `${value.parcelas} parcelas mensais de ${fmtBRL(
                  total / value.parcelas
                )} · sem juros`}
            {value.method === "boleto" && value.parcelas > 1 && (
              <span> · um boleto por parcela enviado por e-mail</span>
            )}
            {value.method === "pix" && value.parcelas > 1 && (
              <span>
                {" "}
                · Pix recorrente · debitado todo dia {ORG.diaVencimento}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/* ---------- FUTURE MONTHS ---------- */

function FutureMonths() {
  const meses = ORG.proximosVencimentos.slice(1, 4)
  return (
    <div className="mt-5">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon name="event_repeat" size={14} className="text-fg-tertiary" />
        <span className="aw-eyebrow text-fg-tertiary">
          Próximas mensalidades após hoje
        </span>
        <span className="flex-1" />
        <span className="body-xs text-fg-tertiary">
          cobradas todo dia{" "}
          <span className="tabular-nums">
            {ORG.diaVencimento.toString().padStart(2, "0")}
          </span>
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
        {meses.map((v, i) => (
          <div
            key={v.mes}
            className={[
              "flex items-center gap-3 px-4 py-3",
              i < meses.length - 1 ? "border-b border-border-subtle" : "",
            ].join(" ")}
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-bg-surface">
              <Icon
                name="calendar_today"
                size={14}
                className="text-fg-secondary"
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="body-sm font-medium text-fg-primary">
                {v.mes}
              </div>
              <div className="body-xs text-fg-tertiary">
                vence {v.vencimento}
              </div>
            </div>
            <div className="text-right">
              <div className="body-sm font-medium tabular-nums text-fg-primary">
                {fmtBRL(v.valor)}
              </div>
              <div className="text-[10px] text-fg-tertiary">
                mensalidade cheia
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 px-3 py-2 body-xs text-fg-tertiary">
        <Icon name="info" size={12} />
        <span>
          Custos variáveis de uso são cobrados no mês seguinte ao consumo,
          somados à mensalidade.
        </span>
      </div>
    </div>
  )
}

/* ---------- GRAND TOTAL BAR ---------- */

function GrandTotalBar({
  totalGeral,
  impl,
  totalImpl,
  mens,
  totalMens,
}: {
  totalGeral: number
  impl: Line
  totalImpl: number
  mens: Line
  totalMens: number
}) {
  return (
    <div className="mt-5 rounded-xl border border-border bg-bg-canvas p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="body-xs text-fg-tertiary">Implementação</div>
          <div className="body-sm font-medium tabular-nums text-fg-primary">
            {fmtBRL(totalImpl)}
          </div>
          <div className="text-[10px] text-fg-tertiary">
            {impl.parcelas === 1
              ? "à vista"
              : `${impl.parcelas}× ${fmtBRL(totalImpl / impl.parcelas)}`}
          </div>
        </div>
        <div>
          <div className="body-xs text-fg-tertiary">1ª mensalidade</div>
          <div className="body-sm font-medium tabular-nums text-fg-primary">
            {fmtBRL(totalMens)}
          </div>
          <div className="text-[10px] text-fg-tertiary">
            {mens.parcelas === 1
              ? "à vista"
              : `${mens.parcelas}× ${fmtBRL(totalMens / mens.parcelas)}`}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-t border-border-subtle pt-3">
        <span className="body-sm font-medium text-fg-primary">
          Total a pagar agora
        </span>
        <span className="body-xl font-medium tabular-nums text-fg-primary">
          {fmtBRL(totalGeral)}
        </span>
      </div>
    </div>
  )
}

/* ---------- CHECKOUT PHASE ---------- */

function CheckoutPhase({
  impl,
  mens,
  totalImpl,
  totalMens,
  onBack,
  onSubmit,
}: {
  impl: Line
  mens: Line
  totalImpl: number
  totalMens: number
  onBack: () => void
  onSubmit: () => void
}) {
  const bothCartao = impl.method === "cartao" && mens.method === "cartao"
  const [reuseCard, setReuseCard] = React.useState(true)

  return (
    <section>
      <h3 className="mb-2 text-fg-primary text-balance">
        Realize seu pagamento.
      </h3>
      <p className="mb-6 body-sm text-fg-secondary text-pretty">
        Sua sessão está autenticada. Os instrumentos abaixo foram gerados para
        os pagamentos configurados.
      </p>

      <div className="flex flex-col gap-4">
        <PaymentInstrument
          method={impl.method}
          parcelas={impl.parcelas}
          total={totalImpl}
          label="Implementação"
        />
        <PaymentInstrument
          method={mens.method}
          parcelas={mens.parcelas}
          total={totalMens}
          label="1ª mensalidade"
          offerReuseCard={bothCartao}
          reuseCard={bothCartao && reuseCard}
          onToggleReuseCard={() => setReuseCard((o) => !o)}
        />
      </div>

      <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
        <button
          type="button"
          onClick={onBack}
          className="aw-btn aw-btn--ghost aw-btn--md"
        >
          <Icon name="arrow_back" size={16} />
          <span className="aw-btn__label">Ajustar pagamento</span>
        </button>
        <span className="flex-1" />
        <span className="inline-flex items-center gap-1.5 body-xs text-fg-tertiary">
          <Icon name="lock" size={12} />
          conexão criptografada
        </span>
        <button
          type="button"
          onClick={onSubmit}
          className="aw-btn aw-btn--primary aw-btn--md"
        >
          <span className="aw-btn__label">Confirmar pagamento</span>
          <Icon name="arrow_forward" size={16} />
        </button>
      </footer>
    </section>
  )
}

function PaymentInstrument({
  method,
  parcelas,
  total,
  label,
  offerReuseCard,
  reuseCard,
  onToggleReuseCard,
}: {
  method: MethodId
  parcelas: number
  total: number
  label: string
  offerReuseCard?: boolean
  reuseCard?: boolean
  onToggleReuseCard?: () => void
}) {
  const parcelaLine =
    parcelas === 1
      ? `à vista · ${fmtBRL(total)}`
      : `${parcelas}× ${fmtBRL(total / parcelas)} sem juros`

  return (
    <article className="overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
      <header className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
        <AwBrandLogo brand={methodBrand(method)} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="body-xs font-medium text-fg-primary">{label}</div>
          <div className="body-xs text-fg-tertiary">
            {methodTitle(method)} · {parcelaLine}
          </div>
        </div>
        <div className="body-sm font-medium tabular-nums text-fg-primary">
          {fmtBRL(total)}
        </div>
      </header>
      <div className="p-4">
        {method === "pix" && <PixInstrument />}
        {method === "cartao" && (
          <CartaoInstrument
            parcelas={parcelas}
            total={total}
            offerReuse={offerReuseCard}
            reuse={reuseCard}
            onToggleReuse={onToggleReuseCard}
          />
        )}
        {method === "boleto" && <BoletoInstrument parcelas={parcelas} />}
      </div>
    </article>
  )
}

/* ---------- PIX ---------- */

const PIX_CODE =
  "00020126360014BR.GOV.BCB.PIX0114+5511987654321520400005303986540512000.005802BR5925AWSALES TECNOLOGIA LTDA6009SAO PAULO62070503***6304D2A1"

function PixInstrument() {
  return (
    <div className="flex items-center gap-4">
      <FakeQR />
      <div className="min-w-0 flex-1">
        <div className="aw-eyebrow mb-1.5 text-fg-tertiary">QR Code Pix</div>
        <div className="mb-2.5 body-xs text-fg-secondary">
          Abra o app do seu banco e escaneie ou copie o código abaixo.
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-border py-1.5 pl-2.5 pr-1.5">
          <code className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[10px] text-fg-tertiary">
            {PIX_CODE}
          </code>
          <button
            type="button"
            className="aw-btn aw-btn--secondary aw-btn--sm"
          >
            <Icon name="content_copy" size={12} />
            <span className="aw-btn__label">Copiar</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function FakeQR() {
  const size = 19
  const cells = React.useMemo(() => {
    const arr: boolean[] = []
    let s = 13
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
      className="grid h-[140px] w-[140px] flex-shrink-0 rounded-md border border-border-subtle bg-white p-2"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {cells.map((on, i) => {
        const x = i % size
        const y = Math.floor(i / size)
        let fill: string
        if (isFinder(x, y)) {
          const fx = x < 7 ? x : x - (size - 7)
          const fy = y < 7 ? y : y - (size - 7)
          const onOuter = fx === 0 || fx === 6 || fy === 0 || fy === 6
          const onInner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4
          fill = onOuter || onInner ? "#0D0D0D" : "#FFFFFF"
        } else {
          fill = on ? "#0D0D0D" : "#FFFFFF"
        }
        return (
          <div key={i} style={{ background: fill, aspectRatio: "1 / 1" }} />
        )
      })}
    </div>
  )
}

/* ---------- CARTÃO ---------- */

function CartaoInstrument({
  parcelas,
  total,
  offerReuse,
  reuse,
  onToggleReuse,
}: {
  parcelas: number
  total: number
  offerReuse?: boolean
  reuse?: boolean
  onToggleReuse?: () => void
}) {
  const [number, setNumber] = React.useState("")
  const [name, setName] = React.useState("")
  const [exp, setExp] = React.useState("")
  const [cvv, setCvv] = React.useState("")

  const fmtCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ")
  const fmtExp = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 4)
    return n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n
  }

  return (
    <div className="grid gap-3">
      {offerReuse && (
        <label
          className={[
            "flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 transition-colors duration-aw-fast",
            reuse
              ? "border-fg-primary bg-bg-surface"
              : "border-border bg-bg-raised",
          ].join(" ")}
        >
          <AwCheckbox checked={!!reuse} onChange={() => onToggleReuse?.()} />
          <span className="min-w-0 flex-1">
            <span className="block body-xs font-medium text-fg-primary">
              Usar o mesmo cartão da implementação
            </span>
            <span className="mt-px block body-xs text-fg-tertiary">
              Evita preencher os dados duas vezes · a cobrança vai pro mesmo
              cartão
            </span>
          </span>
        </label>
      )}

      {reuse ? (
        <div className="flex items-center gap-3 rounded-md border border-aw-emerald-200 bg-aw-emerald-100 px-4 py-3.5">
          <Icon
            name="credit_card"
            size={20}
            className="text-aw-emerald-800"
          />
          <div className="min-w-0 flex-1">
            <div className="body-xs font-medium text-aw-emerald-800">
              Usaremos o mesmo cartão da implementação
            </div>
            <div className="mt-0.5 body-xs text-aw-emerald-800/85">
              Você não precisa preencher os dados novamente. A cobrança da 1ª
              mensalidade será feita no mesmo cartão informado acima.
            </div>
          </div>
        </div>
      ) : (
        <>
          <CardField label="Número do cartão">
            <AwCardBrand pan={number} size="sm" />
            <input
              placeholder="0000 0000 0000 0000"
              value={number}
              onChange={(e) => setNumber(fmtCard(e.target.value))}
              inputMode="numeric"
              autoComplete="cc-number"
              className="flex-1 border-0 bg-transparent body-xs tabular-nums outline-0"
            />
          </CardField>
          <CardField label="Nome impresso">
            <Icon name="person" size={14} className="text-fg-tertiary" />
            <input
              placeholder="Como está no cartão"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              autoComplete="cc-name"
              className="flex-1 border-0 bg-transparent body-xs outline-0"
            />
          </CardField>
          <div className="grid grid-cols-2 gap-3">
            <CardField label="Validade">
              <Icon name="event" size={14} className="text-fg-tertiary" />
              <input
                placeholder="MM/AA"
                value={exp}
                onChange={(e) => setExp(fmtExp(e.target.value))}
                autoComplete="cc-exp"
                className="flex-1 border-0 bg-transparent body-xs outline-0"
              />
            </CardField>
            <CardField label="CVV">
              <Icon name="lock" size={14} className="text-fg-tertiary" />
              <input
                placeholder="000"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                autoComplete="cc-csc"
                className="flex-1 border-0 bg-transparent body-xs outline-0"
              />
            </CardField>
          </div>
          <div className="mt-1 flex items-center gap-2.5 rounded-md bg-bg-surface p-2.5">
            <Icon name="lock" size={14} className="text-fg-tertiary" />
            <span className="body-xs text-fg-secondary">
              Cobrado agora:{" "}
              <b className="font-medium tabular-nums text-fg-primary">
                {parcelas === 1
                  ? fmtBRL(total)
                  : `${parcelas}× ${fmtBRL(total / parcelas)}`}
              </b>{" "}
              · cartão salvo de forma criptografada para próximas mensalidades.
            </span>
          </div>
        </>
      )}
    </div>
  )
}

function CardField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="body-xs font-medium text-fg-secondary">{label}</span>
      <span className="flex h-[38px] items-center gap-2 rounded-md border border-border bg-bg-raised px-3 focus-within:border-fg-primary">
        {children}
      </span>
    </label>
  )
}

/* ---------- BOLETO ---------- */

const BOLETO_CODE = "23793.38128 60079.811604 41005.396305 1 99230000000158333"

function BoletoInstrument({ parcelas }: { parcelas: number }) {
  return (
    <>
      <FakeBarcode />
      <div className="mt-2.5 flex items-center gap-1.5 rounded-md border border-border py-1.5 pl-2.5 pr-1.5">
        <code className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis body-xs text-fg-tertiary">
          {BOLETO_CODE}
        </code>
        <button type="button" className="aw-btn aw-btn--secondary aw-btn--sm">
          <Icon name="content_copy" size={12} />
          <span className="aw-btn__label">Copiar</span>
        </button>
      </div>
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          className="aw-btn aw-btn--secondary aw-btn--sm flex-1"
        >
          <Icon name="picture_as_pdf" size={12} />
          <span className="aw-btn__label">Baixar PDF</span>
        </button>
        <button
          type="button"
          className="aw-btn aw-btn--secondary aw-btn--sm flex-1"
        >
          <Icon name="mail" size={12} />
          <span className="aw-btn__label">Enviar por e-mail</span>
        </button>
      </div>
      {parcelas > 1 && (
        <div className="mt-2.5 flex items-center gap-2 rounded-md bg-aw-amber-100 p-2.5 body-xs text-aw-amber-800">
          <Icon name="info" size={14} />
          <span>{parcelas} boletos serão enviados — um por parcela.</span>
        </div>
      )}
    </>
  )
}

function FakeBarcode() {
  const bars = React.useMemo(() => {
    let s = 17
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
    <div className="flex h-[52px] items-stretch gap-px rounded-md border border-border-subtle bg-white p-2">
      {bars.map((b, i) => (
        <React.Fragment key={i}>
          <i className="block bg-aw-gray-1200" style={{ width: b.w }} />
          <div style={{ width: b.space }} />
        </React.Fragment>
      ))}
    </div>
  )
}

/* ---------- PROCESSING ---------- */

function ProcessingPhase({
  totalImpl,
  totalMens,
}: {
  totalImpl: number
  totalMens: number
}) {
  return (
    <section className="flex flex-col items-center pt-10">
      <span
        aria-hidden="true"
        className="h-9 w-9 animate-spin rounded-full border-2 border-brand border-r-transparent"
      />
      <h4 className="mt-6 text-fg-primary">Processando pagamento…</h4>
      <p className="m-0 mt-2.5 max-w-[380px] text-center body-sm text-fg-secondary">
        Estamos confirmando a cobrança da implementação e da 1ª mensalidade.
        Isso leva alguns segundos.
      </p>
      <div className="mt-7 w-full max-w-[380px] rounded-lg border border-border-subtle bg-bg-surface p-3.5">
        <ProcessingRow label="Implementação" amount={totalImpl} done />
        <ProcessingRow label="1ª mensalidade" amount={totalMens} />
      </div>
    </section>
  )
}

function ProcessingRow({
  label,
  amount,
  done,
}: {
  label: string
  amount: number
  done?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      {done ? (
        <Icon
          name="check_circle"
          size={16}
          fill={1}
          className="text-aw-emerald-700"
        />
      ) : (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-fg-tertiary border-r-transparent"
        />
      )}
      <span className="flex-1 body-xs text-fg-primary">{label}</span>
      <span className="body-xs font-medium tabular-nums text-fg-primary">
        {fmtBRL(amount)}
      </span>
    </div>
  )
}
