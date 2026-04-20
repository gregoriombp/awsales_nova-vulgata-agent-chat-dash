"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwCard } from "@/components/ui/AwCard"
import { Icon } from "@/components/ui/Icon"

export type ProjectSummary = {
  slug: string
  name: string
  pageCount: number
  updatedAt: string
}

function fmtRelative(iso: string): string {
  try {
    const d = new Date(iso).getTime()
    const s = Math.max(0, Math.floor((Date.now() - d) / 1000))
    if (s < 60) return "agora"
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}min atrás`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h atrás`
    const days = Math.floor(h / 24)
    if (days < 7) return `${days}d atrás`
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export function ProjectsGrid({ projects }: { projects: ProjectSummary[] }) {
  const router = useRouter()
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const del = async (slug: string, name: string) => {
    if (
      !window.confirm(
        `Excluir "${name}"? O diretório bombardier/projects/${slug}/ será removido.`
      )
    )
      return
    setBusy(slug)
    setError(null)
    try {
      const res = await fetch(
        `/api/bombardier/projects/${encodeURIComponent(slug)}`,
        { method: "DELETE" }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : `HTTP ${res.status}`
        )
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--aw-red-100)] border border-[var(--aw-red-200)] text-[var(--aw-red-800)] text-sm flex items-start gap-2">
          <Icon name="error" size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <AwCard
            key={p.slug}
            interactive
            className="p-5 flex flex-col gap-3 group"
          >
            <Link
              href={`/bombardier/page-builder?load=${encodeURIComponent(
                p.slug
              )}`}
              className="flex flex-col gap-3 no-underline text-[var(--fg-primary)]"
            >
              <div className="aspect-[4/3] rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--fg-tertiary)]">
                <Icon name="dashboard" size={28} />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <h3 className="font-semibold truncate">{p.name}</h3>
                <div className="flex items-center gap-2 text-xs text-[var(--fg-tertiary)]">
                  <span>
                    {p.pageCount} {p.pageCount === 1 ? "página" : "páginas"}
                  </span>
                  <span>·</span>
                  <span>{fmtRelative(p.updatedAt)}</span>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
              <Link
                href={`/bombardier/page-builder?load=${encodeURIComponent(
                  p.slug
                )}`}
                className="flex-1"
              >
                <AwButton variant="secondary" size="sm" iconRight="arrow_forward" block>
                  Abrir
                </AwButton>
              </Link>
              <button
                type="button"
                onClick={() => del(p.slug, p.name)}
                disabled={busy === p.slug}
                aria-label="Excluir projeto"
                title="Excluir"
                className="inline-flex items-center justify-center h-8 w-8 rounded-[var(--radius-sm)] text-[var(--fg-secondary)] hover:text-[var(--aw-red-600)] hover:bg-[var(--bg-raised)] disabled:opacity-40"
              >
                <Icon
                  name={busy === p.slug ? "sync" : "delete"}
                  size={14}
                  className={busy === p.slug ? "animate-spin" : undefined}
                />
              </button>
            </div>
            <div className="text-[11px] text-[var(--fg-tertiary)] font-mono truncate">
              bombardier/projects/{p.slug}/
            </div>
          </AwCard>
        ))}
      </div>
    </>
  )
}
