"use client"

import * as React from "react"
import { AwBrandLogo } from "./AwBrandLogo"
import { AwButton } from "./AwButton"
import { AwInput } from "./AwInput"
import { AwLogo } from "./AwLogo"
import { Icon } from "./Icon"

export type AwConnectModalProps = {
  open: boolean
  onClose: () => void
  /** Brand id (registered in AwBrandLogo) for the source product. If omitted, renders the AwSales mark on a dark tile. */
  productBrand?: string
  /** Display name of the source product. Used in the title. */
  productName?: string
  /** Brand id (registered in AwBrandLogo) for the target integration. */
  targetBrand: string
  /** Display name of the target integration. Used in the title. */
  targetName: string
  /** Subtitle below the title. */
  description?: React.ReactNode
  /** Section heading above the permissions list. */
  permissionsTitle?: string
  /** Permissions / scopes the user is authorizing. */
  permissions?: React.ReactNode[]
  /** Callback URL displayed in the read-only input. */
  redirectUrl?: string
  /** Footer-left action. Hidden when omitted. */
  onHowItWorks?: () => void
  /** Footer-right secondary action. Defaults to onClose. */
  onCancel?: () => void
  /** Footer-right primary action. */
  onAllow?: () => void
  /** Primary CTA loading state. */
  loading?: boolean
  /** Localized labels. */
  labels?: Partial<{
    cancel: string
    allow: string
    howItWorks: string
    copy: string
    copied: string
    titleConnector: string
  }>
}

const DEFAULT_LABELS = {
  cancel: "Cancelar",
  allow: "Permitir acesso",
  howItWorks: "Como funciona",
  copy: "Copiar link",
  copied: "Copiado",
  titleConnector: "para",
}

function ProductMark() {
  return (
    <span className="aw-connect-modal__mark aw-connect-modal__mark--product">
      <AwLogo variant="mark" height={22} aria-label="AwSales" />
    </span>
  )
}

export function AwConnectModal({
  open,
  onClose,
  productBrand,
  productName = "AwSales",
  targetBrand,
  targetName,
  description,
  permissionsTitle,
  permissions = [],
  redirectUrl,
  onHowItWorks,
  onCancel,
  onAllow,
  loading,
  labels,
}: AwConnectModalProps) {
  const L = { ...DEFAULT_LABELS, ...labels }
  const [copied, setCopied] = React.useState(false)

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

  React.useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  if (!open) return null

  const handleCopy = async () => {
    if (!redirectUrl) return
    try {
      await navigator.clipboard.writeText(redirectUrl)
      setCopied(true)
    } catch {
      // ignore — clipboard may be unavailable in some browsers
    }
  }

  return (
    <div
      className="aw-modal-scrim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="aw-connect-modal-title"
    >
      <div
        className="aw-modal aw-connect-modal"
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
            Conectar {productName} {L.titleConnector} {targetName}
          </h2>
          {description && (
            <p className="aw-connect-modal__desc">{description}</p>
          )}
        </div>

        {permissions.length > 0 && (
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

        {redirectUrl && (
          <div className="aw-connect-modal__url">
            <AwInput
              dense
              readOnly
              value={redirectUrl}
              aria-label="URL de redirecionamento"
              className="aw-connect-modal__url-input"
            />
            <AwButton
              variant="secondary"
              size="sm"
              iconLeft={copied ? "check" : "content_copy"}
              onClick={handleCopy}
            >
              {copied ? L.copied : L.copy}
            </AwButton>
          </div>
        )}

        <footer className="aw-connect-modal__foot">
          {onHowItWorks ? (
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
              onClick={onAllow}
            >
              {L.allow}
            </AwButton>
          </div>
        </footer>
      </div>
    </div>
  )
}
