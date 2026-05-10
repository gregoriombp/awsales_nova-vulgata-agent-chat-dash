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
import { useCommentsForUrl, useCurrentUrl } from "@/lib/bombardier-review/hooks"
import { OVERLAY_DATA_ATTR } from "./constants"
import { ReviewCommentCard } from "./ReviewCommentCard"
import type { ReviewCommentStatus } from "./types"

type Filter = "all" | ReviewCommentStatus
type Scope = "page" | "all"

export function ReviewCommentSheet() {
  const open = useReviewStore((s) => s.sheetOpen)
  const setSheetOpen = useReviewStore((s) => s.setSheetOpen)
  const allComments = useReviewStore((s) => s.comments)
  const setExportOpen = useReviewStore((s) => s.setExportOpen)

  const url = useCurrentUrl()
  const pageComments = useCommentsForUrl(url)

  const [scope, setScope] = React.useState<Scope>("page")
  const [filter, setFilter] = React.useState<Filter>("all")

  const source = scope === "page" ? pageComments : allComments
  const filtered = React.useMemo(() => {
    if (filter === "all") return source
    return source.filter((c) => c.status === filter)
  }, [source, filter])

  return (
    <AwSheet
      open={open}
      onClose={() => setSheetOpen(false)}
      title="Comentários"
      meta={
        <span className="text-xs text-[var(--fg-tertiary)]">
          {scope === "page" ? "Nesta tela" : "Em todas as telas"} ·{" "}
          {filtered.length}
        </span>
      }
      footer={
        <div
          {...{ [OVERLAY_DATA_ATTR]: "" }}
          className="flex items-center justify-between gap-2"
        >
          <span className="text-[11px] text-[var(--fg-tertiary)]">
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
        <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-muted)] self-start text-[11px] font-medium">
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

        <div className="flex items-center gap-1 text-[11px] font-medium">
          {(["all", "open", "resolved"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                "px-2.5 py-1 rounded-full transition-colors",
                filter === f
                  ? "bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)]"
                  : "text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)]",
              ].join(" ")}
            >
              {f === "all"
                ? "Todos"
                : f === "open"
                ? "Abertos"
                : "Resolvidos"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {filtered.length === 0 ? (
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="forum" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>
                  {source.length === 0
                    ? scope === "page"
                      ? "Nenhum comentário nesta tela"
                      : "Sem comentários ainda"
                    : "Nada com esse filtro"}
                </AwEmptyTitle>
                {source.length === 0 && scope === "page" && (
                  <AwEmptyDescription>
                    Use a marcação livre ou o pino na barra inferior pra
                    deixar o primeiro comentário.
                  </AwEmptyDescription>
                )}
              </AwEmptyHeader>
            </AwEmpty>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((c) => (
                <ReviewCommentCard key={c.id} comment={c} />
              ))}
            </div>
          )}
        </div>

        {scope === "page" && filtered.length > 0 && (
          <button
            type="button"
            onClick={() => setScope("all")}
            className="self-start text-[11px] text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
          >
            <Icon name="open_in_new" size={11} />
            Ver todos ({allComments.length})
          </button>
        )}
      </div>
    </AwSheet>
  )
}
