"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { useCumulativeScrollOffset } from "@/lib/bombardier-review/scrollOffset"
import { formatFullTimestamp } from "@/lib/bombardier-review/format"
import { OVERLAY_DATA_ATTR, REVIEW_Z } from "./constants"
import { ReplyRow } from "./ReviewCommentCard"
import { UxFlowChip } from "./UxFlowChip"
import type { ReviewComment, ReviewPoint } from "./types"

const THREAD_WIDTH = 360
const GAP = 16

/** Elements that should NOT dismiss the thread when clicked: the review
 * overlay itself and any Radix popper (the ⋯ menu portals outside the tree). */
const KEEP_OPEN_SELECTOR = `[${OVERLAY_DATA_ATTR}], [data-radix-popper-content-wrapper], .aw-dropdown, [role="menu"]`

function anchorPoint(comment: ReviewComment): ReviewPoint {
  return comment.anchor.kind === "pin"
    ? comment.anchor.position
    : comment.anchor.centroid
}

export function ReviewThreadPopover() {
  const threadCommentId = useReviewStore((s) => s.threadCommentId)
  const comments = useReviewStore((s) => s.comments)
  const archivedComments = useReviewStore((s) => s.archivedComments)
  const identity = useReviewStore((s) => s.identity)
  const pendingAnchor = useReviewStore((s) => s.pendingAnchor)

  const closeThread = useReviewStore((s) => s.closeThread)
  const setSheetOpen = useReviewStore((s) => s.setSheetOpen)
  const archiveDirect = useReviewStore((s) => s.archiveDirect)
  const approveComment = useReviewStore((s) => s.approveComment)
  const rejectComment = useReviewStore((s) => s.rejectComment)
  const addReply = useReviewStore((s) => s.addReply)
  const deleteComment = useReviewStore((s) => s.deleteComment)

  const scroll = useCumulativeScrollOffset()

  const [replyText, setReplyText] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const bodyRef = React.useRef<HTMLDivElement>(null)

  const comment =
    comments.find((c) => c.id === threadCommentId) ??
    archivedComments.find((c) => c.id === threadCommentId) ??
    null

  // Reset the composer whenever we switch to a different comment.
  React.useEffect(() => {
    setReplyText("")
    setSubmitting(false)
  }, [threadCommentId])

  // Keep the latest reply in view as the thread grows.
  React.useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [comment?.replies?.length, threadCommentId])

  // Figma-style dismiss: click anywhere that isn't the overlay or a menu.
  React.useEffect(() => {
    if (!threadCommentId) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null
      if (target?.closest(KEEP_OPEN_SELECTOR)) return
      closeThread()
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true)
  }, [threadCommentId, closeThread])

  // While composing a new comment, the compose popover takes over.
  if (!comment || pendingAnchor || typeof window === "undefined") return null

  const point = anchorPoint(comment)
  const pxX = point.x - scroll.x
  const pxY = point.y - scroll.y

  // Horizontal: prefer the right of the pin, flip left if it would overflow.
  let left = pxX + GAP
  if (left + THREAD_WIDTH > window.innerWidth - 8) {
    left = pxX - GAP - THREAD_WIDTH
  }
  left = Math.max(8, Math.min(left, window.innerWidth - THREAD_WIDTH - 8))

  // Vertical: anchor near the pin, flip above when the space below is cramped.
  const spaceBelow = window.innerHeight - pxY - GAP
  const spaceAbove = pxY - GAP
  const placeAbove = spaceBelow < 240 && spaceAbove > spaceBelow
  const maxHeight = Math.max(
    200,
    Math.min(560, placeAbove ? spaceAbove : spaceBelow)
  )
  const vertical: React.CSSProperties = placeAbove
    ? { bottom: window.innerHeight - pxY + GAP }
    : { top: Math.max(8, pxY - 24) }

  const replies = Array.isArray(comment.replies) ? comment.replies : []
  const isResolved = comment.status === "resolved"
  const isInReview = comment.status === "in_review"

  const copyPermalink = () => {
    const base = window.location.origin
    const pathWithQuery = comment.url.includes("?")
      ? `${comment.url}&reviewCommentId=${encodeURIComponent(comment.id)}`
      : `${comment.url}?reviewCommentId=${encodeURIComponent(comment.id)}`
    void navigator.clipboard?.writeText(`${base}${pathWithQuery}`)
  }

  const dropdownItems: AwDropdownItem[] = [
    { id: "copy-link", label: "Copiar link", icon: "link", onSelect: copyPermalink },
    isInReview
      ? {
          id: "reject",
          label: "Reabrir (rejeitar revisão)",
          icon: "refresh",
          onSelect: () => void rejectComment(comment.id),
        }
      : {
          id: "archive",
          label: "Marcar como resolvido",
          icon: "check_circle",
          onSelect: () => void archiveDirect(comment.id),
        },
    { id: "sep", separator: true },
    {
      id: "delete",
      label: "Excluir",
      icon: "delete",
      danger: true,
      onSelect: () => void deleteComment(comment.id),
    },
  ]

  const submitReply = async () => {
    const trimmed = replyText.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      await addReply(comment.id, trimmed)
      setReplyText("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      {...{ [OVERLAY_DATA_ATTR]: "" }}
      className="fixed pointer-events-none"
      style={{ zIndex: REVIEW_Z.popover, left, width: THREAD_WIDTH, ...vertical }}
    >
      <div
        className="pointer-events-auto flex flex-col rounded-[var(--radius-lg)] bg-[var(--bg-raised)] border border-[var(--border-subtle)] shadow-lg overflow-hidden"
        style={{ maxHeight }}
      >
        {/* Header */}
        <header className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border-subtle)]">
          <span
            className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center body-xs font-semibold text-[var(--fg-on-inverse)]"
            style={{ background: comment.authorColorToken }}
          >
            {comment.authorName.charAt(0).toUpperCase()}
          </span>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="body-xs font-medium text-[var(--fg-primary)] truncate">
              {comment.authorName}
            </span>
            <span className="body-xs text-[var(--fg-tertiary)] tabular-nums">
              {formatFullTimestamp(comment.createdAt)}
            </span>
          </div>
          {comment.origin === "ux-flow" && <UxFlowChip flowRef={comment.flowRef} />}

          <div className="ml-auto flex items-center gap-0.5">
            {isInReview && <AwPill variant="beta">Em revisão</AwPill>}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-1 px-1.5 h-7 rounded-[var(--radius-sm)] body-xs text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Abrir no painel lateral"
            >
              <Icon name="open_in_full" size={11} />
              Ver mais
            </button>
            {!isResolved && !isInReview && (
              <button
                type="button"
                onClick={() => void archiveDirect(comment.id)}
                aria-label="Marcar como resolvido"
                title="Marcar como resolvido"
                className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)] hover:text-[var(--accent-success)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Icon name="check_circle" size={15} />
              </button>
            )}
            <AwDropdownMenu
              align="end"
              trigger={
                <button
                  type="button"
                  aria-label="Ações"
                  className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <Icon name="more_horiz" size={15} />
                </button>
              }
              items={dropdownItems}
            />
            <button
              type="button"
              onClick={closeThread}
              aria-label="Fechar"
              className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Icon name="close" size={15} />
            </button>
          </div>
        </header>

        {/* Body: comment + replies */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-3 py-2.5">
          {comment.text.length > 0 && (
            <p className="m-0 body-sm text-[var(--fg-primary)] whitespace-pre-wrap leading-relaxed">
              {comment.text}
            </p>
          )}

          {comment.images && comment.images.length > 0 && (
            <div
              className={[
                "flex flex-wrap gap-1.5",
                comment.text.length > 0 ? "mt-2" : "",
              ].join(" ")}
            >
              {comment.images.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => window.open(src, "_blank", "noopener")}
                  className="rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors focus:outline-none"
                  aria-label={`Ver imagem ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-24 w-24 object-cover" />
                </button>
              ))}
            </div>
          )}

          {comment.resolution?.summary && (
            <p className="m-0 mt-2 body-xs text-[var(--fg-tertiary)] italic">
              {comment.resolution.summary}
            </p>
          )}

          {replies.length > 0 && (
            <div className="mt-2 pt-1 border-t border-[var(--border-subtle)] flex flex-col divide-y divide-[var(--border-subtle)]">
              {replies.map((r) => (
                <ReplyRow key={r.id} reply={r} />
              ))}
            </div>
          )}
        </div>

        {/* Footer: approve/reject when in review, then the reply composer */}
        <div className="border-t border-[var(--border-subtle)] p-2 flex flex-col gap-2">
          {isInReview && (
            <div className="flex items-center gap-1.5">
              <AwButton
                variant="primary"
                size="sm"
                iconLeft="check_circle"
                onClick={() => void approveComment(comment.id)}
              >
                Aprovar
              </AwButton>
              <AwButton
                variant="ghost"
                size="sm"
                iconLeft="undo"
                onClick={() => void rejectComment(comment.id)}
              >
                Rejeitar
              </AwButton>
            </div>
          )}

          <div className="flex items-end gap-1.5">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault()
                  void submitReply()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  closeThread()
                }
              }}
              placeholder="Responder…"
              rows={1}
              className="flex-1 resize-none rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 body-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--accent-brand)] max-h-24"
            />
            <button
              type="button"
              onClick={() => void submitReply()}
              disabled={!replyText.trim() || submitting}
              aria-label="Enviar resposta"
              className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-full bg-[var(--accent-brand)] text-[var(--fg-on-inverse)] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              style={identity ? { background: identity.colorToken } : undefined}
            >
              <Icon name="arrow_upward" size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
