"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"
import { evaluatePassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy"

export type AwPasswordSetupProps = {
  /** Shown in the default subtitle ("Você usará <email> …"). */
  email?: string
  title?: string
  /** Overrides the default subtitle. Pass `null` to hide it. */
  subtitle?: React.ReactNode
  submitLabel?: string
  submittingLabel?: string
  backLabel?: string
  /** Called after the brief "criando…" delay when the form is valid. */
  onSubmit: () => void
  /** When provided, renders a back button on the left of the footer. */
  onBack?: () => void
  /** Shows the "Conexão criptografada" note in the footer. */
  showSecurityNote?: boolean
  className?: string
}

/**
 * AwPasswordSetup — the canonical "create a password" block, shared by every
 * onboarding flow (membro, responsável) so the password rule lives in one
 * place. Policy comes from `lib/password-policy` (NIST 800-63-4): minimum
 * length, no complexity rules, passphrase-friendly, breach-check copy, and an
 * advisory strength meter.
 *
 * The component owns the two fields, the requirement, the strength meter, the
 * hints and the footer (back + submit + submitting state). Each flow only
 * passes copy + the `onSubmit`/`onBack` handlers.
 */
export function AwPasswordSetup({
  email,
  title = "Defina uma senha forte",
  subtitle,
  submitLabel = "Criar conta e continuar",
  submittingLabel = "Criando…",
  backLabel = "Outro método",
  onSubmit,
  onBack,
  showSecurityNote = false,
  className,
}: AwPasswordSetupProps) {
  const [pwd, setPwd] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [show, setShow] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const ev = evaluatePassword(pwd)
  const matches = confirm.length > 0 && pwd === confirm
  const valid = ev.longEnough && matches

  const submit = () => {
    if (!valid || submitting) return
    setSubmitting(true)
    window.setTimeout(onSubmit, 1100)
  }

  const resolvedSubtitle =
    subtitle !== undefined ? (
      subtitle
    ) : email ? (
      <>
        Você usará{" "}
        <span className="font-medium text-fg-primary">{email}</span> e essa
        senha para entrar na AwSales.
      </>
    ) : (
      <>Escolha uma senha forte para proteger sua conta.</>
    )

  return (
    <div className={cn("w-full", className)}>
      <h3 className="mb-2 text-fg-primary text-balance">{title}</h3>

      {resolvedSubtitle !== null && (
        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          {resolvedSubtitle}
        </p>
      )}

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
          status={confirm.length === 0 ? "idle" : matches ? "match" : "mismatch"}
        />
      </div>

      {/* NIST: a single hard requirement (length) + advisory strength + hints */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 body-xs">
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full",
              ev.longEnough
                ? "bg-aw-emerald-100 text-aw-emerald-700"
                : "bg-bg-muted text-fg-tertiary"
            )}
          >
            <Icon name={ev.longEnough ? "check" : "remove"} size={12} />
          </span>
          <span
            className={ev.longEnough ? "text-fg-secondary" : "text-fg-tertiary"}
          >
            Mínimo de {PASSWORD_MIN_LENGTH} caracteres
          </span>
        </div>

        <div>
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full not-italic",
                  i < ev.score ? "bg-aw-emerald-500" : "bg-bg-muted"
                )}
              />
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3 body-xs text-fg-tertiary">
            <span>Força: {pwd.length === 0 ? "—" : ev.label}</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="shield" size={12} />
              Bloqueamos senhas vazadas (HIBP)
            </span>
          </div>
        </div>

        <p className="m-0 body-xs text-fg-tertiary text-pretty">
          Dica: uma frase secreta — várias palavras com espaços — costuma ser
          mais forte e fácil de lembrar que uma senha curta com símbolos.
        </p>
      </div>

      {submitting && (
        <div className="mt-5 flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 flex-shrink-0 animate-spin rounded-full border-[1.5px] border-brand border-r-transparent"
          />
          <div className="body-xs font-medium text-fg-primary">
            Criando sua conta segura…
          </div>
        </div>
      )}

      <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="arrow_back" size={16} />
            <span className="aw-btn__label">{backLabel}</span>
          </button>
        )}
        <span className="flex-1" />
        {showSecurityNote && <SecurityNote />}
        <button
          type="button"
          onClick={submit}
          disabled={!valid || submitting}
          className="aw-btn aw-btn--primary aw-btn--md"
        >
          <span className="aw-btn__label">
            {submitting ? submittingLabel : submitLabel}
          </span>
          <Icon name="arrow_forward" size={16} />
        </button>
      </footer>
    </div>
  )
}

function SecurityNote() {
  return (
    <span className="inline-flex items-center gap-1.5 body-xs text-fg-tertiary">
      <Icon name="lock" size={12} />
      Conexão criptografada
    </span>
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
      <span className="body-xs font-medium text-fg-secondary">{label}</span>
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
          <Icon name="error" size={16} className="text-aw-amber-700" fill={1} />
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
