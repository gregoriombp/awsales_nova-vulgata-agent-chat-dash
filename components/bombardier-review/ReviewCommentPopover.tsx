"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { Icon } from "@/components/ui/Icon"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { OVERLAY_DATA_ATTR } from "./constants"
import type { ReviewPoint } from "./types"

const POPOVER_WIDTH = 320
const POPOVER_OFFSET = 16

export function ReviewCommentPopover() {
  const pendingAnchor = useReviewStore((s) => s.pendingAnchor)
  const identity = useReviewStore((s) => s.identity)
  const saveComment = useReviewStore((s) => s.saveComment)
  const cancelPending = useReviewStore((s) => s.cancelPending)

  const [text, setText] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (pendingAnchor) {
      setText("")
      setSubmitting(false)
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [pendingAnchor])

  if (!pendingAnchor || !identity) return null

  const point: ReviewPoint =
    pendingAnchor.kind === "pin" ? pendingAnchor.position : pendingAnchor.centroid

  const pxX = point.x - window.scrollX
  const pxY = point.y - window.scrollY

  const placeAbove = pxY > window.innerHeight * 0.55
  const top = placeAbove
    ? Math.max(8, pxY - POPOVER_OFFSET)
    : Math.min(window.innerHeight - 8, pxY + POPOVER_OFFSET)
  const translateY = placeAbove ? "-100%" : "0"
  const left = Math.min(
    Math.max(POPOVER_WIDTH / 2 + 8, pxX),
    window.innerWidth - POPOVER_WIDTH / 2 - 8
  )

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)
    await saveComment(text)
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              void submit()
            } else if (e.key === "Escape") {
              e.preventDefault()
              cancelPending()
            }
          }}
          placeholder="Escreva o feedback…"
          rows={3}
          className="w-full resize-none px-3 py-2 bg-transparent body-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none"
        />
        <div className="px-2 py-2 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)]">
          <span className="body-xs text-[var(--fg-tertiary)] flex items-center gap-1">
            <Icon name="keyboard_command_key" size={11} />
            ⌘↵ pra salvar
          </span>
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
              disabled={!text.trim() || submitting}
              loading={submitting}
            >
              Salvar
            </AwButton>
          </div>
        </div>
      </form>
    </div>
  )
}
