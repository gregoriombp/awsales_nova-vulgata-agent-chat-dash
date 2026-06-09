"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AwButton } from "./AwButton"
import { Icon } from "./Icon"

/**
 * AwDropzone — área de upload arrasta-e-solta do design system.
 *
 * Extraído do dropzone polido do `components/modals/SendFileModal.tsx` (a
 * implementação mais completa do produto): estados de drag, lista de arquivos
 * com barra de progresso por item, validação de tamanho, accept e remover.
 *
 * Self-managed: o componente é dono da lista de arquivos e simula o progresso
 * no cliente (sem backend). Dispara `onChange` a cada mudança e `onComplete`
 * uma vez quando todos os arquivos terminam — quem consome decide o que fazer
 * (fechar um modal, marcar fontes como adicionadas, etc.).
 *
 * Variantes:
 *  - `default`  — caixa cheia: vazia mostra o CTA; com arquivos vira a lista
 *                 com progresso (igual ao SendFileModal).
 *  - `compact`  — caixa menor sempre visível + lista enxuta abaixo (para
 *                 colunas de formulário, ex. anexos de Knowledge Layer).
 */

export type AwDropzoneFile = {
  id: string
  name: string
  type: string
  size?: number
  file?: File
  status: "uploading" | "completed"
  progress: number
}

export type AwDropzoneProps = {
  /** Tipos aceitos (string do atributo `accept` do input). */
  accept?: string
  multiple?: boolean
  /** Tamanho máximo por arquivo em MB — arquivos acima são ignorados. */
  maxSizeMb?: number
  variant?: "default" | "compact"
  /** Ícone Material Symbols da caixa vazia. */
  icon?: string
  title?: string
  hint?: string
  ctaLabel?: string
  /** Simula o progresso de upload no cliente. Default `true`. */
  simulateProgress?: boolean
  /** Dispara a cada mudança na lista de arquivos. */
  onChange?: (files: AwDropzoneFile[]) => void
  /** Dispara uma vez quando todos os arquivos terminam o upload. */
  onComplete?: (files: AwDropzoneFile[]) => void
  className?: string
}

const UPLOAD_DURATION_MS = 2200

