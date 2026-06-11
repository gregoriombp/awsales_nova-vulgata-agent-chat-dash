"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

const LINK_TTL_DIAS = 10
const LINK_ENVIADO_EM = "02/05/2026"

export default function LinkExpiradoPage() {
  const router = useRouter()
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent">("idle")

  const requestNewLink = () => {
    if (status !== "idle") return
    setStatus("sending")
    window.setTimeout(() => setStatus("sent"), 600)
  }

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
          Seu link de primeiro acesso expirou
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          Por segurança, links de primeiro acesso valem por {LINK_TTL_DIAS} dias
          a partir do envio. O seu já passou desse prazo. Solicite um novo link
          e continue a configuração da sua conta.
        </p>

        {status !== "sent" && (
          <div className="flex items-start gap-2.5 rounded-md border border-aw-amber-500/40 bg-aw-amber-100 px-3.5 py-2.5 body-xs text-aw-amber-700">
            <Icon name="schedule" size={16} fill={1} className="mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span>
                Este link foi enviado em{" "}
                <b className="font-medium">{LINK_ENVIADO_EM}</b> e expirou após{" "}
                {LINK_TTL_DIAS} dias.
              </span>
              <span className="text-aw-amber-700/80">
                O conteúdo do convite continua válido — só o link precisa ser
                reemitido.
              </span>
            </div>
          </div>
        )}

        {status === "sent" && (
          <div className="flex items-start gap-3.5 rounded-lg border border-aw-emerald-500/40 bg-aw-emerald-100 px-4 py-3.5">
            <Icon
              name="check_circle"
              size={16}
              fill={1}
              className="mt-0.5 shrink-0 text-aw-emerald-700"
            />
            <div className="flex flex-col gap-0.5">
              <div className="body-xs font-medium text-fg-primary">
                Novo link enviado para o seu e-mail
              </div>
              <div className="body-xs text-fg-secondary">
                Você pode fechar esta aba ou voltar para o login para continuar.
              </div>
            </div>
          </div>
        )}

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
            iconLeft="send"
            loading={status === "sending"}
            disabled={status !== "idle"}
            onClick={requestNewLink}
          >
            {status === "sent" ? "Novo link enviado" : "Solicitar novo link"}
          </AwButton>
          <AwButton variant="ghost" size="md" onClick={goToLogin}>
            Voltar para o login
          </AwButton>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
