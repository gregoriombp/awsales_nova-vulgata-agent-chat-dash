"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AwButton } from "@/components/ui/AwButton"
import { Icon } from "@/components/ui/Icon"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwInput } from "@/components/ui/AwInput"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ONBOARDING_ORG } from "../_data"

const PIX_CODE_MENS =
  "00020126360014BR.GOV.BCB.PIX0114+5511987654321520400005303986540512000.005802BR5925AWSALES TECNOLOGIA LTDA6009SAO PAULO62070503***6304D2A1"

const BOLETO_LINHA_MENS =
  "23793.38128 60079.811604 41005.396305 1 99230000000158333"

type MethodId = "pix" | "cartao" | "boleto"

type Method = {
  id: MethodId
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
    description:
      "Envio mensal por e-mail · vencimento no dia " +
      ONBOARDING_ORG.diaVencimento.toString().padStart(2, "0"),
  },
]

export default function MensalidadePage() {
  const router = useRouter()
  const [step, setStep] = React.useState<"select" | "checkout">("select")
  const [selected, setSelected] = React.useState<MethodId | null>("pix")
  const [voucher, setVoucher] = React.useState<{
    code: string
    discount: number
  } | null>(null)

  const goToCheckout = () => {
    if (!selected) return
    setStep("checkout")
  }

  const finishOnboarding = () => {
    router.push("/inicio?welcome=1")
  }

  return (
    <AwOnboardingShell currentStep={8} org={ONBOARDING_ORG}>
      <section>
        {step === "select" ? (
          <SelectStep
            selected={selected}
            onSelect={setSelected}
            voucher={voucher}
            onApplyVoucher={setVoucher}
            onSubmit={goToCheckout}
          />
        ) : (
          <CheckoutStep
            method={selected ?? "pix"}
            voucher={voucher}
            onBack={() => setStep("select")}
            onDone={finishOnboarding}
          />
        )}
      </section>
    </AwOnboardingShell>
  )
}

function SelectStep({
  selected,
  onSelect,
  voucher,
  onApplyVoucher,
  onSubmit,
}: {
  selected: MethodId | null
  onSelect: (m: MethodId) => void
  voucher: { code: string; discount: number } | null
  onApplyVoucher: (v: { code: string; discount: number } | null) => void
  onSubmit: () => void
}) {
  return (
    <>
      <h3 className="mb-2 text-fg-primary text-balance">
        Configure a primeira mensalidade.
      </h3>

      <p className="mb-6 body-sm text-fg-secondary text-pretty">
        A implementação já foi paga. Falta só definir o método e quitar a
        mensalidade do mês corrente — o valor é proporcional aos{" "}
        {ONBOARDING_ORG.diasRestantesMesAtual} dias restantes. As próximas
        seguem o ciclo regular do plano.
      </p>

      <article className="mb-3 overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
        <header className="flex items-center justify-between gap-4 px-5 py-5">
          <div className="min-w-0">
            <div className="aw-eyebrow text-fg-tertiary">A pagar agora</div>
            <div className="mt-2 body-xs text-fg-secondary">
              Plano{" "}
              <span className="font-medium text-fg-primary">
                {ONBOARDING_ORG.plan}
              </span>
              <span className="text-fg-tertiary">
                {" "}
                — valor proporcional aos {ONBOARDING_ORG.diasRestantesMesAtual}{" "}
                dias do mês
              </span>
            </div>
          </div>
          <div
            className="text-fg-primary"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <h2 className="m-0">{ONBOARDING_ORG.valorMensalProrrata}</h2>
          </div>
        </header>
        <dl className="m-0 grid grid-cols-2 border-t border-border-subtle">
          <div className="px-5 py-3.5">
            <dt className="body-xs text-fg-tertiary">Mensalidade cheia</dt>
            <dd
              className="m-0 mt-1 body-sm font-medium text-fg-primary"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {ONBOARDING_ORG.valorMensal}
              <span className="ml-0.5 body-xs text-fg-tertiary">/mês</span>
            </dd>
          </div>
          <div className="border-l border-border-subtle px-5 py-3.5">
            <dt className="inline-flex items-center gap-1 body-xs text-fg-tertiary">
              Próxima cobrança
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Como funciona a data de vencimento"
                      className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-fg-tertiary hover:text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-primary"
                    >
                      <Icon name="info" size={12} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-[260px] bg-aw-gray-1200 text-white border-aw-gray-1000"
                  >
                    Todo mês a mensalidade é cobrada no dia{" "}
                    <strong className="font-medium tabular-nums">
                      {ONBOARDING_ORG.diaVencimento}
                    </strong>
                    . A primeira é proporcional aos dias restantes do mês
                    corrente — por isso vence em{" "}
                    <strong className="font-medium tabular-nums">
                      {ONBOARDING_ORG.dataPrimeiroVencimento}
                    </strong>
                    .
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </dt>
            <dd
              className="m-0 mt-1 body-sm font-medium text-fg-primary"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {ONBOARDING_ORG.dataPrimeiroVencimento}
            </dd>
          </div>
        </dl>
      </article>

      <VoucherField voucher={voucher} onApply={onApplyVoucher} />

      <div className="mt-5 mb-3 aw-eyebrow text-fg-tertiary">
        Método de pagamento
      </div>

      <ul className="m-0 mb-5 flex flex-col gap-2.5 list-none p-0">
        {METHODS.map((method) => {
          const isSelected = selected === method.id
          return (
            <li key={method.id}>
              <button
                type="button"
                onClick={() => onSelect(method.id)}
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
                      "block body-sm font-medium",
                      isSelected ? "text-white" : "text-fg-primary",
                    ].join(" ")}
                  >
                    {method.title}
                  </span>
                  <span
                    className={[
                      "block body-xs",
                      isSelected ? "text-white/70" : "text-fg-tertiary",
                    ].join(" ")}
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

      <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
        <AwButton asChild size="md" variant="ghost" iconLeft="arrow_back">
          <Link href="/primeiro-acesso/confirmado">Voltar</Link>
        </AwButton>
        <span className="flex-1" />
        <AwButton
          size="md"
          variant="primary"
          iconRight="arrow_forward"
          disabled={!selected}
          onClick={onSubmit}
        >
          Pagar mensalidade
        </AwButton>
      </footer>
    </>
  )
}

function VoucherField({
  voucher,
  onApply,
}: {
  voucher: { code: string; discount: number } | null
  onApply: (v: { code: string; discount: number } | null) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  if (voucher) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-aw-emerald-200 bg-aw-emerald-50 px-2.5 py-1 body-xs text-aw-emerald-800">
        <Icon name="local_offer" size={14} />
        <span>
          <strong className="font-medium">{voucher.code}</strong> aplicado · −
          {voucher.discount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
        <button
          type="button"
          onClick={() => onApply(null)}
          className="text-aw-emerald-700 hover:text-aw-emerald-900"
          aria-label="Remover voucher"
        >
          <Icon name="close" size={12} />
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 body-xs text-fg-secondary hover:text-fg-primary hover:underline"
      >
        <Icon name="local_offer" size={12} />
        Tenho um voucher
      </button>
    )
  }

  const apply = () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    if (trimmed.length < 4) {
      setError("Código inválido.")
      return
    }
    onApply({ code: trimmed, discount: 150 })
    setOpen(false)
    setCode("")
    setError(null)
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="w-[200px]">
          <AwInput
            iconLeft="local_offer"
            placeholder="Código do voucher"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") apply()
            }}
          />
        </div>
        <AwButton
          size="sm"
          variant="secondary"
          onClick={apply}
          disabled={!code.trim()}
        >
          Aplicar
        </AwButton>
        <AwButton
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(false)
            setCode("")
            setError(null)
          }}
        >
          Cancelar
        </AwButton>
      </div>
      {error && (
        <p
          className="m-0 inline-flex items-center gap-1 body-xs text-aw-red-700"
          role="alert"
        >
          <Icon name="error" size={12} fill={1} />
          {error}
        </p>
      )}
    </div>
  )
}

