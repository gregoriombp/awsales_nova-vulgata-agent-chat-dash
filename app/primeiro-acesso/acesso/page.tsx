"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

type Pick = "google" | "ms" | "password"

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
  const [mode, setMode] = React.useState<"choose" | "password">("choose")

  const choose = (id: Pick) => {
    setPicked(id)
    if (id === "password") {
      setMode("password")
      return
    }
    setTimeout(
      () => router.push(`/primeiro-acesso/perfil?via=${id}`),
      900,
    )
  }

  const goBackToChoose = () => {
    setMode("choose")
    setPicked(null)
  }

  return (
    <AwOnboardingShell currentStep={1} org={ONBOARDING_ORG}>
      <section>
        {mode === "password" ? (
          <PasswordSetup
            onBack={goBackToChoose}
            onSubmit={() =>
              router.push("/primeiro-acesso/perfil?via=password")
            }
          />
        ) : (
          <>
            <h3 className="mb-2 text-fg-primary text-balance">
              Como você prefere entrar?
            </h3>

            <p className="mb-7 body-sm text-fg-secondary text-pretty">
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

            <div className="my-4 flex items-center gap-3 aw-eyebrow text-fg-tertiary before:h-px before:flex-1 before:bg-border-subtle before:content-[''] after:h-px after:flex-1 after:bg-border-subtle after:content-['']">
              ou
            </div>

            <div className="flex flex-col gap-2.5">
              <AuthOption
                disabled={!!picked && picked !== "password"}
                onClick={() => choose("password")}
                icon={<Icon name="lock" size={18} />}
                label="Definir uma senha"
              />
            </div>

            {picked && picked !== "password" && (
              <div className="mt-5 flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-4 w-4 flex-shrink-0 animate-spin rounded-full border-[1.5px] border-brand border-r-transparent"
                />
                <div className="body-xs font-medium text-fg-primary">
                  {picked === "google" && "Redirecionando para Google…"}
                  {picked === "ms" && "Redirecionando para Microsoft…"}
                </div>
              </div>
            )}

            <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
              <Link
                href="/primeiro-acesso/convite"
                className="aw-btn aw-btn--ghost aw-btn--md"
              >
                <Icon name="arrow_back" size={16} />
                <span className="aw-btn__label">Voltar</span>
              </Link>
              <span className="flex-1" />
              <span className="body-xs text-fg-tertiary">
                autenticação via OAuth ou e-mail
              </span>
            </footer>
          </>
        )}
      </section>
    </AwOnboardingShell>
  )
}

function PasswordSetup({
  onBack,
  onSubmit,
}: {
  onBack: () => void
  onSubmit: () => void
}) {
  const [pwd, setPwd] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [show, setShow] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const rules = [
    { label: "Mínimo de 8 caracteres", ok: pwd.length >= 8 },
    { label: "Pelo menos 1 letra maiúscula", ok: /[A-Z]/.test(pwd) },
    { label: "Pelo menos 1 número", ok: /\d/.test(pwd) },
    {
      label: "Pelo menos 1 símbolo (!@#$…)",
      ok: /[^A-Za-z0-9]/.test(pwd),
    },
  ]
  const allOk = rules.every((r) => r.ok)
  const matches = confirm.length > 0 && pwd === confirm
  const valid = allOk && matches

  const submit = () => {
    if (!valid || submitting) return
    setSubmitting(true)
    setTimeout(onSubmit, 1100)
  }

  return (
    <>
      <h3 className="mb-2 text-fg-primary text-balance">
        Defina uma senha para o seu acesso.
      </h3>

      <p className="mb-7 body-sm text-fg-secondary text-pretty">
        Você usará seu e-mail{" "}
        <span className="font-medium text-fg-primary">
          {ONBOARDING_USER.email}
        </span>{" "}
        e esta senha para entrar na AwSales.
      </p>

      <div className="grid gap-3.5">
        <PasswordField
          label="Nova senha"
          value={pwd}
          onChange={setPwd}
          show={show}
          onToggleShow={() => setShow((v) => !v)}
        />
        <PasswordField
          label="Confirmar senha"
          value={confirm}
          onChange={setConfirm}
          show={show}
          onToggleShow={() => setShow((v) => !v)}
          status={
            confirm.length === 0
              ? "idle"
              : matches
              ? "match"
              : "mismatch"
          }
        />
      </div>

      <ul className="mt-4 m-0 grid grid-cols-2 gap-x-4 gap-y-1.5 list-none p-0">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className="flex items-center gap-2 body-xs"
          >
            <span
              className={[
                "flex h-4 w-4 items-center justify-center rounded-full",
                rule.ok
                  ? "bg-aw-emerald-100 text-aw-emerald-700"
                  : "bg-bg-muted text-fg-tertiary",
              ].join(" ")}
            >
              <Icon name={rule.ok ? "check" : "remove"} size={12} />
            </span>
            <span
              className={rule.ok ? "text-fg-secondary" : "text-fg-tertiary"}
            >
              {rule.label}
            </span>
          </li>
        ))}
      </ul>

      {submitting && (
        <div className="mt-5 flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 flex-shrink-0 animate-spin rounded-full border-[1.5px] border-brand border-r-transparent"
          />
          <div className="body-xs font-medium text-fg-primary">
            Criando seu acesso…
          </div>
        </div>
      )}

      <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="aw-btn aw-btn--ghost aw-btn--md"
        >
          <Icon name="arrow_back" size={16} />
          <span className="aw-btn__label">Outro método</span>
        </button>
        <span className="flex-1" />
        <button
          type="button"
          onClick={submit}
          disabled={!valid || submitting}
          className="aw-btn aw-btn--primary aw-btn--md"
        >
          <span className="aw-btn__label">
            {submitting ? "Criando…" : "Criar acesso e entrar"}
          </span>
          <Icon name="arrow_forward" size={16} />
        </button>
      </footer>
    </>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  status = "idle",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggleShow: () => void
  status?: "idle" | "match" | "mismatch"
}) {
  const borderClass =
    status === "mismatch"
      ? "border-aw-amber-500 focus-within:border-aw-amber-500"
      : status === "match"
      ? "border-aw-emerald-500 focus-within:border-aw-emerald-500"
      : "border-border focus-within:border-fg-primary"

  return (
    <label className="flex flex-col gap-1.5">
      <span className="body-xs font-medium text-fg-secondary">
        {label}
      </span>
      <span
        className={`flex h-11 items-center gap-2 rounded-md border ${borderClass} bg-bg-raised px-3.5`}
      >
        <Icon name="lock" size={16} className="text-fg-tertiary" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="flex-1 border-0 bg-transparent body-sm outline-0"
          style={{ letterSpacing: show ? "0" : "0.1em" }}
        />
        {status === "match" && (
          <Icon
            name="check_circle"
            size={16}
            className="text-aw-emerald-700"
            fill={1}
          />
        )}
        {status === "mismatch" && (
          <Icon
            name="error"
            size={16}
            className="text-aw-amber-700"
            fill={1}
          />
        )}
        <button
          type="button"
          onClick={onToggleShow}
          tabIndex={-1}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-fg-tertiary hover:bg-bg-muted hover:text-fg-secondary"
        >
          <Icon name={show ? "visibility_off" : "visibility"} size={18} />
        </button>
      </span>
    </label>
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
      className="flex w-full items-center gap-3 rounded-md border border-border bg-bg-raised px-4 py-3.5 text-left body-xs font-medium text-fg-primary transition-colors duration-aw-fast hover:border-border-strong hover:bg-bg-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-bg-raised"
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
