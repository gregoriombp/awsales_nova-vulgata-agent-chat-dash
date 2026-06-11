"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  /**
   * @deprecated O selo "Conexão criptografada" foi removido por decisão de
   * review (2026-06-11). A prop é aceita mas não renderiza nada — mantida só
   * para não quebrar chamadores existentes.
   */
  showSecurityNote?: boolean
  className?: string
}

/**
 * AwPasswordSetup — the canonical "create a password" block, shared by every
 * onboarding flow (membro, responsável) so the password rule lives in one
 * place. Policy comes from `lib/password-policy` (NIST 800-63-4): minimum
 * length, no complexity rules, passphrase-friendly, and an advisory strength
 * meter.
 *
 * The component owns the two fields, the requirement, the strength meter
 * (icon + colored state label + explainer tooltip) and the footer (back +
 * submit + submitting state). Each flow only passes copy + the
 * `onSubmit`/`onBack` handlers.
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
        senha para entrar na Aswork.
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

      {/* NIST: a single hard requirement (length) + advisory strength meter */}
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

        <StrengthMeter score={ev.score} label={ev.label} empty={pwd.length === 0} />
      </div>

      {submitting && (
        <div className="mt-5 flex items-center gap-3.5 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-[1.5px] border-brand border-r-transparent"
          />
          <div className="body-xs font-medium text-fg-primary">
            Criando sua conta segura…
          </div>
        </div>
      )}

      <footer className="mt-12 flex items-center gap-3">
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

/* -----------------------------------------------------------------
 * Strength meter — advisory, never a gate.
 *
 * Three visual tiers on top of the 0–4 score: fraca (danger), média
 * (warning), forte (success). Icon + colored label, explainer tooltip
 * on hover, and a subtle "AI-thinking" gradient sweep on the label
 * whenever the tier changes. Colors/durations come straight from the
 * motion + accent tokens (var(--dur-base) var(--ease-out)).
 * ----------------------------------------------------------------- */

type StrengthTier = "idle" | "weak" | "medium" | "strong"

const STRENGTH_TIERS: Record<
  StrengthTier,
  { icon: string; color: string; soft: string }
> = {
  idle: {
    icon: "shield",
    color: "var(--fg-tertiary)",
    soft: "var(--fg-tertiary)",
  },
  weak: {
    icon: "warning",
    color: "var(--accent-danger)",
    soft: "var(--aw-red-400)",
  },
  medium: {
    icon: "shield",
    color: "var(--accent-warning)",
    soft: "var(--aw-amber-300)",
  },
  strong: {
    icon: "check_circle",
    color: "var(--accent-success)",
    soft: "var(--aw-emerald-400)",
  },
}

/* Mirrors `calc(var(--dur-slow) * 4)` (4 × 280ms) used by the CSS sweep. */
const LABEL_SWEEP_MS = 1120

function StrengthMeter({
  score,
  label,
  empty,
}: {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  empty: boolean
}) {
  const tier: StrengthTier = empty
    ? "idle"
    : score <= 1
      ? "weak"
      : score === 2
        ? "medium"
        : "strong"
  const meta = STRENGTH_TIERS[tier]

  /* Gradient sweep on the label whenever the tier (color state) changes. */
  const [sweeping, setSweeping] = React.useState(false)
  const prevTier = React.useRef(tier)
  React.useEffect(() => {
    if (prevTier.current === tier) return
    prevTier.current = tier
    if (tier === "idle") {
      setSweeping(false)
      return
    }
    setSweeping(true)
    const t = window.setTimeout(() => setSweeping(false), LABEL_SWEEP_MS)
    return () => window.clearTimeout(t)
  }, [tier])

  return (
    <div
      style={
        {
          "--aw-pwd-tier": meta.color,
          "--aw-pwd-tier-soft": meta.soft,
        } as React.CSSProperties
      }
    >
      <style>{`
        .aw-pwd-strength__bar--on { background-color: var(--aw-pwd-tier); }
        .aw-pwd-strength__icon,
        .aw-pwd-strength__label {
          color: var(--aw-pwd-tier);
          transition: color var(--dur-base) var(--ease-out);
        }
        .aw-pwd-strength__label--sweep {
          background-image: linear-gradient(
            100deg,
            var(--aw-pwd-tier) 25%,
            var(--aw-pwd-tier-soft) 50%,
            var(--aw-pwd-tier) 75%
          );
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: aw-pwd-label-sweep calc(var(--dur-slow) * 4) var(--ease-out) both;
        }
        @keyframes aw-pwd-label-sweep {
          from { background-position: 140% 0; }
          to { background-position: -40% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aw-pwd-strength__label--sweep {
            animation: none;
            background-image: none;
            -webkit-text-fill-color: currentColor;
          }
        }
      `}</style>

      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <i
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full not-italic transition-colors duration-aw-base ease-aw-out",
              i < score ? "aw-pwd-strength__bar--on" : "bg-bg-muted"
            )}
          />
        ))}
      </div>

      <div className="mt-1.5 flex items-center body-xs text-fg-tertiary">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-help items-center gap-1.5">
                <Icon
                  name={meta.icon}
                  size={14}
                  fill={tier === "idle" ? 0 : 1}
                  className="aw-pwd-strength__icon"
                />
                <span>
                  Força:{" "}
                  <span
                    className={cn(
                      "aw-pwd-strength__label font-medium",
                      sweeping && "aw-pwd-strength__label--sweep"
                    )}
                  >
                    {empty ? "—" : label}
                  </span>
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-[280px]">
              <div className="flex flex-col gap-2 py-1 body-xs">
                <p className="m-0 font-medium text-fg-primary">
                  O que cada nível significa
                </p>
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-fg-secondary">
                  <li className="flex items-start gap-2">
                    <i
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full not-italic"
                      style={{ background: "var(--accent-danger)" }}
                    />
                    <span>
                      <span className="font-medium text-fg-primary">
                        Muito curta / fraca
                      </span>{" "}
                      — fácil de adivinhar. Use mais caracteres.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full not-italic"
                      style={{ background: "var(--accent-warning)" }}
                    />
                    <span>
                      <span className="font-medium text-fg-primary">
                        Razoável
                      </span>{" "}
                      — atende o mínimo. Alongar a senha aumenta a proteção.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full not-italic"
                      style={{ background: "var(--accent-success)" }}
                    />
                    <span>
                      <span className="font-medium text-fg-primary">
                        Forte / excelente
                      </span>{" "}
                      — longa e variada, difícil de quebrar.
                    </span>
                  </li>
                </ul>
                <p className="m-0 text-fg-tertiary">
                  O medidor é consultivo: o comprimento conta mais que
                  símbolos.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
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
