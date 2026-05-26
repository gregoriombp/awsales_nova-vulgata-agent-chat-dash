"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

const CHUNKS = 4
const CHUNK_LENGTH = 4
const CODE_LENGTH = CHUNKS * CHUNK_LENGTH
const RESEND_COOLDOWN_SECONDS = 30
const ALLOWED = /[^A-Z0-9]/g

export default function VerificacaoPage() {
  const router = useRouter()
  const [chunks, setChunks] = React.useState<string[]>(
    Array.from({ length: CHUNKS }, () => "")
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

  const code = chunks.join("")
  const isComplete =
    code.length === CODE_LENGTH && chunks.every((c) => c.length === CHUNK_LENGTH)

  const distribute = (raw: string, startIndex: number) => {
    const clean = raw.toUpperCase().replace(ALLOWED, "")
    if (!clean) {
      setChunks((prev) => {
        const next = [...prev]
        next[startIndex] = ""
        return next
      })
      if (status === "error") setStatus("idle")
      return
    }
    setChunks((prev) => {
      const next = [...prev]
      let cursor = 0
      for (let i = startIndex; i < CHUNKS && cursor < clean.length; i++) {
        next[i] = clean.slice(cursor, cursor + CHUNK_LENGTH)
        cursor += CHUNK_LENGTH
      }
      return next
    })
    if (status === "error") setStatus("idle")

    const consumedChars = Math.min(clean.length, (CHUNKS - startIndex) * CHUNK_LENGTH)
    const lastFilledIndex = Math.min(
      startIndex + Math.ceil(consumedChars / CHUNK_LENGTH) - 1,
      CHUNKS - 1
    )
    const lastChunkFull =
      consumedChars >= (lastFilledIndex - startIndex + 1) * CHUNK_LENGTH
    const focusIndex = lastChunkFull
      ? Math.min(lastFilledIndex + 1, CHUNKS - 1)
      : lastFilledIndex
    requestAnimationFrame(() => inputsRef.current[focusIndex]?.focus())
  }

  const handleChange = (i: number, raw: string) => {
    distribute(raw, i)
  }

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !chunks[i] && i > 0) {
      e.preventDefault()
      setChunks((prev) => {
        const next = [...prev]
        next[i - 1] = ""
        return next
      })
      inputsRef.current[i - 1]?.focus()
      return
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault()
      inputsRef.current[i - 1]?.focus()
      return
    }
    if (e.key === "ArrowRight" && i < CHUNKS - 1) {
      e.preventDefault()
      inputsRef.current[i + 1]?.focus()
    }
  }

  const handlePaste = (
    i: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const text = e.clipboardData.getData("text")
    if (!text) return
    e.preventDefault()
    distribute(text, i)
  }

  const verify = React.useCallback(() => {
    if (!isComplete || status === "verifying" || status === "success") return
    setStatus("verifying")
    setTimeout(() => {
      if (code === "0000000000000000") {
        setStatus("error")
        setChunks(Array.from({ length: CHUNKS }, () => ""))
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
    setChunks(Array.from({ length: CHUNKS }, () => ""))
    setStatus("idle")
    inputsRef.current[0]?.focus()
  }

  const borderForBox = (i: number) => {
    if (status === "error") return "border-aw-amber-500"
    if (status === "success") return "border-aw-emerald-500"
    if (chunks[i]) return "border-fg-primary"
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
          Digite o serial de 16 caracteres enviado para o seu e-mail. Esse é o
          primeiro passo — em seguida você criará uma conta segura para acessar
          a plataforma.
        </p>

        <div className="flex flex-col gap-2.5">
          <span className="body-xs font-medium text-fg-secondary">
            Serial de segurança
          </span>
          <div className="flex items-center gap-2">
            {chunks.map((chunk, i) => (
              <React.Fragment key={i}>
                <input
                  ref={(el) => {
                    inputsRef.current[i] = el
                  }}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={CHUNK_LENGTH}
                  value={chunk}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={(e) => handlePaste(i, e)}
                  disabled={status === "verifying" || status === "success"}
                  aria-label={`Bloco ${i + 1} de ${CHUNKS} — 4 caracteres`}
                  placeholder="XXXX"
                  className={`h-14 w-[112px] rounded-md border bg-bg-raised text-center body-xl font-medium uppercase tracking-[0.18em] text-fg-primary outline-0 transition-colors duration-aw-fast placeholder:text-fg-tertiary/40 focus:border-fg-primary disabled:opacity-60 ${borderForBox(
                    i
                  )}`}
                />
                {i < CHUNKS - 1 && (
                  <span
                    aria-hidden="true"
                    className="text-fg-tertiary body-lg"
                  >
                    —
                  </span>
                )}
              </React.Fragment>
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
