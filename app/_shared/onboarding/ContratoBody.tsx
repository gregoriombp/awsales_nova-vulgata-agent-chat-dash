"use client"

import * as React from "react"
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwCheckbox } from "@/components/ui/AwCheckbox"
import { AwFileIcon } from "@/components/ui/AwFileIcon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ONBOARDING_ORG,
  ONBOARDING_USER,
  fmtBRL,
  type OnboardingContact,
} from "@/app/primeiro-acesso/_data"

type Org = typeof ONBOARDING_ORG
type User = typeof ONBOARDING_USER

export function ContratoBody({
  org,
  user,
  backHref,
  nextHref,
  heading = "Revise o contrato antes de pagar",
  intro,
}: {
  org: Org
  user: User
  backHref: string
  nextHref: string
  heading?: string
  intro?: React.ReactNode
}) {
  const [accepted, setAccepted] = React.useState(false)
  const fidelidadeMeses = org.contractTerm.replace(" meses", "")

  return (
    <AwOnboardingShell org={org}>
      <section>
        <h3 className="mb-2 text-fg-primary text-balance">{heading}</h3>

        <p className="mb-6 body-sm text-fg-secondary text-pretty">
          {intro ?? (
            <>
              Os termos abaixo refletem o contrato firmado com a AwSales. Confira
              cada seção; divergências devem ser tratadas com{" "}
              {org.accountManager.name} antes do pagamento.
            </>
          )}
        </p>

        <ContratoSection title="Dados da empresa">
          <KV label="Razão social" value={org.razaoSocial} />
          <KV
            label="CNPJ"
            value={<span className="tabular-nums">{org.cnpj}</span>}
          />
          <KV
            label="Admin responsável"
            value={
              <span className="inline-flex items-center gap-2">
                <AwAvatar
                  initials="RA"
                  alt={user.name}
                  style={{ width: 18, height: 18, fontSize: 9 }}
                />
                <span>{user.name}</span>
                <span className="font-normal text-fg-tertiary">
                  · {user.email}
                </span>
              </span>
            }
          />
        </ContratoSection>

        <ContratoSection title="Condições comerciais">
          <KV
            label="Plano"
            value={
              <span className="inline-flex flex-wrap items-center gap-1.5">
                <span>
                  <b className="font-medium">{org.plan}</b>
                  <span className="font-normal text-fg-tertiary">
                    {" "}
                    · {org.contractTerm} · {org.fidelidade}
                  </span>
                </span>
                <MultaInfo />
              </span>
            }
          />
          <KV label="Implementação" value={fmtBRL(org.valorImplementacao)} emph />
          <KV
            label="Mensalidade cheia"
            value={
              <>
                <span className="tabular-nums">
                  {fmtBRL(org.valorMensal)}
                </span>
                <span className="font-normal text-fg-tertiary"> /mês</span>
              </>
            }
          />
          <KV
            label="1ª mensalidade (prorrata)"
            value={
              <>
                <span className="tabular-nums">
                  {fmtBRL(org.valorMensalProrrata)}
                </span>
                <span className="font-normal text-fg-tertiary">
                  {" "}
                  · {org.diasRestantesMesAtual} dias restantes · vence{" "}
                  {org.dataPrimeiroVencimento}
                </span>
              </>
            }
          />
          <KV
            label="Custos variáveis de uso"
            value={
              <>
                <span>Sob consumo</span>
                <span className="font-normal text-fg-tertiary">
                  {" "}
                  · limite {org.limiteUsoVariavel}
                </span>
              </>
            }
          />
        </ContratoSection>

        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-border-subtle bg-bg-surface px-3.5 py-3">
          <span className="body-xs font-medium flex-shrink-0 text-fg-secondary">
            Seu time AwSales
          </span>
          <span
            aria-hidden="true"
            className="h-5 w-px bg-border-subtle"
          />
          <TeamMember person={org.accountManager} />
          <TeamMember person={org.representanteComercial} />
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-raised px-4 py-3">
          <AwFileIcon type="pdf" size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block body-xs font-medium text-fg-primary">
              Contrato_{org.razaoSocial.replace(/\s+/g, "_")}.pdf
            </span>
            <span className="block body-xs text-fg-tertiary">
              PDF · {org.plan} · {org.contractTerm} · 48 KB
            </span>
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 body-xs font-medium text-fg-secondary hover:text-fg-primary"
          >
            Baixar
            <Icon name="download" size={14} />
          </button>
        </div>

        <label
          className={[
            "mt-5 flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5 transition-colors duration-aw-fast",
            accepted
              ? "border-fg-primary bg-bg-surface"
              : "border-border bg-bg-raised",
          ].join(" ")}
        >
          <AwCheckbox
            checked={accepted}
            onChange={setAccepted}
            className="mt-px"
          />
          <span className="flex-1 body-xs text-fg-secondary text-pretty">
            Li e aceito os{" "}
            <a
              href="#"
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-fg-primary underline decoration-dotted underline-offset-2 hover:no-underline"
            >
              Termos de Uso
            </a>
            ,{" "}
            <a
              href="#"
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-fg-primary underline decoration-dotted underline-offset-2 hover:no-underline"
            >
              Política de Privacidade
            </a>{" "}
            e as condições comerciais acima — incluindo a{" "}
            <b className="font-medium text-fg-primary">
              cobrança recorrente mensal
            </b>{" "}
            e a fidelidade de {fidelidadeMeses} meses.
          </span>
        </label>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <Link
            href={backHref}
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="arrow_back" size={16} />
            <span className="aw-btn__label">Voltar</span>
          </Link>
          <span className="flex-1" />
          {accepted ? (
            <Link href={nextHref} className="aw-btn aw-btn--primary aw-btn--md">
              <span className="aw-btn__label">Aceitar e ir para pagamento</span>
              <Icon name="arrow_forward" size={16} />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="aw-btn aw-btn--primary aw-btn--md"
            >
              <span className="aw-btn__label">Aceitar e ir para pagamento</span>
              <Icon name="arrow_forward" size={16} />
            </button>
          )}
        </footer>
      </section>
    </AwOnboardingShell>
  )
}

function ContratoSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <article className="mt-3 overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
      <header className="border-b border-border-subtle px-[18px] pb-3 pt-3.5">
        <h6 className="m-0 text-fg-primary">{title}</h6>
      </header>
      <dl className="m-0">{children}</dl>
    </article>
  )
}

function KV({
  label,
  value,
  emph,
}: {
  label: string
  value: React.ReactNode
  emph?: boolean
}) {
  return (
    <div className="grid grid-cols-[200px_1fr] border-b border-border-subtle px-[18px] py-3 last:border-b-0">
      <dt className="body-xs text-fg-tertiary">{label}</dt>
      <dd
        className={[
          "m-0 font-medium text-fg-primary",
          emph ? "body-sm" : "body-xs",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  )
}

function MultaInfo() {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Como a multa de fidelidade é calculada"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-fg-tertiary transition-colors hover:text-fg-secondary"
          >
            <Icon name="info" size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px]">
          Multa de 50% sobre o saldo das mensalidades restantes até o fim da
          fidelidade, em caso de cancelamento antecipado. Detalhes completos no
          contrato.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function TeamMember({ person }: { person: OnboardingContact }) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2">
      <AwAvatar
        src={person.photo}
        initials={person.initials}
        alt={person.name}
        style={{ width: 28, height: 28, fontSize: 11 }}
      />
      <div className="min-w-0">
        <div className="body-xs font-medium leading-tight text-fg-primary">
          {person.name}
        </div>
        <div className="mt-px text-[10px] text-fg-tertiary">{person.role}</div>
      </div>
    </div>
  )
}
