"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 30

export default function VerificacaoPage() {
  const router = useRouter()
  const [digits, setDigits] = React.useState<string[]>(
    Array.from({ length: CODE_LENGTH }, () => "")
  )
  const [status, setStatus] = React.useState<
    "idle" | "verifying" | "error" | "success"
  >("idle")
  const [resendIn, setResendIn] = React.useState(RESEND_COOLDOWN_SECONDS)
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([])

  React.useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  React.useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  const code = digits.join("")
  const isComplete = code.length === CODE_LENGTH && digits.every((d) => d !== "")

  const setDigit = (i: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev]
      next[i] = value
      return next
    })
    if (status === "error") setStatus("idle")
  }

  const handleChange = (i: number, raw: string) => {
    const value = raw.replace(/\D/g, "")
    if (!value) {
      setDigit(i, "")
      return
    }
    if (value.length === 1) {
      setDigit(i, value)
      inputsRef.current[i + 1]?.focus()
      return
    }
    const chars = value.slice(0, CODE_LENGTH - i).split("")
    setDigits((prev) => {
      const next = [...prev]
      chars.forEach((c, idx) => {
        next[i + idx] = c
      })
      return next
    })
    const lastIndex = Math.min(i + chars.length, CODE_LENGTH - 1)
    inputsRef.current[lastIndex]?.focus()
  }

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault()
      setDigit(i - 1, "")
      inputsRef.current[i - 1]?.focus()
      return
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault()
      inputsRef.current[i - 1]?.focus()
      return
    }
    if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
      e.preventDefault()
      inputsRef.current[i + 1]?.focus()
    }
  }

  const handlePaste = (
    i: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "")
    if (!text) return
    e.preventDefault()
    handleChange(i, text)
  }

  const verify = React.useCallback(() => {
    if (!isComplete || status === "verifying" || status === "success") return
    setStatus("verifying")
    setTimeout(() => {
      if (code === "000000") {
        setStatus("error")
        setDigits(Array.from({ length: CODE_LENGTH }, () => ""))
        inputsRef.current[0]?.focus()
        return
      }
      setStatus("success")
      setTimeout(() => router.push("/primeiro-acesso/conta"), 600)
    }, 900)
  }, [code, isComplete, router, status])

  React.useEffect(() => {
    if (isComplete && status === "idle") verify()
  }, [isComplete, status, verify])

  const resend = () => {
    if (resendIn > 0) return
    setResendIn(RESEND_COOLDOWN_SECONDS)
    setDigits(Array.from({ length: CODE_LENGTH }, () => ""))
    setStatus("idle")
    inputsRef.current[0]?.focus()
  }

  const borderForBox = (i: number) => {
    if (status === "error") return "border-aw-amber-500"
    if (status === "success") return "border-aw-emerald-500"
    if (digits[i]) return "border-fg-primary"
    return "border-border"
  }

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
          Insira seu código de primeiro acesso
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          Digite os 6 dígitos enviados para o seu e-mail. Esse é o primeiro
          passo — em seguida você criará uma conta segura para acessar a
          plataforma.
        </p>

        <div className="flex flex-col gap-2.5">
          <span className="body-xs font-medium text-fg-secondary">
            Código de segurança
          </span>
          <div className="flex gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={CODE_LENGTH}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={(e) => handlePaste(i, e)}
                disabled={status === "verifying" || status === "success"}
                aria-label={`Dígito ${i + 1} de ${CODE_LENGTH}`}
                className={`h-14 w-12 rounded-md border bg-bg-raised text-center tabular-nums body-xl font-medium text-fg-primary outline-0 transition-colors duration-aw-fast focus:border-fg-primary disabled:opacity-60 ${borderForBox(
                  i
                )}`}
              />
            ))}
          </div>
        </div>

        {status === "error" && (
          <div className="mt-4 flex items-center gap-2.5 rounded-md border border-aw-amber-500/40 bg-aw-amber-100 px-3.5 py-2.5 body-xs text-aw-amber-700">
            <Icon name="error" size={16} fill={1} />
            <span>Código inválido. Verifique no e-mail e tente novamente.</span>
          </div>
        )}

        {(status === "verifying" || status === "success") && (
          <div className="mt-4 flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
            {status === "verifying" ? (
              <span
                aria-hidden="true"
                className="inline-block h-4 w-4 flex-shrink-0 animate-spin rounded-full border-[1.5px] border-brand border-r-transparent"
              />
            ) : (
              <Icon
                name="check_circle"
                size={16}
                fill={1}
                className="flex-shrink-0 text-aw-emerald-700"
              />
            )}
            <div className="body-xs font-medium text-fg-primary">
              {status === "verifying"
                ? "Verificando código…"
                : "Identidade pré-verificada. Vamos criar sua conta."}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 body-xs text-fg-tertiary">
          <Icon name="schedule" size={14} />
          <span>O código expira em 10 minutos.</span>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <button
            type="button"
            onClick={resend}
            disabled={
              resendIn > 0 || status === "verifying" || status === "success"
            }
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="refresh" size={16} />
            <span className="aw-btn__label">
              {resendIn > 0 ? `Reenviar em ${resendIn}s` : "Reenviar código"}
            </span>
          </button>
          <span className="flex-1" />
          <span className="inline-flex items-center gap-1.5 body-xs text-fg-tertiary">
            <Icon name="lock" size={12} />
            1/2 fatores
          </span>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
