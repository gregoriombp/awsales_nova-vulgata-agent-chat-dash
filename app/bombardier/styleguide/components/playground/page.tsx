import fs from "node:fs"
import path from "node:path"
import { AwCard } from "@/components/ui/AwCard"
import { Icon } from "@/components/ui/Icon"
import {
  PlaygroundList,
  type PlaygroundEntry,
} from "./_components/PlaygroundList"

export const dynamic = "force-dynamic"

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
          até um designer aprovar — só então entram em{" "}
          <code className="px-1.5 py-0.5 text-xs rounded bg-[var(--bg-muted)] font-mono">
            components/ui/
          </code>
          .
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
        <PlaygroundList entries={entries} />
      )}
    </div>
  )
}
