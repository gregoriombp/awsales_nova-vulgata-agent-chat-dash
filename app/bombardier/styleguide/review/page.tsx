"use client"

import * as React from "react"
import Link from "next/link"
import { AwButton } from "@/components/ui/AwButton"
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu"
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty"
import { AwInput } from "@/components/ui/AwInput"
import { AwPill } from "@/components/ui/AwPill"
import { AwStatCard } from "@/components/ui/AwStatCard"
import { Icon } from "@/components/ui/Icon"
import { useReviewStore } from "@/lib/bombardier-review/store"
import type { ReviewComment } from "@/components/bombardier-review/types"
import { PageHero } from "../_primitives"

type StatusFilter = "all" | "open" | "resolved"
type SortKey = "createdAt" | "author" | "url" | "status"
type SortDir = "asc" | "desc"

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function relative(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60_000)
  if (m < 1) return "agora"
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(ts).toLocaleDateString("pt-BR")
}

function SortHeader({
  label,
  sortKey,
  current,
  direction,
  onClick,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  direction: SortDir
  onClick: (k: SortKey) => void
}) {
  const active = current === sortKey
  return (
    <button
      type="button"
      onClick={() => onClick(sortKey)}
      className={[
        "inline-flex items-center gap-1 text-[11px] uppercase tracking-wide font-medium",
        active
          ? "text-[var(--fg-primary)]"
          : "text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)]",
      ].join(" ")}
    >
      {label}
      {active && (
        <Icon
          name={direction === "asc" ? "arrow_upward" : "arrow_downward"}
          size={12}
        />
      )}
    </button>
  )
}

function StatusPill({ status }: { status: ReviewComment["status"] }) {
  return status === "resolved" ? (
    <AwPill variant="live">Resolvido</AwPill>
  ) : (
    <AwPill variant="draft">Aberto</AwPill>
  )
}

