"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { Icon } from "@/components/ui/Icon"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { useCumulativeScrollOffset } from "@/lib/bombardier-review/scrollOffset"
import { OVERLAY_DATA_ATTR } from "./constants"
import type { ReviewPoint } from "./types"

const POPOVER_WIDTH = 320
const POPOVER_OFFSET = 16
const MAX_IMAGES = 4

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function extractImagesFromClipboard(items: DataTransferItemList): File[] {
  const files: File[] = []
  for (const item of Array.from(items)) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile()
      if (file) files.push(file)
    }
  }
  return files
}

export function ReviewCommentPopover() {
  const pendingAnchor = useReviewStore((s) => s.pendingAnchor)
  const identity = useReviewStore((s) => s.identity)
  const saveComment = useReviewStore((s) => s.saveComment)
  const cancelPending = useReviewStore((s) => s.cancelPending)

  const [text, setText] = React.useState("")
  const [images, setImages] = React.useState<string[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const scroll = useCumulativeScrollOffset()

  React.useEffect(() => {
    if (pendingAnchor) {
      setText("")
      setImages([])
      setSubmitting(false)
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [pendingAnchor])

  const addImages = React.useCallback(async (files: File[]) => {
    const eligible = files
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_IMAGES)
    if (eligible.length === 0) return
    const dataUrls = await Promise.all(eligible.map(readFileAsDataUrl))
    setImages((prev) => [...prev, ...dataUrls].slice(0, MAX_IMAGES))
  }, [])

  const handlePaste = React.useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!e.clipboardData) return
      const files = extractImagesFromClipboard(e.clipboardData.items)
      if (files.length > 0) {
        e.preventDefault()
        await addImages(files)
      }
    },
    [addImages]
  )

  const handleFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      await addImages(files)
      if (fileInputRef.current) fileInputRef.current.value = ""
    },
    [addImages]
  )

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx))

  if (!pendingAnchor || !identity) return null

  const point: ReviewPoint =
    pendingAnchor.kind === "pin" ? pendingAnchor.position : pendingAnchor.centroid

  const pxX = point.x - scroll.x
  const pxY = point.y - scroll.y

  const placeAbove = pxY > window.innerHeight * 0.55
  const top = placeAbove
    ? Math.max(8, pxY - POPOVER_OFFSET)
    : Math.min(window.innerHeight - 8, pxY + POPOVER_OFFSET)
  const translateY = placeAbove ? "-100%" : "0"
  const left = Math.min(
    Math.max(POPOVER_WIDTH / 2 + 8, pxX),
    window.innerWidth - POPOVER_WIDTH / 2 - 8
  )

  const canSubmit = (text.trim().length > 0 || images.length > 0) && !submitting

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    await saveComment(text, images.length > 0 ? images : undefined)
    setSubmitting(false)
  }

  return (
    <div
      {...{ [OVERLAY_DATA_ATTR]: "" }}
      className="fixed z-[55] pointer-events-none"
      style={{
        top,
        left,
        width: POPOVER_WIDTH,
        transform: `translate(-50%, ${translateY})`,
      }}
    >
      <form
        onSubmit={submit}
        className="pointer-events-auto rounded-[var(--radius-lg)] bg-[var(--bg-raised)] border border-[var(--border-subtle)] shadow-lg flex flex-col overflow-hidden"
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border-subtle)]">
          <span
            className="h-5 w-5 rounded-full flex items-center justify-center body-xs font-semibold text-[var(--fg-on-inverse)]"
            style={{ background: identity.colorToken }}
          >
            {identity.name.charAt(0).toUpperCase()}
          </span>
          <span className="body-xs font-medium text-[var(--fg-primary)]">
            {identity.name}
          </span>
          <span className="body-xs text-[var(--fg-tertiary)] ml-auto">
            {pendingAnchor.kind === "draw" ? "Marcação livre" : "Pino"}
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              void submit()
            } else if (e.key === "Escape") {
              e.preventDefault()
              cancelPending()
            }
          }}
          placeholder="Escreva o feedback… ou cole uma imagem"
          rows={3}
          className="w-full resize-none px-3 py-2 bg-transparent body-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none"
        />

        {images.length > 0 && (
          <div className="px-3 pb-2 flex flex-wrap gap-2">
            {images.map((src, idx) => (
              <div key={idx} className="relative group/thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-16 w-16 rounded-[var(--radius-sm)] object-cover border border-[var(--border-subtle)]"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                  aria-label="Remover imagem"
                >
                  <Icon name="close" size={9} />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-16 w-16 rounded-[var(--radius-sm)] border border-dashed border-[var(--border-default)] flex items-center justify-center text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:border-[var(--border-strong)] transition-colors"
                aria-label="Adicionar imagem"
              >
                <Icon name="add" size={16} />
              </button>
            )}
          </div>
        )}

        <div className="px-2 py-2 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Anexar imagem"
              title="Anexar imagem (ou cole com ⌘V)"
              disabled={images.length >= MAX_IMAGES}
            >
              <Icon name="image" size={14} />
            </button>
            <span className="body-xs text-[var(--fg-tertiary)] flex items-center gap-1">
              <Icon name="keyboard_command_key" size={11} />
              ⌘↵
            </span>
          </div>
          <div className="flex items-center gap-1">
            <AwButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancelPending}
            >
              Cancelar
            </AwButton>
            <AwButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={!canSubmit}
              loading={submitting}
            >
              Salvar
            </AwButton>
          </div>
        </div>
      </form>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
