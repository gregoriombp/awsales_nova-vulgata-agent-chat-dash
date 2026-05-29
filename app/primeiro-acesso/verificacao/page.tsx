"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

const RESEND_COOLDOWN_SECONDS = 30

export default function VerificacaoPage() {
  const router = useRouter()
  const [status, setStatus] = React.useState<"sent" | "validating" | "success">(
    "sent"
  )
  const [resendIn, setResendIn] = React.useState(RESEND_COOLDOWN_SECONDS)

  React.useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  // Magic link: o clique já autentica — sem código, sem senha. Aqui o clique
  // no "e-mail" simulado valida o acesso e segue pra criação de conta.
  const openLink = () => {
    if (status !== "sent") return
    setStatus("validating")
    setTimeout(() => {
      setStatus("success")
      setTimeout(() => router.push("/primeiro-acesso/conta"), 700)
    }, 1100)
  }

  const resend = () => {
    if (resendIn > 0 || status !== "sent") return
    setResendIn(RESEND_COOLDOWN_SECONDS)
  }

  const busy = status !== "sent"

  return (
    <AwOnboardingShell org={ONBOARDING_ORG} showOrgCard={false}>
      <section>
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-surface px-2.5 py-1 body-xs text-fg-tertiary">
          <Icon name="mail" size={12} />
          <span>
            Convite enviado para{" "}
            <b className="font-medium text-fg-primary">
              {ONBOARDING_USER.email}
            </b>
          </span>
        </div>

        <h3 className="mb-2 text-fg-primary text-balance">
          Entre pelo seu link de acesso
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          Enviamos um link seguro para o seu e-mail. Abra a mensagem e clique em{" "}
          <b className="font-medium text-fg-primary">Entrar</b> — sem código nem
          senha. Ao clicar, o acesso já é validado e você segue para criar a
          conta.
        </p>

        {/* Bloco que simula o e-mail com o magic link */}
        <div className="rounded-xl border border-border-subtle bg-bg-raised p-4">
          <div className="mb-3 flex items-center gap-2.5 border-b border-border-subtle pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-muted text-fg-secondary">
              <Icon name="mark_email_unread" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="body-xs font-medium text-fg-primary">
                Seu acesso à AwSales
              </div>
              <div className="body-xs text-fg-tertiary">
                AwSales · para {ONBOARDING_USER.email}
              </div>
            </div>
          </div>

          {status === "success" ? (
            <div className="flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
              <Icon
                name="check_circle"
                size={16}
                fill={1}
                className="flex-shrink-0 text-aw-emerald-700"
              />
              <div className="body-xs font-medium text-fg-primary">
                Acesso validado. Vamos criar sua conta…
              </div>
            </div>
          ) : status === "validating" ? (
            <div className="flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
              <span
                aria-hidden="true"
                className="inline-block h-4 w-4 flex-shrink-0 animate-spin rounded-full border-[1.5px] border-brand border-r-transparent"
              />
              <div className="body-xs font-medium text-fg-primary">
                Validando seu link de acesso…
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLink}
              className="aw-btn aw-btn--primary aw-btn--md aw-btn--block"
            >
              <Icon name="login" size={16} />
              <span className="aw-btn__label">Entrar na AwSales</span>
            </button>
          )}

          <p className="m-0 mt-2.5 text-[11px] text-fg-tertiary">
            Protótipo: este bloco simula o e-mail. Em produção, o link chega na
            caixa de entrada de {ONBOARDING_USER.firstName}.
          </p>
        </div>

        <div className="mt-5 flex items-center gap-2 body-xs text-fg-tertiary">
          <Icon name="schedule" size={14} />
          <span>O link expira em 15 minutos.</span>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <button
            type="button"
            onClick={resend}
            disabled={resendIn > 0 || busy}
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="refresh" size={16} />
            <span className="aw-btn__label">
              {resendIn > 0 ? `Reenviar em ${resendIn}s` : "Reenviar link"}
            </span>
          </button>
          <span className="flex-1" />
          <span className="inline-flex items-center gap-1.5 body-xs text-fg-tertiary">
            <Icon name="lock" size={12} />
            Link de uso único
          </span>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
