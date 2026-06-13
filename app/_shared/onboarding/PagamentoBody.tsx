"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwPill } from "@/components/ui/AwPill"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwCardBrand } from "@/components/ui/AwCardBrand"
import { AwCheckbox } from "@/components/ui/AwCheckbox"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { AwQrPlaceholder } from "@/components/ui/AwQrPlaceholder"
import { cn } from "@/lib/utils"
import { ONBOARDING_ORG, fmtBRL } from "@/app/primeiro-acesso/_data"
import { PagamentoResumo, type ResumoItem } from "./PagamentoResumo"

type Org = typeof ONBOARDING_ORG

type MethodId = "pix" | "cartao" | "boleto"
type Stage = "config" | "exec" | "paid"
/** Uma das duas cobranças — cada uma é uma transação independente, com
 *  método, parcelamento e ciclo de vida próprios. */
type Charge = { method: MethodId; parcelas: number; stage: Stage; pending: boolean }

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

const METHOD_SHORT: Record<MethodId, string> = {
  pix: "Pix",
  cartao: "Cartão",
  boleto: "Boleto",
}
/** Cartão e Pix podem ser parcelados; boleto é sempre à vista. */
const supportsInstallments = (id: MethodId) => id === "cartao" || id === "pix"
/** Linha curta de método + parcelamento para o resumo lateral. */
const methodSummary = (id: MethodId, parcelas: number) =>
  supportsInstallments(id) && parcelas > 1
    ? `${METHOD_SHORT[id]} · ${parcelas}×`
    : `${METHOD_SHORT[id]} · à vista`

