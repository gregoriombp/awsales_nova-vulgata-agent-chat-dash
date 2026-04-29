"use client"

import * as React from "react"
import { AwBrandLogo } from "./AwBrandLogo"
import { AwButton } from "./AwButton"
import { AwField, AwInput } from "./AwInput"
import { AwLogo } from "./AwLogo"
import { Icon } from "./Icon"

/* -----------------------------------------------------------------
 * Shared types
 * ----------------------------------------------------------------- */

export type AwConnectModalKind = "oauth" | "webhook" | "apiKey"

export type AwWebhookStep = {
  /** Short label shown in the stepper indicator. */
  label: string
  /** Step heading. */
  title: string
  /** Body — supports rich React content (lists, paragraphs, links). */
  body: React.ReactNode
  /** Optional copyable URL widget rendered inside the step. */
  copy?: { label: string; value: string }
}

export type AwApiKeyField = {
  id: string
  label: string
  placeholder?: string
  /** Material icon name shown inside the input. */
  iconLeft?: string
  /** Helper text below the input. */
  helper?: string
  defaultValue?: string
}

export type AwConnectModalProps = {
  open: boolean
  onClose: () => void
  /** Connection flow. Defaults to OAuth. */
  kind?: AwConnectModalKind
  /** Brand id (registered in AwBrandLogo) for the source product. */
  productBrand?: string
  productName?: string
  /** Brand id (registered in AwBrandLogo) for the target integration. */
  targetBrand: string
  targetName: string
  description?: React.ReactNode

  /* OAuth */
  permissionsTitle?: string
  permissions?: React.ReactNode[]
  redirectUrl?: string

  /* Webhook */
  /** Steps for the webhook flow. Each step is a slide. */
  steps?: AwWebhookStep[]
  /** Initial step index. */
  initialStep?: number

  /* API key */
  apiKeyFields?: AwApiKeyField[]
  /** External docs link rendered in the API-key flow header. */
  docsUrl?: string
  docsLabel?: string
  apiKeyIntro?: React.ReactNode

  /* Footer */
  onHowItWorks?: () => void
  onCancel?: () => void
  /** Primary action — Permitir acesso (OAuth) / Salvar webhook (webhook) / Conectar (apiKey). */
  onAllow?: () => void
  loading?: boolean

  labels?: Partial<{
    cancel: string
    allow: string
    allowWebhook: string
    allowApiKey: string
    howItWorks: string
    copy: string
    copied: string
    titleConnector: string
    next: string
    back: string
    finish: string
    stepOf: string
  }>
}

const DEFAULT_LABELS = {
  cancel: "Cancelar",
  allow: "Permitir acesso",
  allowWebhook: "Concluir configuração",
  allowApiKey: "Conectar",
  howItWorks: "Como funciona",
  copy: "Copiar link",
  copied: "Copiado",
  titleConnector: "para",
  next: "Continuar",
  back: "Voltar",
  finish: "Concluir",
  stepOf: "de",
}

function ProductMark() {
  return (
    <span className="aw-connect-modal__mark aw-connect-modal__mark--product">
      <AwLogo variant="mark" height={22} aria-label="AwSales" />
    </span>
  )
}

/* -----------------------------------------------------------------
 * Copy-URL widget — reused by OAuth redirect + webhook steps.
 * ----------------------------------------------------------------- */

function CopyUrl({
  value,
  copy,
  copied,
}: {
  value: string
  copy: string
  copied: string
}) {
  const [done, setDone] = React.useState(false)
  React.useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setDone(false), 1600)
    return () => clearTimeout(t)
  }, [done])
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
    } catch {
      /* clipboard may be unavailable */
    }
  }
  return (
    <div className="aw-connect-modal__url">
      <AwInput
        dense
        readOnly
        value={value}
        aria-label="URL"
        className="aw-connect-modal__url-input"
      />
      <AwButton
        variant="secondary"
        size="sm"
        iconLeft={done ? "check" : "content_copy"}
        onClick={handleCopy}
      >
        {done ? copied : copy}
      </AwButton>
    </div>
  )
}