/* ---------- checkout step ---------- */

function CheckoutStep({
  method,
  voucher,
  onBack,
  onDone,
}: {
  method: MethodId
  voucher: { code: string; discount: number } | null
  onBack: () => void
  onDone: () => void
}) {
  const brandId = method === "cartao" ? "card" : method
  const eyebrow =
    method === "pix"
      ? "Pagamento via Pix"
      : method === "cartao"
        ? "Pagamento no cartão"
        : "Pagamento via boleto"

  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <AwBrandLogo brand={brandId} size="md" />
        <span className="aw-eyebrow text-fg-tertiary">{eyebrow}</span>
      </div>

      <ValorBox voucher={voucher} />

      {method === "pix" && <PixCheckout onDone={onDone} />}
      {method === "cartao" && <CartaoCheckout onDone={onDone} />}
      {method === "boleto" && <BoletoCheckout onDone={onDone} />}

      <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
        <AwButton size="md" variant="ghost" iconLeft="arrow_back" onClick={onBack}>
          Voltar
        </AwButton>
      </footer>
    </>
  )
}

function ValorBox({
  voucher,
}: {
  voucher: { code: string; discount: number } | null
}) {
  const base = Number(
    ONBOARDING_ORG.valorMensalProrrata
      .replace(/[R$\s]/g, "")
      .replace(/\./g, "")
      .replace(",", "."),
  )
  const finalValue = voucher ? Math.max(0, base - voucher.discount) : base
  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <div className="mb-5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="aw-eyebrow text-fg-tertiary">
            Valor desta cobrança
          </div>
          <div className="mt-0.5 body-xs text-fg-tertiary">
            Mensalidade · valor proporcional
          </div>
        </div>
        <div
          className="body-xl font-medium text-fg-primary"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {fmt(finalValue)}
        </div>
      </div>
      {voucher && (
        <div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-2 body-xs text-fg-tertiary">
          <span>
            Subtotal {fmt(base)} · voucher{" "}
            <strong className="font-medium">{voucher.code}</strong>
          </span>
          <span className="font-medium text-aw-emerald-700 tabular-nums">
            −{fmt(voucher.discount)}
          </span>
        </div>
      )}
    </div>
  )
}

