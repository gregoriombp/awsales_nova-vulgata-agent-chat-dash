"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwModal } from "@/components/ui/AwModal"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER, fmtBRL } from "../_data"
import { FaSlack, FaWhatsapp } from "react-icons/fa6"

const ORG = ONBOARDING_ORG
const USER = ONBOARDING_USER

const METHOD_TITLES: Record<string, string> = {
  pix: "Pix",
  cartao: "Cartão de crédito",
  boleto: "Boleto bancário",
}

function parcelaLabel(method: string, parcelas: number, total: number) {
  const title = METHOD_TITLES[method] ?? method
  if (parcelas === 1) return `${title} · à vista`
  return `${title} · ${parcelas}× ${fmtBRL(total / parcelas)}`
}

export default function ConcluidoPage() {
  return (
    <React.Suspense fallback={null}>
      <ConcluidoContent />
    </React.Suspense>
  )
}

function ConcluidoContent() {
  const searchParams = useSearchParams()

  const implMethod = searchParams.get("im") ?? "pix"
  const implParcelas = Number(searchParams.get("ip") ?? "1")
  const mensMethod = searchParams.get("mm") ?? "pix"
  const mensParcelas = Number(searchParams.get("mp") ?? "1")

  const totalImpl = ORG.valorImplementacao
  const totalMens = ORG.valorMensalProrrata
  const proxima = ORG.proximosVencimentos[1]
  const amFirstName = ORG.accountManager.name.split(/\s+/)[0]
  const [contactOpen, setContactOpen] = React.useState(false)

  return (
    <AwOnboardingShell org={ORG}>
      <section className="pt-4 text-center">
        <span className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-aw-emerald-100 text-aw-emerald-700">
          <Icon name="check_circle" size={40} fill={1} />
        </span>

        <h2 className="mb-2.5 text-fg-primary text-balance">
          Seu ambiente está ativo, {USER.firstName}
        </h2>

        <p className="mx-auto mb-7 max-w-[460px] body-md text-fg-secondary text-pretty">
          Recebemos seu pagamento da implementação e da primeira mensalidade. A{" "}
          {ORG.name} já está provisionada e pronta para uso.
        </p>

        <div className="mx-auto mb-6 max-w-[480px] rounded-xl border border-border-subtle bg-bg-surface p-[18px] text-left">
          <div className="aw-eyebrow mb-3 text-fg-tertiary">Resumo</div>
          <ConfirmedRow
            label="Implementação"
            sub={parcelaLabel(implMethod, implParcelas, totalImpl)}
            value={totalImpl}
          />
          <ConfirmedRow
            label="1ª mensalidade"
            sub={parcelaLabel(mensMethod, mensParcelas, totalMens)}
            value={totalMens}
          />
          <div className="mt-3.5 flex items-baseline justify-between border-t border-border pt-3.5">
            <span className="body-xs text-fg-tertiary">Próxima cobrança</span>
            <span className="body-sm font-medium tabular-nums text-fg-primary">
              {proxima.mes} · {fmtBRL(proxima.valor)}
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/inicio" className="aw-btn aw-btn--primary aw-btn--md">
            <span className="aw-btn__label">Acessar a plataforma</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>

        <div className="mx-auto mt-8 flex max-w-[460px] items-center gap-3 rounded-xl border border-border-subtle p-4 text-left">
          <AwAvatar
            src={ORG.accountManager.photo}
            initials={ORG.accountManager.initials}
            alt={ORG.accountManager.name}
            style={{ width: 36, height: 36, fontSize: 13 }}
          />
          <div className="min-w-0 flex-1">
            <div className="body-xs text-fg-tertiary">
              Seu Account Manager
            </div>
            <div className="body-sm font-medium text-fg-primary">
              {ORG.accountManager.name}
            </div>
            <div className="body-xs text-fg-tertiary">
              {ORG.accountManager.email}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="aw-btn aw-btn--secondary aw-btn--sm flex-shrink-0"
          >
            <Icon name="chat" size={12} />
            <span className="aw-btn__label">Falar com {amFirstName}</span>
          </button>
        </div>
      </section>

      <ContactChannelModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        managerName={ORG.accountManager.name}
      />
    </AwOnboardingShell>
  )
}

const CONTACT_CHANNELS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    hint: "Resposta rápida no horário comercial.",
    icon: <FaWhatsapp size={22} />,
    color: "#25D366",
  },
  {
    key: "slack",
    label: "Slack",
    hint: "Converse no canal compartilhado da sua conta.",
    icon: <FaSlack size={22} />,
    color: "#4A154B",
  },
] as const

/** Modal de canal de contato — espelha o de settings/equipe. */
function ContactChannelModal({
  open,
  onClose,
  managerName,
}: {
  open: boolean
  onClose: () => void
  managerName: string
}) {
  return (
    <AwModal open={open} onClose={onClose} title="Conversar com seu gerente">
      <div className="flex flex-col gap-4">
        <p className="m-0 body-xs text-fg-secondary">
          Escolha por onde falar com {managerName}.
        </p>
        <div className="flex flex-col gap-2">
          {CONTACT_CHANNELS.map((channel) => (
            <button
              key={channel.key}
              type="button"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-raised px-4 py-3 text-left transition-colors duration-aw-fast hover:bg-bg-surface"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: channel.color }}
              >
                {channel.icon}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="body-sm font-medium text-fg-primary">
                  {channel.label}
                </span>
                <span className="body-xs text-fg-secondary">
                  {channel.hint}
                </span>
              </span>
              <Icon
                name="chevron_right"
                size={18}
                className="ml-auto text-fg-tertiary"
              />
            </button>
          ))}
        </div>
      </div>
    </AwModal>
  )
}

function ConfirmedRow({
  label,
  sub,
  value,
}: {
  label: string
  sub: string
  value: number
}) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between">
      <div>
        <div className="body-sm font-medium text-fg-primary">{label}</div>
        <div className="mt-px body-xs text-fg-tertiary">{sub}</div>
      </div>
      <div className="body-sm font-medium tabular-nums text-fg-primary">
        {fmtBRL(value)}
      </div>
    </div>
  )
}
