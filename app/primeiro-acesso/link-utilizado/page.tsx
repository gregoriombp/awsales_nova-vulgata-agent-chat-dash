"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

const LINK_USADO_EM = "06/05/2026"

export default function LinkUtilizadoPage() {
  const router = useRouter()

  const openSupport = () => router.push("/suporte")
  const goToLogin = () => router.push("/")

  return (
    <AwOnboardingShell org={ONBOARDING_ORG} showOrgCard={false}>
      <section>
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-surface px-2.5 py-1 body-xs text-fg-tertiary">
          <Icon name="mail" size={12} />
          <span>
            Link enviado para{" "}
            <b className="font-medium text-fg-primary">
              {ONBOARDING_USER.email}
            </b>
          </span>
        </div>

        <h3 className="mb-2 text-fg-primary text-balance">
          Esse link de primeiro acesso já foi utilizado
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          Links de primeiro acesso são de uso único. Se você já configurou sua
          conta, basta entrar normalmente pelo login. Se ainda não acessou e
          mesmo assim caiu aqui, talvez alguém tenha aberto o e-mail antes — o
          suporte consegue revogar o acesso e enviar um novo link.
        </p>

        <div className="flex items-start gap-2.5 rounded-md border border-aw-amber-500/40 bg-aw-amber-100 px-3.5 py-2.5 body-xs text-aw-amber-700">
          <Icon
            name="task_alt"
            size={16}
            fill={1}
            className="mt-0.5 shrink-0"
          />
          <div className="flex flex-col gap-0.5">
            <span>
              Este link foi utilizado em{" "}
              <b className="font-medium">{LINK_USADO_EM}</b>. A conta
              correspondente já foi criada.
            </span>
            <span className="text-aw-amber-700/80">
              Se foi você quem configurou, faça login normalmente. Caso
              contrário, abra um chamado com o suporte para verificarmos.
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 body-xs text-fg-tertiary">
          <Icon name="lock" size={14} />
          <span>
            Por segurança, este link não pode ser reaberto — uma nova
            verificação precisa ser feita pelo suporte.
          </span>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <AwButton
            variant="primary"
            size="md"
            iconLeft="support_agent"
            onClick={openSupport}
          >
            Falar com suporte
          </AwButton>
          <AwButton variant="ghost" size="md" onClick={goToLogin}>
            Voltar para o login
          </AwButton>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