function PixCheckout({ onDone }: { onDone: () => void }) {
  const [paid, setPaid] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setPaid(true), 4500)
    return () => clearTimeout(t)
  }, [])
  React.useEffect(() => {
    if (paid) {
      const t = setTimeout(onDone, 1200)
      return () => clearTimeout(t)
    }
  }, [paid, onDone])

  return (
    <>
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
            {PIX_CODE_MENS}
          </code>
          <AwButton size="sm" variant="secondary">
            Copiar
          </AwButton>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
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
    </>
  )
}

function CartaoCheckout({ onDone }: { onDone: () => void }) {
  const [number, setNumber] = React.useState("")
  const [name, setName] = React.useState("")
  const [exp, setExp] = React.useState("")
  const [cvv, setCvv] = React.useState("")
  const [processing, setProcessing] = React.useState(false)

  const fmtCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ")
  const fmtExp = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 4)
    return n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n
  }

  const valid =
    number.replace(/\s/g, "").length >= 13 &&
    name.length > 3 &&
    exp.length === 5 &&
    cvv.length >= 3

  const submit = () => {
    if (!valid || processing) return
    setProcessing(true)
    setTimeout(onDone, 1800)
  }

  return (
    <>
      <div className="grid gap-3.5">
        <label className="flex flex-col gap-1.5">
          <span className="body-xs font-medium text-fg-secondary">
            Número do cartão
          </span>
          <span className="flex h-11 items-center gap-2.5 rounded-md border border-border bg-bg-raised px-3.5 focus-within:border-fg-primary">
            <input
              placeholder="0000 0000 0000 0000"
              value={number}
              onChange={(e) => setNumber(fmtCard(e.target.value))}
              inputMode="numeric"
              autoComplete="cc-number"
              lang="pt-BR"
              className="flex-1 border-0 bg-transparent body-sm outline-0"
              style={{ fontVariantNumeric: "tabular-nums" }}
            />
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="body-xs font-medium text-fg-secondary">
            Nome impresso no cartão
          </span>
          <span className="flex h-11 items-center gap-2 rounded-md border border-border bg-bg-raised px-3.5 focus-within:border-fg-primary">
            <input
              placeholder="Como está no cartão"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              autoComplete="cc-name"
              lang="pt-BR"
              className="flex-1 border-0 bg-transparent body-sm outline-0"
            />
          </span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="body-xs font-medium text-fg-secondary">
              Validade
            </span>
            <span className="flex h-11 items-center gap-2 rounded-md border border-border bg-bg-raised px-3.5 focus-within:border-fg-primary">
              <input
                placeholder="MM/AA"
                value={exp}
                onChange={(e) => setExp(fmtExp(e.target.value))}
                autoComplete="cc-exp"
                lang="pt-BR"
                className="flex-1 border-0 bg-transparent body-sm outline-0"
              />
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="body-xs font-medium text-fg-secondary">CVV</span>
            <span className="flex h-11 items-center gap-2 rounded-md border border-border bg-bg-raised px-3.5 focus-within:border-fg-primary">
              <input
                placeholder="000"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                autoComplete="cc-csc"
                lang="pt-BR"
                className="flex-1 border-0 bg-transparent body-sm outline-0"
              />
            </span>
          </label>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 body-xs text-fg-tertiary">
        <Icon name="lock" size={14} />
        Esse cartão fica salvo pras próximas mensalidades — você pode trocar a
        qualquer momento em Financeiro.
      </div>

      <div className="mt-5">
        <AwButton
          size="md"
          variant="primary"
          iconRight="arrow_forward"
          loading={processing}
          disabled={!valid || processing}
          onClick={submit}
          block
        >
          {processing ? "Processando…" : "Confirmar pagamento"}
        </AwButton>
      </div>
    </>
  )
}

function BoletoCheckout({ onDone }: { onDone: () => void }) {
  return (
    <>
      <div className="rounded-xl border border-border-subtle bg-bg-raised p-5">
        <FakeBarcode />
        <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-bg-canvas py-1.5 pl-3 pr-1.5">
          <code
            className="flex-1 self-center overflow-hidden body-xs text-fg-secondary"
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {BOLETO_LINHA_MENS}
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
            iconLeft="mail"
            className="flex-1"
          >
            Enviar por e-mail
          </AwButton>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3.5 rounded-lg bg-aw-amber-100 px-4 py-3.5 text-aw-amber-800">
        <Icon name="schedule" size={18} />
        <div className="flex-1">
          <div className="body-xs font-medium">
            Aguardando compensação bancária
          </div>
          <div className="body-xs" style={{ opacity: 0.85 }}>
            Sua conta libera assim que o boleto compensar (2-3 dias úteis).
          </div>
        </div>
        <AwButton size="sm" variant="secondary" onClick={onDone}>
          Já paguei
        </AwButton>
      </div>
    </>
  )
}

function FakeQR() {
  const size = 21
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
      className="grid h-[180px] w-[180px] rounded-md border border-border-subtle bg-white p-2.5"
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
          <div key={i} style={{ background: fill, aspectRatio: "1 / 1" }} />
        )
      })}
    </div>
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
