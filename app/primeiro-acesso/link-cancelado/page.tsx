"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

const LINK_CANCELADO_EM = "08/05/2026"

export default function LinkCanceladoPage() {
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
          Esse link de primeiro acesso foi cancelado
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          O convite de primeiro acesso ligado a este link foi cancelado ou
          removido. Isso pode acontecer quando alguém da sua organização
          reemite o convite, troca o destinatário ou pausa o cadastro. O
          suporte consegue confirmar o motivo e reabrir o acesso, se for o
          caso.
        </p>

        <div className="flex items-start gap-2.5 rounded-md border border-aw-red-500/40 bg-aw-red-100 px-3.5 py-2.5 body-xs text-aw-red-700">
          <Icon
            name="block"
            size={16}
            fill={1}
            className="mt-0.5 shrink-0"
          />
          <div className="flex flex-col gap-0.5">
            <span>
              Este link foi cancelado em{" "}
              <b className="font-medium">{LINK_CANCELADO_EM}</b> e não pode mais
              ser usado.
            </span>
            <span className="text-aw-red-700/80">
              Se você esperava receber acesso, fale com o suporte — eles
              conseguem verificar o status do convite com sua organização.
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 body-xs text-fg-tertiary">
          <Icon name="lock" size={14} />
          <span>
            Por segurança, nenhuma etapa da configuração foi iniciada — sua
            conta ainda não existe.
          </span>
        </div>

        <footer className="mt-12 flex items-center gap-3">
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
