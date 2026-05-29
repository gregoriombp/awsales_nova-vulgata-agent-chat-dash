"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { CONVITE_ORG, CONVITE_INVITEE, CONVITE_INVITER } from "../_data"

export default function ConviteLinkUtilizadoPage() {
  const router = useRouter()

  return (
    <AwOnboardingShell org={CONVITE_ORG} showOrgCard={false}>
      <section>
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-surface px-2.5 py-1 body-xs text-fg-tertiary">
          <Icon name="mail" size={12} />
          <span>
            Convite enviado para{" "}
            <b className="font-medium text-fg-primary">
              {CONVITE_INVITEE.email}
            </b>
          </span>
        </div>

        <h3 className="mb-2 text-fg-primary text-balance">
          Este convite já foi usado
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          O link do convite vale uma única vez e já foi utilizado para criar uma
          conta. Se foi você, é só entrar com seu e-mail e senha. Se não
          reconhece esse acesso, fale com {CONVITE_INVITER.firstName}, que te
          convidou.
        </p>

        <div className="flex items-start gap-2.5 rounded-md border border-border bg-bg-surface px-3.5 py-2.5 body-xs text-fg-secondary">
          <Icon
            name="lock"
            size={16}
            className="mt-0.5 flex-shrink-0 text-fg-tertiary"
          />
          <span>
            Por segurança, cada convite só pode ser aberto uma vez — assim
            ninguém reaproveita o seu link.
          </span>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <AwButton
            variant="primary"
            size="md"
            iconLeft="login"
            onClick={() => router.push("/awsales/login")}
          >
            Ir para o login
          </AwButton>
          <AwButton variant="ghost" size="md" iconLeft="mail" asChild>
            <a href={`mailto:${CONVITE_INVITER.email}`}>
              Falar com {CONVITE_INVITER.firstName}
            </a>
          </AwButton>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
