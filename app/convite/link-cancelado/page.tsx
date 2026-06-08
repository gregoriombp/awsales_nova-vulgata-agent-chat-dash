"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { CONVITE_ORG, CONVITE_INVITEE, CONVITE_INVITER } from "../_data"

export default function ConviteLinkCanceladoPage() {
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

        <h3 className="mb-2 text-fg-primary text-balance">Convite cancelado</h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          {CONVITE_INVITER.name} ({CONVITE_INVITER.role}) cancelou este convite —
          pode ter reenviado para outro endereço ou pausado a entrada por
          enquanto. Fale com {CONVITE_INVITER.firstName} para receber um novo
          acesso.
        </p>

        <div className="flex items-start gap-2.5 rounded-md border border-aw-red-200 bg-aw-red-100 px-3.5 py-2.5 body-xs text-aw-red-700">
          <Icon
            name="block"
            size={16}
            fill={1}
            className="mt-0.5 shrink-0"
          />
          <span>
            Este convite foi removido pela organização e não pode mais ser
            usado.
          </span>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <AwButton variant="primary" size="md" iconLeft="mail" asChild>
            <a href={`mailto:${CONVITE_INVITER.email}`}>
              Falar com {CONVITE_INVITER.firstName}
            </a>
          </AwButton>
          <AwButton
            variant="ghost"
            size="md"
            onClick={() => router.push("/awsales/login")}
          >
            Voltar para o login
          </AwButton>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