function CommentRow({ comment }: { comment: ReviewComment }) {
  const resolveComment = useReviewStore((s) => s.resolveComment)
  const reopenComment = useReviewStore((s) => s.reopenComment)
  const deleteComment = useReviewStore((s) => s.deleteComment)
  const selectComment = useReviewStore((s) => s.selectComment)
  const setSheetOpen = useReviewStore((s) => s.setSheetOpen)

  return (
    <tr className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]">
      <td className="px-3 py-3 align-top">
        <StatusPill status={comment.status} />
      </td>
      <td className="px-3 py-3 align-top">
        <Link
          href={comment.url}
          className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--fg-secondary)] hover:text-[var(--accent-brand)]"
          title={comment.url}
        >
          <Icon name="open_in_new" size={11} />
          <span className="truncate max-w-[200px]">{comment.url}</span>
        </Link>
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-semibold text-[var(--fg-on-inverse)]"
            style={{ background: comment.authorColorToken }}
          >
            {comment.authorName.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm text-[var(--fg-primary)] truncate">
            {comment.authorName}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 align-top max-w-[420px]">
        <p className="m-0 text-sm text-[var(--fg-primary)] line-clamp-3 whitespace-pre-wrap">
          {comment.text}
        </p>
      </td>
      <td className="px-3 py-3 align-top">
        <div
          className="text-xs text-[var(--fg-tertiary)] tabular-nums"
          title={formatTimestamp(comment.createdAt)}
        >
          {relative(comment.createdAt)}
        </div>
      </td>
      <td className="px-3 py-3 align-top text-right">
        <AwDropdownMenu
          trigger={
            <button
              type="button"
              aria-label="Ações"
              className="h-7 w-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-hover)]"
            >
              <Icon name="more_horiz" size={14} />
            </button>
          }
          items={[
            {
              id: "open",
              label: "Abrir tela",
              icon: "open_in_new",
              onSelect: () => {
                selectComment(comment.id)
                setSheetOpen(true)
                window.location.href = comment.url
              },
            },
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
      </td>
    </tr>
  )
}

export default function ReviewInboxPage() {
  const comments = useReviewStore((s) => s.comments)
  const refresh = useReviewStore((s) => s.refreshFromStorage)
  const backend = useReviewStore((s) => s.backend)
  const storage = useReviewStore((s) => s.storage)

  React.useEffect(() => {
    void refresh()
    const unsubscribe = storage.subscribe?.(() => {
      void refresh()
    })
    return unsubscribe
  }, [refresh, storage])

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [authorId, setAuthorId] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")
  const [groupByUrl, setGroupByUrl] = React.useState(true)

  const authors = React.useMemo(() => {
    const seen = new Map<string, string>()
    for (const c of comments) {
      if (!seen.has(c.authorId)) seen.set(c.authorId, c.authorName)
    }
    return Array.from(seen.entries())
  }, [comments])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return comments.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (authorId !== "all" && c.authorId !== authorId) return false
      if (q && !c.text.toLowerCase().includes(q)) return false
      return true
    })
  }, [comments, statusFilter, authorId, search])

  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "createdAt":
          cmp = a.createdAt - b.createdAt
          break
        case "author":
          cmp = a.authorName.localeCompare(b.authorName)
          break
        case "url":
          cmp = a.url.localeCompare(b.url)
          break
        case "status":
          cmp = a.status.localeCompare(b.status)
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return arr
  }, [filtered, sortKey, sortDir])

  const grouped = React.useMemo(() => {
    if (!groupByUrl) return null
    const map = new Map<string, ReviewComment[]>()
    for (const c of sorted) {
      const arr = map.get(c.url) ?? []
      arr.push(c)
      map.set(c.url, arr)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [sorted, groupByUrl])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const openCount = comments.filter((c) => c.status === "open").length
  const resolvedCount = comments.filter((c) => c.status === "resolved").length

  const renderTable = (items: ReviewComment[]) => (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
          <tr>
            <th className="px-3 py-2 text-left">
              <SortHeader
                label="Status"
                sortKey="status"
                current={sortKey}
                direction={sortDir}
                onClick={toggleSort}
              />
            </th>
            <th className="px-3 py-2 text-left">
              <SortHeader
                label="Tela"
                sortKey="url"
                current={sortKey}
                direction={sortDir}
                onClick={toggleSort}
              />
            </th>
            <th className="px-3 py-2 text-left">
              <SortHeader
                label="Autor"
                sortKey="author"
                current={sortKey}
                direction={sortDir}
                onClick={toggleSort}
              />
            </th>
            <th className="px-3 py-2 text-left">
              <span className="text-[11px] uppercase tracking-wide font-medium text-[var(--fg-tertiary)]">
                Comentário
              </span>
            </th>
            <th className="px-3 py-2 text-left">
              <SortHeader
                label="Data"
                sortKey="createdAt"
                current={sortKey}
                direction={sortDir}
                onClick={toggleSort}
              />
            </th>
            <th className="px-3 py-2 w-12" />
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <CommentRow key={c.id} comment={c} />
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <PageHero title="Review · Inbox">
        Painel completo dos comentários do Review Mode. Filtra por autor,
        status ou texto, agrupa por tela, resolve em massa. Lê do mesmo
        storage que o overlay (localStorage ou bridge LAN).
      </PageHero>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AwStatCard icon="forum" label="Total" value={comments.length} />
        <AwStatCard
          icon="pending"
          label="Abertos"
          value={openCount}
          hint={
            comments.length > 0
              ? `${Math.round((openCount / comments.length) * 100)}%`
              : "—"
          }
        />
        <AwStatCard
          icon="check_circle"
          label="Resolvidos"
          value={resolvedCount}
          hint={
            comments.length > 0
              ? `${Math.round((resolvedCount / comments.length) * 100)}%`
              : "—"
          }
        />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-md">
          <AwInput
            iconLeft="search"
            placeholder="Buscar texto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-muted)] text-[11px] font-medium">
          {(["all", "open", "resolved"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={[
                "px-3 py-1 rounded-full transition-colors",
                statusFilter === f
                  ? "bg-[var(--bg-raised)] text-[var(--fg-primary)] shadow-sm"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]",
              ].join(" ")}
            >
              {f === "all" ? "Todos" : f === "open" ? "Abertos" : "Resolvidos"}
            </button>
          ))}
        </div>

        {authors.length > 1 && (
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] text-[var(--fg-primary)] focus:outline-none focus:border-[var(--accent-brand)]"
          >
            <option value="all">Todos os autores</option>
            {authors.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        )}

        <label className="flex items-center gap-2 text-xs text-[var(--fg-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={groupByUrl}
            onChange={(e) => setGroupByUrl(e.target.checked)}
            className="accent-[var(--accent-brand)]"
          />
          Agrupar por tela
        </label>

        <span className="ml-auto inline-flex items-center gap-2 text-[11px] text-[var(--fg-tertiary)]">
          <Icon
            name={backend === "bridge" ? "cloud_done" : "save"}
            size={13}
          />
          {backend === "bridge" ? "Bridge LAN" : "localStorage"}
        </span>

        <AwButton
          variant="ghost"
          size="sm"
          iconLeft="refresh"
          onClick={() => void refresh()}
        >
          Atualizar
        </AwButton>
      </div>

      {sorted.length === 0 ? (
        <AwEmpty>
          <AwEmptyHeader>
            <AwEmptyMedia variant="icon">
              <Icon name="forum" size={20} />
            </AwEmptyMedia>
            <AwEmptyTitle>
              {comments.length === 0
                ? "Nenhum comentário ainda"
                : "Nada com esses filtros"}
            </AwEmptyTitle>
            <AwEmptyDescription>
              {comments.length === 0
                ? "Ative o Review Mode (⌘⇧Y) em qualquer tela e desenhe o primeiro comentário."
                : "Tente afrouxar os filtros ou trocar o autor."}
            </AwEmptyDescription>
          </AwEmptyHeader>
        </AwEmpty>
      ) : grouped ? (
        <div className="flex flex-col gap-6">
          {grouped.map(([url, items]) => {
            const groupOpen = items.filter((c) => c.status === "open").length
            return (
              <section key={url} className="flex flex-col gap-3">
                <header className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      name="web_asset"
                      size={14}
                      className="text-[var(--fg-tertiary)] shrink-0"
                    />
                    <Link
                      href={url}
                      className="font-mono text-sm text-[var(--fg-primary)] hover:text-[var(--accent-brand)] truncate"
                    >
                      {url}
                    </Link>
                    <span className="text-xs text-[var(--fg-tertiary)] shrink-0">
                      {items.length} no total · {groupOpen} aberto
                      {groupOpen === 1 ? "" : "s"}
                    </span>
                  </div>
                </header>
                {renderTable(items)}
              </section>
            )
          })}
        </div>
      ) : (
        renderTable(sorted)
      )}
    </div>
  )
}