export function PagamentoBody({
  org,
  backHref,
  concluidoHrefBase,
  concluidoExtraParams,
  heading = "Pague uma cobrança de cada vez.",
  intro,
}: {
  org: Org
  backHref: string
  concluidoHrefBase: string
  concluidoExtraParams?: Record<string, string | null | undefined>
  heading?: string
  intro?: React.ReactNode
}) {
  const router = useRouter()
  const maxParcelas = org.parcelamentoMaxImplementacao

  // As duas cobranças, na ordem em que são quitadas. Texto e valores são
  // NOSSOS (prorrata real do mês), não os do protótipo de referência.
  const chargeMeta = React.useMemo(
    () => [
      {
        title: "Implementação",
        desc: "Setup único da plataforma · cobrança avulsa",
        total: org.valorImplementacao,
      },
      {
        title: "1ª mensalidade",
        desc: `Proporcional aos ${org.diasRestantesMesAtual} dias restantes do mês`,
        total: org.valorMensalProrrata,
      },
    ],
    [org.valorImplementacao, org.valorMensalProrrata, org.diasRestantesMesAtual]
  )

  const [phase, setPhase] = React.useState<
    "cobrancas" | "processing" | "declined" | "blocked"
  >("cobrancas")
  const [attempts, setAttempts] = React.useState(0)
  const [charges, setCharges] = React.useState<Charge[]>(() =>
    chargeMeta.map(() => ({
      method: "pix",
      parcelas: 1,
      stage: "config",
      pending: false,
    }))
  )

  const activeIdx = charges.findIndex((c) => c.stage !== "paid")
  const paidCount = charges.filter((c) => c.stage === "paid").length
  const allPaid = paidCount === charges.length
  const anyPending = charges.some((c) => c.stage === "paid" && c.pending)

  // Dados do resumo lateral — derivados do estado ao vivo das cobranças.
  const totalHoje = chargeMeta[0].total + chargeMeta[1].total
  const resumoItems: ResumoItem[] = charges.map((charge, i) => {
    const status =
      charge.stage === "paid"
        ? charge.pending
          ? ("pending" as const)
          : ("paid" as const)
        : ("open" as const)
    const detail =
      charge.stage === "paid"
        ? `via ${METHOD_SHORT[charge.method].toLowerCase()}${
            charge.parcelas > 1 ? ` · ${charge.parcelas}×` : ""
          }`
        : i === activeIdx
          ? methodSummary(charge.method, charge.parcelas)
          : undefined
    return { title: chargeMeta[i].title, total: chargeMeta[i].total, status, detail }
  })
  const proximos = org.proximosVencimentos
    .filter((v) => !v.prorrata)
    .map((v) => ({ quando: v.vencimento.slice(0, 5), valor: v.valor }))

  const patch = React.useCallback(
    (i: number, p: Partial<Charge>) =>
      setCharges((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...p } : c))),
    []
  )

  const concluidoHref = React.useMemo(() => {
    const params = new URLSearchParams()
    params.set("im", charges[0].method)
    params.set("ip", String(charges[0].parcelas))
    params.set("mm", charges[1].method)
    params.set("mp", String(charges[1].parcelas))
    if (concluidoExtraParams) {
      for (const [k, v] of Object.entries(concluidoExtraParams)) {
        if (v != null && v !== "") params.set(k, v)
      }
    }
    return `${concluidoHrefBase}?${params.toString()}`
  }, [charges, concluidoHrefBase, concluidoExtraParams])

  const goProcessing = () => {
    setPhase("processing")
    setTimeout(() => router.push(concluidoHref), 1600)
  }

  // Caminho infeliz do cartão — recusa some na cobrança ativa (stage "exec").
  const handleDeclined = () => {
    const next = attempts + 1
    setAttempts(next)
    setPhase(next >= 3 ? "blocked" : "declined")
  }
  const retryCard = () => setPhase("cobrancas") // cobrança ativa segue em "exec"
  const switchMethod = () => {
    if (activeIdx >= 0) patch(activeIdx, { stage: "config" })
    setPhase("cobrancas")
  }
  const resetBlocked = () => {
    setAttempts(0)
    if (activeIdx >= 0) patch(activeIdx, { stage: "config" })
    setPhase("cobrancas")
  }

  return (
    <AwOnboardingShell
      org={org}
      size="wide"
      team={[org.accountManager, org.representanteComercial]}
    >
      {phase === "processing" ? (
        <ProcessingPhase
          totalImpl={chargeMeta[0].total}
          totalMens={chargeMeta[1].total}
        />
      ) : phase === "blocked" ? (
        <BlockedPhase org={org} onBack={resetBlocked} />
      ) : phase === "declined" ? (
        <DeclinedPhase
          org={org}
          attempt={attempts}
          onRetryCard={retryCard}
          onSwitchMethod={switchMethod}
        />
      ) : (
        <section>
          <h3 className="mb-2 text-fg-primary text-balance">{heading}</h3>
          <p className="mb-6 max-w-[600px] body-sm text-fg-secondary text-pretty">
            {intro ?? (
              <>
                A{" "}
                <b className="font-medium text-fg-primary">implementação</b> e a{" "}
                <b className="font-medium text-fg-primary">1ª mensalidade</b> são
                duas cobranças separadas — cada uma com seu método e
                parcelamento. Conclua a primeira para liberar a segunda.
              </>
            )}
          </p>

          <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-7">
            <div>
              <ChargeProgress
                activeIdx={activeIdx}
                stages={charges.map((c) => c.stage)}
              />

              {allPaid ? (
                <DoneSummary anyPending={anyPending} onContinue={goProcessing} />
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {charges.map((charge, i) => {
                    const meta = chargeMeta[i]
                    const row =
                      charge.stage === "paid" ? (
                        <PaidRow charge={charge} meta={meta} />
                      ) : i !== activeIdx ? (
                        // Sequencial: só a cobrança ativa fica aberta; as demais travadas.
                        <LockedRow meta={meta} index={i} />
                      ) : (
                        <ChargeCard
                          charge={charge}
                          meta={meta}
                          index={i}
                          maxParcelas={maxParcelas}
                          offerReuse={
                            i === 1 &&
                            charges[0].method === "cartao" &&
                            charges[0].stage === "paid"
                          }
                          onConfig={(p) => patch(i, p)}
                          onPay={() => patch(i, { stage: "exec" })}
                          onBackToConfig={() => patch(i, { stage: "config" })}
                          onPaid={(pending) => patch(i, { stage: "paid", pending })}
                          onDecline={handleDeclined}
                        />
                      )
                    // Re-monta a cada mudança de etapa (config→exec→paid, travada→
                    // ativa), disparando o fadeInUp para a transição entre estados.
                    return (
                      <div
                        key={`${i}-${charge.stage}`}
                        className="animate-fadeInUp"
                      >
                        {row}
                      </div>
                    )
                  })}
                </div>
              )}

              <footer className="mt-12 flex items-center gap-3">
                <AwButton asChild variant="ghost" size="md" iconLeft="arrow_back">
                  <Link href={backHref}>Voltar</Link>
                </AwButton>
                <span className="flex-1" />
              </footer>
            </div>

            <div className="mt-6 lg:mt-0">
              <PagamentoResumo
                items={resumoItems}
                totalHoje={totalHoje}
                proximos={proximos}
                recorrencia={{ valor: org.valorMensal, dia: org.diaVencimento }}
              />
            </div>
          </div>
        </section>
      )}
    </AwOnboardingShell>
  )
}

