import fs from "node:fs"
import path from "node:path"
import { AwCard } from "@/components/ui/AwCard"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"

export const dynamic = "force-dynamic"

type PlaygroundEntry = {
  name: string
  filePath: string
  meta: {
    description?: string
    createdAt?: string
    sourcePrompt?: string
    approval?: string
  } | null
  sizeBytes: number
}

function readPlayground(): PlaygroundEntry[] {
  const dir = path.join(process.cwd(), "components", "playground")
  try {
    const entries = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".tsx"))
      .sort()
    return entries.map((file) => {
      const fullPath = path.join(dir, file)
      const name = file.replace(/\.tsx$/, "")
      const metaPath = path.join(dir, `${name}.meta.json`)
      let meta: PlaygroundEntry["meta"] = null
      try {
        const raw = fs.readFileSync(metaPath, "utf8")
        meta = JSON.parse(raw)
      } catch {
        meta = null
      }
      const stat = fs.statSync(fullPath)
      return {
        name,
        filePath: path.relative(process.cwd(), fullPath),
        meta,
        sizeBytes: stat.size,
      }
    })
  } catch {
    return []
  }
}

function fmtDate(iso?: string) {
  if (!iso) return ""
  try {
    const d = new Date(iso)
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function PlaygroundPage() {
  const entries = readPlayground()

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <header className="mb-8">
        <p className="aw-eyebrow mb-2">Styleguide · Playground</p>
        <h1 className="text-4xl font-semibold tracking-tight mb-3">
          Componentes propostos
        </h1>
        <p className="text-[var(--fg-secondary)] leading-relaxed max-w-2xl">
          Componentes criados dinamicamente pela IA do Bombardier quando a
          paleta e o shadcn não ofereceram uma solução. Ficam em quarentena
          até um designer aprovar manualmente — só então entram no DS
          principal.
        </p>
      </header>

      {entries.length === 0 ? (
        <AwCard className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <span
              className="inline-flex items-center justify-center rounded-full border border-dashed border-[var(--border-default)]"
              style={{ width: 48, height: 48 }}
            >
              <Icon name="science" size={22} />
            </span>
            <h2 className="text-lg font-semibold">Ninguém no Playground</h2>
            <p className="text-sm text-[var(--fg-secondary)] max-w-md">
              Quando a IA criar um componente novo, ele aparece aqui. Peça
              algo que não existe no design system (ex: &ldquo;timeline
              animada&rdquo;, &ldquo;stat card com sparkline&rdquo;) e veja
              acontecer.
            </p>
          </div>
        </AwCard>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((e) => (
            <AwCard key={e.name} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold">{e.name}</h3>
                    <AwPill variant="draft">
                      {e.meta?.approval ?? "pending"}
                    </AwPill>
                  </div>
                  {e.meta?.description && (
                    <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                      {e.meta.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled
                  title="Fluxo de aprovação chega na Fase 4"
                  className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--bg-muted)] text-[var(--fg-tertiary)] cursor-not-allowed"
                >
                  <Icon name="check" size={14} />
                  Aprovar
                </button>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[var(--fg-tertiary)] font-mono">
                <span className="flex items-center gap-1">
                  <Icon name="description" size={11} />
                  {e.filePath}
                </span>
                <span>{(e.sizeBytes / 1024).toFixed(1)} KB</span>
                {e.meta?.createdAt && <span>{fmtDate(e.meta.createdAt)}</span>}
              </div>
              {e.meta?.sourcePrompt && (
                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                  <div className="text-[11px] uppercase tracking-wider text-[var(--fg-tertiary)] mb-1">
                    Prompt original
                  </div>
                  <p className="text-xs text-[var(--fg-secondary)] italic leading-relaxed">
                    &ldquo;{e.meta.sourcePrompt}&rdquo;
                  </p>
                </div>
              )}
            </AwCard>
          ))}
        </div>
      )}
    </div>
  )
}
