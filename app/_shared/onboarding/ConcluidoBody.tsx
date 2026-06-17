"use client"

import * as React from "react"
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwContactChannelModal } from "@/components/ui/AwContactChannelModal"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import {
  ONBOARDING_ORG,
  ONBOARDING_USER,
  fmtBRL,
} from "@/app/primeiro-acesso/_data"

type Org = typeof ONBOARDING_ORG
type User = typeof ONBOARDING_USER

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

export function ConcluidoBody({
  org,
  user,
  retornoHref,
  retornoLabel = "Acessar a plataforma",
  heading,
  intro,
  searchParams,
}: {
  org: Org
  user: User
  retornoHref: string
  retornoLabel?: string
  heading?: React.ReactNode
  intro?: React.ReactNode
  searchParams: URLSearchParams
}) {
  const implMethod = searchParams.get("im") ?? "pix"
  const implParcelas = Number(searchParams.get("ip") ?? "1")
  const mensMethod = searchParams.get("mm") ?? "pix"
  const mensParcelas = Number(searchParams.get("mp") ?? "1")

  const totalImpl = org.valorImplementacao
  const totalMens = org.valorMensalProrrata
  const proxima = org.proximosVencimentos[1]
  const amFirstName = org.accountManager.name.split(/\s+/)[0]
  const [contactOpen, setContactOpen] = React.useState(false)

  return (
    <AwOnboardingShell
      org={org}
      team={[org.accountManager, org.representanteComercial]}
    >
      <section className="pt-4 text-center">
        <span className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-aw-emerald-100 text-aw-emerald-700">
          <Icon name="check_circle" size={40} fill={1} />
        </span>

        <h2 className="mb-2.5 text-fg-primary text-balance">
          {heading ?? <>Seu ambiente está ativo, {user.firstName}</>}
        </h2>

        <p className="mx-auto mb-7 max-w-[460px] body-md text-fg-secondary text-pretty">
          {intro ?? (
            <>
              Recebemos seu pagamento da implementação e da primeira mensalidade. A{" "}
              {org.name} já está provisionada e pronta para uso.
            </>
          )}
        </p>

        <div className="mx-auto mb-6 max-w-[480px] rounded-xl border border-border-subtle bg-bg-surface p-4.5 text-left">
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
          {org.descontoMensal && (
            <div className="mb-2.5 flex items-baseline justify-between">
              <div>
                <div className="body-sm font-medium text-aw-emerald-700">Desconto</div>
                <div className="mt-px body-xs text-fg-tertiary">
                  {org.descontoMensal.label} · recorrente
                </div>
              </div>
              <div className="body-sm font-medium tabular-nums text-aw-emerald-700">
                -{fmtBRL(org.descontoMensal.valor)}/mês
              </div>
            </div>
          )}
          <div className="mt-3.5 flex items-baseline justify-between border-t border-border pt-3.5">
            <span className="body-xs text-fg-tertiary">Próxima cobrança</span>
            <span className="body-sm font-medium tabular-nums text-fg-primary">
              {proxima.mes} · {fmtBRL(proxima.valor)}
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href={retornoHref} className="aw-btn aw-btn--primary aw-btn--md">
            <span className="aw-btn__label">{retornoLabel}</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>

        <div className="mx-auto mt-8 flex max-w-[460px] items-center gap-3 rounded-xl border border-border-subtle p-4 text-left">
          <AwAvatar
            src={org.accountManager.photo}
            initials={org.accountManager.initials}
            alt={org.accountManager.name}
            style={{ width: 36, height: 36, fontSize: 13 }}
          />
          <div className="min-w-0 flex-1">
            <div className="body-xs text-fg-tertiary">
              Seu Account Manager
            </div>
            <div className="body-sm font-medium text-fg-primary">
              {org.accountManager.name}
            </div>
            <div className="body-xs text-fg-tertiary">
              {org.accountManager.email}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="aw-btn aw-btn--secondary aw-btn--sm shrink-0"
          >
            <Icon name="chat" size={12} />
            <span className="aw-btn__label">Falar com {amFirstName}</span>
          </button>
        </div>
      </section>

      <AwContactChannelModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        managerName={org.accountManager.name}
      />
    </AwOnboardingShell>
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