function formatSize(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`
}

function fileKindLabel(name: string, type: string): string {
  const ext =
    name.split(".").pop()?.toLowerCase() ??
    type.split("/").pop()?.toLowerCase() ??
    ""
  if (ext === "csv" || type.includes("csv")) return "CSV"
  if (ext === "pdf" || type.includes("pdf")) return "PDF"
  if (["xls", "xlsx"].includes(ext)) return "XLS"
  if (["jpg", "jpeg", "png"].includes(ext)) return "IMG"
  return "DOC"
}

export function AwDropzone({
  accept,
  multiple = true,
  maxSizeMb = 10,
  variant = "default",
  icon = "upload_file",
  title = "Arraste e solte arquivos aqui",
  hint = "ou clique para selecionar no seu computador",
  ctaLabel = "Adicionar arquivos",
  simulateProgress = true,
  onChange,
  onComplete,
  className,
}: AwDropzoneProps) {
  const [files, setFiles] = React.useState<AwDropzoneFile[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const startedAtRef = React.useRef<Map<string, number>>(new Map())
  const firedRef = React.useRef(false)

  const maxBytes = maxSizeMb * 1024 * 1024

  // Notifica mudanças.
  React.useEffect(() => {
    onChange?.(files)
    // onChange propositalmente fora das deps: consumidores passam handler estável.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  // Progresso decorativo (sem backend).
  React.useEffect(() => {
    if (!simulateProgress) return
    const id = setInterval(() => {
      setFiles((prev) => {
        if (!prev.some((f) => f.status === "uploading")) return prev
        let changed = false
        const next = prev.map((item) => {
          if (item.status !== "uploading") return item
          const started = startedAtRef.current.get(item.id) ?? Date.now()
          const p = Math.min(
            100,
            Math.round(((Date.now() - started) / UPLOAD_DURATION_MS) * 100),
          )
          changed = true
          return p >= 100
            ? { ...item, status: "completed" as const, progress: 100 }
            : { ...item, progress: p }
        })
        return changed ? next : prev
      })
    }, 80)
    return () => clearInterval(id)
  }, [simulateProgress])

  // Dispara onComplete uma vez quando todos terminam (rearma se algo voltar a subir).
  React.useEffect(() => {
    if (files.length === 0) {
      firedRef.current = false
      return
    }
    const allDone = files.every((f) => f.status === "completed")
    if (allDone && !firedRef.current) {
      firedRef.current = true
      onComplete?.(files)
    } else if (!allDone) {
      firedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  const addFiles = React.useCallback(
    (fileList: FileList | File[]) => {
      const now = Date.now()
      const valid = Array.from(fileList).filter((f) => f.size <= maxBytes)
      const items: AwDropzoneFile[] = valid.map((file, i) => {
        const id = `${file.name}-${now}-${i}-${Math.random().toString(36).slice(2)}`
        startedAtRef.current.set(id, now)
        return {
          id,
          name: file.name,
          type: file.type,
          size: file.size,
          file,
          status: simulateProgress ? "uploading" : "completed",
          progress: simulateProgress ? 0 : 100,
        }
      })
      setFiles((prev) => (multiple ? [...prev, ...items] : items.slice(0, 1)))
    },
    [maxBytes, multiple, simulateProgress],
  )

  const removeFile = React.useCallback((id: string) => {
    startedAtRef.current.delete(id)
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      onChange={(e) => {
        if (e.target.files?.length) addFiles(e.target.files)
        e.target.value = ""
      }}
      className="sr-only"
      aria-hidden
    />
  )

  const emptyBox = (
    <div
      onDrop={onDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsDragging(false)
      }}
      className={cn(
        "rounded-xl border-2 border-dashed text-center transition-colors",
        variant === "compact" ? "p-6" : "p-10",
        isDragging
          ? "border-(--fg-primary) bg-(--bg-hover)"
          : "border-(--border-default) bg-(--bg-canvas)",
      )}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl bg-(--bg-surface) text-(--fg-tertiary)",
            variant === "compact" ? "h-12 w-12" : "h-16 w-16",
          )}
        >
          <Icon name={icon} size={variant === "compact" ? 24 : 32} weight={300} />
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-(--fg-primary)">{title}</p>
          <p className="mb-4 text-[13.5px] text-(--fg-tertiary)">{hint}</p>
          <AwButton
            type="button"
            variant="primary"
            size="sm"
            iconLeft="add"
            onClick={() => inputRef.current?.click()}
          >
            {ctaLabel}
          </AwButton>
        </div>
      </div>
    </div>
  )

  const fileRow = (item: AwDropzoneFile) => {
    const total = item.size ?? 0
    const current =
      item.status === "uploading"
        ? Math.round((total * item.progress) / 100)
        : total
    const sizeLabel = `${formatSize(current)} de ${formatSize(total)}`
    return (
      <div
        key={item.id}
        className="flex shrink-0 items-start gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-3"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-[10px] font-semibold uppercase text-(--fg-secondary)">
          {fileKindLabel(item.name, item.type)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium text-(--fg-primary)">
            {item.name}
          </p>
          <p className="mt-0.5 text-xs text-(--fg-tertiary)">{sizeLabel}</p>
          {item.status === "uploading" && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--bg-muted)">
              <div
                className="h-full rounded-full bg-(--fg-primary) transition-all duration-150 ease-out"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => removeFile(item.id)}
          className={cn(
            "shrink-0 rounded-md p-1.5 transition-colors hover:bg-(--bg-muted)",
            item.status === "completed"
              ? "text-(--accent-danger)"
              : "text-(--fg-tertiary) hover:text-(--fg-primary)",
          )}
          aria-label={`${item.status === "completed" ? "Excluir" : "Cancelar"} ${item.name}`}
        >
          <Icon
            name={item.status === "completed" ? "delete" : "close"}
            size={18}
            weight={300}
          />
        </button>
      </div>
    )
  }

  const addMoreButton = (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex shrink-0 items-center justify-center gap-2 rounded-md border border-dashed border-(--border-default) py-2.5 text-[13.5px] font-medium text-(--fg-secondary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary)"
    >
      <Icon name="add" size={18} weight={300} /> {ctaLabel}
    </button>
  )

  // default: caixa vazia OU lista (mutuamente exclusivas, igual ao SendFileModal).
  if (variant === "default") {
    return (
      <div className={cn("flex flex-col", className)}>
        {hiddenInput}
        {files.length === 0 ? (
          emptyBox
        ) : (
          <div className="flex max-h-[50vh] min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            {files.map(fileRow)}
            {multiple && addMoreButton}
          </div>
        )}
      </div>
    )
  }

  // compact: caixa sempre visível + lista enxuta abaixo.
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {hiddenInput}
      {emptyBox}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">{files.map(fileRow)}</div>
      )}
    </div>
  )
}

export default AwDropzone
