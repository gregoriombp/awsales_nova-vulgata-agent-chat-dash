"use client"

import * as React from "react"
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { useCurrentUrl } from "@/lib/bombardier-review/hooks"
import { STALE_DOCUMENT_HEIGHT_THRESHOLD } from "./constants"
import type { ReviewComment } from "./types"

function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "agora"
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(timestamp).toLocaleDateString()
}

function isStale(comment: ReviewComment, currentDocHeight: number): boolean {
  if (!comment.documentHeight) return false
  const ratio =
    Math.abs(comment.documentHeight - currentDocHeight) /
    comment.documentHeight
  return ratio > STALE_DOCUMENT_HEIGHT_THRESHOLD
}

type Props = {
  comment: ReviewComment
}

export function ReviewCommentCard({ comment }: Props) {
  const selectedId = useReviewStore((s) => s.selectedCommentId)
  const selectComment = useReviewStore((s) => s.selectComment)
  const resolveComment = useReviewStore((s) => s.resolveComment)
  const reopenComment = useReviewStore((s) => s.reopenComment)
  const deleteComment = useReviewStore((s) => s.deleteComment)
  const currentUrl = useCurrentUrl()

  const selected = selectedId === comment.id
  const isOnThisPage = comment.url === currentUrl
  const stale =
    isOnThisPage &&
    typeof window !== "undefined" &&
    isStale(comment, document.documentElement.scrollHeight)

  const navigateToAnchor = () => {
    selectComment(comment.id)
    if (!isOnThisPage) return
    const anchorY =
      comment.anchor.kind === "pin"
        ? comment.anchor.position.y
        : comment.anchor.centroid.y
    const targetY = Math.max(0, anchorY - 120)
    window.scrollTo({ top: targetY, behavior: "smooth" })
  }

  return (
    <article
      onClick={navigateToAnchor}
      className={[
        "group rounded-[var(--radius-md)] border p-3 cursor-pointer transition-colors",
        selected
          ? "border-[var(--accent-brand)] bg-[var(--bg-hover)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-raised)] hover:border-[var(--border-default)]",
      ].join(" ")}
    >
      <header className="flex items-center gap-2 mb-2">
        <span
          className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-[var(--fg-on-inverse)]"
          style={{ background: comment.authorColorToken }}
        >
          {comment.authorName.charAt(0).toUpperCase()}
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-medium text-[var(--fg-primary)]">
            {comment.authorName}
          </span>
          <span className="text-[10px] text-[var(--fg-tertiary)]">
            {formatRelative(comment.createdAt)}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {comment.status === "resolved" && (
            <AwPill variant="live">Resolvido</AwPill>
          )}
          {stale && (
            <AwPill variant="draft" dot={false}>
              Stale
            </AwPill>
          )}
          <AwDropdownMenu
            trigger={
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                aria-label="Ações"
                className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-hover)]"
              >
                <Icon name="more_horiz" size={14} />
              </button>
            }
            items={[
              comment.status === "open"
                ? {
                    id: "resolve",
                    label: "Marcar como resolvido",
                    icon: "check_circle",
                    onSelect: () => void resolveComment(comment.id),
                  }
                : {
                    id: "reopen",
                    label: "Reabrir",
                    icon: "refresh",
                    onSelect: () => void reopenComment(comment.id),
                  },
              { id: "sep", separator: true },
              {
                id: "delete",
                label: "Excluir",
                icon: "delete",
                danger: true,
                onSelect: () => void deleteComment(comment.id),
              },
            ]}
          />
        </div>
      </header>

      <p className="text-sm text-[var(--fg-primary)] whitespace-pre-wrap leading-relaxed">
        {comment.text}
      </p>

      {!isOnThisPage && (
        <div className="mt-2 text-[10px] text-[var(--fg-tertiary)] flex items-center gap-1">
          <Icon name="link" size={11} />
          <span className="font-mono truncate">{comment.url}</span>
        </div>
      )}
    </article>
  )
}
