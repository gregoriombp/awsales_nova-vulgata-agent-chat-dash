"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwModal } from "@/components/ui/AwModal"
import { Icon } from "@/components/ui/Icon"
import { useToast } from "@/components/ui/AwToast"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { OVERLAY_DATA_ATTR } from "./constants"
import type { ReviewExportPayload } from "./types"

export function ReviewExportModal() {
  const open = useReviewStore((s) => s.exportOpen)
  const setExportOpen = useReviewStore((s) => s.setExportOpen)
  const storage = useReviewStore((s) => s.storage)
  const { push } = useToast()

  const [payload, setPayload] = React.useState<ReviewExportPayload | null>(null)
  const json = React.useMemo(
    () => (payload ? JSON.stringify(payload, null, 2) : ""),
    [payload]
  )

  React.useEffect(() => {
    if (!open) {
      setPayload(null)
      return
    }
    void storage.exportAll().then(setPayload)
  }, [open, storage])

  const copy = async () => {
    if (!json) return
    try {
      await navigator.clipboard.writeText(json)
      push({
        title: "Copiado",
        description: "JSON na área de transferência.",
        variant: "success",
      })
    } catch {
      push({
        title: "Não consegui copiar",
        description: "Selecione o texto manualmente.",
        variant: "error",
      })
    }
  }

  const download = () => {
    if (!json) return
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bombardier-review-${new Date()
      .toISOString()
      .slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    push({
      title: "Arquivo baixado",
      description: a.download,
      variant: "success",
    })
  }

  const count = payload?.comments.length ?? 0

  return (
    <AwModal
      open={open}
      onClose={() => setExportOpen(false)}
      title="Exportar comentários"
      footer={
        <div
          {...{ [OVERLAY_DATA_ATTR]: "" }}
          className="flex items-center justify-between gap-2 w-full"
        >
          <span className="text-[11px] text-[var(--fg-tertiary)]">
            {count} {count === 1 ? "comentário" : "comentários"}
          </span>
          <div className="flex items-center gap-2">
            <AwButton variant="ghost" onClick={() => setExportOpen(false)}>
              Fechar
            </AwButton>
            <AwButton
              variant="secondary"
              iconLeft="content_copy"
              onClick={copy}
              disabled={!json}
            >
              Copiar
            </AwButton>
            <AwButton
              variant="primary"
              iconLeft="download"
              onClick={download}
              disabled={!json}
            >
              Baixar .json
            </AwButton>
          </div>
        </div>
      }
    >
      <div
        {...{ [OVERLAY_DATA_ATTR]: "" }}
        className="flex flex-col gap-3"
      >
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed flex items-start gap-2">
          <Icon
            name="info"
            size={16}
            className="text-[var(--fg-tertiary)] mt-0.5"
          />
          <span>
            Esses dados ficam só no seu navegador. Compartilhe o JSON
            manualmente até subirmos a v2 do servidor local.
          </span>
        </p>
        <pre className="rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border-subtle)] p-3 max-h-[40vh] overflow-auto text-[11px] font-mono text-[var(--fg-primary)] whitespace-pre">
          {json || "Carregando…"}
        </pre>
      </div>
    </AwModal>
  )
}
