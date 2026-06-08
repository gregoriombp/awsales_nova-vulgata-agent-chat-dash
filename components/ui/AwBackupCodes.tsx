"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwCheckbox } from "@/components/ui/AwCheckbox"
import { cn } from "@/lib/utils"

export type AwBackupCodesConfirm = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: React.ReactNode
}

export type AwBackupCodesProps = {
  /** Os códigos de uso único a exibir (grade de 2 colunas). */
  codes: string[]
  /** Nome do arquivo do "Baixar .txt". Default "aswork-backup-codes.txt". */
  filename?: string
  /** Callout âmbar opcional acima do checkbox (aviso de risco). */
  warning?: React.ReactNode
  /** Checkbox de confirmação opcional ("salvei em lugar seguro"). */
  confirm?: AwBackupCodesConfirm
  /** Rótulos (i18n). Defaults em PT-BR. */
  labels?: { copy?: string; copied?: string; download?: string }
  className?: string
}

/**
 * AwBackupCodes — grade de códigos de backup de uso único + copiar/baixar e,
 * opcionalmente, um aviso e um checkbox de confirmação. Fonte única usada pelo
 * setup de 2FA do AuthFlow (MfaBackupCodesScreen) e pelo fluxo de convite
 * (convite/seguranca), pra os dois não divergirem.
 */
export function AwBackupCodes({
  codes,
  filename = "aswork-backup-codes.txt",
  warning,
  confirm,
  labels,
  className,
}: AwBackupCodesProps) {
  const copyLabel = labels?.copy ?? "Copiar todos"
  const copiedLabel = labels?.copied ?? "Copiado"
  const downloadLabel = labels?.download ?? "Baixar .txt"
  const [didCopy, setDidCopy] = React.useState(false)

  React.useEffect(() => {
    if (!didCopy) return
    const id = window.setTimeout(() => setDidCopy(false), 1800)
    return () => window.clearTimeout(id)
  }, [didCopy])

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"))
    } catch {
      /* clipboard pode falhar em http — segue mesmo assim */
    }
    setDidCopy(true)
  }

  const downloadTxt = () => {
    const blob = new Blob([codes.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 rounded-lg border border-border bg-bg-surface p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 body-sm tabular-nums tracking-wide text-fg-primary">
          {codes.map((c) => (
            <code key={c} className="block">
              {c}
            </code>
          ))}
        </div>
      </div>

      <div className="mb-5 flex gap-2">
        <AwButton
          variant="secondary"
          size="sm"
          className="flex-1"
          iconLeft={didCopy ? "check" : "content_copy"}
          onClick={copyAll}
        >
          {didCopy ? copiedLabel : copyLabel}
        </AwButton>
        <AwButton
          variant="secondary"
          size="sm"
          className="flex-1"
          iconLeft="download"
          onClick={downloadTxt}
        >
          {downloadLabel}
        </AwButton>
      </div>

      {warning && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-aw-amber-200 bg-aw-amber-100 p-3">
          <Icon
            name="warning"
            size={16}
            className="mt-0.5 shrink-0 text-aw-amber-700"
          />
          <p className="m-0 body-xs leading-relaxed text-aw-amber-900">
            {warning}
          </p>
        </div>
      )}

      {confirm && (
        <label className="flex cursor-pointer items-start gap-2.5 select-none">
          <AwCheckbox
            checked={confirm.checked}
            onChange={confirm.onChange}
            className="mt-px"
          />
          <span className="body-sm text-fg-secondary">{confirm.label}</span>
        </label>
      )}
    </div>
  )
}
