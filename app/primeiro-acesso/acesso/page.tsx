"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

type Pick = "google" | "ms" | "magic" | "password"

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
    <path fill="#4285F4" d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.22-4.74 3.22-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
)

const MsIcon = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
    <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
    <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
    <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
    <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
  </svg>
)

export default function AcessoPage() {
  const router = useRouter()
  const [picked, setPicked] = React.useState<Pick | null>(null)

  const choose = (id: Pick) => {
    setPicked(id)
    setTimeout(() => router.push("/primeiro-acesso/agent-studio"), 900)
  }

  return (
    <AwOnboardingShell currentStep={6} org={ONBOARDING_ORG}>
      <section>
        <div
          className="mb-3.5 font-mono uppercase text-fg-tertiary"
          style={{ fontSize: 10, letterSpacing: "0.08em" }}
        >
          etapa 4 de 4 · método de acesso
        </div>

        <h1
          className="mb-2 font-display font-medium text-fg-primary text-balance"
          style={{
            fontSize: "var(--h3-size)",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
          }}
        >
          Como você prefere entrar?
        </h1>

        <p
          className="mb-7 text-fg-secondary text-pretty"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          Você poderá alterar isso depois nas configurações da conta.
          Recomendamos SSO para times com Google Workspace ou Microsoft 365.
        </p>

        <div className="flex flex-col gap-2.5">
          <AuthOption
            disabled={!!picked && picked !== "google"}
            onClick={() => choose("google")}
            icon={<GoogleIcon />}
            label="Continuar com Google"
          />
          <AuthOption
            disabled={!!picked && picked !== "ms"}
            onClick={() => choose("ms")}
            icon={<MsIcon />}
            label="Continuar com Microsoft"
          />
        </div>

        <div
          className="my-4 flex items-center gap-3 font-mono uppercase text-fg-tertiary before:h-px before:flex-1 before:bg-border-subtle before:content-[''] after:h-px after:flex-1 after:bg-border-subtle after:content-['']"
          style={{ fontSize: 10, letterSpacing: "0.06em" }}
        >
          ou
        </div>

        <div className="flex flex-col gap-2.5">
          <AuthOption
            disabled={!!picked && picked !== "magic"}
            onClick={() => choose("magic")}
            icon={<Icon name="mail" size={18} />}
            label={`Enviar magic-link para ${ONBOARDING_USER.email}`}
          />
          <AuthOption
            disabled={!!picked && picked !== "password"}
            onClick={() => choose("password")}
            icon={<Icon name="lock" size={18} />}
            label="Definir uma senha"
          />
        </div>

        {picked && (
          <div className="mt-5 flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
            <span className="relative h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand">
              <span className="absolute -inset-1 animate-ping rounded-full border-2 border-brand opacity-60" />
            </span>
            <div
              className="font-medium text-fg-primary"
              style={{ fontSize: 13 }}
            >
              {picked === "google" && "Redirecionando para Google…"}
              {picked === "ms" && "Redirecionando para Microsoft…"}
              {picked === "magic" &&
                `Enviando link para ${ONBOARDING_USER.email}…`}
              {picked === "password" && "Abrindo definição de senha…"}
            </div>
          </div>
        )}

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <Link
            href="/primeiro-acesso/confirmado"
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="arrow_back" size={16} />
            <span className="aw-btn__label">Voltar</span>
          </Link>
          <span className="flex-1" />
          <span
            className="font-mono text-fg-tertiary"
            style={{ fontSize: 10, letterSpacing: "0.04em" }}
          >
            autenticação via OAuth ou e-mail
          </span>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}

function AuthOption({
  disabled,
  onClick,
  icon,
  label,
}: {
  disabled?: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-md border border-border bg-bg-raised px-4 py-3.5 text-left font-medium text-fg-primary transition-colors duration-aw-fast hover:border-border-strong hover:bg-bg-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-bg-raised"
      style={{ fontSize: 13.5 }}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      <Icon
        name="arrow_forward"
        size={16}
        className="text-fg-tertiary"
      />
    </button>
  )
}