/* ---------- PROGRESSO DAS COBRANÇAS ---------- */

function ChargeProgress({
  activeIdx,
  stages,
}: {
  activeIdx: number
  stages: Stage[]
}) {
  // Barra limpa de duas etapas — um segmento por cobrança. Sem texto nem
  // moldura: a cobrança paga fica verde, a ativa preta, a pendente cinza.
  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {stages.map((s, i) => {
        const done = s === "paid"
        const active = i === activeIdx
        return (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors duration-aw-base ease-aw-out",
              done ? "bg-aw-emerald-500" : active ? "bg-fg-primary" : "bg-bg-muted"
            )}
          />
        )
      })}
    </div>
  )
}

/* ---------- COBRANÇA ATIVA (config + exec) ---------- */

type ChargeMeta = { title: string; desc: string; total: number }

function ChargeCard({
  charge,
  meta,
  index,
  maxParcelas,
  offerReuse,
  onConfig,
  onPay,
  onBackToConfig,
  onPaid,
  onDecline,
}: {
  charge: Charge
  meta: ChargeMeta
  index: number
  maxParcelas: number
  offerReuse: boolean
  onConfig: (p: Partial<Charge>) => void
  onPay: () => void
  onBackToConfig: () => void
  onPaid: (pending: boolean) => void
  onDecline: () => void
}) {
  const [reuse, setReuse] = React.useState(true)
  const total = meta.total
  const each = total / charge.parcelas
  const payLabel = `Pagar ${meta.title} · ${
    charge.parcelas === 1 ? fmtBRL(total) : `${charge.parcelas}× ${fmtBRL(each)}`
  }`

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-bg-raised">
      <header className="flex items-center gap-3 border-b border-border-subtle px-[18px] py-3.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fg-primary text-2xs font-medium tabular-nums text-white">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="body-sm font-medium text-fg-primary">{meta.title}</div>
          <div className="mt-0.5 body-xs text-fg-tertiary">{meta.desc}</div>
        </div>
        <div className="body-lg font-medium tabular-nums text-fg-primary">
          {fmtBRL(total)}
        </div>
      </header>

      <div className="p-[18px]">
        {charge.stage === "config" ? (
          <>
            <div className="mb-2.5">
              <span className="body-sm font-medium text-fg-secondary">
                Forma de pagamento desta cobrança
              </span>
            </div>
            <MethodGrid
              value={charge.method}
              onChange={(m) =>
                onConfig({
                  method: m,
                  parcelas: supportsInstallments(m) ? charge.parcelas : 1,
                })
              }
            />

            {supportsInstallments(charge.method) ? (
              <InstallmentGrid
                total={total}
                parcelas={charge.parcelas}
                max={maxParcelas}
                onChange={(p) => onConfig({ parcelas: p })}
              />
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-border-subtle bg-bg-surface px-3 py-2.5 body-xs text-fg-secondary">
                <Icon name="info" size={14} className="text-fg-tertiary" />
                <span>
                  Pagamento à vista de{" "}
                  <b className="font-medium tabular-nums text-fg-primary">
                    {fmtBRL(total)}
                  </b>{" "}
                  · boleto único enviado por e-mail
                </span>
              </div>
            )}

            <div className="mt-5">
              <AwButton
                variant="primary"
                size="md"
                block
                iconRight="arrow_forward"
                onClick={onPay}
              >
                {payLabel}
              </AwButton>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3.5 flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-2 body-xs text-fg-secondary">
                <AwBrandLogo brand={methodBrand(charge.method)} size="sm" />
                <span className="truncate">
                  {methodTitle(charge.method)} ·{" "}
                  {charge.parcelas === 1
                    ? "à vista"
                    : `${charge.parcelas}×`}
                </span>
              </span>
              <AwButton
                variant="ghost"
                size="sm"
                iconLeft="swap_horiz"
                onClick={onBackToConfig}
              >
                Trocar
              </AwButton>
            </div>

            {charge.method === "pix" && (
              <PixInstrument onConfirmPaid={() => onPaid(false)} />
            )}
            {charge.method === "cartao" && (
              <CartaoInstrument
                parcelas={charge.parcelas}
                total={total}
                offerReuse={offerReuse}
                reuse={offerReuse && reuse}
                onToggleReuse={() => setReuse((o) => !o)}
                onConfirmPaid={() => onPaid(false)}
                onDecline={onDecline}
              />
            )}
            {charge.method === "boleto" && (
              <BoletoInstrument
                parcelas={charge.parcelas}
                onConfirmPaid={() => onPaid(true)}
              />
            )}
          </>
        )}
      </div>
    </article>
  )
}

