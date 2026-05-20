"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwDropdownMenu, type AwDropdownItem } from "@/components/ui/AwDropdownMenu"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { useCurrentUrl } from "@/lib/bombardier-review/hooks"
import { findPrimaryScrollContainer } from "@/lib/bombardier-review/scrollOffset"
import { STALE_DOCUMENT_HEIGHT_THRESHOLD } from "./constants"
import type { ReviewComment, ReviewReply } from "./types"

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function formatFullTimestamp(ts: number): string {
  const d = new Date(ts)
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} · ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`
}

function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "agora"
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(timestamp).toLocaleDateString("pt-BR")
}

function isStale(comment: ReviewComment, currentDocHeight: number): boolean {
  if (!comment.documentHeight) return false
  const ratio =
    Math.abs(comment.documentHeight - currentDocHeight) /
    comment.documentHeight
  return ratio > STALE_DOCUMENT_HEIGHT_THRESHOLD
}

function StatusPill({ status }: { status: ReviewComment["status"] }) {
  if (status === "in_review") return <AwPill variant="beta">Em revisão</AwPill>
  if (status === "resolved") return <AwPill variant="live">Resolvido</AwPill>
  return null
}

function ReplyRow({ reply }: { reply: ReviewReply }) {
  const isAgent = reply.authorKind === "agent"
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span
        className="h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold text-[var(--fg-on-inverse)]"
        style={{ background: reply.authorColorToken }}
        title={reply.authorName}
      >
        {reply.authorName.charAt(0).toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 leading-tight">
          <span className="body-xs font-medium text-[var(--fg-primary)] truncate">
            {reply.authorName}
          </span>
          {isAgent && (
            <span className="body-xs px-1 py-0 rounded-[var(--radius-xs)] bg-[var(--bg-muted)] text-[var(--fg-tertiary)]">
              agente
            </span>
          )}
          <span className="body-xs text-[var(--fg-tertiary)]">
            {formatRelative(reply.createdAt)}
          </span>
        </div>
        <p className="m-0 body-sm text-[var(--fg-primary)] whitespace-pre-wrap leading-relaxed">
          {reply.text}
        </p>
      </div>
    </div>
  )
}

type Context = "pin" | "sheet" | "inbox"

type Props = {
  comment: ReviewComment
  /** Where the card is being rendered. Controls visibility of Approve/Reject buttons. */
  context?: Context
  /** When provided, renders a checkbox for bulk selection. */
  selectable?: boolean
  selected?: boolean
  onToggleSelected?: () => void
  /** True if this card is for an archived comment (resolved). */
  archived?: boolean
}

export function ReviewCommentCard({
  comment,
  context = "pin",
  selectable = false,
  selected: bulkSelected = false,
  onToggleSelected,
  archived = false,
}: Props) {
  const selectedId = useReviewStore((s) => s.selectedCommentId)
  const selectComment = useReviewStore((s) => s.selectComment)
  const archiveDirect = useReviewStore((s) => s.archiveDirect)
  const approveComment = useReviewStore((s) => s.approveComment)
  const rejectComment = useReviewStore((s) => s.rejectComment)
  const reopenFromArchive = useReviewStore((s) => s.reopenFromArchive)
  const addReply = useReviewStore((s) => s.addReply)
  const deleteComment = useReviewStore((s) => s.deleteComment)
  const currentUrl = useCurrentUrl()

  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [replyOpen, setReplyOpen] = React.useState(false)
  const [replyText, setReplyText] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

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
    const container = findPrimaryScrollContainer()
    if (container) {
      container.scrollTo({ top: targetY, behavior: "smooth" })
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" })
    }
  }

  const copyPermalink = () => {
    if (typeof window === "undefined") return
    const base = window.location.origin
    const pathWithQuery = comment.url.includes("?")
      ? `${comment.url}&reviewCommentId=${encodeURIComponent(comment.id)}`
      : `${comment.url}?reviewCommentId=${encodeURIComponent(comment.id)}`
    const fullUrl = `${base}${pathWithQuery}`
    void navigator.clipboard?.writeText(fullUrl)
  }

  const submitReply = async () => {
    const trimmed = replyText.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      await addReply(comment.id, trimmed)
      setReplyText("")
      setReplyOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const dropdownItems: AwDropdownItem[] = [
    {
      id: "copy-link",
      label: "Copiar link",
      icon: "link",
      onSelect: copyPermalink,
    },
    archived
      ? {
          id: "reopen",
          label: "Reabrir",
          icon: "refresh",
          onSelect: () => void reopenFromArchive(comment.id),
        }
      : comment.status === "open"
      ? {
          id: "archive",
          label: "Marcar como resolvido",
          icon: "check_circle",
          onSelect: () => void archiveDirect(comment.id),
        }
      : {
          id: "reject",
          label: "Reabrir (rejeitar revisão)",
          icon: "refresh",
          onSelect: () => void rejectComment(comment.id),
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

  const replies = Array.isArray(comment.replies) ? comment.replies : []
  const showApprovalButtons =
    !archived && comment.status === "in_review" && (context === "sheet" || context === "inbox")

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
        {selectable && (
          <input
            type="checkbox"
            checked={bulkSelected}
            onChange={(e) => {
              e.stopPropagation()
              onToggleSelected?.()
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Selecionar"
            className="accent-[var(--accent-brand)] mr-0.5"
          />
        )}
        <span
          className="h-6 w-6 rounded-full flex items-center justify-center body-xs font-semibold text-[var(--fg-on-inverse)]"
          style={{ background: comment.authorColorToken }}
        >
          {comment.authorName.charAt(0).toUpperCase()}
        </span>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="body-xs font-medium text-[var(--fg-primary)] truncate">
            {comment.authorName}
          </span>
          <span
            className="body-xs text-[var(--fg-tertiary)] tabular-nums"
            title={new Date(comment.createdAt).toISOString()}
          >
            {formatFullTimestamp(comment.createdAt)}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <StatusPill status={comment.status} />
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
            items={dropdownItems}
          />
        </div>
      </header>

      {comment.text.length > 0 && (
        <p className="body-sm text-[var(--fg-primary)] whitespace-pre-wrap leading-relaxed">
          {comment.text}
        </p>
      )}

      {comment.images && comment.images.length > 0 && (
        <div className={["flex flex-wrap gap-1.5", comment.text.length > 0 ? "mt-2" : ""].join(" ")}>
          {comment.images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                window.open(src, "_blank", "noopener")
              }}
              className="rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors focus:outline-none"
              aria-label={`Ver imagem ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className="mt-2 body-xs text-[var(--fg-tertiary)] flex items-center gap-1"
        title={comment.url}
      >
        <Icon name="link" size={11} />
        <span className="truncate">{comment.url}</span>
      </div>

      {comment.resolution?.summary && (
        <p
          className="m-0 mt-2 body-xs text-[var(--fg-tertiary)] italic"
          title={
            comment.resolution.approvedAt
              ? `Aprovado em ${new Date(
                  comment.resolution.approvedAt
                ).toLocaleString("pt-BR")}`
              : undefined
          }
        >
          {comment.resolution.summary}
        </p>
      )}

      {replies.length > 0 && (
        <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex flex-col divide-y divide-[var(--border-subtle)]">
          {replies.map((r) => (
            <ReplyRow key={r.id} reply={r} />
          ))}
        </div>
      )}

      {showApprovalButtons && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex items-center gap-2"
        >
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

      {(context === "sheet" || context === "inbox") && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 flex items-center gap-3 body-xs"
        >
          <button
            type="button"
            onClick={() => setReplyOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
          >
            <Icon name="reply" size={11} />
            {replyOpen ? "Cancelar resposta" : "Responder"}
          </button>
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)]"
            aria-expanded={historyOpen}
          >
            <Icon name={historyOpen ? "expand_less" : "expand_more"} size={11} />
            Histórico
          </button>
        </div>
      )}

      {replyOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 flex flex-col gap-2"
        >
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escreva uma resposta…"
            rows={2}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 body-sm text-[var(--fg-primary)] focus:outline-none focus:border-[var(--accent-brand)] resize-none"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                void submitReply()
              }
            }}
          />
          <div className="flex items-center justify-end gap-1">
            <AwButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplyOpen(false)
                setReplyText("")
              }}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="primary"
              size="sm"
              loading={submitting}
              disabled={!replyText.trim() || submitting}
              onClick={() => void submitReply()}
            >
              Responder
            </AwButton>
          </div>
        </div>
      )}

      {historyOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2 flex flex-col gap-1 body-xs text-[var(--fg-secondary)]"
        >
          <div>
            <span className="text-[var(--fg-primary)]">Criado</span> ·{" "}
            <span className="text-[var(--fg-tertiary)]">
              {formatFullTimestamp(comment.createdAt)} por {comment.authorName}
            </span>
          </div>
          {replies.map((r) => (
            <div key={r.id}>
              <span className="text-[var(--fg-primary)]">Resposta</span> ·{" "}
              <span className="text-[var(--fg-tertiary)]">
                {formatFullTimestamp(r.createdAt)} por {r.authorName}
                {r.authorKind === "agent" ? " (agente)" : ""}
              </span>
            </div>
          ))}
          {comment.resolution?.at && (
            <div>
              <span className="text-[var(--fg-primary)]">Em revisão</span> ·{" "}
              <span className="text-[var(--fg-tertiary)]">
                {formatFullTimestamp(comment.resolution.at)} por{" "}
                {comment.resolution.actor.name}
                {comment.resolution.actor.kind === "agent" ? " (agente)" : ""}
              </span>
            </div>
          )}
          {comment.resolution?.approvedAt && comment.resolution.approvedBy && (
            <div>
              <span className="text-[var(--fg-primary)]">Aprovado</span> ·{" "}
              <span className="text-[var(--fg-tertiary)]">
                {formatFullTimestamp(comment.resolution.approvedAt)} por{" "}
                {comment.resolution.approvedBy.name}
              </span>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
