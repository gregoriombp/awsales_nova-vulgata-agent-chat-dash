"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

/** Etapas seguintes — orienta o cliente sobre o que vem depois das boas-vindas. */
const PROXIMOS_PASSOS = [
  { icon: "person", label: "Criar sua conta", note: "Google, Microsoft ou senha" },
  { icon: "description", label: "Revisar o contrato", note: "Condições comerciais e termos" },
  { icon: "credit_card", label: "Ativar o ambiente", note: "Implementação + 1ª mensalidade" },
]

export default function VerificacaoPage() {
  const router = useRouter()
  const [advancing, setAdvancing] = React.useState(false)

  // O magic link já autenticou ao ser clicado no e-mail de convite — esta é a
  // tela de boas-vindas que confirma o acesso e segue pra criação da conta.
  const comecar = () => {
    if (advancing) return
    setAdvancing(true)
    setTimeout(() => router.push("/primeiro-acesso/conta"), 700)
  }

  return (
    <AwOnboardingShell org={ONBOARDING_ORG}>
      <section>
        <h3 className="mb-2 text-fg-primary text-balance">
          Bem-vindo à AwSales, {ONBOARDING_USER.firstName}
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          Este é o seu primeiro acesso à AwSales. O link chegou no seu e-mail{" "}
          <b className="font-medium text-fg-primary">{ONBOARDING_USER.email}</b>{" "}
          e já validou sua entrada — sem código nem senha. A partir daqui você
          vai configurar sua conta e deixar o ambiente da{" "}
          <b className="font-medium text-fg-primary">{ONBOARDING_ORG.name}</b>{" "}
          pronto pra usar.
        </p>

        <div className="rounded-xl border border-border-subtle bg-bg-raised p-[18px]">
          <div className="aw-eyebrow mb-4 text-fg-tertiary">O que vem agora</div>
          <ol className="m-0 flex list-none flex-col p-0">
            {PROXIMOS_PASSOS.map((s, i) => (
              <li key={s.label} className="flex gap-3.5 pb-5 last:pb-0">
                <div className="flex flex-col items-center self-stretch">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--bg-inverse) text-(--fg-on-inverse)">
                    <Icon name={s.icon} size={18} />
                  </span>
                  {i < PROXIMOS_PASSOS.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-border-subtle" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="body-sm font-medium text-fg-primary">{s.label}</div>
                  <p className="mt-0.5 body-xs text-fg-secondary text-pretty">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <span className="flex-1" />
          <button
            type="button"
            onClick={comecar}
            disabled={advancing}
            className="aw-btn aw-btn--primary aw-btn--md"
          >
            {advancing ? (
              <span
                aria-hidden="true"
                className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-[1.5px] border-white border-r-transparent"
              />
            ) : null}
            <span className="aw-btn__label">
              {advancing ? "Abrindo…" : "Continuar"}
            </span>
            {!advancing && <Icon name="arrow_forward" size={16} />}
          </button>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
