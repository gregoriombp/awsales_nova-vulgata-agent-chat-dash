"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { AwPasswordSetup } from "@/components/ui/AwPasswordSetup"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

type Method = "google" | "microsoft" | "senha"

const GoogleIcon = () => <AwBrandLogo brand="google" markOnly size={18} aria-hidden />

const MsIcon = () => <AwBrandLogo brand="microsoft" markOnly size={18} aria-hidden />

export default function ContaPage() {
  const router = useRouter()
  const [mode, setMode] = React.useState<"choose" | "password">("choose")
  const [picked, setPicked] = React.useState<Method | null>(null)

  const choose = (id: Method) => {
    setPicked(id)
    if (id === "senha") {
      setMode("password")
      return
    }
    setTimeout(
      () => router.push(`/primeiro-acesso/perfil?metodo=${id}`),
      1100
    )
  }

  return (
    <AwOnboardingShell
      org={ONBOARDING_ORG}
      team={[ONBOARDING_ORG.accountManager, ONBOARDING_ORG.representanteComercial]}
    >
      <section>
        {mode === "password" ? (
          <AwPasswordSetup
            email={ONBOARDING_USER.email}
            submitLabel="Criar conta e entrar"
            onBack={() => {
              setMode("choose")
              setPicked(null)
            }}
            onSubmit={() =>
              router.push("/primeiro-acesso/perfil?metodo=senha")
            }
          />
        ) : (
          <>
            <h3 className="mb-2 text-fg-primary text-balance">
              Crie sua conta para continuar
            </h3>

            <p className="mb-7 body-sm text-fg-secondary text-pretty">
              Seu e-mail está confirmado. Agora escolha como você vai entrar —
              é o que <b className="font-medium text-fg-primary">protege sua
              conta</b> antes de revisar o contrato e o pagamento. Você só faz
              isso uma vez.
            </p>

            <div className="flex flex-col gap-2.5">
              <AuthOption
                disabled={!!picked && picked !== "google"}
                loading={picked === "google"}
                onClick={() => choose("google")}
                icon={<GoogleIcon />}
                label="Continuar com Google"
                hint="Recomendado para times com Google Workspace"
              />
              <AuthOption
                disabled={!!picked && picked !== "microsoft"}
                loading={picked === "microsoft"}
                onClick={() => choose("microsoft")}
                icon={<MsIcon />}
                label="Continuar com Microsoft"
                hint="Para times com Microsoft 365 / Entra ID"
              />
            </div>

            <div className="my-4 flex items-center gap-3 aw-eyebrow text-fg-tertiary before:h-px before:flex-1 before:bg-border-subtle before:content-[''] after:h-px after:flex-1 after:bg-border-subtle after:content-['']">
              ou
            </div>

            <AuthOption
              disabled={!!picked && picked !== "senha"}
              onClick={() => choose("senha")}
              icon={<Icon name="key" size={18} />}
              label="Definir uma senha"
              hint="Use e-mail e senha para entrar"
            />

            <footer className="mt-12 flex items-center gap-3">
              <Link
                href="/primeiro-acesso/verificacao"
                className="aw-btn aw-btn--ghost aw-btn--md"
              >
                <Icon name="arrow_back" size={16} />
                <span className="aw-btn__label">Voltar</span>
              </Link>
              <span className="flex-1" />
            </footer>
          </>
        )}
      </section>
    </AwOnboardingShell>
  )
}

function AuthOption({
  disabled,
  loading,
  onClick,
  icon,
  label,
  hint,
}: {
  disabled?: boolean
  loading?: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  hint?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3.5 rounded-lg border border-border bg-bg-raised px-4 py-3.5 text-left transition-colors duration-aw-fast hover:border-border-strong hover:bg-bg-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-bg-raised"
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block body-sm font-medium text-fg-primary">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block body-xs text-fg-tertiary">{hint}</span>
        )}
      </span>
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-[1.5px] border-fg-tertiary border-r-transparent"
        />
      ) : (
        <Icon
          name="arrow_forward"
          size={16}
          className="shrink-0 text-fg-tertiary"
        />
      )}
    </button>
  )
}
