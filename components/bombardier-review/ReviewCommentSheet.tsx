"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty"
import { AwSheet } from "@/components/ui/AwSheet"
import { Icon } from "@/components/ui/Icon"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { useCurrentUrl } from "@/lib/bombardier-review/hooks"
import { OVERLAY_DATA_ATTR, REVIEW_Z } from "./constants"
import { ReviewCommentCard } from "./ReviewCommentCard"
import type { ReviewComment } from "./types"

type Tab = "open" | "in_review" | "archive"
type Scope = "page" | "all"

const TAB_LABEL: Record<Tab, string> = {
  open: "Abertos",
  in_review: "Em revisão",
  archive: "Arquivados",
}

export function ReviewCommentSheet() {
  const open = useReviewStore((s) => s.sheetOpen)
  const setSheetOpen = useReviewStore((s) => s.setSheetOpen)
  const allComments = useReviewStore((s) => s.comments)
  const archivedComments = useReviewStore((s) => s.archivedComments)
  const archiveCursor = useReviewStore((s) => s.archiveCursor)
  const archiveLoaded = useReviewStore((s) => s.archiveLoaded)
  const loadArchivePage = useReviewStore((s) => s.loadArchivePage)
  const setExportOpen = useReviewStore((s) => s.setExportOpen)
  const approveComment = useReviewStore((s) => s.approveComment)
  const rejectComment = useReviewStore((s) => s.rejectComment)

  const currentUrl = useCurrentUrl()

  const [scope, setScope] = React.useState<Scope>("page")
  const [tab, setTab] = React.useState<Tab>("open")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = React.useState(false)

  React.useEffect(() => {
    if (tab === "archive" && !archiveLoaded) {
      void loadArchivePage(true)
    }
  }, [tab, archiveLoaded, loadArchivePage])

  // Reset selection when switching tabs/scope.
  React.useEffect(() => {
    setSelectedIds(new Set())
  }, [tab, scope])

  const sourceMain = scope === "page"
    ? allComments.filter((c) => c.url === currentUrl)
    : allComments
  const sourceArchive = scope === "page"
    ? archivedComments.filter((c) => c.url === currentUrl)
    : archivedComments

  const visible: ReviewComment[] = React.useMemo(() => {
    if (tab === "open") return sourceMain.filter((c) => c.status === "open")
    if (tab === "in_review") return sourceMain.filter((c) => c.status === "in_review")
    return sourceArchive
  }, [tab, sourceMain, sourceArchive])

  const inReviewCount = allComments.filter((c) => c.status === "in_review").length

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bulkApprove = async () => {
    setBulkBusy(true)
    try {
      for (const id of Array.from(selectedIds)) {
        await approveComment(id)
      }
      setSelectedIds(new Set())
    } finally {
      setBulkBusy(false)
    }
  }

  const bulkReject = async () => {
    setBulkBusy(true)
    try {
      for (const id of Array.from(selectedIds)) {
        await rejectComment(id)
      }
      setSelectedIds(new Set())
    } finally {
      setBulkBusy(false)
    }
  }

  const showBulkBar = tab === "in_review" && selectedIds.size > 0

  return (
    <AwSheet
      open={open}
      onClose={() => setSheetOpen(false)}
      zIndex={REVIEW_Z.sheet}
      title="Comentários"
      meta={
        <span className="body-xs text-[var(--fg-tertiary)]">
          {scope === "page" ? "Nesta tela" : "Em todas as telas"} ·{" "}
          {visible.length}
        </span>
      }
      footer={
        <div
          {...{ [OVERLAY_DATA_ATTR]: "" }}
          className="flex items-center justify-between gap-2"
        >
          <span className="body-xs text-[var(--fg-tertiary)]">
            Total: {allComments.length}
          </span>
          <AwButton
            variant="secondary"
            size="sm"
            iconLeft="ios_share"
            onClick={() => {
              setSheetOpen(false)
              setExportOpen(true)
            }}
          >
            Exportar
          </AwButton>
        </div>
      }
    >
      <div
        {...{ [OVERLAY_DATA_ATTR]: "" }}
        className="flex flex-col gap-3 h-full"
      >
        <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-muted)] self-start body-xs font-medium">
          {(["page", "all"] as Scope[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={[
                "px-3 py-1 rounded-full transition-colors",
                scope === s
                  ? "bg-[var(--bg-raised)] text-[var(--fg-primary)] shadow-sm"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]",
              ].join(" ")}
            >
              {s === "page" ? "Esta tela" : "Tudo"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 body-xs font-medium">
          {(["open", "in_review", "archive"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                "px-2.5 py-1 rounded-full transition-colors inline-flex items-center gap-1.5",
                tab === t
                  ? "bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)]"
                  : "text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)]",
              ].join(" ")}
            >
              {TAB_LABEL[t]}
              {t === "in_review" && inReviewCount > 0 && (
                <span
                  className={[
                    "min-w-4 h-4 px-1 inline-flex items-center justify-center rounded-full body-xs font-semibold tabular-nums",
                    tab === t
                      ? "bg-[var(--bg-raised)] text-[var(--fg-primary)]"
                      : "bg-[var(--aw-amber-100)] text-[var(--aw-amber-700)]",
                  ].join(" ")}
                >
                  {inReviewCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {showBulkBar && (
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] body-xs">
            <span className="text-[var(--fg-secondary)]">
              {selectedIds.size} selecionado{selectedIds.size === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-1">
              <AwButton
                variant="primary"
                size="sm"
                iconLeft="check_circle"
                loading={bulkBusy}
                disabled={bulkBusy}
                onClick={() => void bulkApprove()}
              >
                Aprovar
              </AwButton>
              <AwButton
                variant="ghost"
                size="sm"
                iconLeft="undo"
                disabled={bulkBusy}
                onClick={() => void bulkReject()}
              >
                Rejeitar
              </AwButton>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {visible.length === 0 ? (
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="forum" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>
                  {tab === "archive"
                    ? "Nenhum arquivado aqui"
                    : tab === "in_review"
                    ? "Nada esperando revisão"
                    : scope === "page"
                    ? "Nenhum comentário nesta tela"
                    : "Sem comentários abertos"}
                </AwEmptyTitle>
                {tab === "open" && scope === "page" && (
                  <AwEmptyDescription>
                    Use a marcação livre ou o pino na barra inferior pra
                    deixar o primeiro comentário.
                  </AwEmptyDescription>
                )}
              </AwEmptyHeader>
            </AwEmpty>
          ) : (
            <div className="flex flex-col gap-2">
              {visible.map((c) => (
                <ReviewCommentCard
                  key={c.id}
                  comment={c}
                  context="sheet"
                  archived={tab === "archive"}
                  selectable={tab === "in_review"}
                  selected={selectedIds.has(c.id)}
                  onToggleSelected={() => toggleSelected(c.id)}
                />
              ))}
              {tab === "archive" && archiveCursor && (
                <button
                  type="button"
                  onClick={() => void loadArchivePage(false)}
                  className="mt-2 body-xs text-[var(--accent-brand)] hover:underline self-center"
                >
                  Carregar mais arquivados
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AwSheet>
  )
}