/* -----------------------------------------------------------------
 * Webhook stepper — numbered nodes connected by a progress bar.
 * ----------------------------------------------------------------- */

function WebhookStepper({
  steps,
  current,
  onJump,
}: {
  steps: AwWebhookStep[]
  current: number
  onJump: (i: number) => void
}) {
  const progress =
    steps.length <= 1 ? 0 : (current / (steps.length - 1)) * 100
  return (
    <ol className="aw-connect-modal__steps" aria-label="Etapas">
      <span
        className="aw-connect-modal__steps-track"
        aria-hidden="true"
      />
      <span
        className="aw-connect-modal__steps-progress"
        aria-hidden="true"
        style={{ width: `${progress}%` }}
      />
      {steps.map((s, i) => {
        const state =
          i < current ? "done" : i === current ? "active" : "todo"
        return (
          <li
            key={s.label + i}
            className={`aw-connect-modal__step aw-connect-modal__step--${state}`}
          >
            <button
              type="button"
              className="aw-connect-modal__step-node"
              onClick={() => onJump(i)}
              aria-current={state === "active" ? "step" : undefined}
              aria-label={`Etapa ${i + 1}: ${s.label}`}
              disabled={state === "todo"}
            >
              {state === "done" ? (
                <Icon name="check" size={14} />
              ) : (
                <span>{i + 1}</span>
              )}
            </button>
            <span className="aw-connect-modal__step-label">{s.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

/* -----------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------- */

export function AwConnectModal({
  open,
  onClose,
  kind = "oauth",
  productBrand,
  productName = "AwSales",
  targetBrand,
  targetName,
  description,
  permissionsTitle,
  permissions = [],
  redirectUrl,
  steps,
  initialStep = 0,
  apiKeyFields,
  docsUrl,
  docsLabel = "Ver documentação",
  apiKeyIntro,
  onHowItWorks,
  onCancel,
  onAllow,
  loading,
  labels,
}: AwConnectModalProps) {
  const L = { ...DEFAULT_LABELS, ...labels }
  const stepCount = steps?.length ?? 0
  const [step, setStep] = React.useState(initialStep)

  React.useEffect(() => {
    if (open) setStep(initialStep)
  }, [open, initialStep])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const isOAuth = kind === "oauth"
  const isWebhook = kind === "webhook"
  const isApiKey = kind === "apiKey"

  const primaryLabel = isWebhook
    ? L.allowWebhook
    : isApiKey
      ? L.allowApiKey
      : L.allow

  const onPrimary = () => {
    if (isWebhook && step < stepCount - 1) {
      setStep((s) => Math.min(stepCount - 1, s + 1))
      return
    }
    onAllow?.()
  }

  const isLastStep = !isWebhook || step >= stepCount - 1
  const primaryActionLabel =
    isWebhook && !isLastStep ? L.next : primaryLabel

  return (
    <div
      className="aw-modal-scrim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="aw-connect-modal-title"
    >
      <div
        className={
          "aw-modal aw-connect-modal aw-connect-modal--" + kind
        }
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="aw-modal__close aw-connect-modal__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <Icon name="close" size={18} />
        </button>

        <div className="aw-connect-modal__hero">
          <div className="aw-connect-modal__logos">
            {productBrand ? (
              <AwBrandLogo brand={productBrand} size="lg" />
            ) : (
              <ProductMark />
            )}
            <span aria-hidden="true" className="aw-connect-modal__connector">
              <Icon name="sync_alt" size={16} />
            </span>
            <AwBrandLogo brand={targetBrand} size="lg" />
          </div>

          <h2
            id="aw-connect-modal-title"
            className="aw-connect-modal__title"
          >
            {isWebhook
              ? `Integrar ${targetName}`
              : isApiKey
                ? `Conectar ${targetName}`
                : `Conectar ${productName} ${L.titleConnector} ${targetName}`}
          </h2>
          {description && (
            <p className="aw-connect-modal__desc">{description}</p>
          )}
        </div>

        {/* ───── OAuth body ───── */}
        {isOAuth && permissions.length > 0 && (
          <div className="aw-connect-modal__perms">
            {permissionsTitle && (
              <h3 className="aw-connect-modal__perms-title">
                {permissionsTitle}
              </h3>
            )}
            <ul className="aw-connect-modal__perms-list">
              {permissions.map((perm, i) => (
                <li key={i} className="aw-connect-modal__perm">
                  <Icon
                    name="check_circle"
                    size={16}
                    className="aw-connect-modal__perm-icon"
                  />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isOAuth && redirectUrl && (
          <CopyUrl value={redirectUrl} copy={L.copy} copied={L.copied} />
        )}

        {/* ───── Webhook body ───── */}
        {isWebhook && steps && stepCount > 0 && (
          <div className="aw-connect-modal__webhook">
            <div className="aw-connect-modal__step-meta">
              <span>
                Etapa {step + 1} {L.stepOf} {stepCount}
              </span>
              <span>{steps[step].label}</span>
            </div>
            <WebhookStepper
              steps={steps}
              current={step}
              onJump={setStep}
            />

            <div
              className="aw-connect-modal__slides"
              data-step={step}
            >
              <div
                className="aw-connect-modal__slides-track"
                style={{ transform: `translateX(-${step * 100}%)` }}
              >
                {steps.map((s, i) => (
                  <article
                    key={s.label + i}
                    className="aw-connect-modal__slide"
                    aria-hidden={i !== step}
                  >
                    <h4 className="aw-connect-modal__slide-title">
                      {s.title}
                    </h4>
                    <div className="aw-connect-modal__slide-body">
                      {s.body}
                      {s.copy && (
                        <div className="aw-connect-modal__slide-copy">
                          <span className="aw-connect-modal__slide-copy-label">
                            {s.copy.label}
                          </span>
                          <CopyUrl
                            value={s.copy.value}
                            copy={L.copy}
                            copied={L.copied}
                          />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ───── API Key body ───── */}
        {isApiKey && (
          <div className="aw-connect-modal__apikey">
            {apiKeyIntro && (
              <p className="aw-connect-modal__apikey-intro">
                {apiKeyIntro}
              </p>
            )}
            {apiKeyFields && apiKeyFields.length > 0 && (
              <div className="aw-connect-modal__apikey-fields">
                {apiKeyFields.map((f) => (
                  <AwField
                    key={f.id}
                    label={f.label}
                    htmlFor={f.id}
                    helper={f.helper}
                  >
                    <AwInput
                      id={f.id}
                      placeholder={f.placeholder}
                      iconLeft={f.iconLeft}
                      defaultValue={f.defaultValue}
                    />
                  </AwField>
                ))}
              </div>
            )}
            {docsUrl && (
              <a
                href={docsUrl}
                target="_blank"
                rel="noreferrer"
                className="aw-connect-modal__apikey-docs"
              >
                <Icon name="menu_book" size={14} />
                {docsLabel}
              </a>
            )}
          </div>
        )}

        <footer className="aw-connect-modal__foot">
          {isWebhook && step > 0 ? (
            <AwButton
              variant="ghost"
              size="md"
              iconLeft="arrow_back"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              {L.back}
            </AwButton>
          ) : onHowItWorks ? (
            <AwButton
              variant="ghost"
              size="md"
              iconLeft="play_circle"
              onClick={onHowItWorks}
            >
              {L.howItWorks}
            </AwButton>
          ) : (
            <span aria-hidden="true" />
          )}
          <div className="aw-connect-modal__foot-actions">
            <AwButton
              variant="secondary"
              size="md"
              onClick={onCancel ?? onClose}
            >
              {L.cancel}
            </AwButton>
            <AwButton
              variant="primary"
              size="md"
              loading={loading}
              iconRight={
                isWebhook && !isLastStep ? "arrow_forward" : undefined
              }
              onClick={onPrimary}
            >
              {primaryActionLabel}
            </AwButton>
          </div>
        </footer>
      </div>
    </div>
  )
}
