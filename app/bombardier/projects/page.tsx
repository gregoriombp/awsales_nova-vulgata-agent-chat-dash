import fs from "node:fs"
import path from "node:path"
import Link from "next/link"
import { AwButton } from "@/components/ui/AwButton"
import { AwCard } from "@/components/ui/AwCard"
import { Icon } from "@/components/ui/Icon"
import {
  ProjectsGrid,
  type ProjectSummary,
} from "./_components/ProjectsGrid"

export const dynamic = "force-dynamic"

function readProjects(): ProjectSummary[] {
  const root = path.join(process.cwd(), "bombardier", "projects")
  if (!fs.existsSync(root)) return []

  const slugs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const items: ProjectSummary[] = []
  for (const slug of slugs) {
    const file = path.join(root, slug, "project.json")
    if (!fs.existsSync(file)) continue
    try {
      const raw = fs.readFileSync(file, "utf8")
      const parsed = JSON.parse(raw) as {
        name?: string
        pages?: unknown[]
        updatedAt?: string
      }
      const stat = fs.statSync(file)
      items.push({
        slug,
        name: typeof parsed.name === "string" ? parsed.name : slug,
        pageCount: Array.isArray(parsed.pages) ? parsed.pages.length : 0,
        updatedAt:
          typeof parsed.updatedAt === "string"
            ? parsed.updatedAt
            : stat.mtime.toISOString(),
      })
    } catch {
      /* skip corrupt */
    }
  }
  items.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  return items
}

export default function ProjectsPage() {
  const projects = readProjects()

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-primary)]">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <header className="mb-8 flex items-start justify-between gap-6 flex-wrap">
          <div className="flex flex-col gap-2">
            <Link
              href="/bombardier"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-secondary)] no-underline hover:text-[var(--fg-primary)] w-fit"
            >
              <Icon name="arrow_back" size={14} />
              Bombardier
            </Link>
            <p className="aw-eyebrow">Projetos</p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Todos os projetos
            </h1>
            <p className="text-[var(--fg-secondary)] leading-relaxed max-w-2xl">
              Cada projeto é uma coleção de páginas salvas em{" "}
              <code className="px-1.5 py-0.5 text-xs rounded bg-[var(--bg-muted)] font-mono">
                bombardier/projects/&lt;slug&gt;/project.json
              </code>
              .
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/bombardier/page-builder?new=1">
              <AwButton variant="primary" size="md" iconLeft="add">
                Novo projeto
              </AwButton>
            </Link>
          </div>
        </header>

        {projects.length === 0 ? (
          <AwCard className="p-10 text-center">
            <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
              <span
                className="inline-flex items-center justify-center rounded-full border border-dashed border-[var(--border-default)]"
                style={{ width: 56, height: 56 }}
              >
                <Icon name="folder_open" size={24} />
              </span>
              <h2 className="text-lg font-semibold">
                Nenhum projeto salvo ainda
              </h2>
              <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                Comece um projeto novo no Page Builder e clique em{" "}
                <strong>Salvar</strong>. Ele vai aparecer aqui e ficar no
                filesystem pra você compartilhar via git ou abrir noutro
                momento.
              </p>
              <Link href="/bombardier/page-builder?new=1" className="mt-2">
                <AwButton variant="primary" size="md" iconLeft="add">
                  Criar primeiro projeto
                </AwButton>
              </Link>
            </div>
          </AwCard>
        ) : (
          <ProjectsGrid projects={projects} />
        )}
      </div>
    </main>
  )
}