function MethodGrid({
  value,
  onChange,
}: {
  value: MethodId
  onChange: (m: MethodId) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {METHODS.map((opt) => {
        const sel = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors duration-aw-fast",
              sel
                ? "border-fg-primary bg-fg-primary"
                : "border-border bg-bg-raised hover:border-border-strong"
            )}
          >
            <div className="flex items-center gap-2.5">
              <AwBrandLogo brand={opt.brand} size="sm" bare={sel} />
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "body-xs font-medium",
                    sel ? "text-white" : "text-fg-primary"
                  )}
                >
                  {opt.title}
                </div>
                <div
                  className={cn(
                    "mt-px text-3xs",
                    sel ? "text-white/65" : "text-fg-tertiary"
                  )}
                >
                  {opt.shortDesc}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function InstallmentGrid({
  total,
  parcelas,
  max,
  onChange,
}: {
  total: number
  parcelas: number
  max: number
  onChange: (p: number) => void
}) {
  return (
    <div className="mt-4">
      <div className="mb-2.5">
        <span className="body-sm font-medium text-fg-secondary">Parcelas</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: max }, (_, i) => i + 1).map((p) => {
          const sel = parcelas === p
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={cn(
                "rounded-md border px-1 py-2.5 text-center transition-colors duration-aw-fast",
                sel
                  ? "border-fg-primary bg-fg-primary text-white"
                  : "border-border bg-bg-raised text-fg-primary hover:border-border-strong"
              )}
            >
              <div className="body-xs font-medium">
                {p === 1 ? "À vista" : `${p}×`}
              </div>
              <div
                className={cn(
                  "mt-0.5 text-3xs tabular-nums",
                  sel ? "text-white/70" : "text-fg-tertiary"
                )}
              >
                {p === 1 ? fmtBRL(total) : `${fmtBRL(total / p)}/mês`}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- COBRANÇA PAGA / TRAVADA ---------- */

function PaidRow({ charge, meta }: { charge: Charge; meta: ChargeMeta }) {
  return (
    <article className="flex items-center gap-3 rounded-xl border border-aw-emerald-700/30 bg-bg-raised px-[18px] py-3.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aw-emerald-100 text-aw-emerald-700">
        <Icon name="check" size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="body-sm font-medium text-fg-primary">{meta.title}</div>
        <div className="mt-0.5 body-xs text-fg-tertiary">
          {charge.pending
            ? "Boleto em compensação"
            : `Pago via ${methodTitle(charge.method).toLowerCase()}`}
          {charge.parcelas > 1 ? ` · ${charge.parcelas}×` : ""}
        </div>
      </div>
      <div className="body-sm font-medium tabular-nums text-fg-primary">
        {fmtBRL(meta.total)}
      </div>
      <AwPill variant={charge.pending ? "warning" : "live"}>
        {charge.pending ? "em análise" : "Pago"}
      </AwPill>
    </article>
  )
}

function LockedRow({ meta, index }: { meta: ChargeMeta; index: number }) {
  return (
    <article className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface px-[18px] py-3.5 opacity-70">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-muted text-2xs font-medium tabular-nums text-fg-tertiary">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="body-sm font-medium text-fg-secondary">{meta.title}</div>
        <div className="mt-0.5 body-xs text-fg-tertiary">
          Liberada após a cobrança anterior
        </div>
      </div>
      <div className="body-sm font-medium tabular-nums text-fg-tertiary">
        {fmtBRL(meta.total)}
      </div>
      <Icon name="lock" size={15} className="text-fg-tertiary" />
    </article>
  )
}

/* ---------- DUAS COBRANÇAS CONCLUÍDAS ---------- */

function DoneSummary({
  anyPending,
  onContinue,
}: {
  anyPending: boolean
  onContinue: () => void
}) {
  return (
    <div className="mt-5 flex flex-col items-center rounded-xl border border-border-subtle bg-bg-surface px-6 py-8 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-aw-emerald-100 text-aw-emerald-700">
        <Icon name="task_alt" size={28} fill={1} />
      </span>
      <h4 className="text-fg-primary text-balance">
        As duas cobranças foram concluídas
      </h4>
      <p className="mt-2 max-w-[380px] body-sm text-fg-secondary text-pretty">
        {anyPending
          ? "O boleto entra em compensação — liberamos seu acesso assim que o pagamento confirmar."
          : "Implementação e 1ª mensalidade pagas separadamente, cada uma como sua própria transação."}
      </p>
      <div className="mt-6">
        <AwButton
          variant="primary"
          size="md"
          iconRight="arrow_forward"
          onClick={onContinue}
        >
          Continuar
        </AwButton>
      </div>
    </div>
  )
}

/* ---------- PIX ---------- */

const PIX_CODE =
  "00020126360014BR.GOV.BCB.PIX0114+5511987654321520400005303986540512000.005802BR5925AWSALES TECNOLOGIA LTDA6009SAO PAULO62070503***6304D2A1"

function PixInstrument({ onConfirmPaid }: { onConfirmPaid: () => void }) {
  const [secondsLeft, setSecondsLeft] = React.useState(30 * 60)

  React.useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000
    )
    return () => clearInterval(t)
  }, [secondsLeft])

  const expired = secondsLeft <= 0
  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0")
  const ss = (secondsLeft % 60).toString().padStart(2, "0")

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-4">
        <AwQrPlaceholder px={140} ariaLabel="QR code Pix" />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="aw-eyebrow text-fg-tertiary">QR Code Pix</span>
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full px-2 py-px text-3xs font-medium tabular-nums",
                expired
                  ? "bg-aw-red-100 text-aw-red-700"
                  : "bg-aw-amber-100 text-aw-amber-800",
              ].join(" ")}
            >
              <Icon name="schedule" size={10} />
              {expired ? "Pix expirado" : `Expira em ${mm}:${ss}`}
            </span>
          </div>
          <div className="mb-2.5 body-xs text-fg-secondary">
            Abra o app do seu banco e escaneie ou copie o código abaixo.
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-border py-1.5 pl-2.5 pr-1.5">
            <code className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-3xs text-fg-tertiary">
              {PIX_CODE}
            </code>
            <AwButton variant="secondary" size="sm" iconLeft="content_copy">
              Copiar
            </AwButton>
          </div>
        </div>
      </div>
      <div className="flex justify-end border-t border-border-subtle pt-3">
        <AwButton
          variant="primary"
          size="sm"
          iconLeft="check"
          onClick={onConfirmPaid}
        >
          Já paguei o Pix
        </AwButton>
      </div>
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
  onConfirmPaid,
  onDecline,
}: {
  parcelas: number
  total: number
  offerReuse?: boolean
  reuse?: boolean
  onToggleReuse?: () => void
  onConfirmPaid: () => void
  onDecline?: () => void
}) {
  const [number, setNumber] = React.useState("")
  const [name, setName] = React.useState("")
  const [exp, setExp] = React.useState("")
  const [cvv, setCvv] = React.useState("")
  // Caminho feliz do cartão: processando → confirmado → (o card encolhe ao
  // virar PaidRow). A recusa segue síncrona, sem passar por aqui.
  const [status, setStatus] = React.useState<
    "idle" | "processing" | "confirmed"
  >("idle")

  React.useEffect(() => {
    if (status === "processing") {
      const t = window.setTimeout(() => setStatus("confirmed"), 1100)
      return () => window.clearTimeout(t)
    }
    if (status === "confirmed") {
      const t = window.setTimeout(() => onConfirmPaid(), 720)
      return () => window.clearTimeout(t)
    }
  }, [status, onConfirmPaid])

  const handlePay = () => {
    const digits = number.replace(/\D/g, "")
    if (!reuse && digits.endsWith("0002")) {
      onDecline?.()
      return
    }
    setStatus("processing")
  }

  const fmtCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ")
  const fmtExp = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 4)
    return n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n
  }

  if (status !== "idle") {
    return (
      <div className="flex animate-fadeInUp flex-col items-center justify-center gap-3 py-8 text-center">
        {status === "processing" ? (
          <>
            <span
              aria-hidden="true"
              className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-r-transparent"
            />
            <span className="body-sm text-fg-secondary">
              Processando pagamento…
            </span>
          </>
        ) : (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-aw-emerald-100 text-aw-emerald-700">
              <Icon name="check" size={26} fill={1} />
            </span>
            <span className="body-sm font-medium text-fg-primary">
              Pagamento confirmado
            </span>
          </>
        )}
      </div>
    )
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
              Evita preencher os dados duas vezes · a cobrança vai para o mesmo
              cartão
            </span>
          </span>
        </label>
      )}

      {!reuse && (
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
      <div className="flex justify-end border-t border-border-subtle pt-3">
        <AwButton
          variant="primary"
          size="sm"
          iconLeft="lock"
          onClick={handlePay}
        >
          Pagar agora
        </AwButton>
      </div>
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

function BoletoInstrument({
  parcelas,
  onConfirmPaid,
}: {
  parcelas: number
  onConfirmPaid: () => void
}) {
  const [showDelayNotice, setShowDelayNotice] = React.useState(false)

  return (
    <>
      <FakeBarcode />
      <div className="mt-2.5 flex items-center gap-1.5 rounded-md border border-border py-1.5 pl-2.5 pr-1.5">
        <code className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis body-xs text-fg-tertiary">
          {BOLETO_CODE}
        </code>
        <AwButton variant="secondary" size="sm" iconLeft="content_copy">
          Copiar
        </AwButton>
      </div>
      <div className="mt-2.5 flex gap-2">
        <AwButton
          variant="secondary"
          size="sm"
          block
          iconLeft="picture_as_pdf"
        >
          Baixar PDF
        </AwButton>
        <AwButton variant="secondary" size="sm" block iconLeft="mail">
          Enviar por e-mail
        </AwButton>
      </div>
      {parcelas > 1 && (
        <div className="mt-2.5 flex items-center gap-2 rounded-md bg-aw-amber-100 p-2.5 body-xs text-aw-amber-800">
          <Icon name="info" size={14} />
          <span>Você recebe {parcelas} boletos — um por parcela.</span>
        </div>
      )}

      <div className="mt-3 border-t border-border-subtle pt-3">
        {showDelayNotice ? (
          <div className="flex flex-col gap-2.5 rounded-md bg-aw-amber-100 p-3 body-xs text-aw-amber-800">
            <div className="flex items-start gap-2">
              <Icon name="info" size={14} fill={1} className="mt-px" />
              <span>
                A compensação bancária pode levar até{" "}
                <b className="font-medium">48h</b> para ser contabilizada. Você
                pode seguir para a próxima etapa enquanto isso — avisaremos por
                e-mail assim que confirmarmos.
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <AwButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDelayNotice(false)}
              >
                Voltar
              </AwButton>
              <AwButton
                variant="primary"
                size="sm"
                iconLeft="arrow_forward"
                onClick={onConfirmPaid}
              >
                Entendi, seguir
              </AwButton>
            </div>
          </div>
        ) : (
          <div className="flex justify-end">
            <AwButton
              variant="primary"
              size="sm"
              iconLeft="check"
              onClick={() => setShowDelayNotice(true)}
            >
              Já paguei o boleto
            </AwButton>
          </div>
        )}
      </div>
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

/* ---------- DECLINED / BLOCKED (caminho infeliz do cartão) ---------- */

function DeclinedPhase({
  org,
  attempt,
  onRetryCard,
  onSwitchMethod,
}: {
  org: Org
  attempt: number
  onRetryCard: () => void
  onSwitchMethod: () => void
}) {
  const amFirst = org.accountManager.name.split(" ")[0]
  return (
    <section className="mx-auto w-full max-w-[460px]">
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-aw-red-200 bg-aw-red-100 px-2.5 py-1 body-xs font-medium text-aw-red-700">
        <Icon name="credit_card_off" size={12} fill={1} />
        Tentativa {attempt} de 3
      </div>

      <h3 className="mb-2 text-fg-primary text-balance">
        Não conseguimos cobrar seu cartão
      </h3>
      <p className="mb-5 body-sm text-fg-secondary text-pretty">
        Nenhum valor foi cobrado. Você pode tentar outro cartão, trocar de
        método ou falar com {amFirst} se preferir resolver junto.
      </p>

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-aw-red-200 bg-aw-red-100 px-4 py-3.5">
        <Icon
          name="info"
          size={16}
          fill={1}
          className="mt-0.5 shrink-0 text-aw-red-700"
        />
        <div className="min-w-0">
          <div className="body-xs font-medium text-aw-red-900">
            Recusado pelo emissor do cartão
          </div>
          <div className="mt-0.5 body-xs text-aw-red-700">
            Código 51 · saldo insuficiente. Esta é a resposta do banco emissor —
            confira os dados ou use outro cartão.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <AwButton
          variant="primary"
          size="md"
          block
          iconLeft="credit_card"
          onClick={onRetryCard}
        >
          Tentar outro cartão
        </AwButton>
        <AwButton
          variant="secondary"
          size="md"
          block
          iconLeft="swap_horiz"
          onClick={onSwitchMethod}
        >
          Pagar com Pix ou boleto
        </AwButton>
        <AwButton variant="ghost" size="md" block iconLeft="headset_mic">
          Falar com {amFirst}
        </AwButton>
      </div>
    </section>
  )
}

function BlockedPhase({ org, onBack }: { org: Org; onBack: () => void }) {
  const amFirst = org.accountManager.name.split(" ")[0]
  return (
    <section className="mx-auto w-full max-w-[460px]">
      <span className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-aw-amber-100 text-aw-amber-700">
        <Icon name="lock" size={36} fill={1} />
      </span>

      <h3 className="mb-2 text-fg-primary text-balance">
        Pagamento bloqueado por segurança
      </h3>
      <p className="mb-6 body-sm text-fg-secondary text-pretty">
        Após 3 tentativas recusadas, pausamos novas cobranças por segurança. Já{" "}
        <b className="font-medium text-fg-primary">abrimos um chamado</b> e{" "}
        {amFirst} foi avisado — vai te chamar para resolver junto. Seu progresso
        está salvo.
      </p>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-muted text-fg-secondary">
          <Icon name="support_agent" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="body-xs font-medium text-fg-primary">
            {org.accountManager.name}
          </div>
          <div className="body-xs text-fg-tertiary">
            {org.accountManager.role} · Aswork
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-aw-amber-100 px-2 py-0.5 text-2xs font-medium text-aw-amber-800">
          <Icon name="confirmation_number" size={12} />
          Chamado aberto
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <AwButton variant="primary" size="md" block iconLeft="headset_mic">
          Falar com {amFirst}
        </AwButton>
        <AwButton
          variant="ghost"
          size="md"
          block
          iconLeft="arrow_back"
          onClick={onBack}
        >
          Voltar ao pagamento
        </AwButton>
      </div>
    </section>
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
      <h4 className="mt-6 text-fg-primary">Preparando seu ambiente…</h4>
      <p className="m-0 mt-2.5 max-w-[380px] text-center body-sm text-fg-secondary">
        Confirmamos as duas cobranças. Em instantes seu acesso estará liberado.
      </p>
      <div className="mt-7 w-full max-w-[380px] rounded-lg border border-border-subtle bg-bg-surface p-3.5">
        <ProcessingRow label="Implementação" amount={totalImpl} done />
        <ProcessingRow label="1ª mensalidade" amount={totalMens} done />
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
