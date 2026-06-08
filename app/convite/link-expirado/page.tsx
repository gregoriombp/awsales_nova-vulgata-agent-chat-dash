"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import {
  CONVITE_ORG,
  CONVITE_INVITEE,
  CONVITE_INVITER,
  CONVITE_EXPIRA_EM,
} from "../_data"

export default function ConviteLinkExpiradoPage() {
  const router = useRouter()
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent">(
    "idle"
  )

  const requestNewLink = () => {
    if (status !== "idle") return
    setStatus("sending")
    window.setTimeout(() => setStatus("sent"), 600)
  }

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
          Seu convite expirou
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          Por segurança, o link do convite vale por {CONVITE_EXPIRA_EM} a partir
          do envio, e o seu já passou desse prazo. Você pode pedir um novo agora
          — ele chega no seu e-mail em instantes.
        </p>

        {status !== "sent" ? (
          <div className="flex items-start gap-2.5 rounded-md border border-aw-amber-500/40 bg-aw-amber-100 px-3.5 py-2.5 body-xs text-aw-amber-700">
            <Icon
              name="schedule"
              size={16}
              fill={1}
              className="mt-0.5 shrink-0"
            />
            <span>
              Seu convite continua de pé — só o link de acesso precisa ser
              reenviado.
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-3.5 rounded-lg border border-aw-emerald-500/40 bg-aw-emerald-100 px-4 py-3.5">
            <Icon
              name="check_circle"
              size={16}
              fill={1}
              className="mt-0.5 shrink-0 text-aw-emerald-700"
            />
            <div className="flex flex-col gap-0.5">
              <div className="body-xs font-medium text-fg-primary">
                Enviamos um novo link para o seu e-mail
              </div>
              <div className="body-xs text-fg-secondary">
                Abra a mensagem e clique em Entrar para continuar.
              </div>
            </div>
          </div>
        )}

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <AwButton
            variant="primary"
            size="md"
            iconLeft="send"
            loading={status === "sending"}
            disabled={status !== "idle"}
            onClick={requestNewLink}
          >
            {status === "sent" ? "Novo link enviado" : "Receber um novo link"}
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
