import Link from "next/link"
import type { Metadata } from "next"
import { Icon } from "@/components/ui/Icon"
import { ROADMAP, type RoadmapItem, type RoadmapStatus } from "./_data"
import { RoadmapItemCard } from "./_components/roadmap-item-card"

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Bloco de ideias e pendências do Bombardier. Não é planejamento oficial — ideias soltas que viram trabalho ou são abandonadas.",
}

// Ordem de exibição: o mais acionável primeiro; concluído e descartado por último.
const STATUS_ORDER: RoadmapStatus[] = [
  "in-progress",
  "todo",
  "idea",
  "done",
  "dropped",
]

const STATUS_HEADING: Record<RoadmapStatus, string> = {
  "in-progress": "Em progresso",
  todo: "A fazer",
  idea: "Ideias",
  done: "Concluído",
  dropped: "Descartado",
}

function groupByStatus(items: RoadmapItem[]): Record<RoadmapStatus, RoadmapItem[]> {
  const groups = {
    "in-progress": [],
    todo: [],
    idea: [],
    done: [],
    dropped: [],
  } as Record<RoadmapStatus, RoadmapItem[]>
  for (const item of items) groups[item.status].push(item)
  for (const key of Object.keys(groups) as RoadmapStatus[]) {
    groups[key].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
  }
  return groups
}

export default function RoadmapPage() {
  const groups = groupByStatus(ROADMAP)
  const openCount = ROADMAP.filter(
    (i) => i.status !== "done" && i.status !== "dropped"
  ).length

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-primary)]">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <Link
          href="/bombardier"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-secondary)] no-underline hover:text-[var(--fg-primary)] transition-colors mb-8"
        >
          <Icon name="arrow_back" size={16} />
          Bombardier
        </Link>

        <header className="mb-10">
          <p className="aw-eyebrow mb-3">Bombardier</p>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-5xl font-semibold tracking-tight">Roadmap</h1>
            {openCount > 0 ? (
              <span
                className="inline-flex items-center rounded-[var(--radius-md)] border px-2.5 py-1 text-xs font-medium"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--fg-secondary)",
                }}
              >
                {openCount} aberto{openCount > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
          <p className="text-lg text-[var(--fg-secondary)] max-w-2xl leading-relaxed">
            Bloco de ideias e pendências do projeto. <strong>Não é planejamento
            oficial nem fonte da verdade</strong> — coisas aqui viram trabalho ou
            são abandonadas. Pra anotar: edite{" "}
            <code className="text-sm">_data.ts</code> ou peça{" "}
            <code className="text-sm">/todo</code> pro agente.
          </p>
        </header>

        <div className="flex flex-col gap-12">
          {STATUS_ORDER.map((status) => {
            const items = groups[status]
            if (items.length === 0) return null
            return (
              <section key={status}>
                <h2 className="text-xl font-semibold tracking-tight mb-4">
                  {STATUS_HEADING[status]}{" "}
                  <span className="text-[var(--fg-tertiary)] font-normal">
                    ({items.length})
                  </span>
                </h2>
                <ol className="m-0 p-0 list-none flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item.id}>
                      <RoadmapItemCard item={item} />
                    </li>
                  ))}
                </ol>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
