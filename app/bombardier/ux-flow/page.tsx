import Link from "next/link"
import type { Metadata } from "next"
import { AwButton } from "@/components/ui/AwButton"
import { AwCard } from "@/components/ui/AwCard"
import { AwPill } from "@/components/ui/AwPill"
import { AwStatCard } from "@/components/ui/AwStatCard"
import { Icon } from "@/components/ui/Icon"
import { FLOW_GROUPS, FLOW_META, type FlowGroup } from "./_data/flow-meta"

export const metadata: Metadata = {
  title: "UX Flow",
  description: "Todos os fluxos navegáveis do produto, estilo Figma prototype.",
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export default function UxFlowIndex() {
  const totalScreens = FLOW_META.reduce((sum, f) => sum + f.screens, 0)

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-primary)]">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <Link href="/bombardier" className="no-underline">
          <AwButton variant="ghost" size="sm" iconLeft="arrow_back">
            Bombardier
          </AwButton>
        </Link>

        <header className="mt-6 mb-10">
          <p className="aw-eyebrow mb-3">UX Flow</p>
          <h1 className="text-5xl font-semibold tracking-tight mb-3">Fluxos</h1>
          <p className="text-lg text-[var(--fg-secondary)] max-w-2xl">
            Cada fluxo conecta as telas do produto num mapa navegável, estilo Figma
            prototype. Abra um pra explorar, comentar ou sugerir mudanças.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <AwStatCard icon="account_tree" label="Fluxos" value={FLOW_META.length} />
          <AwStatCard icon="web_asset" label="Telas mapeadas" value={totalScreens} />
          <AwStatCard
            icon="palette"
            label="Fonte"
            value="Styleguide"
            hint="Mesmos NODES/EDGES do design system"
          />
        </div>

        {FLOW_GROUPS.map((group: FlowGroup) => {
          const flows = FLOW_META.filter((f) => f.group === group)
          if (flows.length === 0) return null
          return (
            <section key={group} className="mb-10">
              <p className="aw-eyebrow mb-3">{group}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {flows.map((f) => (
                  <AwCard
                    key={f.slug}
                    interactive
                    className="p-6 flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface)]"
                        style={{ width: 44, height: 44 }}
                      >
                        <Icon name="account_tree" size={24} />
                      </span>
                      <AwPill variant="neutral">{f.screens} telas</AwPill>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-semibold">{f.title}</h2>
                      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                        {f.description}
                      </p>
                    </div>
                    <div className="mt-auto pt-2 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--fg-tertiary)]">
                        <Icon name="schedule" size={13} />
                        Atualizado em {formatDate(f.updatedAt)}
                      </span>
                      <Link
                        href={`/bombardier/ux-flow/${f.slug}`}
                        className="no-underline"
                      >
                        <AwButton variant="primary" iconRight="arrow_forward">
                          Abrir
                        </AwButton>
                      </Link>
                    </div>
                  </AwCard>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
